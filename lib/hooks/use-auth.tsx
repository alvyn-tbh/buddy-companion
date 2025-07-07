'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthState, signUpWithEmail, signInWithEmail, signInWithGoogle, signInWithGitHub, signOut, getCurrentUser, onAuthStateChange, resetPassword, updatePassword, updateProfile, SignUpData, SignInData } from '@/lib/auth';
import { toast } from 'sonner';

interface AuthContextType extends AuthState {
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (data: SignInData) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateProfile: (data: { name?: string; avatar_url?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for when authentication is disabled
const mockUser = {
  id: 'mock-user-id',
  email: 'test@example.com',
  name: 'Test User',
  avatar_url: undefined,
  provider: 'mock',
  created_at: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  // Check if user authentication is enabled (only when USER_AUTH=true)
  const isUserAuthEnabled = process.env.NEXT_PUBLIC_USER_AUTH === 'true';

  const [state, setState] = useState<AuthState>({
    user: isUserAuthEnabled ? null : mockUser,
    loading: isUserAuthEnabled, // Only show loading if auth is enabled
    error: null,
  });

  const refreshUser = async () => {
    // Skip if auth is not enabled
    if (!isUserAuthEnabled) {
      return;
    }

    try {
      const { user, error } = await getCurrentUser();
      setState(prev => ({
        ...prev,
        user,
        error,
        loading: false,
      }));
    } catch (error) {
      console.error('Error refreshing user:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to get current user',
        loading: false,
      }));
    }
  };

  const signUp = async (data: SignUpData) => {
    // Skip if auth is not enabled
    if (!isUserAuthEnabled) {
      toast.info('Authentication is disabled for testing');
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { user, error } = await signUpWithEmail(data);
      
      if (error) {
        setState(prev => ({ ...prev, error, loading: false }));
        toast.error(error);
      } else if (user) {
        setState(prev => ({ ...prev, user, loading: false }));
        toast.success('Account created successfully! Please check your email to verify your account.');
      }
    } catch (error) {
      console.error('Error signing up:', error);
      const errorMessage = 'An unexpected error occurred during sign up';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      toast.error(errorMessage);
    }
  };

  const signIn = async (data: SignInData) => {
    // Skip if auth is not enabled
    if (!isUserAuthEnabled) {
      toast.info('Authentication is disabled for testing');
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { user, error } = await signInWithEmail(data);
      
      if (error) {
        setState(prev => ({ ...prev, error, loading: false }));
        toast.error(error);
      } else if (user) {
        setState(prev => ({ ...prev, user, loading: false }));
        toast.success('Signed in successfully!');
      }
    } catch (error) {
      console.error('Error signing in:', error);
      const errorMessage = 'An unexpected error occurred during sign in';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      toast.error(errorMessage);
    }
  };

  const handleGoogleSignIn = async () => {
    // Skip if auth is not enabled
    if (!isUserAuthEnabled) {
      toast.info('Authentication is disabled for testing');
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        setState(prev => ({ ...prev, error, loading: false }));
        toast.error(error);
      } else {
        toast.info('Redirecting to Google...');
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      const errorMessage = 'An unexpected error occurred during Google sign in';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      toast.error(errorMessage);
    }
  };

  const handleGitHubSignIn = async () => {
    // Skip if auth is not enabled
    if (!isUserAuthEnabled) {
      toast.info('Authentication is disabled for testing');
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { error } = await signInWithGitHub();
      
      if (error) {
        setState(prev => ({ ...prev, error, loading: false }));
        toast.error(error);
      } else {
        toast.info('Redirecting to GitHub...');
      }
    } catch (error) {
      console.error('Error signing in with GitHub:', error);
      const errorMessage = 'An unexpected error occurred during GitHub sign in';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      toast.error(errorMessage);
    }
  };

  const handleSignOut = async () => {
    // Skip if auth is not enabled
    if (!isUserAuthEnabled) {
      toast.info('Authentication is disabled for testing');
      return;
    }

    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const { error } = await signOut();
      
      if (error) {
        setState(prev => ({ ...prev, error, loading: false }));
        toast.error(error);
      } else {
        setState(prev => ({ ...prev, user: null, loading: false }));
        toast.success('Signed out successfully!');
      }
    } catch (error) {
      console.error('Error signing out:', error);
      const errorMessage = 'An unexpected error occurred during sign out';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      toast.error(errorMessage);
    }
  };

  const handleResetPassword = async (email: string) => {
    // Skip if auth is not enabled
    if (!isUserAuthEnabled) {
      toast.info('Authentication is disabled for testing');
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        setState(prev => ({ ...prev, error, loading: false }));
        toast.error(error);
      } else {
        setState(prev => ({ ...prev, loading: false }));
        toast.success('Password reset email sent! Please check your inbox.');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      const errorMessage = 'An unexpected error occurred during password reset';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      toast.error(errorMessage);
    }
  };

  const handleUpdatePassword = async (password: string) => {
    // Skip if auth is not enabled
    if (!isUserAuthEnabled) {
      toast.info('Authentication is disabled for testing');
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { error } = await updatePassword(password);
      
      if (error) {
        setState(prev => ({ ...prev, error, loading: false }));
        toast.error(error);
      } else {
        setState(prev => ({ ...prev, loading: false }));
        toast.success('Password updated successfully!');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      const errorMessage = 'An unexpected error occurred during password update';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      toast.error(errorMessage);
    }
  };

  const handleUpdateProfile = async (data: { name?: string; avatar_url?: string }) => {
    // Skip if auth is not enabled
    if (!isUserAuthEnabled) {
      toast.info('Authentication is disabled for testing');
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { user, error } = await updateProfile(data);
      
      if (error) {
        setState(prev => ({ ...prev, error, loading: false }));
        toast.error(error);
      } else if (user) {
        setState(prev => ({ ...prev, user, loading: false }));
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = 'An unexpected error occurred during profile update';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    // Skip if auth is not enabled
    if (!isUserAuthEnabled) {
      return;
    }

    // Get initial user state
    refreshUser();

    // Listen to auth state changes
    const { data: { subscription } } = onAuthStateChange((user) => {
      setState(prev => ({
        ...prev,
        user,
        loading: false,
      }));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isUserAuthEnabled]);

  const value: AuthContextType = {
    ...state,
    signUp,
    signIn,
    signInWithGoogle: handleGoogleSignIn,
    signInWithGitHub: handleGitHubSignIn,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    updatePassword: handleUpdatePassword,
    updateProfile: handleUpdateProfile,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 