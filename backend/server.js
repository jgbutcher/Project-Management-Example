const http = require('http');
const url = require('url');

/*
 * Simple task API implemented using Node's built-in HTTP server.
 *
 * Endpoints:
 *   GET  /api/tasks    -> returns an array of tasks
 *   POST /api/tasks    -> accepts a JSON payload { title: string, completed: boolean }
 *                         and appends a new task to the in‑memory list
 *
 * CORS headers are added to allow the frontend (running from a file or another port)
 * to interact with the API without browser restrictions.
 */

// In-memory task store. In a production system this would be persisted in a database.
let tasks = [
  { id: 1, title: 'Example Task', completed: false }
];
let nextId = 2;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Immediately respond to CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Handle GET /api/tasks
  if (parsedUrl.pathname === '/api/tasks' && req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(tasks));
    return;
  }

  // Handle POST /api/tasks
  if (parsedUrl.pathname === '/api/tasks' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const task = JSON.parse(body);
        // Basic validation: ensure title is provided
        if (!task.title || typeof task.title !== 'string') {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Task must have a string title.' }));
          return;
        }
        task.id = nextId++;
        task.completed = Boolean(task.completed);
        tasks.push(task);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(task));
      } catch (err) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Invalid JSON payload.' }));
      }
    });
    return;
  }

  // Fallback: 404 for unhandled routes
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Not Found');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Task API server listening on port ${PORT}`);
});