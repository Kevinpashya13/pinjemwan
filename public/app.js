// --- Application State ---
let currentView = 'dashboard';
let cachedBooks = [];
let cachedLoans = [];
let selectedBook = null;

// --- DOM Elements ---
const navItems = document.querySelectorAll('.nav-item');
const contentViews = document.querySelectorAll('.content-view');
const badgeLoansCount = document.getElementById('badge-loans-count');

// Dashboard Elements
const statTotalTitles = document.getElementById('stat-total-titles');
const statTotalCopies = document.getElementById('stat-total-copies');
const statActiveLoans = document.getElementById('stat-active-loans');
const statAvailableCopies = document.getElementById('stat-available-copies');
const tableDashboardLoansBody = document.getElementById('table-dashboard-loans-body');
const btnSeeAllLoans = document.getElementById('btn-see-all-loans');

// Books Elements
const booksGrid = document.getElementById('books-grid');
const inputSearchBooks = document.getElementById('input-search-books');

// Loans Elements
const tableLoansBody = document.getElementById('table-loans-body');

// Add Book Elements
const formAddBook = document.getElementById('form-add-book');

// Modal Elements
const loanModal = document.getElementById('loan-modal');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnCancelLoan = document.getElementById('btn-cancel-loan');
const formLoan = document.getElementById('form-loan');
const modalBookTitle = document.getElementById('modal-book-title');
const modalBookAuthor = document.getElementById('modal-book-author');
const inputTukangPinjemName = document.getElementById('tukang-pinjem-name');

// Mobile Sidebar Elements
const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
const appSidebar = document.getElementById('app-sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  refreshAllData();
});

// --- Event Listeners ---
function setupEventListeners() {
  // Sidebar Navigation clicks
  navItems.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetView = btn.dataset.view;
      switchView(targetView);
      closeMobileSidebar();
    });
  });

  // "Lihat Semua" in Dashboard
  btnSeeAllLoans.addEventListener('click', () => {
    switchView('loans');
  });

  // Search input in Daftar Buku
  inputSearchBooks.addEventListener('input', (e) => {
    const keyword = e.target.value.toLowerCase().trim();
    const filtered = cachedBooks.filter((book) =>
      book.title.toLowerCase().includes(keyword) || book.author.toLowerCase().includes(keyword)
    );
    renderBooksGrid(filtered);
  });

  // Form: Tambah Buku
  formAddBook.addEventListener('submit', handleAddBook);

  // Modal Pinjam Buku
  btnCloseModal.addEventListener('click', closeModal);
  btnCancelLoan.addEventListener('click', closeModal);
  formLoan.addEventListener('submit', handleLoanSubmit);

  // Mobile drawer events
  btnToggleSidebar.addEventListener('click', toggleMobileSidebar);
  sidebarOverlay.addEventListener('click', closeMobileSidebar);
}

// --- View Switcher ---
function switchView(viewName) {
  currentView = viewName;

  // Update nav active state
  navItems.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });

  // Toggle visible section
  contentViews.forEach((section) => {
    if (section.id === `view-${viewName}`) {
      section.classList.remove('hidden');
    } else {
      section.classList.add('hidden');
    }
  });

  // Scroll to top of main area
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- Mobile Sidebar Controls ---
function toggleMobileSidebar() {
  appSidebar.classList.toggle('open');
  sidebarOverlay.classList.toggle('hidden');
}

function closeMobileSidebar() {
  appSidebar.classList.remove('open');
  sidebarOverlay.classList.add('hidden');
}

// --- Data Fetching ---
async function refreshAllData() {
  await Promise.all([loadBooks(), loadLoans()]);
  updateDashboard();
}

async function loadBooks() {
  try {
    const res = await fetch('/api/books');
    if (!res.ok) throw new Error('Gagal memuat katalog buku');
    cachedBooks = await res.json();
    renderBooksGrid(cachedBooks);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadLoans() {
  try {
    const res = await fetch('/api/loans?status=active');
    if (!res.ok) throw new Error('Gagal memuat daftar peminjaman');
    cachedLoans = await res.json();
    renderLoansTable(cachedLoans);
    badgeLoansCount.textContent = cachedLoans.length;
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// --- Render Dashboard & Stats ---
function updateDashboard() {
  const totalTitles = cachedBooks.length;
  const totalCopies = cachedBooks.reduce((sum, b) => sum + (Number(b.total_copies) || 0), 0);
  const availableCopies = cachedBooks.reduce((sum, b) => sum + (Number(b.available_copies) || 0), 0);
  const activeLoans = cachedLoans.length;

  statTotalTitles.textContent = totalTitles;
  statTotalCopies.textContent = totalCopies;
  statActiveLoans.textContent = activeLoans;
  statAvailableCopies.textContent = availableCopies;

  // Render top 5 recent loans in dashboard table
  renderDashboardLoansTable(cachedLoans.slice(0, 5));
}

function renderDashboardLoansTable(loans) {
  tableDashboardLoansBody.innerHTML = '';

  if (loans.length === 0) {
    tableDashboardLoansBody.innerHTML = `
      <tr>
        <td colspan="4" class="empty-cell">Tidak ada buku yang sedang dipinjam saat ini.</td>
      </tr>
    `;
    return;
  }

  loans.forEach((loan) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${escapeHtml(loan.book_title)}</strong></td>
      <td>${escapeHtml(loan.tukang_pinjem)}</td>
      <td>${formatDateTime(loan.borrow_date)}</td>
      <td>
        <button class="btn btn-secondary btn-sm btn-return" data-id="${loan.id}">
          Kembalikan
        </button>
      </td>
    `;
    tr.querySelector('.btn-return').addEventListener('click', () => handleReturnBook(loan.id));
    tableDashboardLoansBody.appendChild(tr);
  });
}

// --- Render Books Catalog Grid ---
function renderBooksGrid(books) {
  booksGrid.innerHTML = '';

  if (books.length === 0) {
    booksGrid.innerHTML = '<p class="empty-cell">Tidak ada buku yang ditemukan.</p>';
    return;
  }

  books.forEach((book) => {
    const isAvailable = book.available_copies > 0;
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
      <div class="book-card-header">
        <h3 class="book-title">${escapeHtml(book.title)}</h3>
        <p class="book-author">oleh ${escapeHtml(book.author)}</p>
      </div>
      <div class="book-card-footer">
        <span class="badge ${isAvailable ? 'badge-available' : 'badge-empty'}">
          ${isAvailable ? `Stok: ${book.available_copies}/${book.total_copies}` : 'Habis'}
        </span>
        <button 
          class="btn btn-primary btn-sm btn-pinjam" 
          ${isAvailable ? '' : 'disabled'}
        >
          ${isAvailable ? 'Pinjam Buku' : 'Stok Habis'}
        </button>
      </div>
    `;

    const btnPinjam = card.querySelector('.btn-pinjam');
    if (isAvailable) {
      btnPinjam.addEventListener('click', () => openModal(book));
    }

    booksGrid.appendChild(card);
  });
}

// --- Render Loans Table (View Peminjaman) ---
function renderLoansTable(loans) {
  tableLoansBody.innerHTML = '';

  if (loans.length === 0) {
    tableLoansBody.innerHTML = `
      <tr>
        <td colspan="4" class="empty-cell">Belum ada peminjaman aktif.</td>
      </tr>
    `;
    return;
  }

  loans.forEach((loan) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${escapeHtml(loan.book_title)}</strong></td>
      <td>${escapeHtml(loan.tukang_pinjem)}</td>
      <td>${formatDateTime(loan.borrow_date)}</td>
      <td>
        <button class="btn btn-secondary btn-sm btn-return" data-id="${loan.id}">
          Kembalikan
        </button>
      </td>
    `;
    tr.querySelector('.btn-return').addEventListener('click', () => handleReturnBook(loan.id));
    tableLoansBody.appendChild(tr);
  });
}

// --- Form: Tambah Buku ---
async function handleAddBook(e) {
  e.preventDefault();
  const title = document.getElementById('book-title').value.trim();
  const author = document.getElementById('book-author').value.trim();
  const total_copies = document.getElementById('book-copies').value;

  try {
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, author, total_copies: Number(total_copies) }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal menambahkan buku');

    showToast(`Buku "${data.title}" berhasil ditambahkan!`, 'success');
    formAddBook.reset();
    await refreshAllData();
    switchView('books'); // Pindah otomatis ke daftar buku
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// --- Modal Handlers ---
function openModal(book) {
  selectedBook = book;
  modalBookTitle.textContent = book.title;
  modalBookAuthor.textContent = `oleh ${book.author}`;
  inputTukangPinjemName.value = '';
  loanModal.classList.remove('hidden');
  loanModal.setAttribute('aria-hidden', 'false');
  inputTukangPinjemName.focus();
}

function closeModal() {
  selectedBook = null;
  loanModal.classList.add('hidden');
  loanModal.setAttribute('aria-hidden', 'true');
}

// --- Action: Pinjam Buku ---
async function handleLoanSubmit(e) {
  e.preventDefault();
  if (!selectedBook) return;

  const tukang_pinjem = inputTukangPinjemName.value.trim();
  if (!tukang_pinjem) {
    showToast('Nama peminjam wajib diisi', 'error');
    return;
  }

  try {
    const res = await fetch('/api/loans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        book_id: selectedBook.id,
        tukang_pinjem: tukang_pinjem,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal memproses peminjaman');

    showToast('Peminjaman berhasil dicatat!', 'success');
    closeModal();
    await refreshAllData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// --- Action: Kembalikan Buku ---
async function handleReturnBook(loanId) {
  if (!confirm('Apakah buku ini sudah diterima kembali?')) return;

  try {
    const res = await fetch(`/api/loans/${loanId}/return`, {
      method: 'POST',
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal mengembalikan buku');

    showToast('Buku berhasil dikembalikan!', 'success');
    await refreshAllData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// --- Helper Functions ---
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function formatDateTime(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}