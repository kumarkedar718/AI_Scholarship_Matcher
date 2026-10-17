# AI-Based Scholarship Matcher

An AI-powered scholarship discovery, eligibility evaluation, and application tracking platform designed for higher education students and administrators.

---

## 🌟 Key Features

### 🎓 Student Portal
* **Automated Eligibility Engine**: Deterministic, 100% accurate rule evaluation comparing student profile data (academic score, family income, category, gender, education level) against official criteria.
* **AI Recommendation Engine**: Personalized scholarship recommendations with transparent reasoning powered by Gemini AI with an intelligent rule-based fallback engine.
* **Natural Language Search**: Semantic search allowing students to find scholarships matching conversational queries (e.g. *"scholarships for girl engineering students from low income families"*).
* **Application Tracker**: End-to-end lifecycle tracking with status milestones (`Saved`, `Planning to Apply`, `Applied`, `Under Review`, `Approved`, `Rejected`), application notes, and deadline reminders.
* **Document Management**: Secure parent/guardian income certificate upload and validation (PDF/PNG/JPEG with strict file type and size enforcement).
* **Real-Time Notifications**: Automated notification center for upcoming deadlines, eligibility changes, and application status updates.

### 🛡️ Authentication & Security
* **JWT Authentication**: Role-based access control (`student` vs. `admin`) with secure HTTP Bearer token authorization.
* **Email Verification**: Token-based email verification via SMTP with automated desktop status polling.
* **Mobile-Friendly Password Reset**: Cryptographically secure SHA-256 password reset tokens with 30-minute expiry and rate-limiting, accessible across both mobile and desktop browsers.
* **Admin Access Hardening**: Self-registration for admin accounts is strictly prohibited; administrative bootstrap is locked to authorized channels with strict password complexity policies.

### 📊 Admin Analytics Dashboard
* **Metrics Overview**: Real-time summary of student enrollments, scholarship availability, and application volumes.
* **Demographics & Distribution**: Visual breakdown of applicants by gender, category, state, and income brackets.
* **Deadline & Popularity Analytics**: Monitoring of upcoming deadlines, ongoing portal schemes, and high-interest scholarships.
* **Comprehensive Audit Logging**: Tamper-evident logging of administrative actions and security events.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide React, Axios, React Router v7 |
| **Backend** | Node.js, Express.js, Mongoose (MongoDB ODM), Nodemailer |
| **Database** | MongoDB |
| **AI / NLP** | Google Gemini API (with smart fallback rule engine) |
| **Security** | JSON Web Tokens (JWT), Bcrypt, Express Rate Limit, Helmet, Multer |

---

## 📋 Prerequisites

Before setting up the project, ensure you have installed:
* [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
* [npm](https://www.npmjs.com/) (v9.0.0 or higher)
* [MongoDB Community Server](https://www.mongodb.com/try/download/community) (v6.0 or higher) running locally or a MongoDB Atlas URI

---

## 🚀 Quick Start Guide

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/AI_Scholarship_Matcher.git
cd AI_Scholarship_Matcher
```

### 2. Install Dependencies
Install dependencies for both backend and frontend workspaces:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root directory
cd ..
```

### 3. Configure Environment Variables

#### Backend (`backend/.env`)
Create a `backend/.env` file from the provided template:
```bash
cp backend/.env.example backend/.env
```
Configure the required values in `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/ai_scholarship_matcher
JWT_SECRET=your_jwt_secret_key_here
FRONTEND_URL=http://localhost:5173
BACKEND_PUBLIC_URL=http://localhost:5000

# Optional AI Provider Configuration
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here

# SMTP Email Configuration (for verification and password resets)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
EMAIL_FROM="AI Scholarship Matcher <noreply@scholarshipmatcher.edu>"

# Admin Security Configuration
ADMIN_BOOTSTRAP_ENABLED=true
ADMIN_BOOTSTRAP_SECRET=your_admin_bootstrap_secret_here
ADMIN_BOOTSTRAP_EMAIL=admin@example.com
```

> **Note on Mobile Testing**: When testing email verification or password reset links from a mobile phone on the same Wi-Fi network, set `FRONTEND_URL=http://<YOUR_PC_LAN_IP>:5173` and `BACKEND_PUBLIC_URL=http://<YOUR_PC_LAN_IP>:5000`.

#### Frontend (`frontend/.env`)
Create a `frontend/.env` file from the provided template:
```bash
cp frontend/.env.example frontend/.env
```
Default configuration:
```env
VITE_API_URL=/api
```

---

## 💻 Running the Application

From the root project directory, you can run the workspaces concurrently:

### Option A: Using Root Helper Commands
```bash
# Terminal 1: Start Backend API (Port 5000)
npm run dev:backend

# Terminal 2: Start Frontend Development Server (Port 5173)
npm run dev:frontend
```

### Option B: Running Each Workspace Directly
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Once started, open your browser and navigate to:
* **Frontend Application**: `http://localhost:5173`
* **Backend Health Check**: `http://127.0.0.1:5000/api/health`

---

## 📦 Production Build

To verify and create an optimized production build for the frontend:
```bash
npm run build:frontend
```
Build outputs will be generated in `frontend/dist/`.

---

## 🔒 Security Best Practices

* Never commit `.env` files or sensitive credentials to Git.
* Passwords are encrypted using Bcrypt (`10` salt rounds).
* Rate limiters are enforced on authentication, password reset, and AI query endpoints.
* Uploaded document paths are sanitized and access-restricted to the authenticated account owner.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
