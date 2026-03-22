# 🚀 Intelligent Campus Placement System (Backend)

A **production-level backend system** for managing campus placements, built with Node.js, Express.js, and MongoDB.

This project goes beyond CRUD by implementing **real-world placement logic**, including eligibility filtering, candidate ranking, authentication, and secure token management.

---

## 🌐 Live API

🔗 https://intelligent-campus-placement-system.onrender.com  

This project is deployed and can be tested directly using the live API.  
Local setup instructions are provided for development and testing purposes.

---

## 📌 Features

### 🔐 Authentication & Security
- JWT-based authentication (Access + Refresh Tokens)
- Refresh token rotation (secure implementation)
- Hashed refresh tokens using bcrypt
- Logout with token invalidation
- Role-based access control (Admin / Student / Company)

---

### 👤 User & Profile System
- Unified User model with roles
- Student profile (CGPA, branch, skills, experience)
- Company profile linked to user
- One-to-one profile linking (User → Student / Company)

---

### 💼 Job Management
- Create and manage job postings
- Eligibility criteria:
  - Minimum CGPA
  - Allowed branches
  - Passing year
  - Required skills

---

### 📄 Job Application System
- Students can apply to jobs
- Prevent duplicate applications
- Application status tracking:
  - Applied
  - Rejected
  - Shortlisted
  - Selected

---

### ⚡ Intelligent Features (Core Highlight)

#### ✅ Eligibility Engine
- Automatically checks:
  - CGPA
  - Branch
  - Passing Year
- Auto-rejects ineligible candidates

👉 This makes the system behave like a real ATS (Applicant Tracking System)

---

#### 📊 Candidate Ranking System

Students are scored based on:

| Factor | Weight |
|--------|--------|
| CGPA | 50% |
| Skills Match | 30% |
| Experience | 20% |

- Generates ranked candidate list per job
- Helps companies shortlist efficiently

---

### 🧑‍💼 Admin Dashboard
- Total users
- Total students
- Total companies
- Total jobs
- Total applications

---

### 🧹 Soft Deletes
- Records are not permanently deleted
- Uses `isDeleted` flag
- Supports recovery and auditing

---

### 📜 Middleware & Architecture
- Request logging middleware
- Global error handler
- Clean modular structure:
  - Controllers
  - Routes
  - Models
  - Middleware
  - Utils

---

## 🛠️ Tech Stack

- Backend: Node.js, Express.js  
- Database: MongoDB + Mongoose  
- Authentication: JWT, bcrypt  
- Architecture: MVC Pattern  

---

## 📂 Project Structure

```
intelligent-campus-placement-system/
│
├── controllers/
├── models/
├── routes/
├── middleware/
├── utils/
├── server.js
├── package.json
└── .env
```

---

## ⚙️ Run Locally

```bash
git clone https://github.com/lakshay-0423/intelligent-campus-placement-system.git
cd intelligent-campus-placement-system
npm install
npm start
```

---

## 🔑 API Endpoints

### Auth
- POST /auth/signup
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout

### Students
- POST /students/profile
- GET /students

### Companies
- POST /companies/profile
- GET /companies

### Jobs
- POST /jobs
- GET /jobs
- GET /jobs/:jobId/rank

### Applications
- POST /applications/:jobId

### Admin
- GET /admin/dashboard

---

## 🔄 Application Flow

1. User signs up → assigned role  
2. Student/Company creates profile  
3. Company posts job  
4. Student applies  

5. System:
   - Checks eligibility  
   - Auto-rejects if not eligible  

6. Eligible candidates are:
   - Scored  
   - Ranked  

---

## 🎯 Why This Project Stands Out

- Not just CRUD — includes real placement logic  
- Implements ATS-like features  
- Secure authentication (industry-level)  
- Clean and scalable architecture  
- Covers backend concepts asked in interviews  

---

## 🚀 Future Improvements

- Resume upload & parsing  
- AI-based job recommendation  
- Email notifications  
- Interview scheduling system  
- Pagination & filtering  
- API documentation (Swagger)  

---

## 👨‍💻 Author

Lakshay  

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!