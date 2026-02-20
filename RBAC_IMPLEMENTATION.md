# 🔐 RBAC System Implementation Summary

## Overview

PLearn now includes a complete Role-Based Access Control (RBAC) system that manages user permissions across the entire platform. This document provides a technical overview of the implementation.

## Architecture

### 1. **Frontend Architecture**

#### Components & Pages

**Navigation Component** (`src/components/Navigation.tsx`)
- Added admin dashboard link (visible only to ADMIN users)
- Displays user role and profile information
- Quick access to admin panel for administrators

**Admin Page** (`app/admin/page.tsx`)
- Protected route (requires ADMIN role)
- Displays statistics dashboard with 4 KPIs:
  - Total Users
  - Total Courses
  - Total Enrollments
  - Users by Role distribution
- User management table with capabilities:
  - Search by name/email
  - Filter by role
  - Change user roles
  - Delete users
- Real-time UI updates when roles change

**Auth Context** (`src/contexts/AuthContext.tsx`)
- Enhanced with JWT token decoding
- Extracts user role from token (token.role)
- Stores role in user state for permission checks
- Used by all protected components for role-based visibility

### 2. **Backend Architecture**

#### Database Schema Updates

**User Model** (Prisma)
```prisma
model User {
  id          String    @id @default(cuid())
  email       String    @unique
  password    String
  name        String
  role        Role      @default(STUDENT)  // Updated with new roles
  courses     Course[]
  enrollments Enrollment[]
}

enum Role {
  STUDENT
  INSTRUCTOR
  ADMIN        // Full system access
  MANAGER      // View-only admin functions
  HR           // View users & stats for HR purposes
}
```

#### Guard Implementation

**JwtAuthGuard** (`src/auth/jwt-auth.guard.ts`)
- Validates JWT token
- Extracts user info from token
- Adds user to request object
- Prerequisite for RolesGuard

**RolesGuard** (`src/common/guards/roles.guard.ts`)
```typescript
- Uses @Reflector to read ROLES_KEY metadata from controller methods
- Matches user.role against required roles array
- Throws ForbiddenException if role not permitted
- Works in conjunction with JwtAuthGuard
```

#### Decorators

**@Roles() Decorator** (`src/common/decorators/roles.decorator.ts`)
```typescript
- Applied to controller methods
- Usage: @Roles('ADMIN', 'MANAGER')
- Stores required roles in metadata
- Read by RolesGuard during request processing
```

#### Admin Module Structure

**AdminController** (`src/admin/admin.controller.ts`)

Protected Endpoints:

1. **GET /admin/users**
   - Roles: ADMIN, MANAGER, HR
   - Returns: All users with course/enrollment counts
   - Purpose: User management overview

2. **GET /admin/users/:id**
   - Roles: ADMIN, MANAGER, HR
   - Returns: User details with enrollment history
   - Purpose: View individual user information

3. **PUT /admin/users/:id/role**
   - Roles: ADMIN only
   - Body: { role: "INSTRUCTOR" }
   - Returns: Updated user object
   - Purpose: Change user roles
   - Validation: Validates role enum before update

4. **DELETE /admin/users/:id**
   - Roles: ADMIN only
   - Returns: Deleted user object
   - Purpose: Remove users from system
   - Side Effect: Cascade deletes user enrollments

5. **GET /admin/statistics**
   - Roles: ADMIN, MANAGER, HR
   - Returns: Platform statistics (users, courses, enrollments, role distribution)
   - Purpose: View platform metrics

6. **GET /admin/courses-stats**
   - Roles: ADMIN, MANAGER
   - Returns: Course statistics with enrollment counts
   - Purpose: View course performance metrics

**AdminModule** (`src/admin/admin.module.ts`)
- Registered in AppModule imports
- Encapsulates admin functionality
- Dependencies: PrismaService, JwtAuthGuard, RolesGuard

### 3. **Permission Flow**

```
User Request
    ↓
[JwtAuthGuard] ← Validates token, extracts user
    ↓
[RolesGuard] ← Checks @Roles() decorator metadata
    ↓
User.role ∈ Required Roles?
    ├─ YES → Execute endpoint handler
    └─ NO → Return 403 Forbidden
    ↓
Response to Client
```

## Implementation Details

### Guards Integration

```typescript
// In app.module.ts - AdminModule automatically uses guards via @UseGuards decorator

// In admin-controller.ts
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)  // Applied to all routes
export class AdminController {
  @Get('users')
  @Roles('ADMIN', 'MANAGER', 'HR')    // Specific role requirements
  async getAllUsers() { ... }
}
```

### Role Validation

```typescript
// In updateUserRole method
const validRoles = Object.values(Role);
if (!validRoles.includes(role)) {
  throw new BadRequestException(`Invalid role: ${role}`);
}
```

### Frontend Role-Based UI

```typescript
// In Navigation.tsx
{user.role === 'ADMIN' && (
  <Link href="/admin">
    <button>👑 Trang Quản Trị</button>
  </Link>
)}

// In admin/page.tsx
if (!user || user.role !== 'ADMIN') {
  router.push('/');  // Redirect non-admins
}
```

## Test Users

The system includes 5 pre-created test users with different roles:

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | admin123456 | ADMIN |
| manager@example.com | manager123456 | MANAGER |
| hr@example.com | hr123456 | HR |
| instructor@example.com | instructor123456 | INSTRUCTOR |
| student@example.com | student123456 | STUDENT |

## Database Schema Changes

The Prisma schema was updated to include two new roles:
- `MANAGER` - For platform managers (read-only admin access)
- `HR` - For HR personnel (view users and platform stats)

```
prisma db push  // Syncs schema with database
```

## API Response Examples

### Success: Admin Can View Users
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "...",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "ADMIN"
    }
  ]
}
```

### Error: Non-Admin Access Denied
```json
{
  "statusCode": 403,
  "message": "Forbidden",
  "error": "Your role does not have access to this resource"
}
```

### Error: Missing Authentication
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Invalid token"
}
```

## Frontend Routes Protection

All protected routes check `user?.role`:

```typescript
// In protected page component
useEffect(() => {
  if (!user || user.role !== 'ADMIN') {
    router.push('/');  // Redirect to home
  }
}, [user, router]);
```

## Security Features

1. **JWT Token-Based**: All authentication uses secure JWT tokens
2. **Role Validation**: Both frontend and backend validate roles
3. **Cascade Deletion**: Deleting a user also deletes their enrollments
4. **Password Hashing**: All passwords hashed with bcryptjs (10 rounds)
5. **Token Expiration**: JWT tokens expire after 1 day
6. **Enum Validation**: Role values validated against Prisma enum

## Deployment Status

- ✅ Backend RBAC system deployed to Render
- ✅ Frontend admin dashboard deployed to Vercel
- ✅ Database schema updated on Neon PostgreSQL
- ✅ Test users seeded in production database
- ✅ All 6 admin endpoints live and functional

## Files Modified/Created

### Backend
- ✅ `backend/src/auth/jwt-auth.guard.ts` - Enhanced JWT authentication
- ✅ `backend/src/common/guards/roles.guard.ts` - Role-based authorization
- ✅ `backend/src/common/decorators/roles.decorator.ts` - Role decorator
- ✅ `backend/src/admin/admin.controller.ts` - Admin API endpoints
- ✅ `backend/src/admin/admin.module.ts` - Admin module
- ✅ `backend/src/app.module.ts` - AdminModule registration
- ✅ `backend/prisma/schema.prisma` - Updated Role enum
- ✅ `backend/seed.ts` - Added test users with different roles

### Frontend
- ✅ `frontend/app/admin/page.tsx` - Admin dashboard
- ✅ `frontend/src/contexts/AuthContext.tsx` - Enhanced auth context
- ✅ `frontend/src/components/Navigation.tsx` - Admin link in nav

## Testing Recommendations

1. Test each role's access to admin endpoints
2. Verify frontend redirects for unauthorized access
3. Test role change functionality
4. Verify JWT token includes role information
5. Test cascade delete behavior
6. Verify all 6 admin endpoints with different roles

## Future Enhancements

- Fine-grained permissions (e.g., per-course)
- Audit logging for admin actions
- Role-specific dashboard views
- Permission groups/inheritance
- API key management for service integrations
- Two-factor authentication for sensitive operations

## Performance Considerations

- Role checks cached in guard (no database queries)
- Single JWT validation per request
- Metadata stored in controller (no runtime overhead)
- Efficient database queries with proper indexing

## Compliance & Standards

- Follows NestJS best practices for guards and decorators
- JWT implementation aligns with industry standards
- Role-based access follows OWASP guidelines
- Password hashing uses secure bcryptjs library

---

**Implementation Date**: February 20-21, 2025
**Status**: ✅ Production Ready
**Last Updated**: February 21, 2025
