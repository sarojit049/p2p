import api from '../api';

// Auth
export const loginWithSecretCode = (secretCode) =>
  api.post('/auth/login', { secretCode });

export const logout = () => api.post('/auth/logout');

export const getMe = () => api.get('/auth/me');

// Users
export const createUsername = (username, displayName, avatar) =>
  api.post('/users/username', { username, displayName, avatar });

export const searchUsers = (username) =>
  api.get('/users/search', { params: { username } });

export const getProfile = () => api.get('/users/profile');

// Chat
export const sendMessage = (receiverId, message) =>
  api.post('/chat/send', { receiverId, message });

export const uploadMedia = (receiverId, formData, onUploadProgress) => {
  formData.append('receiverId', receiverId);
  return api.post('/chat/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
};

export const getConversation = (userId, page = 1) =>
  api.get(`/chat/${userId}`, { params: { page } });

export const getRecentConversations = () => api.get('/chat/conversations');

// Calls
export const startCall = (receiverId, callType) =>
  api.post('/call/start', { receiverId, callType });

export const endCall = (callId, status) =>
  api.post('/call/end', { callId, status });

export const getCallHistory = (page = 1) =>
  api.get('/call/history', { params: { page } });

// Admin
export const adminLogin = (username, password) =>
  api.post('/admin/login', { username, password });

export const generateSecretCode = () => api.post('/admin/secret-codes');
export const getAdminSecretCodes = (page = 1, limit = 20) =>
  api.get('/admin/secret-codes', { params: { page, limit } });
export const revokeSecretCode = (id) => api.delete(`/admin/secret-codes/${id}`);

export const getAdminLogs = (page = 1, limit = 50) =>
  api.get('/admin/logs', { params: { page, limit } });

export const getAdminUsers = (page = 1, limit = 20) => api.get('/admin/users', { params: { page, limit } });

export const getAdminUser = (id) => api.get(`/admin/users/${id}`);

export const blockUser = (id) => api.patch(`/admin/users/${id}/block`);

export const unblockUser = (id) => api.patch(`/admin/users/${id}/unblock`);

export const deleteUser = (id) => api.delete(`/admin/users/${id}`);

export const getDashboardStats = () => api.get('/admin/dashboard');

export const getAdminChatHistory = (params = {}) =>
  api.get('/admin/chats', { params });

export const getAdminCallHistory = (page = 1) =>
  api.get('/admin/calls', { params: { page } });
