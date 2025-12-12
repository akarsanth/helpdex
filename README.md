# HelpDex – IT Ticket Management System

HelpDex is a full-stack MERN application built to streamline IT issue reporting and resolution between clients, QA teams, developers, and administrators.  
It modernizes the traditional support workflow with real-time updates, role-based access, ticket lifecycle management, and effective communication tools.

---

## 🚀 Features

### 🔐 Authentication & Security
- JWT-based authentication
- Role-based access control (Client, QA, Developer, Admin)
- Protected routes and token refresh handling
- Email verification + OTP support

### 🎫 Ticket Management
- Create, update, assign, and track support tickets
- Ticket attributes: category, priority, attachments, status flow
- Status workflow: **Open → Assigned → In Progress → Resolved → Closed**
- Deadline support and activity timestamps
- File uploads (attachments)

### 💬 Communication & Notifications
- Threaded comments (internal & public)
- Real-time email notifications on ticket updates
- Notification management with read/unread tracking

### 📊 Dashboards (Role-Based)
- **Client**: Submit/view tickets, comment, track progress  
- **QA**: Review incoming tickets, assign to developers  
- **Developer**: Resolve assigned tickets, update status  
- **Admin**: Manage users, roles, and system access  

### 📁 Additional Features
- Reusable UI components (Formik + Material UI)
- Ticket filtering & sorting by status, priority, category
- Responsive design for desktop & mobile
- Modular backend with Express controllers and middleware

---

## 🛠️ Tech Stack

### Frontend
- React (TypeScript)
- Material UI
- Redux Toolkit
- Axios (with interceptors)
- Formik + Yup

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JSON Web Tokens (JWT)
- Multer (file uploads)

---

## 📐 System Architecture

### ERD Includes:
- User  
- Ticket  
- Comment  
- Attachment  
- Notification  
- Status  
- Category  

### DFD & Sequence Diagrams Cover:
- Registration & login  
- Ticket submission  
- Ticket update & deletion  
- Ticket details flow  
- Email notification workflow  

---

## 📁 Folder Structure (High Level)

