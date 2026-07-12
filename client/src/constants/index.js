// Route paths
export const ROUTES = {
  LOGIN: '/',
  USERNAME_SETUP: '/setup',
  DASHBOARD: '/dashboard',
  CHAT: '/chat/:userId',
  PROFILE: '/profile',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin/dashboard',
  NOT_FOUND: '/404',
};

// User roles
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

// User statuses
export const STATUS = {
  ACTIVE: 'active',
  BLOCKED: 'blocked',
  INACTIVE: 'inactive',
};

// Call types
export const CALL_TYPE = {
  VOICE: 'voice',
  VIDEO: 'video',
};

// Socket events — per 07_SOCKET_IO_SPECIFICATION.md
export const SOCKET_EVENTS = {
  NEW_MESSAGE: 'new_message',
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  CALL_USER: 'call_user',
  INCOMING_CALL: 'incoming_call',
  CALL_ACCEPTED: 'call_accepted',
  CALL_REJECTED: 'call_rejected',
  CALL_ENDED: 'call_ended',
  WEBRTC_OFFER: 'webrtc_offer',
  WEBRTC_ANSWER: 'webrtc_answer',
  ICE_CANDIDATE: 'ice_candidate',
  FORCE_DISCONNECT: 'force_disconnect',
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'pc_token',
  USER: 'pc_user',
};

// WebRTC STUN server — per 08_WEBRTC_SPECIFICATION.md
export const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];
