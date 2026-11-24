const express = require('express');
const cors = require('cors');
const db = require('./db');
const path = require('node:path'); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Get all books in catalog with live availability status
app.get('/api/books', (req, res) => {
  try {
    const books = db.prepare(`
      SELECT books.*,
        CASE 
          WHEN EXISTS (SELECT 1 FROM loans WHERE loans.book_id = books.id AND loans.status = 'active') 
          THEN 0 
          ELSE 1 
        END AS is_available
      FROM books 
      ORDER BY books.id DESC
    `).all();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Add a new book
app.post('/api/books', (req, res) => {
  try {
    const { title, author } = req.body;
    if (!title || !author || !title.trim() || !author.trim()) {
      return res.status(400).json({ error: 'Title dan author wajib diisi cyuks' });
    }

    const insert = db.prepare(`
      INSERT INTO books (title, author)
      VALUES (?, ?)
    `);
    const result = insert.run(title.trim(), author.trim());

    const newBook = db.prepare('SELECT * FROM books WHERE id = ?').get(result.lastInsertRowid);
    newBook.is_available = 1;
    res.status(201).json(newBook);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get loan records (optional filter: ?status=active or ?status=returned)
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

// Tukang Pinjem: Borrow a book
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

    // Ensure book is not already borrowed
    const activeLoan = db.prepare("SELECT 1 FROM loans WHERE book_id = ? AND status = 'active'").get(book_id);
    if (activeLoan) {
      return res.status(400).json({ error: 'Bukunya lagi dipinjam orang lain cyuks' });
    }

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

// Admin: Confirm book return
app.post('/api/loans/:id/return', (req, res) => {
  try {
    const loanId = req.params.id;
    const loan = db.prepare("SELECT * FROM loans WHERE id = ? AND status = 'active'").get(loanId);

    if (!loan) {
      return res.status(404).json({ error: 'Gaada yang minjem atoga udah dibalikin sih cyuks' });
    }

    db.prepare(`
      UPDATE loans
      SET status = 'returned', return_date = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(loanId);

    res.json({ message: 'Waduh makasih udah dibalikin cyuks' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server pinjemwan running on http://localhost:${PORT}`);
});
