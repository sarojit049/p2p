# 14_CODING_CONVENTIONS.md

# PrivateConnect Coding Conventions

Version: 1.0

Status: Approved

Priority: CRITICAL

---

# 1. Purpose

This document defines mandatory coding standards for every contributor and every AI assistant.

Code quality must remain consistent across the entire project.

---

# 2. Language

Frontend
JavaScript (ES2023)

Backend
JavaScript (Node.js)

Do not introduce TypeScript in Version 1.0.

---

# 3. Naming Conventions

## Variables
camelCase

Example
```js
const userName = "";
const secretCode = "";
const isLoggedIn = true;
```

---

## Constants
UPPER_SNAKE_CASE
```js
const MAX_USERS = 100;
const JWT_EXPIRES_IN = "24h";
```

---

## Functions
camelCase
```js
generateSecretCode()
sendMessage()
verifyToken()
```

Functions should describe actions.

---

## React Components
PascalCase
```text
LoginPage.jsx
ChatWindow.jsx
AdminSidebar.jsx
```

---

## Hooks
Prefix with `use`
```text
useAuth.js
useSocket.js
useUserSearch.js
```

---

## Models
Singular
PascalCase
```text
User.js
Chat.js
Call.js
SecretCode.js
```

---

## Controllers
camelCase + Controller
```text
authController.js
chatController.js
adminController.js
```

---

## Services
camelCase + Service
```text
authService.js
chatService.js
callService.js
```

---

## Routes
camelCase + Routes
```text
authRoutes.js
userRoutes.js
chatRoutes.js
```

---

# 4. File Organization

One primary responsibility per file.
Avoid files larger than ~300 lines where practical.
Split large modules into reusable parts.

---

# 5. Function Rules

* Single responsibility.
* Prefer small, readable functions.
* Avoid deeply nested logic.
* Return early when appropriate.
* Handle errors consistently.

---

# 6. React Rules

* Functional Components only.
* Use Hooks.
* Keep UI and business logic separate.
* Reusable components first.
* Avoid unnecessary state.

---

# 7. Express Rules

Routes
↓
Controllers
↓
Services
↓
Models

Controllers should remain thin.
Business logic belongs in services.

---

# 8. API Response Format

Success
```json
{
  "success": true,
  "message": "Operation successful.",
  "data": {}
}
```

Error
```json
{
  "success": false,
  "message": "Operation failed.",
  "error": {}
}
```

Keep this format consistent across all APIs.

---

# 9. Error Handling

* Never swallow errors.
* Log server-side errors safely.
* Return user-friendly messages.
* Do not expose stack traces.

---

# 10. Comments

Write comments only where they add value.
Avoid commenting obvious code.
Document complex logic.

---

# 11. Imports

Group imports:
1. External packages
2. Internal modules
3. Local files

Remove unused imports.

---

# 12. Environment Variables

Never hardcode secrets.
Access configuration through environment variables.
Provide `.env.example`.

---

# 13. Git Commit Style

Examples
```text
feat: add secret code authentication
fix: validate username uniqueness
refactor: move chat logic to service
docs: update API specification
test: add auth controller tests
```

---

# 14. Code Review Checklist

Before merging:
* Builds successfully.
* No lint errors.
* No unused variables.
* Validation implemented.
* Error handling present.
* Documentation updated.

---

# 15. AI Rules

AI must:
* Reuse existing code.
* Avoid duplicate logic.
* Keep naming consistent.
* Follow folder structure.
* Update documentation after changes.
* Ask for clarification if requirements conflict.

---

# 16. Definition of Done

Code is complete when:
* Readable.
* Maintainable.
* Modular.
* Tested.
* Documented.
* Matches project conventions.

Status: Approved
Version: 1.0
