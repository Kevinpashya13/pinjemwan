const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

const dbPath = path.join(__dirname, '..', 'pinjemwan.sqlite');
const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    total_copies INTEGER NOT NULL,
    available_copies INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    tukang_pinjem TEXT NOT NULL,
    borrow_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    return_date DATETIME,
    status TEXT NOT NULL CHECK(status IN ('active', 'returned')),
    FOREIGN KEY (book_id) REFERENCES books (id)
  );
`);

const countBooks = db.prepare('SELECT COUNT(*) AS total FROM books').get();
if (countBooks.total === 0) {
  const insertSeed = db.prepare(`
    INSERT INTO books (title, author, total_copies, available_copies)
    VALUES (?, ?, ?, ?)
  `);

  insertSeed.run('Laskar Pelangi', 'Andrea Hirata', 3, 3);
  insertSeed.run('Filosofi Teras', 'Henry Manampiring', 2, 2);
  insertSeed.run('Atomic Habits', 'James Clear', 1, 1);
  console.log('Seed data initialized successfully.');
}

module.exports = db;