import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key } from 'lucide-react';
import { adminLogin } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Toast from '../../components/Toast';

const AdminLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setToast({ type: 'error', message: 'Username and password are required.' });
      return;
    }

    setIsLoading(true);
    setToast(null);

    try {
      const res = await adminLogin(username.trim(), password.trim());
      const { token, user } = res.data.data;
      
      login(token, user);
      
      navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
    } catch (error) {
      setToast({
        type: 'error',
        message: error.response?.data?.message || 'Invalid admin credentials.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
          <p className="text-gray-500 text-sm mt-2 text-center">
            Sign in to manage PrivateConnect
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="username"
            label="Admin Username"
            type="text"
            placeholder="Enter admin username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            required
            autoComplete="username"
          />

          <Input
            id="password"
            label="Admin Password"
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
            autoComplete="current-password"
          />

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            className="bg-gray-900 hover:bg-gray-800 focus:ring-gray-900"
          >
            Login to Admin Portal
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(ROUTES.LOGIN)}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            Return to User Login
          </button>
        </div>
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default AdminLoginPage;
