import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants';

/**
 * PublicRoute
 * Redirects already-authenticated users away from login screens.
 */
const PublicRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, user } = useAuth();

  if (isAuthenticated) {
    if (adminOnly) {
      return isAdmin ? <Navigate to={ROUTES.ADMIN_DASHBOARD} replace /> : children;
    }
    if (!user?.username) {
      return <Navigate to={ROUTES.USERNAME_SETUP} replace />;
    }
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
};

export default PublicRoute;
