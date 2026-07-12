# 10_ADMIN_PANEL_SPECIFICATION.md

# PrivateConnect Admin Panel Specification

Version: 1.0

Status: Approved

Priority: Critical

---

# 1. Purpose

The Admin Panel is the central management interface of PrivateConnect.

Only authenticated administrators can access it.

All administrative operations must be performed through this panel.

---

# 2. Admin Responsibilities

Administrator can:
* Login
* Generate Secret Codes
* View Users
* Search Users
* Block Users
* Unblock Users
* Delete Users
* View Chat History
* View Call History
* View Dashboard Statistics
* Logout

Administrator cannot:
* View Secret Code plaintext after creation
* Recover existing Secret Codes
* Edit chat messages
* Modify database directly

---

# 3. Admin Authentication

Single Admin Account (MVP)

Authentication Method
Username + Password

After successful login:
Generate JWT
Protected Admin Session

---

# 4. Admin Routes

```text
/admin/login
/admin/dashboard
/admin/users
/admin/users/:id
/admin/secret-codes
/admin/chats
/admin/calls
/admin/settings
```

---

# 5. Dashboard

Cards
* Total Users
* Active Users
* Blocked Users
* Secret Codes Generated
* Total Chats
* Total Calls
* Active Online Users

Recent Activity
Latest Logins
Recent Messages Count
Recent Calls Count

---

# 6. Secret Code Management

Generate
Assign
View Status
Search
Delete (Unused only)

Rules
Each Secret Code belongs to one user.
Secret Code is displayed only once.
Hash stored in database.
Cannot reveal original value later.

---

# 7. User Management

View User
Search User
Filter Users
Block User
Unblock User
Delete User
View Profile
View Activity

---

# 8. User Status

Supported States
Active
Inactive
Blocked
Deleted (Removed)

Status changes must be logged.

---

# 9. Chat Monitoring

Admin can:
View Conversation
Filter by User
Filter by Date
Search Messages
Sort by Latest

Admin cannot:
Modify Messages
Delete Messages

---

# 10. Call History

Admin can:
View Voice Calls
View Video Calls
View Duration
View Status
Filter by Date
Search User

---

# 11. Search

Search by:
Username
User ID
Role
Status

Search must be fast and indexed.

---

# 12. Pagination

Required for:
Users
Chats
Calls

Default Page Size
20

---

# 13. Filters

Users
Role
Status
Date

Chats
Sender
Receiver
Date Range

Calls
Call Type
Status
Date Range

---

# 14. Logs

Track:
Admin Login
Secret Code Generation
User Block
User Unblock
User Delete
System Errors

Never log:
JWT
Passwords
Secret Codes

---

# 15. Permissions

Administrator has full control over:
Users
Chats
Calls
Secret Codes
System Dashboard

No regular user may access any admin route.

---

# 16. Security

JWT Required
Role Validation
Input Validation
Rate Limiting
Helmet
CORS
HTTPS

Admin APIs must reject non-admin users.

---

# 17. UI Layout

Sidebar
Dashboard
Users
Secret Codes
Chats
Calls
Settings
Logout

Main Area
Statistics
Tables
Search
Filters
Actions

---

# 18. Error Handling

Display user-friendly messages.

Examples
"User not found."
"Access denied."
"Secret Code generated."
"Action completed."

Never expose server stack traces.

---

# 19. Future Enhancements

Reserved
RBAC
Multiple Admins
Audit Dashboard
Analytics
CSV Export
System Notifications
Role Permissions

These are excluded from Version 1.0.

---

# 20. Definition of Done

Admin Panel is complete when:
* Admin login works.
* Dashboard loads.
* Secret Code generation works.
* User management works.
* Chat monitoring works.
* Call history works.
* Search works.
* Filters work.
* Pagination works.
* Security checks pass.
* Documentation is updated.

Status: Approved
Version: 1.0
