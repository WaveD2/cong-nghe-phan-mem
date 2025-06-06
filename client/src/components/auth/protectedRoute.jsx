import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import LoadingComponent from '../helper/loadingComponent';

const ProtectedRoute = ({ allowedRoles, redirectRoles = [] }) => {
  
  const location = useLocation();
  const { isLoading, isAuthenticated, user } = useAuth();
  
  if (isLoading) {
    return <LoadingComponent />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (location.pathname === "/dashboard") {
    const userRedirectPath = redirectRoles.includes(user.role);
    if (userRedirectPath && userRedirectPath !== location.pathname) {
      return <Navigate to={userRedirectPath} replace />;
    }
  }

  return <Outlet />;
};

export default React.memo(ProtectedRoute);
