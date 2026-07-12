# 05_DATABASE_DESIGN.md

# PrivateConnect Enterprise Database Design

Version: 1.0

Status: Approved

Database: MongoDB Atlas

ODM: Mongoose

---

# 1. Database Philosophy

The database must be:
* Secure
* Simple
* Modular
* Scalable
* Maintainable

The MVP is optimized for approximately **100 users**, but the schema should allow future expansion without major redesign.

---

# 2. Database Collections

Version 1.0 uses only four primary collections.

```text
Users
SecretCodes
Chats
Calls
```

No additional collections are introduced unless a feature explicitly requires them.

---

# 3. Users Collection

Purpose:
Stores user identity and account information.

### Fields

| Field        | Type     | Required | Notes                       |
| ------------ | -------- | -------- | --------------------------- |
| _id          | ObjectId | Yes      | MongoDB ID                  |
| username     | String   | Yes      | Unique                      |
| secretCodeId | ObjectId | Yes      | Reference to SecretCodes    |
| role         | String   | Yes      | admin / user                |
| status       | String   | Yes      | active / blocked / inactive |
| profileImage | String   | No       | Future use                  |
| lastSeen     | Date     | Yes      | Updated automatically       |
| createdAt    | Date     | Yes      | Timestamp                   |
| updatedAt    | Date     | Yes      | Timestamp                   |

---

### Indexes

Unique
username

Normal
role
status

---

# 4. SecretCodes Collection

Purpose
Stores administrator-generated Secret Codes.

The actual Secret Code is **never stored in plaintext**.
Only its bcrypt hash is stored.

### Fields

| Field          | Type            |
| -------------- | --------------- |
| _id            | ObjectId        |
| secretCodeHash | String          |
| assignedUser   | ObjectId        |
| generatedBy    | ObjectId        |
| isUsed         | Boolean         |
| expiresAt      | Date (Optional) |
| createdAt      | Date            |
| updatedAt      | Date            |

---

# Rules

Secret Code must be unique.
Hash before saving.
Cannot be reused after assignment.

---

# 5. Chats Collection

Purpose
Stores chat messages.

### Fields

| Field       | Type     |
| ----------- | -------- |
| _id         | ObjectId |
| senderId    | ObjectId |
| receiverId  | ObjectId |
| message     | String   |
| messageType | String   |
| isRead      | Boolean  |
| createdAt   | Date     |
| updatedAt   | Date     |

---

### messageType

Supported values
text

Future values
image
file
audio
video

Only **text** is implemented in MVP.

---

### Indexes

senderId
receiverId
createdAt

Compound Index
(senderId + receiverId)

---

# 6. Calls Collection

Purpose
Stores call history.

### Fields

| Field      | Type     |
| ---------- | -------- |
| _id        | ObjectId |
| callerId   | ObjectId |
| receiverId | ObjectId |
| callType   | String   |
| status     | String   |
| startTime  | Date     |
| endTime    | Date     |
| duration   | Number   |
| createdAt  | Date     |

---

### callType
voice
video

---

### status
missed
accepted
rejected
ended

---

# 7. Collection Relationships

```text
Users
   │
   ├──────────────┐
   │              │
SecretCodes      Chats
                  │
                  │
                 Calls
```

---

# 8. Relationship Rules

One User → One Secret Code
One Secret Code → One User
One User → Many Chats
One User → Many Calls
No duplicate user records.

---

# 9. Naming Convention

Collections
PascalCase
Users
Chats
Calls
SecretCodes

Fields
camelCase
senderId
receiverId
secretCodeHash
createdAt
updatedAt

---

# 10. Timestamp Policy

Every collection must include
createdAt
updatedAt

Mongoose timestamps must be enabled.

---

# 11. Validation Rules

Username
Required
Unique
Minimum length: 3
Maximum length: 30
Allowed: Letters, Numbers, Underscore

Message
Required
Maximum length: 5000 characters
Trim whitespace.
Reject empty messages.

Secret Code
Generated only by Admin.
Hash before storage.
Never expose hash.

---

# 12. Query Rules

Always use indexes.
Never fetch unnecessary fields.
Use pagination where required.
Sort by createdAt descending where appropriate.
Avoid N+1 query patterns.

---

# 13. Soft Delete Policy

Version 1.0
Physical delete is allowed only for admin-managed cleanup.
Future versions may introduce soft deletes.

---

# 14. Backup Strategy

MongoDB Atlas automated backups (depending on selected tier).
Export collections before major schema changes.
Never modify production data directly.

---

# 15. Future Expansion

Reserved for future collections:
Groups
Notifications
Attachments
BlockedUsers
AuditLogs
Settings

These collections are intentionally excluded from Version 1.0.

---

# 16. Database Security

Never expose database credentials.
Use environment variables.
Enable MongoDB network restrictions where practical.
Validate all incoming data.
Sanitize queries.
Use Mongoose schema validation.

---

# 17. Engineering Rules

No duplicate data.
No unnecessary collections.
Keep schemas simple.
Document schema changes before implementation.
Update this document whenever a collection changes.

---

# Database Version

v1.0

Collections: 4
Target Users: 100
Status: Approved
