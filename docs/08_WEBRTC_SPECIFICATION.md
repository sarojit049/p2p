# 08_WEBRTC_SPECIFICATION.md

# PrivateConnect WebRTC Specification

Version: 1.0

Status: Approved

Priority: Critical

---

# Purpose

WebRTC is responsible for peer-to-peer audio and video communication.

Socket.io is **only** used for signaling.

Media streams must never pass through the application server.

---

# Supported Features (MVP)

* One-to-One Voice Call
* One-to-One Video Call
* Camera On/Off
* Microphone Mute/Unmute
* Accept Call
* Reject Call
* End Call

Not included:
* Group Calls
* Screen Sharing
* Recording
* Background Blur

---

# WebRTC Architecture

```text
Caller
   │
Offer
   │
Socket.io
   │
Receiver
   │
Answer
   │
Socket.io
   │
ICE Candidate Exchange
   │
Peer-to-Peer Connection
   │
Audio / Video Stream
```

---

# Signaling Flow

1. Caller sends `call_user`.
2. Receiver receives incoming call.
3. Receiver accepts or rejects.
4. Caller creates WebRTC Offer.
5. Offer sent via Socket.io.
6. Receiver creates Answer.
7. Answer sent via Socket.io.
8. ICE Candidates exchanged.
9. Direct media connection established.

---

# ICE Configuration

Default STUN Server
```text
stun:stun.l.google.com:19302
```

Future:
* Coturn
* Managed TURN Service

TURN is not required for MVP but architecture should allow adding it later.

---

# Media Constraints

Audio
* Enabled by default.

Video
* Enabled only for video calls.

Resolution
Use browser defaults.
Allow future configuration.

---

# Permissions

Before starting a call:
* Request microphone permission.
* Request camera permission (video call only).

If denied:
* Show clear error.
* Do not crash the application.

---

# Call Lifecycle

Idle
↓
Outgoing Call
↓
Incoming Call
↓
Accepted
↓
Connecting
↓
Connected
↓
Ended

If rejected:
Outgoing → Rejected → Idle

---

# Call States

* idle
* ringing
* connecting
* connected
* rejected
* ended
* failed

Only one active call per user in MVP.

---

# User Actions

Caller
* Start Voice Call
* Start Video Call
* End Call

Receiver
* Accept
* Reject
* End Call

During Call
* Mute/Unmute
* Camera On/Off (video only)

---

# Error Handling

Handle:
* Permission denied
* Camera unavailable
* Microphone unavailable
* Peer disconnected
* ICE failure
* Signaling timeout

Display user-friendly messages.
Do not expose internal errors.

---

# Connection Recovery

If signaling reconnects before call establishment:
* Retry signaling once.

If peer connection fails after establishment:
* End call gracefully.
* Allow user to call again.

Automatic call resume is not part of MVP.

---

# Security

* Use HTTPS in production.
* Authenticate signaling with JWT.
* Validate all signaling payloads.
* Never expose internal peer information unnecessarily.

---

# Logging

Log:
* Call started
* Call accepted
* Call rejected
* Call ended
* Call duration
* Call failure reason (high level)

Do not log:
* Audio content
* Video content
* Media streams

---

# Browser Support

Primary target:
* Google Chrome (latest)
* Microsoft Edge (latest)

Secondary:
* Firefox (latest)

Safari support may require additional testing.

---

# Performance

Target:
* Stable one-to-one calls for up to 100 registered users.
* Minimize signaling messages.
* Release media tracks immediately after call ends.

---

# Future Enhancements

Reserved for future versions:
* Group Calls
* Screen Sharing
* Call Recording
* Virtual Background
* TURN Redundancy
* Adaptive Bitrate
* Network Quality Indicator

These features are intentionally excluded from Version 1.0.

---

# Definition of Done

WebRTC module is complete when:
* Voice calls work.
* Video calls work.
* Offer/Answer exchange works.
* ICE Candidate exchange works.
* Permissions are handled correctly.
* Calls end gracefully.
* Errors are handled.
* Documentation is updated.

Status: Approved
Version: 1.0
