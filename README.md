FullStack Project Management Tool
This repository demonstrates a complete, fullstack project management application built solely with builtin Node.js modules and vanilla web technologies. Despite having no external dependencies, it supports multiple projects, tasks with workflow stages, and persistent storage, making it a solid showcase of endtoend engineering.
Features
• Multiproject support – you can create as many projects as you like. Each project maintains its own task board.
• Tasks with statuses – tasks include a title, optional description, and a status (todo, inprogress, done). Tasks can be moved through these stages via the API or the UI.
• Persistent storage – all projects and tasks are saved to a JSON file on disk (backend/data.json), so your data survives server restarts.
• RESTful API – clean endpoints allow clients to create, read, update and delete projects and tasks (see the API Reference).
• Interactive UI – the frontend provides a sidebar of projects and a Kanbanstyle board. You can add projects, create tasks, move them between columns and delete them, all without a page reload.
API Reference
All endpoints are relative to http://localhost:3000/api.
Project Collection
MethodEndpointDescriptionGET/projectsList all projects.POST/projectsCreate a project. Body: { "name": "..." }Single Project
MethodEndpointDescriptionGET/projects/:pidGet a project by id.PUT/projects/:pidRename a project. Body: { "name": "..." }DELETE/projects/:pidDelete a project and all of its tasks.Task Collection (per project)
MethodEndpointDescriptionGET/projects/:pid/tasksList tasks for a project.POST/projects/:pid/tasksCreate a task. Body: { "title": "...", "description": "...", "status": "todo" }Single Task
MethodEndpointDescriptionPUT/projects/:pid/tasks/:tidUpdate a task’s title, description or status. Body may contain any of those fields.DELETE/projects/:pid/tasks/:tidDelete a task from the project.Getting Started
Backend
The backend resides in the backend folder. It uses Node’s http module to serve the API and reads/writes data to data.json. To run it:
cd backend
node server.js
The server listens on port 3000 by default. On first run it creates data.json with a sample project if the file doesn’t exist. Feel free to delete or edit this file to reset your data.
Frontend
The frontend is located in the frontend directory. There’s no build step; simply open the index.html in your browser after starting the backend:
cd frontend
# doubleclick index.html or open it with your preferred browser
You’ll see a list of projects on the left and a task board on the right. Create a project, add tasks, move them through stages (using the move button), and delete them as needed.
Project Structure
full_stack_project/
├── backend/
│   ├── server.js    # Node HTTP server providing the API
│   ├── data.json    # Persistent data store (autocreated on first run)
│   └── package.json # npm metadata (no external dependencies used)
├── frontend/
│   ├── index.html   # Main HTML page
│   ├── app.js       # Frontend logic for interacting with the API
│   └── style.css    # Basic styling
└── README.md        # Project documentation
Next Steps
This app is intentionally lightweight yet demonstrates a breadth of fullstack concepts. To take it further:
• Swap the JSON file for a real database (SQLite, PostgreSQL or MongoDB).
• Add user authentication so each user has their own projects and tasks.
• Replace vanilla JS with a modern framework such as React or Vue and add a build tool (Vite, Webpack) to scale the UI.
• Deploy the backend to a hosting service and serve the frontend over HTTPS.
Feel free to fork and modify this project however you see fit – it’s a great springboard for showcasing your fullstack skills.

