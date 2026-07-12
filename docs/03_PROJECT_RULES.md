# 03_PROJECT_RULES.md

# PrivateConnect Enterprise Development Rules

Version: 1.0

Status: Mandatory

Priority: CRITICAL

---

# SECTION 1 — PROJECT CONSTITUTION

This document defines the mandatory rules for every developer and every AI agent working on the PrivateConnect project.

These rules are not suggestions.

These rules are requirements.

Every implementation must follow them.

---

# 1. PROJECT OBJECTIVE

The objective of PrivateConnect is to build a secure, maintainable, scalable communication platform using the MERN Stack.

The first release (Version 1.0) is an MVP supporting approximately 100 users.

Every engineering decision must support long-term maintainability.

---

# 2. PROJECT PHILOSOPHY

The project follows these principles:

Documentation First
Architecture Before Code
Security by Default
Reusable Components
Reusable APIs
Clean Code
Modular Development
Readable Code
Simple User Experience
Scalable Architecture

Never trade quality for speed.

---

# 3. DEVELOPMENT ORDER

Every feature must follow this order.

Requirement Analysis
↓
Architecture Review
↓
Database Design
↓
API Design
↓
Frontend Planning
↓
Implementation
↓
Testing
↓
Documentation
↓
Git Commit

Skipping any step is not allowed.

---

# 4. SOURCE OF TRUTH

The project documentation has the following priority.

1. AI_MEMORY.md
2. PROJECT_RULES.md
3. PROJECT_PROGRESS.md
4. TODO.md
5. Remaining Documentation

If implementation differs from documentation, documentation must be updated or implementation must be corrected.

Never allow both to become inconsistent.

---

# 5. PROJECT STRUCTURE

The repository must always remain organized.

Required structure:

PrivateConnect/
client/
server/
docs/

Never place backend files inside the frontend.
Never place frontend files inside the backend.
Never mix responsibilities.

---

# 6. ARCHITECTURE

The project follows Modular Architecture.

Backend Layers
Routes
↓
Controllers
↓
Services
↓
Models
↓
Database

Utilities and Middlewares remain independent.

Frontend Layers
Pages
↓
Layouts
↓
Components
↓
Hooks
↓
Services
↓
API

Business logic must never be written directly inside UI components.

---

# 7. VERSIONING

Version 1.0
MVP
100 Users

Version 1.5
Enhancements

Version 2.0
Group Communication

Version 3.0
Mobile Applications

Version 4.0
Enterprise Platform

Never implement Version 2+ features inside Version 1 unless explicitly approved.

---

# 8. MVP BOUNDARIES

Allowed
Secret Code Login
Username Setup
Admin Dashboard
User Search
One-to-One Chat
Voice Call
Video Call
Logout

Not Allowed
Group Chat
Group Calls
Stories
Status
Broadcast Channels
File Sharing
Image Sharing
Push Notifications
Desktop Application
Android Application
iOS Application
End-to-End Encryption

Do not introduce these features into Version 1.

---

# 9. QUALITY STANDARDS

Every module must be:
Readable
Reusable
Maintainable
Testable
Documented
Predictable

No experimental code is allowed in the main branch.

---

# 10. DEPENDENCY POLICY

Before installing any dependency:
Check if native JavaScript can solve the problem.
Check if React already provides a solution.
Check if Node already provides a solution.
Only then install a package.

Every dependency must have a clear purpose.
Avoid unnecessary packages.
Avoid abandoned packages.
Prefer actively maintained libraries.

---

# 11. CONFIGURATION POLICY

Configuration belongs in environment variables.

Never hardcode:
JWT Secrets
MongoDB URI
Admin credentials
API Keys
Socket URLs
Frontend URLs
Render URLs
Cloudinary credentials

Every configurable value must have an entry in `.env.example`.

---

# 12. SECURITY FIRST

Security is mandatory.

Every API must validate input.
Every API must authenticate where required.
Every API must authorize actions.
Every API must return safe error messages.

Never expose stack traces.
Never expose secrets.
Never trust client input.

---

# 13. PERFORMANCE FIRST

Minimize database queries.
Reuse database connections.
Avoid duplicate API requests.
Lazy-load pages where practical.
Avoid unnecessary React re-renders.
Avoid unnecessary Socket events.
Measure before optimizing.

---

# 14. DOCUMENTATION POLICY

Documentation is part of development.
A feature is incomplete until its documentation is updated.

Every feature must update:
README (if needed)
API Specification (if changed)
Database Design (if changed)
Project Progress
Changelog
TODO (if needed)

---

# 15. AI RESPONSIBILITIES

Every AI assistant working on this project must:

Read documentation before coding.
Understand existing architecture.
Avoid duplicate implementations.
Respect modular design.
Generate production-quality code.
Prefer maintainability over speed.
Explain significant design decisions.
Update documentation after changes.
Never make hidden assumptions.
Ask for clarification when requirements are ambiguous.

---

# 16. PROHIBITED ACTIONS

The AI must never:
Delete working modules without approval.
Rename folders without approval.
Rewrite completed features without justification.
Install unnecessary dependencies.
Ignore documentation.
Mix frontend and backend logic.
Store secrets in source code.
Commit `.env` files.
Generate incomplete placeholder implementations when a complete implementation is expected.

---

# 17. DEFINITION OF SUCCESS

PrivateConnect Version 1.0 is successful only when:

Admin can manage Secret Codes.
Users can authenticate with Secret Codes.
Users can create unique usernames.
Users can search by username.
Users can exchange real-time messages.
Users can make one-to-one voice calls.
Users can make one-to-one video calls.

The application is deployed successfully.
The documentation matches the implementation.
The codebase is clean, modular, and maintainable.

---

# END OF PART 1

Next sections to be appended:
* Part 2 — Coding Standards
* Part 3 — Frontend Rules
* Part 4 — Backend Rules
* Part 5 — Database Rules
* Part 6 — API Rules
* Part 7 — Socket.io Rules
* Part 8 — WebRTC Rules
* Part 9 — Security Rules
* Part 10 — Git Workflow
* Part 11 — Documentation Standards
* Part 12 — AI Review Checklist
* Part 13 — Definition of Done
