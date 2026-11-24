# pinjemwan

A clean, lightweight book lending management web application built with a high-performance **Express REST API**, **native Node.js 22 SQLite**, and an elegant **Literary Minimal UI** without heavy frontend frameworks.

---

## Key Features

- **Real-Time Catalog & Availability Tracking**: View books with instant availability status. The borrow button is automatically disabled when a book is currently borrowed.
- **Customizable Loan Duration & Overdue Tracking**: Borrowers can specify custom loan durations in days (default: 14 days), with live status badges (*Sisa X hr*, *Hari ini*, or *Terlambat X hr*).
- **Unified Sidebar Navigation**: Intuitive layout with Dashboard metrics, Catalog, Active Loans, and Returned History.
- **Borrower View**: Frictionless borrowing flow via a simple modal form with dynamic loan terms preview.
- **Management & Monitoring**:
  - Add new book titles and authors.
  - Transparent active borrower monitoring table with live due dates.
  - Loan return confirmation and complete return history audit trail.
- **Zero Framework Bloat**: Crafted purely with Semantic HTML5, Modern CSS, and Vanilla JavaScript.
- **Native Embedded Database**: Powered by Node.js v22 built-in `node:sqlite` (`DatabaseSync`), eliminating external database setup or native compilation tools.

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
| `GET` | `/api/books` | Fetch all books with live availability (`is_available`) | - | `200 OK` (Array of books) |
| `POST` | `/api/books` | Add a new book to the catalog | `{"title": "...", "author": "..."}` | `201 Created` |
| `GET` | `/api/loans` | Retrieve loan records with `due_date` | Optional: `?status=active` or `?status=returned` | `200 OK` (Array of loans) |
| `POST` | `/api/loans` | Borrow a book with optional custom duration | `{"book_id": 1, "tukang_pinjem": "Kevin", "duration_days": 14}` | `201 Created` |
| `POST` | `/api/loans/:id/return` | Confirm book return | - | `200 OK` |

---

## License

Distributed under the [MIT License](LICENSE). Built for clean portfolio and learning purposes.
