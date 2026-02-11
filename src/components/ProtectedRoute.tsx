import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requiredRoles = [],
}) => {
  const { isAuthenticated, hasPermission, hasRole } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login\" state={{ from: location }} replace />;
  }

  const hasRequiredPermissions = requiredPermissions.length === 0 ||
    requiredPermissions.some(permission => hasPermission(permission));

  const hasRequiredRoles = requiredRoles.length === 0 ||
    requiredRoles.some(role => hasRole(role));

  if (!hasRequiredPermissions || !hasRequiredRoles) {
    return <Navigate to="/dashboard\" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;