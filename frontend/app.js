/*
 * Frontend logic for the project management app.
 *
 * The UI consists of a sidebar with projects and a main area displaying
 * the selected project’s task board. Users can create projects, add
 * tasks to the selected project, and move tasks between status columns.
 */

const API_BASE = 'http://localhost:3000/api';

// DOM elements
const projectListEl = document.getElementById('project-list');
const newProjectNameEl = document.getElementById('new-project-name');
const addProjectBtn = document.getElementById('add-project-btn');
const projectTitleEl = document.getElementById('project-title');
const boardEl = document.getElementById('board');
const taskInputsEl = document.getElementById('task-inputs');
const newTaskTitleEl = document.getElementById('new-task-title');
const newTaskDescEl = document.getElementById('new-task-desc');
const addTaskBtn = document.getElementById('add-task-btn');

let currentProject = null;

// Fetch and render all projects
async function loadProjects() {
  try {
    const resp = await fetch(`${API_BASE}/projects`);
    const projects = await resp.json();
    renderProjectList(projects);
  } catch (err) {
    console.error('Failed to load projects:', err);
  }
}

function renderProjectList(projects) {
  projectListEl.innerHTML = '';
  projects.forEach(project => {
    const li = document.createElement('li');
    li.textContent = project.name;
    li.dataset.id = project.id;
    li.className = currentProject && currentProject.id === project.id ? 'selected' : '';
    li.addEventListener('click', () => selectProject(project.id));
    projectListEl.appendChild(li);
  });
}

// Select a project and load its tasks
async function selectProject(projectId) {
  try {
    const resp = await fetch(`${API_BASE}/projects/${projectId}`);
    if (!resp.ok) throw new Error('Project not found');
    currentProject = await resp.json();
    projectTitleEl.textContent = currentProject.name;
    boardEl.classList.remove('hidden');
    taskInputsEl.classList.remove('hidden');
    newTaskTitleEl.value = '';
    newTaskDescEl.value = '';
    highlightSelectedProject();
    renderTasks(currentProject.tasks);
  } catch (err) {
    console.error(err);
  }
}

function highlightSelectedProject() {
  const items = projectListEl.querySelectorAll('li');
  items.forEach(item => {
    item.classList.toggle('selected', currentProject && parseInt(item.dataset.id, 10) === currentProject.id);
  });
}

function renderTasks(tasks) {
  const statuses = ['todo', 'in-progress', 'done'];
  statuses.forEach(status => {
    const column = boardEl.querySelector(`.column[data-status="${status}"] .task-list`);
    column.innerHTML = '';
    tasks.filter(task => task.status === status).forEach(task => {
      const li = document.createElement('li');
      li.className = 'task-item';
      li.innerHTML = `<strong>${task.title}</strong><br><small>${task.description}</small>`;
      // Actions container
      const actions = document.createElement('div');
      actions.className = 'task-actions';
      // Move button except for done
      if (task.status !== 'done') {
        const moveBtn = document.createElement('button');
        moveBtn.textContent = 'Move ➡';
        moveBtn.addEventListener('click', () => moveTaskForward(task));
        actions.appendChild(moveBtn);
      }
      // Delete button
      const delBtn = document.createElement('button');
      delBtn.textContent = 'Delete';
      delBtn.addEventListener('click', () => deleteTask(task));
      actions.appendChild(delBtn);
      li.appendChild(actions);
      column.appendChild(li);
    });
  });
}

// Create a new project
async function addProject() {
  const name = newProjectNameEl.value.trim();
  if (!name) return;
  try {
    const resp = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    if (!resp.ok) throw new Error('Failed to create project');
    newProjectNameEl.value = '';
    loadProjects();
  } catch (err) {
    console.error(err);
  }
}

// Create a new task in the current project with status todo
async function addTask() {
  if (!currentProject) return;
  const title = newTaskTitleEl.value.trim();
  const description = newTaskDescEl.value.trim();
  if (!title) return;
  try {
    const resp = await fetch(`${API_BASE}/projects/${currentProject.id}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, status: 'todo' })
    });
    if (!resp.ok) throw new Error('Failed to create task');
    newTaskTitleEl.value = '';
    newTaskDescEl.value = '';
    // Reload tasks
    selectProject(currentProject.id);
  } catch (err) {
    console.error(err);
  }
}

// Move a task to the next status
async function moveTaskForward(task) {
  const nextStatusMap = { 'todo': 'in-progress', 'in-progress': 'done' };
  const nextStatus = nextStatusMap[task.status];
  if (!nextStatus) return;
  try {
    await fetch(`${API_BASE}/projects/${currentProject.id}/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus })
    });
    selectProject(currentProject.id);
  } catch (err) {
    console.error(err);
  }
}

// Delete a task
async function deleteTask(task) {
  try {
    await fetch(`${API_BASE}/projects/${currentProject.id}/tasks/${task.id}`, {
      method: 'DELETE'
    });
    selectProject(currentProject.id);
  } catch (err) {
    console.error(err);
  }
}

// Event listeners
addProjectBtn.addEventListener('click', addProject);
addTaskBtn.addEventListener('click', addTask);

// Initial load
loadProjects();