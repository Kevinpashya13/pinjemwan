const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

const dbPath = path.join(__dirname, '..', 'pinjemwan.sqlite');
const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    tukang_pinjem TEXT NOT NULL,
    borrow_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    due_date DATETIME,
    return_date DATETIME,
    status TEXT NOT NULL CHECK(status IN ('active', 'returned')),
    FOREIGN KEY (book_id) REFERENCES books (id)
  );
`);

// Migration safeguards
try {
  db.exec(`
    ALTER TABLE books DROP COLUMN total_copies;
    ALTER TABLE books DROP COLUMN available_copies;
  `);
} catch {}

try {
  db.exec(`ALTER TABLE loans ADD COLUMN due_date DATETIME;`);
} catch {}

try {
  db.exec(`UPDATE loans SET due_date = datetime(borrow_date, '+14 days') WHERE due_date IS NULL;`);
} catch {}

const countBooks = db.prepare('SELECT COUNT(*) AS total FROM books').get();
if (countBooks.total === 0) {
  const insertSeed = db.prepare(`
    INSERT INTO books (title, author)
    VALUES (?, ?)
  `);

  insertSeed.run('Laskar Pelangi', 'Andrea Hirata');
  insertSeed.run('Filosofi Teras', 'Henry Manampiring');
  insertSeed.run('Atomic Habits', 'James Clear');
  console.log('Seed data initialized successfully.');
}

module.exports = db;
