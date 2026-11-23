let currentRole = 'tukang-pinjem';
let selectedBook = null;

const btnRoleTukangPinjem = document.getElementById('btn-role-tukang-pinjem');
const btnRoleAdmin = document.getElementById('btn-role-admin');
const viewTukangPinjem = document.getElementById('view-tukang-pinjem');
const viewAdmin = document.getElementById('view-admin');

const booksGrid = document.getElementById('books-grid');
const formAddBook = document.getElementById('form-add-book');
const tableLoansBody = document.getElementById('table-loans-body');
const activeLoansCount = document.getElementById('active-loans-count');

const loanModal = document.getElementById('loan-modal');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnCancelLoan = document.getElementById('btn-cancel-loan');
const formLoan = document.getElementById('form-loan');
const modalBookTitle = document.getElementById('modal-book-title');
const modalBookAuthor = document.getElementById('modal-book-author');
const inputTukangPinjemName = document.getElementById('tukang-pinjem-name');

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadBooks();
  loadLoans();
});

// --- Event Listeners Setup ---
function setupEventListeners() {
  // Role switcher toggle
  btnRoleTukangPinjem.addEventListener('click', () => switchRole('tukang-pinjem'));
  btnRoleAdmin.addEventListener('click', () => switchRole('admin'));

  // Admin form submission: Add Book
  formAddBook.addEventListener('submit', handleAddBook);

  // Tukang Pinjem modal events
  btnCloseModal.addEventListener('click', closeModal);
  btnCancelLoan.addEventListener('click', closeModal);
  formLoan.addEventListener('submit', handleLoanSubmit);
}

// --- Switch Role Navigation ---
function switchRole(role) {
  currentRole = role;
  if (role === 'tukang-pinjem') {
    btnRoleTukangPinjem.classList.add('active');
    btnRoleAdmin.classList.remove('active');
    viewTukangPinjem.classList.remove('hidden');
    viewAdmin.classList.add('hidden');
    loadBooks(); // Refresh catalog
  } else {
    btnRoleAdmin.classList.add('active');
    btnRoleTukangPinjem.classList.remove('active');
    viewAdmin.classList.remove('hidden');
    viewTukangPinjem.classList.add('hidden');
    loadLoans(); // Refresh admin loan tracking
  }
}

// --- API: Fetch & Render Books Catalog ---
async function loadBooks() {
  try {
    const res = await fetch('/api/books');
    if (!res.ok) throw new Error('Gagal memuat cyuks');
    const books = await res.json();
    renderBooksGrid(books);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Render book cards for Tukang Pinjem view
function renderBooksGrid(books) {
  booksGrid.innerHTML = '';

  if (books.length === 0) {
    booksGrid.innerHTML = '<p class="empty-cell">Waduh cyuks, bukunya blom gw masukin yaks</p>';
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
          ${isAvailable ? `Stok: ${book.available_copies}/${book.total_copies}` : 'Abis cyuks'}
        </span>
        <button 
          class="btn btn-primary btn-sm btn-pinjam" 
          ${isAvailable ? '' : 'disabled'}
        >
          ${isAvailable ? 'Minjem dongs' : 'Minjem dongs'}
        </button>
      </div>
    `;

    // Attach click event for borrowing
    const btnPinjam = card.querySelector('.btn-pinjam');
    if (isAvailable) {
      btnPinjam.addEventListener('click', () => openModal(book));
    }

    booksGrid.appendChild(card);
  });
}

// --- API: Fetch & Render Active Loans (Admin View) ---
async function loadLoans() {
  try {
    const res = await fetch('/api/loans?status=active');
    if (!res.ok) throw new Error('Gagal memuat cyuks');
    const loans = await res.json();
    renderLoansTable(loans);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Render active loans table for Admin
function renderLoansTable(loans) {
  tableLoansBody.innerHTML = '';
  activeLoansCount.textContent = `${loans.length} dipinjem`;

  if (loans.length === 0) {
    tableLoansBody.innerHTML = `
      <tr>
        <td colspan="4" class="empty-cell">Gaada yang minjem cyuks.</td>
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
          Balikins
        </button>
      </td>
    `;

    // Return button event
    tr.querySelector('.btn-return').addEventListener('click', () => handleReturnBook(loan.id));
    tableLoansBody.appendChild(tr);
  });
}

// --- API: Admin Add New Book ---
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
    if (!res.ok) throw new Error(data.error || 'Gagal cyuks');

    showToast(`Buku "${data.title}" Udah ditambahin cyuks`, 'success');
    formAddBook.reset();
    loadBooks();
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

// --- API: Tukang Pinjem Submits Loan ---
async function handleLoanSubmit(e) {
  e.preventDefault();
  if (!selectedBook) return;

  const tukang_pinjem = inputTukangPinjemName.value.trim();
  if (!tukang_pinjem) {
    showToast('Nama lu isi dulu cyuks', 'error');
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
    if (!res.ok) throw new Error(data.error || 'Gagal cyuks');

    showToast(data.message || 'Udah dipinjemins', 'success');
    closeModal();
    loadBooks();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// --- API: Admin Returns Book ---
async function handleReturnBook(loanId) {
  if (!confirm('Bukunya udah dibalikins?')) return;

  try {
    const res = await fetch(`/api/loans/${loanId}/return`, {
      method: 'POST',
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal cyuks');

    showToast(data.message || 'Udah dibalikins', 'success');
    loadLoans();
    loadBooks();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

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