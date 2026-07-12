# 15_ENVIRONMENT_VARIABLES.md

# PrivateConnect Environment Variables

Version: 1.0

Status: Approved

Priority: Critical

---

# Purpose

This document defines every required environment variable for the PrivateConnect application.

No secret values should ever be committed to Git.

Always include a `.env.example` file in the repository.

---

# Backend (.env)

```env
# ==========================================
# APPLICATION
# ==========================================
NODE_ENV=development
PORT=5000
APP_NAME=PrivateConnect

# ==========================================
# FRONTEND
# ==========================================
CLIENT_URL=http://localhost:5173

# ==========================================
# DATABASE
# ==========================================
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/privateconnect

# ==========================================
# JWT
# ==========================================
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=24h

# ==========================================
# ADMIN
# ==========================================
ADMIN_USERNAME=admin
ADMIN_PASSWORD=replace_with_secure_password

# ==========================================
# SOCKET
# ==========================================
SOCKET_CORS_ORIGIN=http://localhost:5173

# ==========================================
# LOGGING
# ==========================================
LOG_LEVEL=info
```

---

# Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

---

# Production Example

Backend

```env
NODE_ENV=production
PORT=5000

CLIENT_URL=https://your-frontend-domain

MONGODB_URI=your_production_mongodb_uri

JWT_SECRET=your_long_random_secret

JWT_EXPIRES_IN=24h

ADMIN_USERNAME=admin

ADMIN_PASSWORD=your_secure_password

SOCKET_CORS_ORIGIN=https://your-frontend-domain
```

Frontend

```env
VITE_API_URL=https://your-backend-domain/api/v1

VITE_SOCKET_URL=https://your-backend-domain
```

---

# Environment Variable Rules

Never commit:
* Real JWT secrets
* Real database URIs
* Real passwords
* API keys
* Cloud credentials

Always commit:
`.env.example`

---

# Naming Rules

Use uppercase names.
Separate words with underscores.

Examples
JWT_SECRET
CLIENT_URL
MONGODB_URI

---

# Secret Generation

JWT Secret
Generate at least 32 random bytes.
Do not reuse across unrelated projects.

Admin Password
Minimum 12 characters.
Use a strong unique password.

---

# Local Development

Frontend
http://localhost:5173

Backend
http://localhost:5000

MongoDB
MongoDB Atlas Free Cluster

---

# Production Checklist

* Environment variables configured on Render.
* Environment variables configured on Vercel.
* `.env` not committed.
* `.env.example` updated.
* JWT secret replaced with a secure value.
* Admin password replaced.
* MongoDB URI updated.

---

# Future Variables

Reserved
TURN_SERVER_URL
TURN_USERNAME
TURN_PASSWORD
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
EMAIL_PROVIDER
EMAIL_API_KEY

These are intentionally unused in Version 1.0.

---

# Validation Rules

Application must fail fast if required variables are missing.
Do not start the server with incomplete configuration.
Provide clear startup errors.

---

# Definition of Done

Environment configuration is complete when:
* Local development works.
* Production deployment works.
* Secrets are externalized.
* `.env.example` is accurate.
* No secrets are committed.

Status: Approved
Version: 1.0
