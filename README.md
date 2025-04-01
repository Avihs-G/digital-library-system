# Digital Library System

## Overview

The Digital Library System is a web application that allows users to upload, download, and manage digital books in PDF format. It includes user authentication, book categorization, and search functionality.

## Features

### User Management
- **User Registration:** Users can create an account with a username and password.
- **User Login/Logout:** Secure login and logout functionality using JWT.
- **Profile Management:** Users can view and update their profile information.

### Book Management
- **Book Upload:** Users can upload books in PDF format.
- **Book Metadata Management:** Manage book details such as title, author, genre, and a short description.
- **Book Categorization:** Organize books into categories for easy browsing.

### Search Functionality
- **Search by Title:** Find books by their title.
- **Search by Genre:** Filter books based on genre.
- **Search by Author:** Locate books by author name.

### File Management
- **File Upload:** Upload PDF files to the system.
- **File Download:** Download books in PDF format.
- **File Preview:** Preview book content before downloading.

### Library Catalog
- **Book Listing:** Display a list of available books with metadata.
- **Grid View:** View books in a grid layout for easy navigation.
- **Sorting Options:** Sort books by title, author, or genre.

### Interactive Elements
- **Like Button:** Users can like books to show appreciation.
- **Quotation Display:** Display random book quotations on the home page.

### Access Control
- **Public and Private Books:** Control access to books based on user roles.
- **Basic User Roles:** Implement roles such as Admin and User for access management.

## Technologies Used
- **Backend:** Node.js, Express
- **Frontend:** React
- **Database:** MongoDB (using MongoDB Atlas)
- **Authentication:** JSON Web Tokens (JWT)
- **File Storage:** AWS S3 or similar service

## Getting Started

### Prerequisites
- Node.js and npm installed
- MongoDB Atlas account for database
- AWS account for file storage (optional)

### Installation
1. Clone the repository: `git clone https://github.com/your-username/digital-library.git`
2. Navigate to the project directory: `cd digital-library`
3. Install dependencies: `npm install`
4. Set up environment variables for database and JWT secret.

### Running the Application
- Start the backend server: `npm start`
- Start the frontend development server: `npm run start-client`

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License
This project is licensed under the MIT License.
