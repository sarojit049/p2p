# 23_DECISIONS.md

# PrivateConnect Architecture Decision Records (ADR)

Version: 1.0

Status: Approved

Priority: Critical

---

# Purpose

This document records the important technical and architectural decisions made for the PrivateConnect project.

Each decision includes:
* Decision
* Reason
* Alternatives Considered
* Consequences

Future changes should update this document instead of replacing history.

---

# ADR-001

## Decision
Use the MERN Stack.

### Reason
* Single programming language (JavaScript)
* Large ecosystem
* Fast development
* Easy deployment
* Strong community support

### Alternatives Considered
* MEAN
* Django
* Laravel
* Spring Boot

### Result
Approved

---

# ADR-002

## Decision
Use React + Vite.

### Reason
* Fast development server
* Small bundle
* Excellent React support
* Modern tooling

### Alternatives
* Next.js
* CRA
* Vue
* Angular

### Result
Approved

---

# ADR-003

## Decision
Use MongoDB Atlas.

### Reason
* Managed database
* Free tier
* Flexible schema
* Easy cloud deployment

### Alternatives
* PostgreSQL
* MySQL
* SQLite

### Result
Approved

---

# ADR-004

## Decision
Authentication uses Admin-generated Secret Codes.

### Reason
* Controlled access
* No public registration
* No mobile numbers
* No email dependency

### Alternatives
* OTP
* Email login
* Google login
* Phone login

### Result
Approved

---

# ADR-005

## Decision
Single Administrator for Version 1.0.

### Reason
* Simpler MVP
* Easier management
* Reduced complexity

### Future
RBAC
Multiple Administrators
Moderator Roles

---

# ADR-006

## Decision
Usernames are unique.

### Reason
Simple search.
Simple communication.
Predictable identity.

---

# ADR-007

## Decision
Use Socket.io.

### Reason
Reliable realtime communication.
Automatic reconnection.
Room support.
Large community.

### Alternatives
Native WebSocket
SignalR
Pusher

---

# ADR-008

## Decision
Use WebRTC.

### Reason
Browser native.
Peer-to-peer media.
No paid SDK required.

### Alternatives
Agora
Daily
Twilio Video

---

# ADR-009

## Decision
Messages are stored in plaintext on the server for Version 1.0.

### Reason
Server moderation.
Admin chat history.
Simpler MVP.

### Consequences
* Not end-to-end encrypted.
* Server operators can access message content.
* This must be disclosed appropriately to users.

### Future
Optional end-to-end encryption mode.

---

# ADR-010

## Decision
Hash Secret Codes with bcrypt.

### Reason
Protect against database compromise.
Never store plaintext Secret Codes.

---

# ADR-011

## Decision
Use JWT Authentication.

### Reason
Stateless authentication.
Simple deployment.
Well supported.

---

# ADR-012

## Decision
Deploy Frontend on Vercel.

### Reason
Excellent React support.
Fast deployments.
Free tier.

---

# ADR-013

## Decision
Deploy Backend on Render.

### Reason
Easy Node.js hosting.
GitHub integration.
Free tier for MVP.

---

# ADR-014

## Decision
Documentation First Development.

### Reason
Reduces ambiguity.
Improves AI consistency.
Supports long-term maintenance.

---

# ADR-015

## Decision
Feature-Based Modular Architecture.

### Reason
Scalable.
Easy maintenance.
Reusable code.

---

# ADR-016

## Decision
Business logic belongs in Services.

### Reason
Thin controllers.
Reusable logic.
Cleaner testing.

---

# ADR-017

## Decision
One Socket Room per User.

### Reason
Simple routing.
Efficient messaging.

---

# ADR-018

## Decision
One Active Call per User.

### Reason
Simplifies call state.
Suitable for MVP.

---

# ADR-019

## Decision
MVP limited to 100 users.

### Reason
Free-tier hosting.
Simpler performance tuning.
Cost control.

---

# ADR-020

## Decision
Future features remain outside MVP.

Deferred Features
* Group Chat
* Group Calls
* File Sharing
* Push Notifications
* Mobile Apps
* Desktop Apps
* End-to-End Encryption

### Reason
Deliver a focused, stable MVP first.

---

# Decision Update Process

When making a new architectural decision:
1. Create a new ADR.
2. Assign the next ADR number.
3. Record the date.
4. Explain the reason.
5. Document alternatives.
6. Describe consequences.

Never rewrite history.

---

# Current Decision Summary

Approved Decisions
20

Rejected Decisions
0

Pending Decisions
0

---

# Definition of Done

Architecture decisions are complete when:
* Documented.
* Justified.
* Versioned.
* Referenced by implementation where appropriate.

Status: Approved
Version: 1.0
