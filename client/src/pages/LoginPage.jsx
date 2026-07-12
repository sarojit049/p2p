import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { loginWithSecretCode } from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';
import { ROUTES } from '../constants';

/**
 * LoginPage
 * Secret Code authentication flow.
 * Per 11_USER_FLOW.md — First Login Flow & Returning User Flow
 * Per 09_UI_UX_SPECIFICATION.md — Secret Code Login screen
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [secretCode, setSecretCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!secretCode.trim()) {
      setError('Please enter your Secret Code.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginWithSecretCode(secretCode.trim());
      const { token, user, isNewUser } = response.data.data;

      login(token, user);

      if (isNewUser || !user.username) {
        navigate(ROUTES.USERNAME_SETUP, { replace: true });
      } else {
        navigate(ROUTES.DASHBOARD, { replace: true });
      }
    } catch (err) {
      const message =
        err.response?.data?.message || 'Invalid Secret Code. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-lg mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">PrivateConnect</h1>
          <p className="text-sm text-gray-500 mt-1">Controlled-access communication</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Sign In</h2>
            <p className="text-sm text-gray-500 mt-1">
              Enter your Secret Code to access the platform.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              <Input
                id="secretCode"
                label="Secret Code"
                type="password"
                placeholder="Enter your Secret Code"
                value={secretCode}
                onChange={(e) => {
                  setSecretCode(e.target.value);
                  if (error) setError('');
                }}
                error={error}
                required
                autoComplete="current-password"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                disabled={!secretCode.trim()}
                className="w-full"
              >
                <Lock size={16} />
                Sign In
              </Button>
            </div>
          </form>

          <p className="mt-6 text-xs text-gray-400 text-center">
            Don't have a Secret Code?{' '}
            <span className="text-gray-600">Contact your administrator.</span>
          </p>
        </div>

        {/* Admin link */}
        <p className="text-center mt-4">
          <a
            href={ROUTES.ADMIN_LOGIN}
            className="text-xs text-gray-400 hover:text-blue-600 transition-colors"
          >
            Administrator login →
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
