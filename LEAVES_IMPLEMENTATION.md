# Leave Management Backend - Complete Implementation

## Overview

I've created a complete backend system for leave management with all filters, pagination, and full CRUD operations. The implementation follows the existing patterns in your codebase.

## Files Created/Modified

### 1. **Database Schema** (`server/prisma/schema.prisma`)

Added two new enums and one model:

```prisma
enum LeaveType {
  ANNUAL_LEAVE
  MATERNITY_LEAVE
  CASUAL_LEAVE
  SICK_LEAVE
  PERSONAL_LEAVE
  UNPAID_LEAVE
}

enum LeaveStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
}

model Leave {
  id          String       @id @default(uuid())
  employeeId  String
  employee    User         @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  leaveType   LeaveType
  startDate   DateTime
  endDate     DateTime
  duration    Int          // number of days
  reason      String?

  status      LeaveStatus  @default(PENDING)
  approvedBy  User?        @relation("approvedBy", fields: [approvedById], references: [id])
  approvedById String?
  approvalNotes String?
  approvalDate DateTime?

  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@map("leaves")
}
```

### 2. **Validations** (`server/src/validations/leaves.js`)

- `leaveTypeSchema` - Validates leave type enum
- `leaveStatusSchema` - Validates leave status enum
- `createLeaveSchema` - Validates leave creation with date validation
- `updateLeaveSchema` - Partial schema for updates
- `approveLeaveSchema` - Schema for approval with optional notes
- `listLeaveSchema` - Query parameters with filters and sorting

### 3. **Service Layer** (`server/src/services/leaves.service.js`)

Provides business logic with the following functions:

- **`list(filters)`** - List leaves with pagination and filters
  - Filters: status, leaveType, employeeId, department, date range
  - Sorting: supports sortBy and order (asc/desc)
  - Pagination: page and limit with max limit of 100
  - Returns: meta info with page, limit, total, totalPages + data array

- **`getById(id)`** - Get single leave with full details

- **`getByEmployeeId(employeeId, options)`** - Get leaves for specific employee
  - Supports status filter and pagination

- **`create(payload)`** - Create new leave request
  - Auto-calculates duration based on start/end dates

- **`update(id, payload)`** - Update existing leave
  - Only updates pending leaves for non-admins
  - Auto-recalculates duration if dates change

- **`approve(id, approvalData, approverId)`** - Approve or reject leave
  - Sets status, approval notes, approved by, and approval date

- **`remove(id)`** - Delete leave

- **`getStats(employeeId)`** - Get leave statistics for employee
  - Returns total approved days and breakdown by leave type

### 4. **Controller Layer** (`server/src/controllers/leaves.controller.js`)

Handles HTTP requests with proper validation and authorization:

- **`listLeaves`** - List all leaves (admin endpoint)
- **`getLeave`** - Get specific leave details
- **`getMyLeaves`** - Get current user's leaves
- **`createLeave`** - Create leave request (authenticated)
- **`updateLeave`** - Update leave (employee/admin only)
- **`approveLeave`** - Approve/reject leave (admin only)
- **`deleteLeave`** - Delete leave (employee/admin only)
- **`getLeaveStats`** - Get current user's leave statistics

### 5. **Routes** (`server/src/routes/leaves.route.js`)

RESTful API endpoints:

```
GET    /leaves                 - List all leaves (requires 'leave:read')
GET    /leaves/:id             - Get specific leave (requires 'leave:read')
GET    /leaves/my-leaves       - Get user's leaves (authenticated)
GET    /leaves/stats           - Get user's leave stats (authenticated)
POST   /leaves                 - Create leave (authenticated)
PUT    /leaves/:id             - Update leave (employee/admin)
DELETE /leaves/:id             - Delete leave (employee/admin)
PATCH  /leaves/:id/approve     - Approve/reject leave (requires 'leave:approve')
```

### 6. **Permissions** (`server/src/lib/permission.js`)

Updated with leave permissions:

```javascript
leave: ['create', 'read', 'edit', 'delete', 'approve']

// Employee role gets
leave: ['create', 'read']

// Admin role gets
leave: ['create', 'read', 'edit', 'delete', 'approve']
```

### 7. **Routes Registration** (`server/src/routes/index.js`)

Registered the new leaves route at `/leaves` path.

## Features Implemented

### Filtering

- By leave status (PENDING, APPROVED, REJECTED, CANCELLED)
- By leave type (ANNUAL_LEAVE, MATERNITY_LEAVE, CASUAL_LEAVE, SICK_LEAVE, PERSONAL_LEAVE, UNPAID_LEAVE)
- By employee ID
- By department
- By date range (startDate and endDate)

### Pagination

- Configurable page and limit
- Max limit of 100 items per page
- Returns total count and total pages in metadata

### Sorting

- Support for multiple sort fields: createdAt, startDate, endDate, status, duration
- Ascending/descending order

### Authorization

- Employees can create leaves, view their own leaves, and view stats
- Employees can only update/delete their pending leaves
- Only admins can approve/reject leaves
- Only admins can list all leaves

### Auto-Calculations

- Automatically calculates duration in days between start and end dates
- Validates that end date is after start date

## API Usage Examples

### Create Leave

```bash
POST /api/leaves
Authorization: Bearer {token}
Content-Type: application/json

{
  "leaveType": "ANNUAL_LEAVE",
  "startDate": "2025-02-01T00:00:00Z",
  "endDate": "2025-02-05T00:00:00Z",
  "reason": "Vacation"
}
```

### Get My Leaves with Filters

```bash
GET /api/leaves/my-leaves?status=APPROVED&page=1&limit=10
Authorization: Bearer {token}
```

### List All Leaves (Admin)

```bash
GET /api/leaves?page=1&limit=20&status=PENDING&leaveType=ANNUAL_LEAVE&sortBy=startDate&order=asc
Authorization: Bearer {admin-token}
```

### Approve/Reject Leave (Admin)

```bash
PATCH /api/leaves/{id}/approve
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "status": "APPROVED",
  "approvalNotes": "Approved"
}
```

## Database Migration

The database has been successfully migrated with:

- Prisma Client generated
- Seed scripts ready (if configured)

## Next Steps

1. Optionally add email notifications when leaves are approved/rejected
2. Add leave balance/quota management if needed
3. Add reporting endpoints for leave analytics
4. Consider adding recurring leave requests

All permissions and middleware are properly integrated with your existing authentication system.
