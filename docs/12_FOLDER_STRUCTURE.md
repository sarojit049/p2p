# 12_FOLDER_STRUCTURE.md

# PrivateConnect Enterprise Folder Structure

Version: 1.0

Status: Approved

Priority: Critical

---

# Architecture Style

PrivateConnect follows a **Feature-Based Modular Architecture**.

The codebase is divided into:
* Client
* Server
* Shared Documentation

Each layer has a single responsibility.

---

# Root Structure

```text
PrivateConnect/
│
├── client/
├── server/
├── docs/
├── .env.example
├── .gitignore
├── README.md
├── package.json
└── LICENSE
```

---

# Client Structure

```text
client/
│
├── public/
│
├── src/
│   ├── api/
│   ├── assets/
│   ├── components/
│   ├── config/
│   ├── constants/
│   ├── context/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── socket/
│   ├── styles/
│   ├── utils/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

# Client Folder Purpose

## api/
Axios instance
API helper methods
Request interceptors
Response interceptors

---

## assets/
Images
Icons
Fonts
Logos
SVG

---

## components/
Reusable UI components
Examples
Button
Input
Modal
Avatar
Loader
Toast
Navbar
Sidebar
SearchBar
MessageBubble

---

## config/
Application configuration
Socket URL
API URL
Constants

---

## constants/
Application constants
Routes
Roles
Event names
Status values
Error codes

---

## context/
React Context
Authentication
Socket
Theme (Future)

---

## hooks/
Reusable hooks
Examples
useAuth
useSocket
useDebounce
useOnlineStatus

---

## layouts/
Application layouts
AuthLayout
DashboardLayout
AdminLayout

---

## pages/
Login
Username Setup
Dashboard
Chat
Profile
Admin Login
Admin Dashboard
404

---

## routes/
Protected Routes
Public Routes
Admin Routes

---

## services/
Business logic
Authentication
User
Chat
Call
Admin

---

## socket/
Socket.io client
Connection
Events
Listeners
Emitters

---

## styles/
Global CSS
Tailwind overrides

---

## utils/
Helpers
Date formatting
Validation
Storage
JWT helpers

---

# Server Structure

```text
server/
│
├── config/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── services/
├── sockets/
├── utils/
├── validators/
├── app.js
├── server.js
└── package.json
```

---

# Server Folder Purpose

## config/
MongoDB connection
Environment configuration
Application constants

---

## controllers/
Receive request
Call services
Return response
No business logic here.

---

## services/
Business logic
Authentication
Secret Codes
Users
Chat
Calls
Admin

---

## routes/
REST API routes
Authentication
Users
Chat
Call
Admin

---

## models/
Mongoose schemas
Users
SecretCodes
Chats
Calls

---

## middlewares/
JWT Authentication
Role validation
Error handler
Rate limiter
Request logger

---

## validators/
Input validation
Login
Username
Message
Call
Admin

---

## sockets/
Socket.io server
Connection
Authentication
Chat events
Call events
Presence

---

## utils/
Reusable helpers
Hashing
JWT
Date helpers
Response helpers
Logger

---

# Documentation Structure

```text
docs/
│
├── 00_PROJECT_VISION.md
├── 01_AI_MEMORY.md
├── 02_MASTER_PROMPT.md
├── 03_PROJECT_RULES.md
├── 04_SYSTEM_ARCHITECTURE.md
├── 05_DATABASE_DESIGN.md
├── 06_API_SPECIFICATION.md
├── 07_SOCKET_IO_SPECIFICATION.md
├── 08_WEBRTC_SPECIFICATION.md
├── 09_UI_UX_SPECIFICATION.md
├── 10_ADMIN_PANEL_SPECIFICATION.md
├── 11_USER_FLOW.md
├── 12_FOLDER_STRUCTURE.md
├── ...
```

---

# File Naming Rules

Components
PascalCase
Example: Button.jsx, Navbar.jsx, MessageBubble.jsx

Hooks
camelCase
Example: useAuth.js, useSocket.js

Controllers
camelCase
Example: authController.js, chatController.js

Services
camelCase
Example: authService.js, chatService.js

Models
PascalCase
Example: User.js, Chat.js, Call.js, SecretCode.js

Routes
camelCase
Example: authRoutes.js, userRoutes.js, chatRoutes.js

---

# Import Rules

Use absolute imports where practical.
Avoid circular dependencies.
Never import across unrelated modules.

---

# Growth Strategy

Future folders
notifications/
groups/
uploads/
analytics/

These remain excluded from Version 1.0.

---

# Definition of Done

Folder structure is complete when:
* Every file has a defined purpose.
* Responsibilities are clearly separated.
* No duplicate modules exist.
* Naming conventions are followed.
* AI can locate every module without ambiguity.

Status: Approved
Version: 1.0
