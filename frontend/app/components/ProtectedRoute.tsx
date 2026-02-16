'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: ReactNode;
  isAuthenticated: boolean;
}

const ProtectedRoute = ({ children, isAuthenticated }: ProtectedRouteProps) => {
  const router = useRouter();
  const [hasValidated, setHasValidated] = useState(false);

  useEffect(() => {
    // Check authentication status and redirect if not authenticated
    if (!isAuthenticated) {
      router.push('/auth/signin');
    } else {
      setHasValidated(true);
    }
  }, [isAuthenticated, router]);

  // Show nothing while checking authentication status
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Redirecting to login...</div>
      </div>
    );
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;