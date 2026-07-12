# AI_MEMORY.md

Version: 1.0.0

Document Type: Persistent AI Memory

Priority: CRITICAL

Status: Source of Truth

---

# Purpose

This document acts as the permanent memory for every AI assistant working on the PrivateConnect project.

Every coding session must begin by reading this document.

If any instruction conflicts with another document, this document takes precedence unless PROJECT_RULES.md explicitly overrides it.

Never ignore this document.

---

# Project Identity

Project Name
PrivateConnect

Project Type
Private Private Communication Platform

Architecture
MERN Stack

Current Version
1.0 MVP

Current Stage
Planning

Target Users
100

Deployment
Frontend → Vercel
Backend → Render
Database → MongoDB Atlas

---

# Core Vision

PrivateConnect is NOT another WhatsApp clone.
PrivateConnect is NOT another Discord clone.
PrivateConnect is NOT another Telegram clone.
PrivateConnect is a controlled-access communication platform.
Every user must be approved by an Administrator.
No public registration exists.

---

# Authentication Rules

Users cannot register.
Users cannot create accounts.
Users cannot use phone numbers.
Users cannot use email addresses.
Users cannot use Google Login.
Users cannot use Facebook Login.
Users cannot use OTP verification.
Users cannot use social authentication.

Users must authenticate using an Admin-generated Secret Code.
Only the Administrator can generate Secret Codes.
Secret Codes must be unique.
Secret Codes must be securely hashed before storage.

---

# Username Rules

Every user must have exactly one unique username.
Usernames must be unique across the entire platform.
Usernames cannot be duplicated.
Users communicate using usernames.
Searching always happens using usernames.
Never search using phone numbers.
Never search using email addresses.

---

# Chat Rules

Chat is one-to-one only.
No group chat.
Messages are stored in MongoDB.
Messages arrive in real time.
Socket.io handles real-time communication.
Server receives messages in plaintext.
Transport security relies on HTTPS/TLS in production.
Typing indicators are supported.
Online/offline presence is supported.
Read receipts are optional and not required for MVP.

---

# Calling Rules

Voice calling is supported.
Video calling is supported.
WebRTC handles media.
Socket.io handles signaling only.
Never transmit media through Socket.io.
Never store audio or video streams.
Calls are peer-to-peer whenever possible.

---

# Admin Rules

Administrator has full control.
Administrator generates Secret Codes.
Administrator manages users.
Administrator can deactivate users.
Administrator can delete users.
Administrator can view chat history.
Administrator can view login history.
Administrator cannot be deleted through the UI.

---

# Database Rules

MongoDB Atlas only.

Collections
Users
SecretCodes
Chats
Calls

Indexes should be added where appropriate.
Always use timestamps.
Never duplicate data unnecessarily.

---

# API Rules

REST APIs.
Consistent JSON responses.
Centralized error handling.
Validation required.
Meaningful HTTP status codes.
Never expose internal server errors to users.

---

# Frontend Rules

React only.
Vite only.
Tailwind CSS only.
Functional Components only.
React Hooks only.
Reusable Components.
Responsive Layout.
No inline CSS unless unavoidable.

---

# Backend Rules

Node.js
Express.js
Mongoose
Controllers
Routes
Models
Middlewares
Services
Utilities
Follow modular architecture.

---

# Security Rules

JWT Authentication.
Helmet.
CORS.
Rate Limiting.
Input Validation.
Sanitize MongoDB queries.
Hash Secret Codes.
Environment variables only.
Never hardcode secrets.

---

# UI Philosophy

Simple.
Modern.
Minimal.
Professional.
Fast.
Responsive.
No unnecessary animations.

---

# Performance Goals

Target
100 users

Fast startup.
Fast API responses.
Minimal database queries.
Efficient Socket.io events.

---

# Development Philosophy

Documentation First.
Architecture Second.
Implementation Third.
Deployment Last.

Every feature must follow this order.

---

# Coding Philosophy

Readable code.
Clean code.
Maintainable code.
Reusable code.
Modular code.
Production-quality code.
Avoid shortcuts.
Avoid unnecessary complexity.

---

# Git Rules

Meaningful commit messages.
Small commits.
Feature branches.
No direct commits to production without review.
Never commit .env files.
Always maintain .env.example.

---

# Documentation Rules

Every new feature must update:
README
API Documentation
Environment Variables
Project Progress
Changelog

If documentation is not updated, the feature is incomplete.

---

# AI Behaviour Rules

Read this document before writing code.
Never change project architecture without approval.
Never rename folders without approval.
Never install unnecessary dependencies.
Never remove working features.
Never rewrite working modules unless requested.
Always reuse existing code.
Always explain major architectural decisions.
Always maintain coding consistency.
Always validate user input.
Always handle errors.
Always write production-quality code.
If unsure, ask before making assumptions.

---

# MVP Scope

Included
Secret Code Authentication
Username System
Admin Dashboard
One-to-One Chat
Voice Calls
Video Calls
User Search
Profile
Logout

Excluded
Group Chat
Group Calls
File Sharing
Screen Sharing
Push Notifications
Stories
Status
Mobile Apps
Desktop Apps
End-to-End Encryption

These features are intentionally excluded from Version 1.0.

---

# Long-Term Goal

Build a secure, maintainable communication platform that starts as a 100-user MVP but has an architecture that can evolve without major rewrites.

Every design decision should favor clarity, maintainability, and scalability over unnecessary complexity.

---

# AI Session Checklist

Before starting any coding session:
1. Read AI_MEMORY.md.
2. Read PROJECT_RULES.md.
3. Check PROJECT_PROGRESS.md.
4. Review TODO.md.
5. Continue from the latest completed feature.
6. Do not duplicate work.
7. Keep documentation synchronized with code.
8. Maintain the agreed architecture.
9. Preserve backward compatibility whenever practical.
10. End each completed feature with a short implementation summary and any documentation updates required.
