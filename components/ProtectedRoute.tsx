import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { profile, loading, session } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-white text-xl">Loading...</div>
        </div>
    );
  }

  if (!session || !profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (profile.is_banned) {
      return (
        <div className="flex flex-col items-center justify-center h-screen text-center">
            <h1 className="text-4xl font-bold text-red-500 mb-4">Access Denied</h1>
            <p className="text-xl">Your account has been banned.</p>
        </div>
    );
  }

  if (!allowedRoles.includes(profile.role)) {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center">
            <h1 className="text-4xl font-bold text-red-500 mb-4">Unauthorized</h1>
            <p className="text-xl">You do not have permission to access this page.</p>
        </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
