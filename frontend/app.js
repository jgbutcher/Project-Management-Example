/*
 * Frontend logic for the project management tool.
 *
 * This script fetches tasks from the backend API and renders them as a list.
 * It also allows the user to add new tasks via the input field. When the
 * "Add Task" button is clicked, a POST request is sent to the backend to
 * create a new task, and the list is refreshed.
 */

async function fetchTasks() {
  try {
    const response = await fetch('http://localhost:3000/api/tasks');
    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.statusText}`);
    }
    const tasks = await response.json();
    renderTasks(tasks);
  } catch (error) {
    console.error(error);
  }
}

function renderTasks(tasks) {
  const list = document.getElementById('task-list');
  list.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.textContent = `${task.title}${task.completed ? ' (completed)' : ''}`;
    list.appendChild(li);
  });
}

async function addTask() {
  const input = document.getElementById('new-task');
  const title = input.value.trim();
  if (!title) return;
  try {
    await fetch('http://localhost:3000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title, completed: false })
    });
    input.value = '';
    fetchTasks();
  } catch (error) {
    console.error('Error adding task:', error);
  }
}

// Setup event listeners on page load
document.addEventListener('DOMContentLoaded', () => {
  fetchTasks();
  document.getElementById('add-btn').addEventListener('click', addTask);
});