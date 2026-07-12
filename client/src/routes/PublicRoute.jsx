import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants';

/**
 * PublicRoute
 * Redirects already-authenticated users away from login screens.
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, user } = useAuth();

  if (isAuthenticated) {
    if (isAdmin) {
      return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
    }
    if (!user?.username) {
      return <Navigate to={ROUTES.USERNAME_SETUP} replace />;
    }
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children ? children : <Outlet />;
};

export default PublicRoute;
