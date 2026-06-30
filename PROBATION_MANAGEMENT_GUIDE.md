# Probation Management System - Complete Guide

## 🎯 Overview

Complete probation tracking and management system integrated into the Employee module. Automatically calculates probation periods, tracks reviews, handles extensions, and manages confirmations.

---

## 📋 New Employee Fields

Added to `employees` table:

```typescript
probation_duration_months: number         // 3, 6, or 12 months
probation_end_date: Date                  // Auto-calculated from joining date
probation_status: string                  // active, under_review, extended, confirmed, failed, terminated
probation_extension_count: number         // Number of times extended
probation_extension_reason: string        // Reason for extension
date_of_confirmation: Date                // When employee was confirmed
confirmed_by: string                      // User ID who confirmed
confirmation_remarks: string              // Confirmation/review remarks
```

---

## 🔄 Automatic Probation Calculation

When employee is invited with `employment_type: 'probation'`:

```javascript
Joining Date: 01-Jan-2026
Probation Period: 6 months (default)

System Auto-Calculates:
├─ probation_start_date: 01-Jan-2026
├─ probation_end_date: 30-Jun-2026
├─ probation_duration_months: 6
└─ probation_status: 'active'
```

---

## 📊 API Endpoints

### 1. Probation Dashboard

**Endpoint:** `GET /v1/employees/probation/dashboard`

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_on_probation": 45,
      "expiring_this_week": 8,
      "expiring_this_month": 17
    },
    "status_breakdown": {
      "confirmed": 25,
      "extended": 5,
      "under_review": 10,
      "failed": 2,
      "active": 30
    }
  }
}
```

---

### 2. Get Probation Employees (With Filters)

**Endpoint:** `GET /v1/employees/probation/list`

**Query Parameters:**
```
?status=active                           // Filter by status
?expiring_within_days=30                // Expiring in next 30 days
?department_id=uuid                      // Filter by department
?reporting_manager_id=uuid               // Filter by manager
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "employee_id": "uuid",
      "employee_code": "IM05",
      "employee_name": "John Doe",
      "email": "john@company.com",
      "probation_details": {
        "probation_start_date": "2026-01-01",
        "probation_end_date": "2026-06-30",
        "probation_duration_months": 6,
        "days_remaining": 45,
        "status": "active",
        "extension_count": 0,
        "extension_reason": null
      },
      "employment_details": {
        "employment_type": "probation",
        "employment_status": "ACTIVE",
        "date_of_joining": "2026-01-01",
        "date_of_confirmation": null
      },
      "department": {
        "id": "dept-uuid",
        "name": "Engineering"
      },
      "designation": {
        "id": "desig-uuid",
        "name": "Software Engineer"
      },
      "reporting_manager": {
        "id": "mgr-uuid",
        "name": "Jane Smith",
        "employee_code": "IM02"
      }
    }
  ],
  "total": 45
}
```

---

### 3. Get Probation Details (Single Employee)

**Endpoint:** `GET /v1/employees/probation/:employeeId/details`

**Response:** Same as list item above

---

### 4. Submit Probation Review

**Endpoint:** `POST /v1/employees/probation/:employeeId/review`

**Payload:**
```json
{
  "performance_rating": 4,
  "work_quality_rating": 5,
  "productivity_rating": 4,
  "attendance_rating": 5,
  "discipline_rating": 4,
  "communication_rating": 4,
  "team_collaboration_rating": 5,
  "recommendation": "confirm",
  "remarks": "Employee has shown excellent performance and is ready for confirmation."
}
```

**Recommendations:**
- `confirm` - Confirm employee (complete probation)
- `extend` - Extend probation (requires `extension_months` and `extension_reason`)
- `fail` - Fail probation (terminate employee)

**For Extension:**
```json
{
  "performance_rating": 3,
  "work_quality_rating": 3,
  "productivity_rating": 3,
  "attendance_rating": 4,
  "discipline_rating": 4,
  "communication_rating": 3,
  "team_collaboration_rating": 3,
  "recommendation": "extend",
  "extension_months": 3,
  "extension_reason": "Need more time to evaluate technical skills",
  "remarks": "Employee shows potential but needs additional time to meet expectations."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Probation review submitted successfully. Recommendation: confirm",
  "data": {
    "employee_id": "uuid",
    "average_rating": "4.43",
    "recommendation": "confirm"
  }
}
```

---

### 5. Confirm Employee

**Endpoint:** `POST /v1/employees/probation/:employeeId/confirm`

**Payload:**
```json
{
  "confirmation_date": "2026-07-01",
  "confirmation_remarks": "Employee has successfully completed probation with excellent performance."
}
```

**What Happens:**
- ✅ `probation_status` → `'confirmed'`
- ✅ `employment_type` → `'full_time'`
- ✅ `date_of_confirmation` → Set to confirmation date
- ✅ `confirmed_by` → User ID of approver
- ✅ Employee removed from probation list

**Response:**
```json
{
  "success": true,
  "message": "Employee confirmed successfully",
  "data": {
    "employee_id": "uuid",
    "confirmation_date": "2026-07-01",
    "employment_type": "full_time"
  }
}
```

---

### 6. Extend Probation

**Endpoint:** `POST /v1/employees/probation/:employeeId/extend`

**Payload:**
```json
{
  "extension_months": 3,
  "extension_reason": "Need additional time to evaluate performance on recent project assignments."
}
```

**Calculation Example:**
```
Current End Date: 30-Jun-2026
Extension: +3 Months
New End Date: 30-Sep-2026
```

**What Happens:**
- ✅ `probation_end_date` → Extended by X months
- ✅ `probation_status` → `'extended'`
- ✅ `probation_extension_count` → Incremented
- ✅ `probation_extension_reason` → Stored

**Response:**
```json
{
  "success": true,
  "message": "Probation extended by 3 months",
  "data": {
    "employee_id": "uuid",
    "new_end_date": "2026-09-30",
    "extension_count": 1
  }
}
```

---

### 7. Fail Probation

**Endpoint:** `POST /v1/employees/probation/:employeeId/fail`

**Payload:**
```json
{
  "failure_remarks": "Employee did not meet performance expectations during probation period.",
  "exit_date": "2026-06-30"
}
```

**What Happens:**
- ✅ `probation_status` → `'failed'`
- ✅ `employment_status` → `'EXITED'`
- ✅ `exit_reason` → `'Failed Probation'`
- ✅ `date_of_exit` → Set to specified or current date

**Response:**
```json
{
  "success": true,
  "message": "Employee probation marked as failed",
  "data": {
    "employee_id": "uuid",
    "exit_date": "2026-06-30"
  }
}
```

---

## 🎬 Complete User Flows

### Flow 1: New Employee → Confirmed

```
1. HR Invites Employee
   POST /v1/employees/invite
   {
     "email": "john@company.com",
     "employment_type": "probation",
     "date_of_joining": "2026-01-01",
     ...
   }

2. System Auto-Calculates
   probation_end_date: 2026-06-30
   probation_status: 'active'
   probation_duration_months: 6

3. Manager Views Dashboard (Before Review)
   GET /v1/employees/probation/dashboard
   Shows: 1 employee expiring in June

4. Manager Submits Review
   POST /v1/employees/probation/:id/review
   {
     "recommendation": "confirm",
     "performance_rating": 4,
     ...
   }

5. Employee Confirmed
   probation_status: 'confirmed'
   employment_type: 'full_time'
   date_of_confirmation: '2026-07-01'

6. Dashboard Updated
   total_on_probation: 0
   confirmed: 1
```

---

### Flow 2: Probation Extended

```
1. Employee on Probation
   probation_end_date: 2026-06-30
   probation_status: 'active'

2. Manager Extends Probation
   POST /v1/employees/probation/:id/extend
   {
     "extension_months": 3,
     "extension_reason": "Need more time"
   }

3. New Dates Calculated
   probation_end_date: 2026-09-30
   probation_status: 'extended'
   probation_extension_count: 1

4. Later Confirmed
   POST /v1/employees/probation/:id/confirm
   probation_status: 'confirmed'
```

---

### Flow 3: Probation Failed

```
1. Employee Underperforming
   probation_status: 'active'

2. Manager Submits Review
   POST /v1/employees/probation/:id/review
   {
     "recommendation": "fail",
     "remarks": "Did not meet expectations"
   }

3. Employee Terminated
   probation_status: 'failed'
   employment_status: 'EXITED'
   exit_reason: 'Failed Probation'
```

---

## 📅 Probation Statuses

| Status | Description | Employee Type |
|--------|-------------|---------------|
| `active` | Currently on probation | probation |
| `under_review` | Being reviewed by manager | probation |
| `extended` | Probation period extended | probation |
| `confirmed` | Successfully completed | full_time |
| `failed` | Did not pass probation | (Exited) |
| `terminated` | Terminated during probation | (Exited) |

---

## 🎯 Rating Scale (1-5)

```
1 - Poor
2 - Below Average
3 - Average
4 - Good
5 - Excellent
```

**Areas Rated:**
- Performance
- Work Quality
- Productivity
- Attendance
- Discipline
- Communication
- Team Collaboration

---

## 🔔 Notification/Reminder Implementation (Future)

**Suggested Reminders:**

```javascript
// 30 days before probation end
sendReminder({
  to: ['employee', 'manager', 'hr'],
  message: 'Probation review due in 30 days',
  employee: 'John Doe',
  end_date: '2026-06-30'
});

// 15 days before
sendReminder({
  to: ['manager', 'hr'],
  message: 'Probation review required for John Doe'
});

// 7 days before
sendReminder({
  to: ['manager', 'hr'],
  message: 'URGENT: Probation review due in 7 days'
});

// On due date
sendReminder({
  to: ['manager', 'hr'],
  message: 'Probation ends TODAY for John Doe'
});
```

---

## 📊 Dashboard Filters

```javascript
// Active probations only
GET /v1/employees/probation/list?status=active

// Expiring soon
GET /v1/employees/probation/list?expiring_within_days=7

// Extended probations
GET /v1/employees/probation/list?status=extended

// By department
GET /v1/employees/probation/list?department_id=uuid

// By manager (my team)
GET /v1/employees/probation/list?reporting_manager_id=uuid

// Combined filters
GET /v1/employees/probation/list?status=active&expiring_within_days=30&department_id=uuid
```

---

## ✅ Testing Checklist

- [ ] New employee invited with `employment_type: 'probation'`
- [ ] Probation end date auto-calculated (joining + 6 months)
- [ ] Dashboard shows correct count
- [ ] Filter by status works
- [ ] Filter by expiring days works
- [ ] Submit review with "confirm" recommendation
- [ ] Employee status changes to confirmed
- [ ] Employment type changes to full_time
- [ ] Extend probation works
- [ ] Extension count increments
- [ ] New end date calculated correctly
- [ ] Fail probation works
- [ ] Employee exits with "Failed Probation" reason
- [ ] Dashboard updates after all actions

---

## 🚀 Quick Start

### 1. Invite Employee on Probation

```bash
POST /v1/employees/invite
Headers: x-tenant-id, Authorization
{
  "email": "newemployee@company.com",
  "role": "EMPLOYEE",
  "employee_code": "IM10",
  "first_name": "New",
  "last_name": "Employee",
  "employment_type": "probation",
  "date_of_joining": "2026-06-01",
  "department_id": "dept-uuid",
  "designation_id": "desig-uuid"
}
```

### 2. View Probation Dashboard

```bash
GET /v1/employees/probation/dashboard
Headers: x-tenant-id, Authorization
```

### 3. Get Employees Expiring This Month

```bash
GET /v1/employees/probation/list?expiring_within_days=30
Headers: x-tenant-id, Authorization
```

### 4. Confirm Employee

```bash
POST /v1/employees/probation/{employee-id}/confirm
Headers: x-tenant-id, Authorization
{
  "confirmation_date": "2026-12-01",
  "confirmation_remarks": "Excellent performance during probation"
}
```

---

## 🎉 Summary

The Probation Management System is now fully integrated with:

✅ **Automatic Calculation** - Probation dates auto-calculated from joining date
✅ **Dashboard Overview** - Real-time stats on probations
✅ **Smart Filtering** - Filter by status, expiry, department, manager
✅ **Review System** - 7-point rating scale with recommendations
✅ **Confirmation Process** - One-click employee confirmation
✅ **Extension Support** - Flexible probation extensions
✅ **Failure Handling** - Proper exit process for failed probations
✅ **Employee Module Integration** - All APIs in existing employee module

No separate tables needed - everything uses the existing `employees` table!
