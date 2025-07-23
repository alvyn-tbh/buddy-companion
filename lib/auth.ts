import { createClient } from './supabase/client';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  provider?: string;
  created_at: string;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export interface SignUpData {
  email: string;
  password: string;
  name?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(data: SignUpData): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const supabase = createClient();
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
        },
      },
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (authData.user) {
      const user: AuthUser = {
        id: authData.user.id,
        email: authData.user.email!,
        name: authData.user.user_metadata?.name || data.name,
        avatar_url: authData.user.user_metadata?.avatar_url,
        provider: 'email',
        created_at: authData.user.created_at,
      };
      return { user, error: null };
    }

    return { user: null, error: 'Sign up failed' };
  } catch (error) {
    console.error('Sign up error:', error);
    return { user: null, error: 'An unexpected error occurred' };
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(data: SignInData): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (user) {
      // Log the login event
      await supabase.from('login_history').insert({
        user_id: user.id,
        // login_at will default to now()
      });

      const authUser: AuthUser = {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name,
        avatar_url: user.user_metadata?.avatar_url,
        provider: user.app_metadata?.provider || 'email',
        created_at: user.created_at,
      };
      return { user: authUser, error: null };
    }

    return { user: null, error: 'Sign in failed' };
  } catch (error) {
    console.error('Sign in error:', error);
    return { user: null, error: 'An unexpected error occurred' };
  }
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      return { user: null, error: error.message };
    }

    // The user will be redirected to the OAuth provider
    // The actual user data will be available after the redirect
    return { user: null, error: null };
  } catch (error) {
    console.error('Google sign in error:', error);
    return { user: null, error: 'An unexpected error occurred' };
  }
}

/**
 * Sign in with GitHub
 */
export async function signInWithGitHub(): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      return { user: null, error: error.message };
    }

    return { user: null, error: null };
  } catch (error) {
    console.error('GitHub sign in error:', error);
    return { user: null, error: 'An unexpected error occurred' };
  }
}

/**
 * Sign out
 */
export async function signOut(): Promise<{ error: string | null }> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    return { error: error?.message || null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      return { user: null, error: error.message };
    }

    if (user) {
      const authUser: AuthUser = {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name,
        avatar_url: user.user_metadata?.avatar_url,
        provider: user.app_metadata?.provider || 'email',
        created_at: user.created_at,
      };
      return { user: authUser, error: null };
    }

    return { user: null, error: null };
  } catch (error) {
    console.error('Get current user error:', error);
    return { user: null, error: 'An unexpected error occurred' };
  }
}

/**
 * Reset password
 */
export async function resetPassword(email: string): Promise<{ error: string | null }> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Reset password error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Update password
 */
export async function updatePassword(password: string): Promise<{ error: string | null }> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Update password error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Update user profile
 */
export async function updateProfile(data: { name?: string; avatar_url?: string }): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const supabase = createClient();
    const { data: authData, error } = await supabase.auth.updateUser({
      data: data,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (authData.user) {
      const user: AuthUser = {
        id: authData.user.id,
        email: authData.user.email!,
        name: authData.user.user_metadata?.name,
        avatar_url: authData.user.user_metadata?.avatar_url,
        provider: authData.user.app_metadata?.provider || 'email',
        created_at: authData.user.created_at,
      };
      return { user, error: null };
    }

    return { user: null, error: 'Profile update failed' };
  } catch (error) {
    console.error('Update profile error:', error);
    return { user: null, error: 'An unexpected error occurred' };
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  const supabase = createClient();
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      const user: AuthUser = {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata?.name,
        avatar_url: session.user.user_metadata?.avatar_url,
        provider: session.user.app_metadata?.provider || 'email',
        created_at: session.user.created_at,
      };
      callback(user);
    } else if (event === 'SIGNED_OUT') {
      callback(null);
    }
  });
}
