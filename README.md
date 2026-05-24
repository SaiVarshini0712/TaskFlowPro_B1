# TaskFlowPro_B1
⚡ TaskFlowPro_B1 — A full-stack task management web app with JWT auth, real-time updates via Socket.IO, Kanban drag-and-drop, dashboard analytics, dark mode, and responsive design. Built with React, Node.js, Express, and MongoDB.
⚡ TaskFlow Pro
A production-grade, full-stack Smart Task Management System built as an internship project submission. TaskFlow Pro demonstrates real-world engineering skills including JWT authentication, REST API design, real-time communication with Socket.IO, Kanban drag-and-drop, and a fully responsive UI with dark mode.

🚀 Live Demo

Frontend: https://taskflow-pro.vercel.app
Backend API: https://taskflow-pro-api.onrender.com


✨ Features
🔐 Authentication & Security

JWT-based login and registration
bcrypt password hashing
Protected routes on both frontend and backend
"Remember Me" toggle and persistent sessions
Auto-logout on token expiry

✅ Task Management (Full CRUD)

Create, edit, delete, and complete tasks
Fields: Title, Description, Priority, Status, Due Date, Category
Overdue detection with visual warnings
One-click status toggle

📊 Dashboard & Analytics

Stat cards: Total, Completed, In Progress, Overdue
SVG completion ring with animated progress
Priority breakdown bar chart
Category distribution tags
Recent tasks feed

⚡ Real-Time Updates

Socket.IO integration for live task sync
Instant notifications when tasks are created, updated, or deleted
Per-user socket rooms for isolated real-time events

🗂️ Kanban Board

Trello-style drag-and-drop board
Three columns: Pending → In Progress → Completed
Visual drop-zone highlighting
Toast confirmation on task move

🔍 Search & Filters

Live search across title, description, and category
Filter by priority and status
Sort by due date, priority, title, or newest

🌙 Dark Mode

Full light/dark theme toggle
CSS variable-based theming for smooth transitions

📱 Responsive Design

Mobile-first layout with hamburger sidebar
Works seamlessly on mobile, tablet, and desktop

🔔 Toast Notifications

Real-time toast alerts for all actions
Four types: success, error, info, warning
