# 16_DEPLOYMENT_GUIDE.md

# PrivateConnect Deployment Guide

Version: 1.0

Status: Approved

Priority: Critical

---

# Purpose

This document describes the official deployment process for PrivateConnect.

Deployment architecture:
Frontend → Vercel
Backend → Render
Database → MongoDB Atlas

---

# Production Architecture

```text
                 Users
                   │
            HTTPS / WSS
                   │
        ┌──────────────────┐
        │  Vercel Frontend │
        └────────┬─────────┘
                 │ HTTPS
                 │
        ┌────────▼─────────┐
        │  Render Backend  │
        │ Express + Socket │
        └────────┬─────────┘
                 │
                 │
        ┌────────▼─────────┐
        │ MongoDB Atlas    │
        └──────────────────┘
```

---

# Deployment Order

Always deploy in this order:
1. GitHub Repository
2. MongoDB Atlas
3. Render Backend
4. Vercel Frontend
5. Testing

Never deploy frontend before backend APIs are ready.

---

# GitHub

Repository Structure
PrivateConnect/
client/
server/
docs/
README.md

---

Main Branch
Production

Develop Branch
Development

Feature Branches
Individual features

---

# MongoDB Atlas

Create Free Cluster
Create Database
Create Database User
Whitelist Network Access
Copy Connection String
Save Connection String in Render Environment Variables
Never expose credentials publicly.

---

# Render Backend

Create New Web Service
Connect GitHub Repository
Select server directory (if using monorepo settings)

Environment
Node.js

Build Command
```text
npm install
```

Start Command
```text
npm start
```

Environment Variables
PORT
MONGODB_URI
JWT_SECRET
CLIENT_URL
ADMIN_USERNAME
ADMIN_PASSWORD
SOCKET_CORS_ORIGIN

---

# Vercel Frontend

Import GitHub Repository

Framework
Vite

Root Directory
client

Build Command
```text
npm run build
```

Output Directory
```text
dist
```

Environment Variables
VITE_API_URL
VITE_SOCKET_URL

---

# Production Environment

Backend
NODE_ENV=production

Frontend
Production URLs only
No localhost references.

---

# HTTPS

Production must use HTTPS.
WebSocket connections should use WSS.
Never use HTTP in production.

---

# Deployment Validation

Backend
* Server starts successfully.
* MongoDB connects.
* JWT works.
* APIs respond.
* Socket.io connects.

Frontend
* Builds successfully.
* Loads correctly.
* API communication works.
* Socket connection works.

---

# Smoke Tests

Login
Username Creation
Search User
Chat
Voice Call
Video Call
Logout
Admin Login
Secret Code Generation

All must pass before release.

---

# Rollback Strategy

If deployment fails:
1. Identify failing release.
2. Redeploy previous stable version.
3. Investigate logs.
4. Fix issue.
5. Deploy again.

Never patch production without testing.

---

# Monitoring

Monitor:
Server uptime
API errors
Socket connections
Database connectivity
Application logs

Do not log sensitive information.

---

# Backup

Before major releases:
Export MongoDB data (where appropriate)
Tag Git release
Document schema changes

---

# Release Checklist

* Code reviewed
* Tests passed
* Documentation updated
* Environment variables verified
* Production URLs configured
* HTTPS enabled
* Smoke tests completed

Only then mark release as complete.

---

# Future Deployment

Reserved

Docker
Kubernetes
CI/CD Pipelines
Redis
Load Balancer
Horizontal Scaling

These are outside Version 1.0.

---

# Definition of Done

Deployment is complete when:
* Frontend is live.
* Backend is live.
* Database is connected.
* APIs work.
* Socket.io works.
* Voice calls work.
* Video calls work.
* Admin Panel works.
* All smoke tests pass.

Status: Approved
Version: 1.0
