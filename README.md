# 📚 Digital Library System

A web-based digital library platform that allows users to **browse**, **search** and **Add Books** , with a secure **authentication system** and a robust **admin interface** to manage the collection. Built with **HTML**, **Tailwind CSS**, **JavaScript**, and **Firebase (Auth + Firestore)**.

---

## 📌 Table of Contents

- [📖 Introduction](#-introduction)
- [✨ Features](#-features)
- [🧑‍💻 Technologies Used](#-technologies-used)
- [📁 Project Structure](#-project-structure)
- [⚙️ Firebase Configuration](#️-firebase-configuration)
- [🚀 Setup Instructions](#-setup-instructions)
- [🔐 Roles & Permissions](#-roles--permissions)
- [📸 Screenshots](#-screenshots)
- [🔮 Future Enhancements](#-future-enhancements)
- [🤖 AI Involvement](#-ai-involvement)
- [🙋 Contributors](#-contributors)
- [📄 License](#-license)

---

## 📖 Introduction

The **Digital Library System** is an academic mini-project that offers a modern interface for students and administrators to interact with a digital book repository.  
It supports two user roles:
- **Users** who can search, view, bookmark, and suggest books.
- **Admins** who can manage the entire book collection.

This project was built from scratch using frontend technologies and serverless backend services like Firebase.

---

## ✨ Features

### 🔐 Authentication
- Firebase Email/Password-based secure login
- Persistent sessions and auto-redirect on auth state
- Role-based access: user vs admin

### 👤 User Profile
- View personal details: name, gender, age, location
- View account info: status, role, join date, last active
- Edit profile option with validation
- Tab-based profile navigation (Details / Edit)

### 📚 Library Interface
- Browse all books with cover thumbnails
- Search by keyword or filter by category
- Bookmark favorite books
- Suggest new books via form submission

### ⚙️ Admin Panel
- Add new books with cover URL and file link
- Edit or delete books from Firestore

---

## 🧑‍💻 Technologies Used

| Technology         | Purpose                                      |
|--------------------|----------------------------------------------|
| **HTML5**          | Page structure                               |
| **Tailwind CSS**   | Styling and responsive design                |
| **JavaScript (ES6)** | Logic, DOM manipulation                     |
| **Firebase Auth**  | Secure authentication                        |
| **Firebase Firestore** | Real-time NoSQL database for data storage  |
| **Font Awesome**   | Icons for UI buttons                         |

---

## 📁 Project Structure

```
digital-library-system/
├── index.html          # Login and Register page
├── profile.html        # User profile and edit page
├── books.html          # View, search, manage books
├── app.js              # Firebase initialization and app logic
├── css/
│   └── styles.css      # Custom Tailwind overrides (if any)
├── assets/
│   └── images/         # Book covers, icons
└── README.md           # Project documentation
```

---

## ⚙️ Firebase Configuration

To use Firebase services, configure your Firebase project:

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable **Email/Password Authentication**
3. Create a **Firestore Database** with the following collections:

### `users` collection:
```json
{
  "fullName": "Alice Smith",
  "age": 22,
  "gender": "female",
  "location": "Mumbai",
  "role": "user" or 'admin',
  "status": "active",
  "createdAt": "...",
  "lastActive": "..."
}
```

### `books` collection:
```json
{
  "title": "Rich Dad Poor Dad",
  "author": "Robert Kiyosaki",
  "category": "Finance",
  "fileUrl": "https://...",
  "coverUrl": "https://...",
  "uploadedBy": "admin"
}
```

### `suggestions` collection:
```json
{
  "title": "New Book Title",
  "author": "Requested Author",
  "submittedBy": "userEmail",
  "timestamp": "..."
}
```

---

## 🚀 Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/digital-library-system.git
   cd digital-library-system
   ```

2. **Set Up Firebase**
   - Copy your Firebase config and paste it inside `app.js` under `const firebaseConfig = { ... }`

3. **Open in Browser**
   - Open `index.html` or `books.html` in a browser
   - For best results, use **Live Server** in VS Code

---

## 🔐 Roles & Permissions

| Role   | Capabilities                                                     |
|--------|------------------------------------------------------------------|
| User   | View/Search books, View documents, Download books Edit profile   |
| Admin  | All user permissions + Add/Edit/Delete books, Review suggestions|

---

## 📸 Screenshots

> *(You can add real screenshots of the following pages)*

- Login & Register
- Profile tab (View/Edit)
- Books dashboard
- Admin book management

---

## 🔮 Future Enhancements

- 🗂️ EPUB/PDF reader integration
- 🌙 Dark mode toggle
- 📊 Admin dashboard with Statistics
- 🗣️ Book comments and star ratings
- 📤 Upload support for book files by admin

---

## 🤖 AI Involvement

This mini-project was built with the assistance of multiple AI tools for faster and optimized development:

| AI Tool     | Contribution Area                        |
|-------------|-------------------------------------------|
| **ChatGPT** | Firebase integration, JavaScript logic, UI templates |
| **Gemini**  | Feature suggestions, UI logic validation |
| **GitHub Copilot** | Live code auto-completion & refactoring   |

> These AI tools were crucial for:
> - Structuring clean and modular code
> - Writing real-time database logic
> - Improving frontend UX with Tailwind CSS
> - Debugging and error fixing

---


## 📌 Contributions

### Development Team
*The following individuals were primarily responsible for the design, development, and implementation of the project.*

- **Your Full Name**
- **P. Shruthi**
- **P. Akshitha**
- **O. Kavitha**
- **M. Poojitha**

### Support and Guidance
- **Shiva G.** – Provided external support in development and testing of the project.
- **Ramakrishna** – Faculty Mentor. Guided the team throughout the project.


## 📄 License

This project is for **educational and academic** purposes only.  
You may modify or extend it freely for personal or institutional use.


