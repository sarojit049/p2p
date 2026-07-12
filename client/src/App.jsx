import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { CallProvider } from './context/CallContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import AdminRoute from './routes/AdminRoute';
import UserLayout from './layouts/UserLayout';

import LoginPage from './pages/LoginPage';
import UsernameSetupPage from './pages/UsernameSetupPage';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import VoiceCallPage from './pages/VoiceCallPage';
import VideoCallPage from './pages/VideoCallPage';
import IncomingCallPopup from './components/IncomingCallPopup';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminSecretCodesPage from './pages/admin/AdminSecretCodesPage';
import AdminChatsPage from './pages/admin/AdminChatsPage';
import AdminCallsPage from './pages/admin/AdminCallsPage';
import AdminLogsPage from './pages/admin/AdminLogsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminLayout from './layouts/AdminLayout';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <CallProvider>
              <IncomingCallPopup />
              <Routes>
            {/* Public Routes */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/setup-username" element={<UsernameSetupPage />} />
              <Route path="/call/:userId" element={<VoiceCallPage />} />
              <Route path="/video-call/:userId" element={<VideoCallPage />} />
              
              <Route element={<UserLayout />}>
                <Route path="/dashboard" element={null} />
                <Route path="/chat/:userId" element={<ChatPage />} />
              </Route>
            </Route>

            {/* Admin Routes */}
            <Route element={<PublicRoute />}>
              <Route path="/admin/login" element={<AdminLoginPage />} />
            </Route>

            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/secret-codes" element={<AdminSecretCodesPage />} />
                <Route path="/admin/chats" element={<AdminChatsPage />} />
                <Route path="/admin/calls" element={<AdminCallsPage />} />
                <Route path="/admin/logs" element={<AdminLogsPage />} />
                <Route path="/admin/settings" element={<AdminSettingsPage />} />
              </Route>
            </Route>

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </CallProvider>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
