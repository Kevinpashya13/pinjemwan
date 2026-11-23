const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 1. GET /api/books - Get all books in catalog
app.get('/api/books', (req, res) => {
  try {
    const books = db.prepare('SELECT * FROM books ORDER BY id DESC').all();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. POST /api/books - Admin: Add a new book
app.post('/api/books', (req, res) => {
  try {
    const { title, author, total_copies } = req.body;
    if (!title || !author || !total_copies || Number(total_copies) <= 0) {
      return res.status(400).json({ error: 'Title, author, dan total_copies (> 0) wajib diisi cyuks' });
    }

    const copies = parseInt(total_copies, 10);
    const insert = db.prepare(`
      INSERT INTO books (title, author, total_copies, available_copies)
      VALUES (?, ?, ?, ?)
    `);
    const result = insert.run(title.trim(), author.trim(), copies, copies);

    const newBook = db.prepare('SELECT * FROM books WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newBook);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET /api/loans - Admin: Get loan records (optional filter: ?status=active)
app.get('/api/loans', (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT loans.*, books.title AS book_title, books.author AS book_author
      FROM loans
      JOIN books ON loans.book_id = books.id
    `;
    const params = [];

    if (status) {
      query += ' WHERE loans.status = ?';
      params.push(status);
    }

    query += ' ORDER BY loans.id DESC';
    const loans = db.prepare(query).all(...params);
    res.json(loans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. POST /api/loans - Tukang Pinjem: Borrow a book
app.post('/api/loans', (req, res) => {
  try {
    const { book_id, tukang_pinjem } = req.body;
    if (!book_id || !tukang_pinjem || !tukang_pinjem.trim()) {
      return res.status(400).json({ error: 'book_id dan tukang_pinjem isi dulu cyuks' });
    }

    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(book_id);
    if (!book) {
      return res.status(404).json({ error: 'Gaada bukunya cyuks' });
    }

    if (book.available_copies <= 0) {
      return res.status(400).json({ error: 'Udah ada yang minjem cyuks' });
    }

    // Decrease book available copies & record loan transaction
    db.prepare('UPDATE books SET available_copies = available_copies - 1 WHERE id = ?').run(book_id);
    const insertLoan = db.prepare(`
      INSERT INTO loans (book_id, tukang_pinjem, status)
      VALUES (?, ?, 'active')
    `);
    const result = insertLoan.run(book_id, tukang_pinjem.trim());

    const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Dah minjem yaks cyuks', loan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. POST /api/loans/:id/return - Admin: Confirm book return
app.post('/api/loans/:id/return', (req, res) => {
  try {
    const loanId = req.params.id;
    const loan = db.prepare("SELECT * FROM loans WHERE id = ? AND status = 'active'").get(loanId);

    if (!loan) {
      return res.status(404).json({ error: 'Gaada yang minjem atoga udah dibalikin sih cyuks' });
    }

    // Update loan status & restore book available copies
    db.prepare(`
      UPDATE loans
      SET status = 'returned', return_date = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(loanId);

    db.prepare('UPDATE books SET available_copies = available_copies + 1 WHERE id = ?').run(loan.book_id);

    res.json({ message: 'Waduh makasih udah dibalikin cyuks' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server pinjemwan running on http://localhost:${PORT}`);
});