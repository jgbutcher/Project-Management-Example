const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

/*
 * Advanced project management API.
 *
 * This server provides endpoints for managing projects and their tasks. It
 * persists data to a JSON file on disk (`data.json`) so that updates survive
 * server restarts. The API supports CRUD operations for both projects and
 * tasks, along with simple status transitions.
 *
 * Endpoints:
 *   GET    /api/projects                       -> list all projects
 *   POST   /api/projects                       -> create a new project
 *   GET    /api/projects/:pid                  -> get a single project
 *   PUT    /api/projects/:pid                  -> update a project’s name
 *   DELETE /api/projects/:pid                  -> delete a project and its tasks
 *
 *   GET    /api/projects/:pid/tasks            -> list tasks for a project
 *   POST   /api/projects/:pid/tasks            -> create a task for a project
 *   PUT    /api/projects/:pid/tasks/:tid       -> update a task (title, description, status)
 *   DELETE /api/projects/:pid/tasks/:tid       -> delete a task
 */

const dataFile = path.join(__dirname, 'data.json');

// Load data from disk; if the file doesn’t exist, initialize with empty structure
function loadData() {
  try {
    const text = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(text);
  } catch (err) {
    // Initialize with a sample project if file is missing
    return {
      nextProjectId: 2,
      nextTaskId: 2,
      projects: [
        {
          id: 1,
          name: 'Example Project',
          tasks: [
            { id: 1, title: 'Example Task', description: 'This is a sample task', status: 'todo', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          ]
        }
      ]
    };
  }
}

// Persist data to disk
function saveData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
}

// Helper to send JSON responses
function sendJSON(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const method = req.method;

  // CORS support
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Route matching using regex
  const projectPattern = /^\/api\/projects(?:\/(\d+))?(?:\/tasks(?:\/(\d+))?)?$/;
  const match = projectPattern.exec(parsed.pathname);
  if (!match) {
    sendJSON(res, 404, { error: 'Not Found' });
    return;
  }

  const [, projectIdStr, taskIdStr] = match;
  const projectId = projectIdStr ? parseInt(projectIdStr, 10) : null;
  const taskId = taskIdStr ? parseInt(taskIdStr, 10) : null;

  // Read incoming request body for POST/PUT
  function readBody(callback) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const json = body ? JSON.parse(body) : {};
        callback(null, json);
      } catch (err) {
        callback(err);
      }
    });
  }

  // Load data
  const data = loadData();

  // Handle project collection
  if (projectId === null && !taskId) {
    if (method === 'GET') {
      sendJSON(res, 200, data.projects);
      return;
    }
    if (method === 'POST') {
      readBody((err, body) => {
        if (err || !body.name) {
          sendJSON(res, 400, { error: 'Invalid project payload' });
          return;
        }
        const project = {
          id: data.nextProjectId++,
          name: body.name,
          tasks: []
        };
        data.projects.push(project);
        saveData(data);
        sendJSON(res, 201, project);
      });
      return;
    }
    sendJSON(res, 405, { error: 'Method Not Allowed' });
    return;
  }

  // Find project by ID
  const project = data.projects.find(p => p.id === projectId);
  if (!project) {
    sendJSON(res, 404, { error: 'Project not found' });
    return;
  }

  // Handle tasks collection
  if (taskId === null && parsed.pathname.endsWith('/tasks')) {
    if (method === 'GET') {
      sendJSON(res, 200, project.tasks);
      return;
    }
    if (method === 'POST') {
      readBody((err, body) => {
        if (err || !body.title) {
          sendJSON(res, 400, { error: 'Invalid task payload' });
          return;
        }
        const task = {
          id: data.nextTaskId++,
          title: body.title,
          description: body.description || '',
          status: body.status || 'todo',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        project.tasks.push(task);
        saveData(data);
        sendJSON(res, 201, task);
      });
      return;
    }
    sendJSON(res, 405, { error: 'Method Not Allowed' });
    return;
  }

  // Handle single project
  if (taskId === null) {
    if (method === 'GET') {
      sendJSON(res, 200, project);
      return;
    }
    if (method === 'PUT') {
      readBody((err, body) => {
        if (err || !body.name) {
          sendJSON(res, 400, { error: 'Invalid project payload' });
          return;
        }
        project.name = body.name;
        saveData(data);
        sendJSON(res, 200, project);
      });
      return;
    }
    if (method === 'DELETE') {
      data.projects = data.projects.filter(p => p.id !== project.id);
      saveData(data);
      sendJSON(res, 204, {});
      return;
    }
    sendJSON(res, 405, { error: 'Method Not Allowed' });
    return;
  }

  // Find task
  const task = project.tasks.find(t => t.id === taskId);
  if (!task) {
    sendJSON(res, 404, { error: 'Task not found' });
    return;
  }

  // Handle single task
  if (method === 'PUT') {
    readBody((err, body) => {
      if (err) {
        sendJSON(res, 400, { error: 'Invalid task payload' });
        return;
      }
      if (body.title !== undefined) task.title = body.title;
      if (body.description !== undefined) task.description = body.description;
      if (body.status !== undefined) task.status = body.status;
      task.updatedAt = new Date().toISOString();
      saveData(data);
      sendJSON(res, 200, task);
    });
    return;
  }
  if (method === 'DELETE') {
    project.tasks = project.tasks.filter(t => t.id !== task.id);
    saveData(data);
    sendJSON(res, 204, {});
    return;
  }
  if (method === 'GET') {
    sendJSON(res, 200, task);
    return;
  }
  sendJSON(res, 405, { error: 'Method Not Allowed' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Project management API listening on port ${PORT}`);
});