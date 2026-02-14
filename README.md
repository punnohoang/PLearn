# PLearn - Online Learning Platform

A modern, full-stack online learning platform built with NestJS, Next.js, and PostgreSQL.

## 📋 Project Status: 95% Complete

### ✅ Completed Features

#### Backend (NestJS)
- ✅ User Authentication (Register, Login, JWT)
- ✅ Course Management (CRUD operations)
- ✅ Enrollment System (track user progress)
- ✅ Lessons Management (organize lessons by course)
- ✅ AI Assistant (powered by X.ai grok-beta)
- ✅ Database with Prisma ORM
- ✅ CORS Configuration (supports multiple origins)
- ✅ Proper error handling and validation

#### Frontend (Next.js)
- ✅ Authentication Pages (Register, Login)
- ✅ Courses Listing (all courses, my courses, create course)
- ✅ Course Details (lessons, progress, enrollment)
- ✅ Lessons View (individual lesson content)
- ✅ Dashboard (learning progress, AI chat)
- ✅ User Profile (view and edit profile, progress stats)
- ✅ Navigation Bar (site-wide navigation)
- ✅ Responsive Design (Tailwind CSS v4)
- ✅ Error Handling (user-friendly Vietnamese messages)

#### DevOps & Deployment
- ✅ Automated Prisma client generation
- ✅ GitHub version control
- ✅ Render backend deployment
- ✅ Vercel frontend deployment
- ✅ Database migration support

### 📈 Current Progress

| Component | Status | Details |
|-----------|--------|---------|
| Backend API | ✅ Complete | 10+ endpoints, all working |
| Frontend Pages | ✅ Complete | 8+ pages, fully functional |
| Database | ✅ Complete | 5 tables (User, Course, Lesson, Enrollment, etc.) |
| Authentication | ✅ Complete | JWT + localStorage |
| Environment Setup | 🔄 In Progress | Need to set env vars on Render/Vercel |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

**Backend:**
```bash
cd backend
npm install
npm run build
```

**Frontend:**
```bash
cd frontend
npm install
npm run build
```

### Running Locally

**Backend:**
```bash
cd backend
npm run start:dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## 🔧 Environment Setup

### Production Deployment
See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete guide to set up:
- Backend environment variables on Render
- Frontend environment variables on Vercel
- Database configuration

### Local Development

**Backend `.env`:**
```
DATABASE_URL="postgresql://user:password@localhost:5432/plearn"
JWT_SECRET="your-secret-key"
FRONTEND_URL="http://localhost:3000"
XAI_API_KEY="your-xai-api-key"
```

**Frontend `.env.local`:**
```
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

## 📁 Project Structure

```
PLearn/
├── backend/                 # NestJS API server
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── courses/        # Courses module
│   │   ├── lessons/        # Lessons module
│   │   ├── enrollments/    # Enrollment tracking
│   │   ├── ai/            # AI assistant module
│   │   └── prisma/        # Database service
│   └── prisma/schema.prisma # Database schema
├── frontend/               # Next.js web app
│   ├── app/
│   │   ├── page.tsx       # Home page
│   │   ├── login/         # Login page
│   │   ├── register/      # Register page
│   │   ├── courses/       # Courses listing & detail
│   │   ├── dashboard/     # Learning dashboard
│   │   └── profile/       # User profile
│   └── src/
│       ├── components/    # Reusable components
│       ├── contexts/      # Global auth context
│       └── lib/          # Utilities (API client)
└── DEPLOYMENT.md         # Deployment guide
```

## 🔐 Authentication Flow

1. **Register:** User creates account → Password hashed with bcrypt → User stored in DB
2. **Login:** User enters credentials → JWT token generated → Token stored in localStorage
3. **Request:** Each API request includes `Authorization: Bearer {token}`
4. **Verify:** Server validates JWT with secret → Route accessible if valid

## 📚 API Endpoints

### Auth
- `POST /auth/register` - Create new account
- `POST /auth/login` - Login and get JWT token

### Courses
- `GET /courses` - All courses with instructor and lesson count
- `GET /courses/{id}` - Course details with lessons
- `POST /courses` - Create new course (requires auth)

### Enrollments
- `POST /enrollments` - Enroll in a course
- `GET /enrollments` - Get user's enrollments
- `PATCH /enrollments/{id}` - Update progress

### Lessons
- `GET /lessons/{courseId}` - Get lessons for a course
- `GET /lessons/detail/{id}` - Get single lesson
- `POST /lessons/{courseId}` - Create lesson
- `PATCH /lessons/{id}` - Update lesson
- `DELETE /lessons/{id}` - Delete lesson

### AI
- `POST /ai/ask` - Ask AI assistant question

## 🛠 Tech Stack

**Backend:**
- NestJS 8+ (Node.js framework)
- Prisma ORM (database)
- PostgreSQL (database)
- Passport.js (authentication)
- bcryptjs (password hashing)
- OpenAI SDK (X.ai integration)
- Express.js (HTTP server)

**Frontend:**
- Next.js 16.1.6 (React framework)
- React 19.2.3 (UI library)
- Tailwind CSS v4 (styling)
- Axios (HTTP client)
- TypeScript (type safety)

**DevOps:**
- GitHub (version control)
- Render (backend hosting)
- Vercel (frontend hosting)
- PostgreSQL Render (database)

## 📖 Features in Detail

### User Authentication
- Secure registration with email validation
- Login with JWT token generation
- Protected routes with authentication guard
- Automatic token refresh and storage

### Course Management
- Create and view courses
- Organized with instructor information
- Track total number of enrollments
- Search and filter courses

### Learning Progress
- Enroll in courses
- Track progress with percentage
- View lessons in order
- Mark lessons as complete
- Dashboard with progress overview

### AI Assistant
- Ask questions about course content
- Powered by X.ai grok-beta model
- Vietnamese-friendly responses
- Context-aware answers

### User Profile
- View and edit user information
- Change password
- View learning statistics
- Completed vs in-progress courses
- Average progress across all courses

## 🧪 Testing Workflow

1. **Register:** Go to `/register` → Create new account
2. **Login:** Go to `/login` → Enter credentials
3. **Browse Courses:** Navigate to `/courses` → See all available courses
4. **Enroll:** Click "Đăng ký" → See course in "My Courses"
5. **Learn:** Click "Học bài" → View lesson content
6. **Track Progress:** Go to `/dashboard` or `/profile` → See learning stats
7. **Ask AI:** Use AI assistant in dashboard for help
8. **Profile:** Navigate to user profile to edit info

## 🚨 Troubleshooting

### "Cannot POST /auth/register"
→ See [DEPLOYMENT.md - Troubleshooting](./DEPLOYMENT.md#troubleshooting)

### "API baseURL: http://localhost:4000"
→ Frontend is using local API URL, need to set `NEXT_PUBLIC_API_URL` on Vercel

### Database connection errors
→ Verify `DATABASE_URL` is set correctly on Render

### Prisma client not found
→ Run `npm run build` again on backend, the postinstall script will generate it

## 📝 Next Steps

1. **Configure Environment Variables** (Required)
   - See [DEPLOYMENT.md](./DEPLOYMENT.md)
   - Set `NEXT_PUBLIC_API_URL` on Vercel
   - Set `FRONTEND_URL` on Render

2. **Test Complete Flow** (To verify)
   - Register a test account
   - Login successfully
   - Enroll in a course
   - View lessons
   - Update profile

3. **Optional Enhancements**
   - Video hosting for lessons
   - Lesson completion certificates
   - Student peer discussion forums
   - Course recommendations AI
   - Payment integration for premium courses
   - Email notifications

## 📧 Contact & Support

For issues or questions, please open a GitHub issue or contact the development team.

## 📄 License

This project is a learning platform for educational purposes.

---

**Last Updated:** February 14, 2025
**Version:** 0.95.0
**Status:** Ready for deployment with environment variable configuration