# pinjemwan

A clean, lightweight book lending management web application built with a high-performance **Express REST API**, **native Node.js 22 SQLite**, and an elegant **Literary Minimal UI** without heavy frontend frameworks.

---

## Key Features

- **Real-Time Catalog & Stock Tracking**: View available books and live copy counters. The borrow button is automatically disabled when a book is out of stock.
- **Borrower View ("Tukang Pinjem")**: Frictionless borrowing flow via a simple modal form without tedious registration or authentication barriers.
- **Admin Dashboard**:
  - Add new book titles and set initial stock quantities.
  - Transparent active borrower monitoring table.
  - One-click physical book return confirmation, automatically replenishing stock count.
- **Zero Framework Bloat**: Crafted purely with Semantic HTML5, Modern CSS (Design Tokens & Segmented Control), and Vanilla JavaScript.
- **Native Embedded Database**: Powered by Node.js v22 built-in `node:sqlite` (`DatabaseSync`), eliminating the need for third-party native compilation tools like `node-gyp` or external database services.

---

## Tech Stack

- **Runtime & Backend**: Node.js (v22.x+), Express.js, CORS
- **Database**: SQLite (Node.js 22 Native `node:sqlite`)
- **Frontend**: HTML5, Modern CSS, Vanilla ES6+ JavaScript
- **Typography**: Newsreader (Serif) & Plus Jakarta Sans

---

## Getting Started (Local Setup)

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js v22.x** or higher (`node -v`)
- **Git**

### 2. Clone Repository
```bash
git clone https://github.com/YOUR-USERNAME/pinjemwan.git
cd pinjemwan
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Application
```bash
npm start
```

Open your browser and navigate to:
```
http://localhost:3000
```

> **Note:** The local SQLite database (`pinjemwan.sqlite`) and initial seed books (*Laskar Pelangi*, *Filosofi Teras*, *Atomic Habits*) will be created automatically on the first server boot.

---

## REST API Documentation

| Method | Endpoint | Description | Request Payload | Response |
|---|---|---|---|---|
| `GET` | `/api/books` | Fetch all books and stock status | - | `200 OK` (Array of books) |
| `POST` | `/api/books` | Add a new book to the catalog | `{"title": "...", "author": "...", "total_copies": 3}` | `201 Created` |
| `GET` | `/api/loans` | Retrieve loan records | Optional: `?status=active` | `200 OK` (Array of loans) |
| `POST` | `/api/loans` | Borrow a book | `{"book_id": 1, "tukang_pinjem": "Kevin"}` | `201 Created` |
| `POST` | `/api/loans/:id/return` | Confirm book return (Admin) | - | `200 OK` |

---

## Project Directory Structure

```text
pinjemwan/
├── public/              # Client-side static assets
│   ├── index.html       # Semantic page layout and modal
│   ├── style.css        # Literary Minimal styling & design tokens
│   └── app.js           # Interactive state management & API fetch calls
├── src/                 # Node.js backend
│   ├── db.js            # SQLite database initialization & seeding
│   └── server.js        # Express REST API routes and static server
├── .gitignore           # Ignored files (node_modules, SQLite database, logs)
├── package.json         # Project metadata and dependencies
└── README.md            # Project documentation
```

---

## License

Distributed under the [MIT License](LICENSE). Built for clean portfolio and learning purposes.