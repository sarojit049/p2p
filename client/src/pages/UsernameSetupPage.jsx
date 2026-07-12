import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { createUsername } from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';
import { ROUTES } from '../constants';

/**
 * UsernameSetupPage
 * Shown only after first successful Secret Code login.
 * Per 11_USER_FLOW.md — Username Creation Flow
 */
const UsernameSetupPage = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = (value) => {
    if (!value.trim()) return 'Username is required.';
    if (value.length < 3) return 'Username must be at least 3 characters.';
    if (value.length > 30) return 'Username cannot exceed 30 characters.';
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return 'Username can only contain letters, numbers, and underscores.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate(username);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await createUsername(username.trim());
      const { user } = response.data.data;
      updateUser(user);
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message || 'Failed to create username. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    if (error) setError(validate(value));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500 shadow-lg mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Choose Your Username</h1>
          <p className="text-sm text-gray-500 mt-1">
            This is how others will find and recognize you.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              <Input
                id="username"
                label="Username"
                type="text"
                placeholder="e.g. john_doe"
                value={username}
                onChange={handleChange}
                error={error}
                helperText="3–30 characters. Letters, numbers, and underscores only."
                required
                autoComplete="username"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                disabled={!username.trim()}
                className="w-full"
              >
                <CheckCircle size={16} />
                Continue
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UsernameSetupPage;
