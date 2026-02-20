# 🔐 RBAC (Role-Based Access Control) System - Testing Guide

This document provides a comprehensive guide for testing the RBAC system implemented in PLearn.

## 📋 System Overview

The RBAC system defines 5 user roles with different permissions:

### User Roles

| Role | Permissions | Use Case |
|------|-------------|----------|
| **ADMIN** | Full access to all features, can manage users, assign roles, delete users | System administrator |
| **MANAGER** | Can view all users, view user details, view platform statistics, view course stats | Platform manager |
| **HR** | Can view all users, view user details, view platform statistics | HR/Personnel manager |
| **INSTRUCTOR** | Can create courses, add lessons, view course enrollment stats | Course creator/teacher |
| **STUDENT** | Can enroll in courses, view lessons, track progress, use AI chat | Learner |

## 🧪 Test Users

The following test users are pre-created in the database:

```
1. ADMIN
   Email: admin@example.com
   Password: admin123456
   
2. MANAGER
   Email: manager@example.com
   Password: manager123456
   
3. HR
   Email: hr@example.com
   Password: hr123456
   
4. INSTRUCTOR
   Email: instructor@example.com
   Password: instructor123456
   
5. STUDENT
   Email: student@example.com
   Password: student123456
```

## 🛣️ Protected Routes

### Frontend Routes

| Route | Required Role | Protected | Description |
|-------|--------------|-----------|-------------|
| `/` | None | No | Home page |
| `/login` | None | No | Login page |
| `/register` | None | No | Registration page |
| `/courses` | STUDENT+ | Yes | View all courses |
| `/courses/[id]` | STUDENT+ | Yes | View course details |
| `/courses/[id]/lessons/[lessonId]` | STUDENT+ | Yes | View lesson content |
| `/dashboard` | STUDENT+ | Yes | User learning dashboard |
| `/profile` | STUDENT+ | Yes | User profile page |
| `/admin` | ADMIN | Yes | Admin management dashboard |

### Backend API Endpoints

#### Public Endpoints (No Auth Required)
```
POST   /auth/register          - User registration
POST   /auth/login             - User login
GET    /health                 - Health check
```

#### Authenticated Endpoints (All authenticated users)
```
GET    /courses                - List all courses
GET    /courses/:id            - Get course details
POST   /enrollments            - Enroll in a course
GET    /enrollments            - Get user enrollments
PUT    /enrollments/:id        - Update enrollment progress
POST   /ai/ask                 - Ask AI assistant
```

#### Admin-Only Endpoints (@Roles('ADMIN'))
```
GET    /admin/users            - List all users (ADMIN, MANAGER, HR)
GET    /admin/users/:id        - Get user details (ADMIN, MANAGER, HR)
PUT    /admin/users/:id/role   - Change user role (ADMIN only)
DELETE /admin/users/:id        - Delete user (ADMIN only)
GET    /admin/statistics       - Get platform stats (ADMIN, MANAGER, HR)
GET    /admin/courses-stats    - Get course statistics (ADMIN, MANAGER)
```

## 🧪 Testing Scenarios

### Scenario 1: Admin User Dashboard Access

**Steps:**
1. Go to http://localhost:3000/login
2. Login with admin@example.com / admin123456
3. Click on user dropdown menu (top right)
4. Click "👑 Trang Quản Trị" link
5. Should see admin dashboard with:
   - 4 statistics cards (users, courses, enrollments, users by role)
   - User management table with search & role filters
   - Ability to change roles and delete users

**Expected Results:**
- ✅ Admin dashboard loads successfully
- ✅ All users are displayed in the table
- ✅ Can change user roles from dropdown
- ✅ Can delete users (except own account)
- ✅ Statistics are displayed correctly

### Scenario 2: Manager/HR User Dashboard Access

**Steps:**
1. Go to http://localhost:3000/login
2. Login with manager@example.com or hr@example.com
3. Try to access /admin route directly (in URL bar)
4. Try to navigate to admin dashboard from dropdown

**Expected Results:**
- ✅ User is redirected to home page (no access to /admin)
- ✅ "Trang Quản Trị" link is NOT visible in dropdown
- ✅ Can access `/admin/users` API endpoint
- ✅ Can access `/admin/statistics` API endpoint
- ❌ CANNOT access `/admin/users/:id/role` (PUT) endpoint
- ❌ CANNOT access `/admin/users/:id` (DELETE) endpoint

### Scenario 3: Instructor User Permissions

**Steps:**
1. Login with instructor@example.com / instructor123456
2. Verify in user dropdown that instructor name is displayed
3. Create a new course (if course creation UI exists)
4. Try to access /admin route

**Expected Results:**
- ✅ Can access courses dashboard
- ✅ Can view profile page
- ✅ Cannot access admin dashboard
- ✅ Can create courses (if UI exists)

### Scenario 4: Student User Permissions

**Steps:**
1. Login with student@example.com / student123456
2. Navigate to /courses
3. Enroll in "Lập trình Python từ cơ bản đến nâng cao" course
4. View lessons and track progress
5. Try to access /admin route

**Expected Results:**
- ✅ Can view and search courses
- ✅ Can enroll in courses
- ✅ Can view lessons
- ✅ Can use AI chat in dashboard
- ✅ Cannot access admin dashboard

### Scenario 5: Role Change Functionality

**Steps:**
1. Login as admin@example.com
2. Go to Admin Dashboard (/admin)
3. Find student@example.com in user list
4. Change role from STUDENT to INSTRUCTOR
5. Click on user dropdown to see role change reflected
6. Logout and login as student@example.com
7. Verify new permissions

**Expected Results:**
- ✅ Role change is successful
- ✅ New role is displayed in dropdown after logout/login
- ✅ User can now access instructor-specific features

## 🔒 API Testing with cURL/Postman

### Test Admin Endpoint (Without Authentication)

**Should fail with 401 Unauthorized:**
```bash
curl -X GET http://localhost:3000/admin/users
```

**Response:**
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

### Test Admin Endpoint (With Student Token)

**Should fail with 403 Forbidden:**
```bash
# First, get student token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"student123456"}'

# Extract token from response, then try admin endpoint
curl -X GET http://localhost:3000/admin/users \
  -H "Authorization: Bearer <STUDENT_TOKEN>"
```

**Response:**
```json
{
  "message": "Forbidden",
  "statusCode": 403
}
```

### Test Admin Endpoint (With Admin Token)

**Should succeed with 200 OK:**
```bash
# Get admin token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123456"}'

# Use token to access admin endpoint
curl -X GET http://localhost:3000/admin/users \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Response:**
```json
[
  {
    "id": "...",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN",
    "_count": {
      "courses": 0,
      "enrollments": 0
    }
  },
  ...
]
```

### Test Role-Based Endpoint (Change User Role)

**Only ADMIN can access (403 for MANAGER/HR):**
```bash
# Get admin token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123456"}'

# Change student role to INSTRUCTOR
curl -X PUT http://localhost:3000/admin/users/<STUDENT_ID>/role \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"role":"INSTRUCTOR"}'
```

## ✅ Verification Checklist

- [ ] Admin user can access admin dashboard
- [ ] Admin user can view all users
- [ ] Admin user can change user roles
- [ ] Admin user can delete users
- [ ] Manager/HR users cannot access admin dashboard
- [ ] Manager/HR users can see users via API
- [ ] Manager/HR users cannot change roles or delete users
- [ ] Instructor users can create courses
- [ ] Student users can enroll in courses
- [ ] Role changes take effect after logout/login
- [ ] Invalid role values are rejected with error message
- [ ] Permissions are enforced both on frontend and backend

## 🚀 Deployment Notes

The RBAC system is now deployed to:

- **Frontend:** https://g5-plearn.vercel.app
- **Backend:** https://plearn-backend-vglq.onrender.com

All RBAC functionality is live and ready for production use.

## 📝 Notes

- JWT tokens expire after 1 day
- Roles are case-sensitive (ADMIN, not admin)
- When deleting a user, all their enrollments are cascade-deleted
- The ADMIN account cannot be deleted by another ADMIN
- Role changes require logout/login to take effect on frontend

## 🔧 Future Enhancements

- [ ] Bulk role assignment for multiple users
- [ ] Role-based dashboard views (different dashboards for different roles)
- [ ] Audit logging for admin actions
- [ ] Permission granularity (e.g., per-course permissions)
- [ ] Two-factor authentication for admin accounts
