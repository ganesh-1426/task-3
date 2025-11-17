const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // parse JSON bodies
app.use(morgan('dev'));

// In-memory store
let books = [
  { id: 1, title: 'The Hobbit', author: 'J.R.R. Tolkien' },
  { id: 2, title: '1984', author: 'George Orwell' }
];
// Helper to get new id
const getNextId = () => books.length ? Math.max(...books.map(b => b.id)) + 1 : 1;

// Routes

// GET /books - return all books
app.get('/books', (req, res) => {
  res.json(books);
});

// GET /books/:id - return book by id
app.get('/books/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const book = books.find(b => b.id === id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json(book);
});

// POST /books - add a new book
// Expected body: { title: string, author: string }
app.post('/books', (req, res) => {
  const { title, author } = req.body;
  if (!title || !author) {
    return res.status(400).json({ error: 'Both title and author are required' });
  }
  const newBook = { id: getNextId(), title: title.trim(), author: author.trim() };
  books.push(newBook);
  res.status(201).json(newBook);
});

// PUT /books/:id - update a book
// Accepts partial updates: { title?: string, author?: string }
app.put('/books/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const bookIndex = books.findIndex(b => b.id === id);
  if (bookIndex === -1) return res.status(404).json({ error: 'Book not found' });

  const { title, author } = req.body;
  if (!title && !author) {
    return res.status(400).json({ error: 'Provide title and/or author to update' });
  }

  const updated = { ...books[bookIndex] };
  if (title) updated.title = title.trim();
  if (author) updated.author = author.trim();

  books[bookIndex] = updated;
  res.json(updated);
});

// DELETE /books/:id - remove a book
app.delete('/books/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const prevLength = books.length;
  books = books.filter(b => b.id !== id);
  if (books.length === prevLength) return res.status(404).json({ error: 'Book not found' });
  res.status(204).send(); // no content
});

// A simple health route
app.get('/', (req, res) => res.send('Books API is running'));

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});