# 07_SOCKET_IO_SPECIFICATION.md

# PrivateConnect Socket.io Specification

Version: 1.0

Status: Approved

Priority: Critical

---

# Purpose

Socket.io is responsible for real-time communication only.

It is NOT responsible for:
* Authentication
* Database Access
* Business Logic
* Video Streaming

Socket.io is only responsible for sending and receiving realtime events.

---

# Responsibilities

Socket.io handles:
* User Connection
* User Disconnection
* Online Status
* Typing Indicator
* Chat Messages
* Message Delivery
* Read Receipts (Future)
* Voice Call Signaling
* Video Call Signaling

---

# Connection Flow

```text
Client Opens App
↓
JWT Validation
↓
Socket Connection
↓
Join Personal Room
↓
Ready
```

Every socket connection must belong to an authenticated user.
Anonymous socket connections are not allowed.

---

# Personal Room Strategy

Each authenticated user joins exactly one personal room.

Room Name
```text
user:<userId>
```

Example
```text
user:685af98291ab
```

Never use usernames as room names.
Always use MongoDB ObjectId.

---

# Socket Authentication

Handshake must include JWT.
Server verifies JWT.

If valid
↓
Connection Accepted
Else
↓
Disconnect

---

# Events

## Client → Server
connect
disconnect
join
typing
stop_typing
send_message
call_user
accept_call
reject_call
end_call
ice_candidate
offer
answer
heartbeat

---

## Server → Client
connected
user_online
user_offline
receive_message
message_sent
typing
stop_typing
incoming_call
call_accepted
call_rejected
call_ended
offer
answer
ice_candidate
error

---

# Message Flow

```text
User A
↓
send_message
↓
Server
↓
Save MongoDB
↓
Emit receive_message
↓
User B
```

The message must be saved before it is delivered.
If database storage fails, do not emit the message.

---

# Typing Indicator

Client emits
typing
Server forwards
typing

When user stops typing
stop_typing
Server forwards
stop_typing

Typing status is never stored in the database.

---

# Online Status

When socket connects
↓
Mark User Online
↓
Broadcast Presence

When socket disconnects
↓
Mark User Offline
↓
Update lastSeen
↓
Broadcast Presence

---

# Heartbeat

Client sends heartbeat every 30 seconds.
Server updates:
* Online status
* Last activity

If heartbeat is missing for an extended period, mark the user offline.

---

# Call Signaling

Socket.io handles only signaling.

Flow
```text
Caller
↓
call_user
↓
Receiver
↓
accept_call
↓
offer
↓
answer
↓
ICE Candidates
↓
WebRTC Connection
↓
end_call
```

Media never passes through Socket.io.

---

# Error Handling

Every event must validate:
* JWT
* User Exists
* Payload
* Room Exists (where applicable)

Invalid payloads return:
```json
{
  "success": false,
  "message": "Invalid socket payload."
}
```

---

# Rate Limits

Typing
Maximum once every 500 ms.

Messages
Reasonable throttling to prevent spam.

Calls
Reject duplicate simultaneous outgoing calls from the same user.

---

# Logging

Log:
* User Connected
* User Disconnected
* Message Sent
* Message Failed
* Call Started
* Call Ended

Never log:
* JWT
* Secret Codes
* Sensitive credentials

---

# Security

Authenticate every socket.
Validate every event.
Never trust client data.
Sanitize inputs.
Disconnect unauthorized clients.
Do not expose internal server errors.

---

# Reconnection

If a user reconnects:
1. Verify JWT.
2. Join personal room again.
3. Restore online status.
4. Resume normal operation.

---

# Future Events (Not in MVP)

message_read
message_deleted
message_edited
group_message
group_typing
group_call
file_upload
notification

These events are reserved for future versions.

---

# Engineering Rules

* One socket connection per authenticated session.
* One personal room per user.
* Keep event names consistent.
* Keep payloads small.
* Do not send unnecessary data.
* Reuse event handlers.
* Separate socket logic from REST controllers.

---

# Definition of Done

Socket module is complete when:
* Authentication works.
* User presence works.
* One-to-one messaging works.
* Typing indicator works.
* Call signaling works.
* Error handling is implemented.
* Logging is implemented.
* Documentation is updated.

Status: Approved
Version: 1.0
