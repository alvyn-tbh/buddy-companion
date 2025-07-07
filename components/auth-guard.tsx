'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo: string;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, redirectTo, fallback }: AuthGuardProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Check if user authentication is enabled (only when USER_AUTH=true)
  const isUserAuthEnabled = process.env.NEXT_PUBLIC_USER_AUTH === 'true';

  useEffect(() => {
    // Skip authentication check if USER_AUTH is not enabled
    if (!isUserAuthEnabled) {
      return;
    }

    if (!loading && !user) {
      // Redirect to specified page if not authenticated
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo, isUserAuthEnabled]);

  // Show loading state only if auth is enabled
  if (loading && isUserAuthEnabled) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated and auth is enabled (will redirect via useEffect)
  if (!user && isUserAuthEnabled) {
    return null;
  }

  // Render children if authenticated or if auth is not enabled
  return <>{children}</>;
} 