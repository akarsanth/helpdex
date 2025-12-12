# HelpDex – IT Ticket Management System

HelpDex is a MERN-based IT ticket management platform that streamlines communication between clients, QA teams, developers, and administrators.  
The system includes secure authentication, ticket workflows, comments, attachments, notifications, and clean dashboards built for each role.

---

## 🚀 Tech Stack

### 🖥️ Frontend (Based on Your `client/package.json`)
- **React 19**
- **TypeScript**
- **Vite**
- **Material UI (MUI)**
- **Formik + Yup** (forms & validation)
- **Axios** (API client)
- **Redux Toolkit + React Redux** (state management)
- **React Router DOM** (routing)
- **Material React Table** (advanced tables)
- **@tanstack/react-table** (table engine)
- **date-fns** (date utilities)

### 🛠️ Backend (Based on Your `server/package.json`)
- **Node.js + Express**
- **MongoDB + Mongoose**
- **JWT Authentication**
- **bcryptjs**
- **cookie-parser**
- **cors**
- **cloudinary + multer-storage-cloudinary** (attachments)
- **formidable** (file parsing)
- **helmet + morgan** (security + logging)
- **nodemailer** (email + OTP)
- **dotenv** (environment variables)

### 🔧 Development Tools
**Frontend**
- Vite
- ESLint + TS ESLint
- TypeScript  

**Backend**
- ts-node
- Nodemon
- ESLint + Prettier
- TypeScript

---

## 🎫 Key Features

### 🔐 Authentication & User Management
- JWT-based secure login
- Refresh token handling
- OTP email verification
- Role-based access control:
  - **Client**
  - **QA**
  - **Developer**
  - **Admin**

### 🎫 Ticketing System
- Create & manage tickets with:
  - Title
  - Description
  - Priority
  - Category
  - Deadline
  - Attachments (Cloudinary)
- Status lifecycle:
  **Open → Assigned → In Progress → Resolved → Closed**
- Timestamp tracking for all actions

### 💬 Communication
- Threaded comments
- Internal comments (staff only)
- Email notifications for:
  - Ticket assignment
  - Status updates
  - New comments

### 📊 Dashboards
- **Client:** Create tickets, comment, track progress  
- **QA:** Validate issues, assign developers  
- **Developer:** View assigned tickets, update progress  
- **Admin:** Manage users, roles, activations  

### 📁 UI and UX
- Clean Material UI interface
- Material React Table for ticket listings
- Advanced filtering, sorting, and pagination
- Fully responsive layout

---

## 📁 Project Structure (Simplified)

