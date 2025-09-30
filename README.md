# Ticket Management System (JavaScript)

A lightweight, front-end **SaaS-style** ticket manager built with **JS** and **localStorage**. Supports CRUD tickets, filtering, search, sorting, status transitions, and simple analytics.

## ✨ Features
- Create / Edit / Delete tickets
- Status workflow: **OPEN → IN_PROGRESS → RESOLVED → CLOSED**
- Search by title / id / assignee / tags
- Filters (by status) and sorting (date, priority)
- LocalStorage persistence (no backend required)
- Responsive, modern UI

## 🧩 Tech Stack
- HTML, CSS, JavaScript 
- localStorage for persistence (can be swapped with a backend later)

## 🚀 Quick Start
1. Download the project or clone the repo
2. Open `index.html` in your browser
3. Click **+ New Ticket**, fill the form, save
4. Use search, filter, sort to manage tickets

## 🛠 Project Structure
```
.
├─ index.html
├─ style.css
└─ app.js
```

## 🔌 Backend Later?
This project is designed so `save/load` can be replaced with API calls (REST/GraphQL).  
- Replace `load()`/`save()` with `fetch('/api/tickets')` logic.  
- Keep the rest of the UI code as is.
