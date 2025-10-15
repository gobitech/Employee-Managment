# AI-Powered Employee Payroll Management System

## Description

This is a full-stack MERN (MongoDB, Express.js, React, Node.js) application designed to modernize and automate employee-centric operations. It integrates features for comprehensive employee management, including authentication, leave and attendance tracking, and a payroll calculator. The system provides different dashboards and functionalities based on user roles (Admin vs. Employee).

---

## Features

- **Role-Based Authentication**: Secure login/registration for Admin and Employee roles using JWT.
- **Protected Routes**: Dashboard access is restricted to logged-in users.
- **Admin Dashboard**:
    - Full CRUD (Create, Read, Update, Delete) functionality for employee management.
    - View and manage all employee leave requests (Approve/Reject).
    - View all employee attendance records.
    - Calculate monthly salary for any employee based on their attendance.
    - Download a PDF payslip of the calculated salary.
- **Employee Dashboard**:
    - Mark daily attendance (Present/Absent).
    - Apply for leave.
    - View the status of past leave requests.
- **Professional UI**: The entire application is styled using the Material-UI (MUI) component library.

---

## Tech Stack

- **Frontend**: React, React Router, Material-UI (MUI), jsPDF
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (via MongoDB Atlas)
- **Authentication**: JSON Web Tokens (JWT), bcryptjs

---

## How to Run

You will need two terminals running simultaneously.

### 1. Backend Setup

```bash
# 1. Navigate to the backend folder
cd backend

# 2. Install dependencies
npm install

# 3. Create a .env file in the 'backend' root and add your variables:
# MONGO_URI=your_mongodb_atlas_connection_string
# JWT_SECRET=your_super_secret_key

# 4. Start the server
npm start
# The backend will be running on http://localhost:5000