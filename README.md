# 📚 Digital Library System

A web-based digital library platform that allows users to **browse**, **search**, and **download books**, with a secure **authentication system** and a focused **admin interface** to manage book content. Built using **HTML**, **Tailwind CSS**, **JavaScript**, and **Firebase (Auth + Firestore)**.

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

The **Digital Library System** is an academic mini-project designed to streamline book access for students and staff through a clean, modern web interface.  
It includes two roles:
- **Users** – Can browse, search, and download books.
- **Admins** – Can access everything users can, plus manage (add/edit/delete) book records.

All data is stored and synced in real-time using **Firebase Firestore**.

---

## ✨ Features

### 🔐 Authentication
A secure Firebase-based login system using **email and password**:
- Validates and stores user credentials securely via Firebase Authentication.
- Automatically redirects users based on authentication status.
- Ensures only authenticated users can access book-related features.

---

### 👤 My Profile
Users can view their personal profile information, fetched directly from Firestore:
- **Basic Information**: Full Name, Age, Gender, and Location.
- **Account Details**: Role (User/Admin), Account Status (Active/Restricted), Join Date, and Last Active Time.
- If a value is missing, it's shown as **"Not available"**.
- Profile information is editable via a modal form (excluding email), and changes are updated in Firestore.

---

### 📚 View Books
A responsive and interactive interface to explore all books in the library:
- Books are listed with **cover images**, **title**, **author**, and a **Download** button.
- Users can **search** for books by title or author using a dynamic search bar.
- All downloads are saved in the user's **Download History**, including a timestamp.

---

### 🛠️ Admin Book Management
Admins have access to a powerful book management interface:
- **Add Books**: Upload new books using a form with title, author, category, file URL, and cover image.
- **Edit Books**: Modify book details inline and save updates directly to Firestore.
- **Delete Books**: Permanently remove books from the collection.

> Admins have the same view as regular users, with the addition of book management features.

---

## 🧑‍💻 Technologies Used

| Technology           | Purpose                                    |
|----------------------|--------------------------------------------|
| **HTML5**            | Structure and semantic layout              |
| **Tailwind CSS**     | Styling and responsive UI design           |
| **JavaScript (ES6)** | Client-side logic and interactivity        |
| **Firebase Auth**    | Secure authentication and session control  |
| **Firebase Firestore** | NoSQL database for real-time data syncing |
| **Font Awesome**     | Icon library for UI buttons and actions    |

---

## 📁 Project Structure

```
digital-library-system/
├── index.html              # Login and Register page
├── profile.html            # User profile and edit page
├── books.html              # View and manage books
├── js/
│   └── app.js              # Shared logic and UI interaction
│   └── auth.js             # Authentication logic (login/register)
│   └── books.js            # View books and admin book management
│   └── firebaseConfig.js   # Firebase initialization (no logic here)
├── css/
│   └── styles.css          # Custom Tailwind overrides (if needed)
├── assets/
│   └── images/             # Book covers and UI icons
└── README.md               # Project documentation
```

---

## ⚙️ Firebase Configuration

To get started with Firebase, follow these steps:

1. Go to [firebase.google.com](https://firebase.google.com) and create a project.
2. Enable **Email/Password Authentication** under **Authentication**.
3. Enable **Cloud Firestore** from the Firebase console.
4. Create the following collections and sample documents:

### `users` collection:
```json
{
  "fullName": "Alice Smith",
  "age": 22,
  "gender": "female",
  "location": "Hyderabad",
  "role": "user",
  "status": "active",
  "createdAt": "timestamp",
  "lastActive": "timestamp"
}
```

### `books` collection:
```json
{
  "title": "Rich Dad Poor Dad",
  "author": "Robert Kiyosaki",
  "category": "Finance",
  "fileUrl": "https://example.com/book.pdf",
  "coverUrl": "https://example.com/cover.jpg",
  "uploadedBy": "admin"
}
```

---

## 🚀 Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone https://github.com/avihs-g/digital-library-system.git
   cd digital-library-system
   ```

2. **Configure Firebase**
   - Copy your Firebase config object from the console.
   - Paste it into `firebaseConfig.js` like this:
   ```js
   const firebaseConfig = {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     ...
   };
   ```

3. **Open the App**
   - Launch `index.html` or `books.html` using **Live Server** (recommended).
   - Make sure your browser allows Firebase access.

---

## 🔐 Roles & Permissions

| Role   | Access Level                                                                 |
|--------|------------------------------------------------------------------------------|
| User   | View profile, edit profile, view books, search and download books            |
| Admin  | All user permissions + add, edit, and delete books in Firestore             |

> ⚠️ Admins cannot manage user accounts or see/edit other users' data.

---

## 📸 Screenshots

*Add actual screenshots in your final submission for:*

- Login/Register Page
- My Profile Dashboard (View/Edit)
- View Books (as User)
- Admin Book Management Panel

---

## 🔮 Future Enhancements

- 📖 Integrated EPUB/PDF reader
- 📊 Book statistics for admins
- 🌙 Dark mode toggle
- 📦 File upload support via Firebase Storage

---

## 🤖 AI Involvement

This project was built using the assistance of AI tools to improve speed and efficiency.

| AI Tool         | Contribution Area                          |
|------------------|--------------------------------------------|
| **ChatGPT**      | Code logic, Firebase rules, UI improvements |
| **Gemini**       | Idea validation, role-based design help     |
| **GitHub Copilot** | Real-time suggestions and error fixing     |

---

## 🙋 Contributors

### Development Team
- **P. Shruthi**
- **P. Akshitha**
- **O. Kavitha**
- **M. Poojitha**

### Support & Guidance
- **Shiva G.** – Provided external support on Developement, Testing of the project.
- **Ramakrishna** – Faculty mentor, Guided team throughout the project.

---

## 📄 License

This project is created solely for **academic and educational** purposes.  
It is open to use, modify, and improve within personal or institutional environments.
```
