# 22_AI_HANDOVER.md

# PrivateConnect AI Handover Protocol

Version: 1.0

Status: Critical

Priority: Highest

---

# Purpose

This document enables seamless continuation of the project across different AI assistants, developers, and time periods.

Any AI or developer joining the project must read this document before making changes.

---

# Project Identity

Project Name
PrivateConnect

Project Type
Private Communication Platform

Architecture
MERN Stack

Version
1.0 MVP

Current Status
Planning Complete
Implementation Pending

Target Users
100

---

# Technology Stack

Frontend
* React
* Vite
* Tailwind CSS
* Axios
* React Router
* Socket.io Client

Backend
* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* Socket.io
* JWT
* bcrypt
* Helmet
* CORS

Deployment
* Vercel
* Render
* MongoDB Atlas

---

# Business Goal

Build a secure administrator-controlled communication platform.

Users do NOT register.
Users do NOT use mobile numbers.
Users do NOT use email.
Users receive access only through administrator-generated Secret Codes.

---

# MVP Scope

Included
* Admin Login
* Secret Code Generation
* Secret Code Authentication
* Username Creation
* Username Search
* One-to-One Chat
* Voice Call
* Video Call
* Profile
* Logout
* Admin Dashboard

Excluded
* Group Chat
* Group Calls
* File Sharing
* Push Notifications
* End-to-End Encryption
* Mobile Apps
* Desktop Apps

These features are intentionally postponed.

---

# Project Documentation

Read in this order:
1. AI_MEMORY.md
2. PROJECT_RULES.md
3. PROJECT_PROGRESS.md
4. TODO.md
5. SYSTEM_ARCHITECTURE.md
6. DATABASE_DESIGN.md
7. API_SPECIFICATION.md
8. SECURITY_POLICY.md
9. Remaining documents

Do not begin implementation before reviewing the required documentation.

---

# Development Status

Documentation
Complete

Environment Setup
Pending

Backend
Pending

Frontend
Pending

Testing
Pending

Deployment
Pending

---

# Current Milestone

Begin implementation with:
1. GitHub repository
2. MongoDB Atlas
3. Render
4. Vercel
5. MERN project initialization

No application code has been implemented yet.

---

# Architecture Rules

* Keep frontend and backend separated.
* Use modular architecture.
* Keep controllers thin.
* Place business logic in services.
* Use reusable components.
* Use reusable middleware.
* Never mix UI and business logic.

---

# Security Summary

* JWT Authentication
* Secret Code hashing with bcrypt
* HTTPS in production
* WSS for Socket.io
* Input validation
* Rate limiting
* Helmet
* CORS
* Environment variables for secrets

Messages are stored in plaintext on the server for Version 1.0.
This is an intentional design decision.

---

# Database Summary

Collections
Users
SecretCodes
Chats
Calls

No additional collections in MVP.

---

# AI Responsibilities

Before coding:
* Read AI_MEMORY.md
* Read PROJECT_RULES.md
* Read PROJECT_PROGRESS.md
* Read TODO.md

Before modifying architecture:
* Verify documentation.
* Request approval if a breaking change is required.

After completing a feature:
* Update PROJECT_PROGRESS.md
* Update CHANGELOG.md
* Update TODO.md
* Update technical documentation if affected
* Summarize implementation

---

# Coding Standards

Follow:
* JavaScript
* React Functional Components
* Express Services
* Mongoose Models
* Clean Architecture
* Modular Design

Avoid:
* Duplicate code
* Placeholder implementations
* Hardcoded secrets
* Large monolithic files

---

# Known Decisions

* Single Admin Account in MVP.
* Username-based communication.
* Secret Code authentication.
* Socket.io for real-time communication.
* WebRTC for media.
* Server-side plaintext message storage.
* No E2EE in Version 1.0.

These decisions should not be changed without updating documentation.

---

# If Context Is Lost

If an AI session loses context:
1. Read this file.
2. Read AI_MEMORY.md.
3. Read PROJECT_PROGRESS.md.
4. Read TODO.md.
5. Resume from the next pending task.

Do not restart completed work.

---

# Handover Checklist

Before ending any development session:
* Save code.
* Update progress.
* Update changelog.
* Update TODO.
* Ensure documentation matches implementation.
* Record any architectural decisions.

---

# Definition of Done

The handover is successful when:
* Another AI can continue the project without additional explanation.
* Documentation accurately reflects the current state.
* No hidden assumptions remain.
* The next task is clearly identified.

---

# Current Next Task

Phase 1 — Development Environment Setup
1. Create GitHub repository.
2. Configure MongoDB Atlas.
3. Configure Render.
4. Configure Vercel.
5. Initialize MERN project.
6. Push initial commit.

Status: Ready for Implementation
Version: 1.0
