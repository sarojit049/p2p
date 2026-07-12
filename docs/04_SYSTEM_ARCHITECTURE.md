# 04_SYSTEM_ARCHITECTURE.md

# PrivateConnect Enterprise System Architecture

Version: 1.0

Status: Approved

Priority: CRITICAL

---

# 1. Architecture Overview

PrivateConnect follows a modern three-tier architecture designed for maintainability, security, and scalability.

The application is divided into:

* Client Layer
* Server Layer
* Database Layer

Real-time communication is handled using Socket.io.

Voice and Video communication use WebRTC.

---

# 2. High-Level Architecture

```text
                    ┌──────────────────────────────┐
                    │         USER DEVICE          │
                    │ React + Tailwind + Vite      │
                    └──────────────┬───────────────┘
                                   │
                              HTTPS + WSS
                                   │
                    ┌──────────────▼───────────────┐
                    │        EXPRESS SERVER        │
                    │                              │
                    │ Authentication               │
                    │ REST APIs                    │
                    │ Socket.io                    │
                    │ Business Logic               │
                    └───────┬───────────┬──────────┘
                            │           │
                            │           │
                    MongoDB Atlas   WebRTC Signaling
                            │
                    Persistent Storage
```

---

# 3. Client Layer

Responsibilities
* Login
* Dashboard
* Chat UI
* Video Call UI
* Voice Call UI
* Profile
* Search Users
* Socket Connection
* WebRTC Peer Connection

Technologies
React
Vite
Tailwind CSS
Axios
Socket.io Client

---

# 4. Server Layer

Responsibilities
Authentication
Authorization
REST APIs
Secret Code Validation
JWT Generation
Socket.io Events
User Presence
Chat Storage
Call Signaling
Admin Dashboard APIs
Server-side Logging

---

# 5. Database Layer

MongoDB Atlas

Collections
Users
SecretCodes
Chats
Calls

Indexes
Username
Secret Code Hash
Created Time

---

# 6. Authentication Flow

```text
User Opens App
        │
Enter Secret Code
        │
Express API
        │
Check SecretCode Collection
        │
Valid?
   ┌────┴─────┐
   │          │
  YES         NO
   │          │
Generate JWT  Reject Request
   │
Dashboard
```

---

# 7. Admin Flow

```text
Admin Login
      │
Dashboard
      │
Generate Secret Code
      │
Assign to User
      │
Store Hashed Secret Code
```

---

# 8. User Login Flow

```text
User
   │
Secret Code
   │
Backend Verification
   │
JWT Token
   │
Frontend Stores Token
   │
Dashboard
```

---

# 9. Chat Flow

```text
User A
↓
Socket.io
↓
Express Server
↓
Save Message
↓
MongoDB
↓
Forward to User B
↓
User B Receives Message
```

Messages are stored on the server.
The server can read plaintext messages.
Transport security is provided by HTTPS/TLS.

---

# 10. Voice & Video Call Flow

```text
User A
↓
Socket.io
↓
Offer
↓
User B
↓
Answer
↓
ICE Candidates
↓
Peer Connection
↓
Direct Audio / Video (WebRTC)
```

Socket.io is used only for signaling.
Media flows directly between peers whenever possible.

---

# 11. Presence System

Socket Connected
↓
User Online
↓
Heartbeat
↓
Disconnect
↓
User Offline

---

# 12. API Layer

Authentication APIs
User APIs
Chat APIs
Call APIs
Admin APIs

Each module is isolated.

---

# 13. Socket.io Layer

Socket Responsibilities
User Connected
User Disconnected
Join Personal Room
Leave Room
Typing
Stop Typing
Send Message
Receive Message
Incoming Call
Accept Call
Reject Call
End Call
Online Status

---

# 14. Folder Architecture

```text
PrivateConnect/

client/
  src/
    components/
    pages/
    hooks/
    services/
    context/
    layouts/
    utils/

server/
  controllers/
  routes/
  models/
  middlewares/
  services/
  sockets/
  config/
  utils/

docs/
```

---

# 15. Security Architecture

JWT Authentication
↓
Protected APIs
↓
Secret Code Hashing
↓
MongoDB
↓
HTTPS
↓
Helmet
↓
CORS
↓
Rate Limiting
↓
Input Validation

---

# 16. Deployment Architecture

```text
Client
↓
Vercel
↓
HTTPS
↓
Render Backend
↓
MongoDB Atlas
```

---

# 17. Logging Strategy

Application Logs
Authentication Logs
Socket Events
Call Events
Server Errors
API Errors

Logs must not contain Secret Codes or JWT tokens.

---

# 18. Error Handling Strategy

Validation Errors
↓
Authentication Errors
↓
Authorization Errors
↓
Database Errors
↓
Socket Errors
↓
Unexpected Errors

Every error must return a consistent JSON response.

---

# 19. Scalability Strategy

Current Target: 100 Users

Architecture should remain modular so future versions can support:
1,000 Users
10,000 Users
Microservices
Redis
Horizontal Scaling

Without major rewrites.

---

# 20. Engineering Principles

Single Responsibility Principle
Separation of Concerns
Modular Design
Reusable Components
Reusable APIs
Reusable Services
Clean Folder Structure
Readable Code
Documentation First
Security by Default
Maintainability over Complexity

---

# End of Document

This architecture document is the foundation for every implementation decision.

Any architectural change must be reflected here before implementation.
