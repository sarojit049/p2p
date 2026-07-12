import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/Loader';
import { ROUTES } from '../constants';

/**
 * ProtectedRoute
 * Redirects unauthenticated users to login.
 * Redirects new users without a username to username setup.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // New user hasn't set their username yet
  if (!user?.username && window.location.pathname !== ROUTES.USERNAME_SETUP) {
    return <Navigate to={ROUTES.USERNAME_SETUP} replace />;
  }

  return children;
};

export default ProtectedRoute;
