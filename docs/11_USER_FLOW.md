# 11_USER_FLOW.md

# PrivateConnect User Flow Specification

Version: 1.0

Status: Approved

Priority: Critical

---

# Purpose

This document defines every user journey inside the application.

Every screen transition must follow this document.

No implementation should contradict these flows.

---

# User Types

System contains only two roles.
1. Administrator
2. User

No additional roles exist in Version 1.

---

# Application Startup

```text
Application Starts
↓
Check Internet
↓
Check Backend Connection
↓
Check JWT Token
↓
Token Exists?
```

If No
↓
Secret Code Login

If Yes
↓
Validate JWT
↓
Dashboard

---

# First Login Flow

```text
Open App
↓
Enter Secret Code
↓
Server Validation
↓
Secret Code Valid?
↓
Yes
↓
JWT Generated
↓
Username Exists?
↓
No
↓
Create Username
↓
Dashboard
↓
End
```

If Secret Code Invalid
↓
Access Denied

---

# Returning User Flow

```text
Open App
↓
JWT Exists
↓
Validate JWT
↓
Valid?
↓
Dashboard
↓
End
```

If JWT Expired
↓
Login Again

---

# Username Creation Flow

Requirements
Unique
3–30 characters
Letters
Numbers
Underscore

Flow
```text
Username
↓
Validate
↓
Unique?
↓
Save
↓
Dashboard
```

---

# Dashboard Flow

Dashboard
↓
Search User
↓
Open Conversation
↓
Chat Screen
↓
Voice / Video Call
↓
Return Dashboard

---

# User Search Flow

```text
Search Username
↓
Server Search
↓
User Found?
↓
Yes
↓
Open Chat
↓
End
```

If Not Found
↓
Display
"No user found."

---

# Chat Flow

```text
Open Chat
↓
Load History
↓
Connect Socket
↓
Send Message
↓
Store Database
↓
Deliver Message
↓
Display
↓
End
```

---

# Incoming Message Flow

```text
Socket Event
↓
Receive Message
↓
Store State
↓
Update UI
↓
Notification Badge
↓
End
```

---

# Voice Call Flow

```text
Click Voice Button
↓
Send Call Request
↓
Receiver Gets Incoming Call
↓
Accept?
↓
Yes
↓
WebRTC Connect
↓
Voice Call
↓
End Call
↓
Store History
↓
End
```

Reject
↓
Caller Notified
↓
End

---

# Video Call Flow

```text
Video Button
↓
Camera Permission
↓
Microphone Permission
↓
Permissions Granted?
↓
Yes
↓
Incoming Call
↓
Accept
↓
WebRTC
↓
Video Connected
↓
End Call
↓
Save History
↓
End
```

Permission Denied
↓
Display Error
↓
End

---

# Logout Flow

```text
Click Logout
↓
Remove JWT
↓
Disconnect Socket
↓
Return Login Screen
```

---

# Admin Login Flow

```text
Admin Login
↓
Validate Credentials
↓
Generate JWT
↓
Admin Dashboard
```

---

# Secret Code Generation Flow

```text
Dashboard
↓
Generate Secret Code
↓
Hash Secret Code
↓
Save Database
↓
Display Plain Secret Code Once
↓
Done
```

---

# Block User Flow

```text
Select User
↓
Block
↓
Update Status
↓
Disconnect Socket
↓
Logout User
↓
Done
```

---

# Delete User Flow

```text
Select User
↓
Delete
↓
Delete Related Data
↓
Success
```

---

# Error Flow

Invalid Secret Code
↓
Display Friendly Error
↓
Stay On Login Screen

---

# Network Failure

API Failure
↓
Retry
↓
Still Failed
↓
Show Error Screen

---

# Session Expired

JWT Expired
↓
Logout
↓
Return Login

---

# Unauthorized Access

Invalid JWT
↓
Reject Request
↓
Redirect Login

---

# User Journey Summary

User
Secret Code Login
↓
Username
↓
Dashboard
↓
Search User
↓
Chat
↓
Voice / Video Call
↓
Logout

---

# Admin Journey Summary

Admin Login
↓
Dashboard
↓
Generate Secret Code
↓
Manage Users
↓
View Chats
↓
View Calls
↓
Logout

---

# Engineering Rules

Every flow must:
Validate Input
Handle Errors
Display Loading State
Display Success State
Remain Responsive
Follow Security Policy

---

# Definition of Done

The application is considered flow-complete when every documented journey works exactly as specified.

Status: Approved
Version: 1.0
