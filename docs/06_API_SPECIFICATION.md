# 06_API_SPECIFICATION.md

# PrivateConnect REST API Specification

Version: 1.0

Status: Approved

Base URL (Development)

```
http://localhost:5000/api/v1
```

Base URL (Production)

```
https://your-backend-domain/api/v1
```

---

# API Standards

All APIs return JSON.

Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {}
}
```

Error Response

```json
{
  "success": false,
  "message": "Error description.",
  "error": {}
}
```

---

# HTTP Status Codes

| Code | Meaning               |
| ---- | --------------------- |
| 200  | Success               |
| 201  | Created               |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 409  | Conflict              |
| 422  | Validation Error      |
| 429  | Too Many Requests     |
| 500  | Internal Server Error |

---

# Authentication Module

## Login Using Secret Code

POST

```
/auth/login
```

Request

```json
{
  "secretCode": "ABC123XYZ"
}
```

Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "...",
    "user": {}
  }
}
```

---

## Logout

POST

```
/auth/logout
```

JWT Required

---

## Current User

GET

```
/auth/me
```

JWT Required

Returns current authenticated user.

---

# User Module

## Create Username

POST

```
/users/username
```

Request

```json
{
  "username": "saroj"
}
```

Validation

* Unique
* 3–30 characters
* Letters, numbers, underscore

---

## Search User

GET

```
/users/search?username=
```

Returns matching users.

---

## Get Profile

GET

```
/users/profile
```

JWT Required.

---

## Update Profile

PUT

```
/users/profile
```

Future enhancement.

---

# Chat Module

## Send Message

POST

```
/chat/send
```

Request

```json
{
  "receiverId": "...",
  "message": "Hello"
}
```

Stores the message and emits a Socket.io event.

---

## Get Conversation

GET

```
/chat/:userId
```

Returns conversation between authenticated user and selected user.

Pagination supported.

---

## Delete Message

Future Version

Not implemented in MVP.

---

# Call Module

## Start Call

POST

```
/call/start
```

Stores call metadata.

---

## End Call

POST

```
/call/end
```

Updates call status and duration.

---

## Call History

GET

```
/call/history
```

Returns authenticated user's call history.

---

# Admin Module

All admin APIs require:

* JWT
* Admin role

---

## Admin Login

POST

```
/admin/login
```

---

## Generate Secret Code

POST

```
/admin/secret-codes
```

Request

```json
{
  "count": 1
}
```

Response

```json
{
  "success": true,
  "data": {
    "secretCode": "GeneratedOnce"
  }
}
```

**Important:** The generated Secret Code is shown only once. The server stores only its hash.

---

## List Users

GET

```
/admin/users
```

Supports pagination.

---

## Get User Details

GET

```
/admin/users/:id
```

---

## Block User

PATCH

```
/admin/users/:id/block
```

---

## Unblock User

PATCH

```
/admin/users/:id/unblock
```

---

## Delete User

DELETE

```
/admin/users/:id
```

---

## List Secret Codes

GET

```
/admin/secret-codes
```

Returns metadata only. Never expose hashes or original Secret Codes.

---

## View Chat History

GET

```
/admin/chats
```

Supports filters:

* sender
* receiver
* date range

---

## Dashboard Statistics

GET

```
/admin/dashboard
```

Returns:

* Total users
* Active users
* Total chats
* Active calls

---

# Validation Rules

Username
* Required
* Unique
* 3–30 characters

Secret Code
* Required
* Server verifies against hash

Message
* Required
* Max 5000 characters

---

# Authentication Rules

JWT required for:
* Profile
* Chat
* Calls
* User Search
* Admin APIs

Public APIs:
* Secret Code Login
* Admin Login

---

# Error Codes

| Code      | Description               |
| --------- | ------------------------- |
| AUTH_001  | Invalid Secret Code       |
| AUTH_002  | Expired Session           |
| AUTH_003  | Unauthorized              |
| USER_001  | Username Already Exists   |
| USER_002  | User Not Found            |
| CHAT_001  | Message Validation Failed |
| CALL_001  | Call Failed               |
| ADMIN_001 | Access Denied             |

---

# Rate Limiting

Login APIs
* Strict

Chat APIs
* Moderate

Search APIs
* Moderate

Admin APIs
* Strict

---

# API Versioning

Current
```
/api/v1
```

Future versions
```
/api/v2
```
```
/api/v3
```

Do not introduce breaking changes within the same version.

---

# Documentation Rule

Whenever an endpoint is:
* Added
* Modified
* Deprecated
* Removed

This document must be updated before release.

---

# MVP API Summary

Authentication
* Login
* Logout
* Me

Users
* Create Username
* Search
* Profile

Chat
* Send Message
* Get Conversation

Calls
* Start
* End
* History

Admin
* Login
* Generate Secret Code
* Users
* Block/Unblock
* Delete User
* Dashboard
* Chat History

Status
Approved

Version
1.0
