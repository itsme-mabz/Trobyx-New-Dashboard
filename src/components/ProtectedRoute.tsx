import React from 'react';
import { Navigate, useLocation } from 'react-router';
import useAuthStore from '../stores/useAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailVerification?: boolean;
}

const ProtectedRoute = ({
  children,
  requireEmailVerification = false,
}: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isLoading = useAuthStore(state => state.isLoading);
  const user = useAuthStore(state => state.user);

  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"   // ✅ FIXED
        replace
        state={{ from: location }}
      />
    );
  }

  if (requireEmailVerification && user && !user.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
