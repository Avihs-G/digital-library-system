# Digital Library System

## Overview

The Digital Library System is a comprehensive web application designed to manage digital books. It allows users to upload, download, and organize books in PDF format, with features for user authentication, book categorization, and advanced search capabilities.

## Features

### User Management
- **User Registration:** Create an account with a username and password.
- **User Login/Logout:** Secure login and logout using JWT.
- **Profile Management:** View and update user profile information.

### Book Management
- **Book Upload:** Upload books in PDF format.
- **Book Metadata Management:** Manage details like title, author, genre, and description.
- **Book Categorization:** Organize books into categories.

### Search Functionality
- **Search by Title:** Find books by their title.
- **Search by Genre:** Filter books by genre.
- **Search by Author:** Locate books by author name.

### File Management
- **File Upload:** Upload PDF files.
- **File Download:** Download books in PDF format.
- **File Preview:** Preview book content.

### Library Catalog
- **Book Listing:** Display a list of available books.
- **Grid View:** View books in a grid layout.
- **Sorting Options:** Sort books by title, author, or genre.

### Interactive Elements
- **Like Button:** Users can like books.
- **Quotation Display:** Show random book quotations on the home page.

### Access Control
- **Public and Private Books:** Control access based on user roles.
- **Basic User Roles:** Implement roles like Admin and User.

## Technologies Used
- **Backend:** Node.js, Express
- **Frontend:** React
- **Database:** MongoDB (using MongoDB Atlas)
- **Authentication:** JSON Web Tokens (JWT)
- **File Storage:** AWS S3 or similar

## Getting Started

### Prerequisites
- Node.js and npm
- MongoDB Atlas account
- AWS account for file storage (optional)

### Installation
1. Clone the repository: `git clone https://github.com/Avihs-G/digital-library-system.git`
2. Navigate to the project directory: `cd digital-library-system`
3. Install dependencies: `npm install`
4. Set up environment variables for database and JWT secret.

### Running the Application
- Start the backend server: `npm start`
- Start the frontend development server: `npm run start-client`

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for improvements or bug fixes.

## License
This project is licensed under the MIT License.
