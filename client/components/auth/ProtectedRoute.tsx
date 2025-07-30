import React, { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  requiredScopes?: string[];
}

interface LoadingSpinnerProps {
  message?: string;
}

function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">D</span>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="font-medium">{message}</span>
        </div>
      </div>
    </div>
  );
}

export default function ProtectedRoute({
  children,
  fallback,
  requiredScopes = [],
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, getIdTokenClaims } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return fallback || <LoadingSpinner message="Checking authentication..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return fallback || <LoadingSpinner message="Redirecting to login..." />;
  }

  // Check required scopes if specified
  if (requiredScopes.length > 0 && user) {
    // For now, we'll assume all authenticated users have all scopes
    // In a real implementation, you'd check the user's permissions/roles
    const hasRequiredScopes = requiredScopes.every(() => true);

    if (!hasRequiredScopes) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Access Denied
            </h2>
            <p className="text-gray-600">
              You don't have the required permissions to access this page.
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
