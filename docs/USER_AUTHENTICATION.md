# User Authentication System

This project now includes a comprehensive user authentication system with multiple sign-in options including email/password, Google, and GitHub authentication using Supabase.

## Features

- **Multiple Authentication Methods**:
  - Email/Password sign up and sign in
  - Google OAuth sign in
  - GitHub OAuth sign in
  - Password reset functionality
  - User profile management

- **Security Features**:
  - Secure session management
  - Password validation
  - Email verification (for email signup)
  - Protected routes
  - Automatic token refresh

- **User Experience**:
  - Beautiful, responsive UI
  - Loading states and error handling
  - Toast notifications
  - User profile dropdown
  - Automatic redirects

## Setup Instructions

### 1. Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OAuth Providers (Optional - for social login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 2. Supabase Configuration

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Copy your project URL and anon key

2. **Enable Authentication Providers**:
   - In your Supabase dashboard, go to Authentication > Settings
   - Enable Email authentication
   - Configure Google OAuth (if using Google sign-in)
   - Configure GitHub OAuth (if using GitHub sign-in)

3. **Configure OAuth Redirect URLs**:
   - Add `http://localhost:3000/auth/callback` for development
   - Add `https://yourdomain.com/auth/callback` for production

### 3. Google OAuth Setup (Optional)

1. **Create Google OAuth Credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     - `http://localhost:3000/auth/callback` (development)
     - `https://yourdomain.com/auth/callback` (production)

2. **Configure in Supabase**:
   - In Supabase dashboard, go to Authentication > Providers
   - Enable Google provider
   - Add your Google Client ID and Client Secret

### 4. GitHub OAuth Setup (Optional)

1. **Create GitHub OAuth App**:
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Create a new OAuth App
   - Set Authorization callback URL:
     - `http://localhost:3000/auth/callback` (development)
     - `https://yourdomain.com/auth/callback` (production)

2. **Configure in Supabase**:
   - In Supabase dashboard, go to Authentication > Providers
   - Enable GitHub provider
   - Add your GitHub Client ID and Client Secret

## Usage

### Authentication Pages

- **`/auth`** - Main authentication page with sign in/sign up forms
- **`/auth/callback`** - OAuth callback handler
- **`/auth/reset-password`** - Password reset page
- **`/auth/forgot-password`** - Forgot password page

### Components

#### AuthForm Component

```tsx
import { AuthForm } from '@/components/auth/auth-form';

// Basic usage
<AuthForm />

// With custom props
<AuthForm 
  defaultTab="signup"
  onSuccess={() => console.log('Authentication successful')}
  className="custom-class"
/>
```

#### UserProfile Component

```tsx
import { UserProfile } from '@/components/user-profile';

// Basic usage
<UserProfile />

// With custom styling
<UserProfile className="ml-4" />
```

### React Hook

#### useAuth Hook

```tsx
import { useAuth } from '@/lib/hooks/use-auth';

function MyComponent() {
  const { 
    user, 
    loading, 
    error,
    signUp, 
    signIn, 
    signInWithGoogle, 
    signInWithGitHub,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile 
  } = useAuth();

  // Check if user is authenticated
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;

  return <div>Welcome, {user.name}!</div>;
}
```

### API Functions

#### Direct Authentication Functions

```tsx
import { 
  signUpWithEmail, 
  signInWithEmail, 
  signInWithGoogle,
  signInWithGitHub,
  signOut,
  getCurrentUser 
} from '@/lib/auth';

// Sign up with email
const { user, error } = await signUpWithEmail({
  email: 'user@example.com',
  password: 'password123',
  name: 'John Doe'
});

// Sign in with email
const { user, error } = await signInWithEmail({
  email: 'user@example.com',
  password: 'password123'
});

// Sign in with Google
const { error } = await signInWithGoogle();

// Sign in with GitHub
const { error } = await signInWithGitHub();

// Sign out
const { error } = await signOut();

// Get current user
const { user, error } = await getCurrentUser();
```

## User Interface

### Authentication Flow

1. **Sign Up**:
   - User fills out name, email, and password
   - Password confirmation validation
   - Email verification sent (if enabled)
   - Success message and redirect

2. **Sign In**:
   - User enters email and password
   - Validation and error handling
   - Success message and redirect

3. **Social Login**:
   - User clicks Google or GitHub button
   - Redirected to OAuth provider
   - Callback handling and session creation
   - Success message and redirect

4. **Password Reset**:
   - User enters email address
   - Reset email sent
   - User clicks link in email
   - New password form
   - Password update and redirect

### User Profile

- **Profile Dropdown**: Shows user avatar, name, and email
- **Account Information**: Provider type and member since date
- **Actions**: Profile settings and sign out
- **Responsive Design**: Adapts to mobile and desktop

## Security Considerations

### Password Requirements

- Minimum 6 characters
- Password confirmation validation
- Secure password reset flow

### Session Management

- HTTP-only cookies
- Automatic token refresh
- Secure session storage
- CSRF protection

### OAuth Security

- Secure redirect URIs
- State parameter validation
- Token exchange security
- Provider verification

## Customization

### Styling

The authentication components use Tailwind CSS and can be customized:

```tsx
// Custom styling for AuthForm
<AuthForm className="max-w-lg mx-auto" />

// Custom styling for UserProfile
<UserProfile className="ml-4" />
```

### Theme Integration

The components automatically adapt to your theme:

```tsx
// Dark mode support
<div className="dark:bg-gray-900">
  <AuthForm />
</div>
```

### Custom Validation

You can add custom validation to the auth forms:

```tsx
// In AuthForm component
const handleSignUp = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Custom validation
  if (signUpData.password.length < 8) {
    toast.error('Password must be at least 8 characters');
    return;
  }
  
  // Proceed with sign up
  await signUp(signUpData);
};
```

## Error Handling

### Common Errors

- **Invalid credentials**: Wrong email/password
- **Email already exists**: User tries to sign up with existing email
- **Weak password**: Password doesn't meet requirements
- **OAuth errors**: Provider authentication issues
- **Network errors**: Connection problems

### Error Messages

All errors are displayed using toast notifications:

```tsx
import { toast } from 'sonner';

// Success messages
toast.success('Account created successfully!');

// Error messages
toast.error('Invalid email or password');

// Info messages
toast.info('Redirecting to Google...');
```

## Testing

### Manual Testing

1. **Email Sign Up**:
   - Navigate to `/auth`
   - Switch to "Sign Up" tab
   - Fill out form and submit
   - Verify email verification (if enabled)

2. **Email Sign In**:
   - Navigate to `/auth`
   - Enter credentials and submit
   - Verify successful login

3. **Social Login**:
   - Click Google or GitHub button
   - Complete OAuth flow
   - Verify successful login

4. **Password Reset**:
   - Navigate to `/auth/forgot-password`
   - Enter email and submit
   - Check email for reset link
   - Complete password reset

### Automated Testing

```tsx
// Example test for AuthForm
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthForm } from '@/components/auth/auth-form';

test('renders sign in form', () => {
  render(<AuthForm />);
  expect(screen.getByText('Welcome back')).toBeInTheDocument();
});

test('handles sign in submission', async () => {
  render(<AuthForm />);
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'test@example.com' },
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: 'password123' },
  });
  fireEvent.click(screen.getByText(/sign in/i));
  // Add assertions for successful sign in
});
```

## Troubleshooting

### Common Issues

1. **OAuth Redirect Errors**:
   - Verify redirect URIs in Supabase and OAuth providers
   - Check environment variables
   - Ensure HTTPS in production

2. **Email Verification Issues**:
   - Check Supabase email settings
   - Verify SMTP configuration
   - Check spam folder

3. **Session Persistence**:
   - Verify cookie settings
   - Check browser storage
   - Ensure proper redirect handling

4. **Styling Issues**:
   - Check Tailwind CSS configuration
   - Verify component imports
   - Check for CSS conflicts

### Debug Mode

Enable debug logging:

```bash
# In your .env.local
DEBUG=supabase:*
```

### Support

For issues with the authentication system:

1. Check the browser console for errors
2. Verify environment variables
3. Check Supabase dashboard logs
4. Review OAuth provider settings
5. Test with different browsers/devices

## Production Deployment

### Environment Setup

1. **Update Environment Variables**:
   - Use production Supabase project
   - Update OAuth redirect URIs
   - Set secure cookie settings

2. **SSL/HTTPS**:
   - Ensure HTTPS is enabled
   - Update OAuth redirect URIs to use HTTPS
   - Configure secure cookie settings

3. **Domain Configuration**:
   - Update Supabase site URL
   - Configure custom domains
   - Set up proper redirects

### Performance Optimization

1. **Code Splitting**:
   - Lazy load authentication components
   - Optimize bundle size
   - Use dynamic imports

2. **Caching**:
   - Implement proper caching strategies
   - Use CDN for static assets
   - Optimize image loading

3. **Monitoring**:
   - Set up error tracking
   - Monitor authentication metrics
   - Track user engagement

## Future Enhancements

### Planned Features

1. **Additional OAuth Providers**:
   - Apple Sign In
   - Microsoft OAuth
   - Twitter OAuth
   - LinkedIn OAuth

2. **Advanced Security**:
   - Two-factor authentication (2FA)
   - Biometric authentication
   - Device management
   - Login history

3. **User Management**:
   - User roles and permissions
   - Team/workspace management
   - User invitations
   - Account linking

4. **Analytics**:
   - Authentication analytics
   - User behavior tracking
   - Conversion metrics
   - Security monitoring

### Integration Examples

```tsx
// Example: Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Redirect to="/auth" />;
  
  return <>{children}</>;
}

// Example: Role-based access
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  if (!user || user.role !== 'admin') {
    return <AccessDenied />;
  }
  
  return <>{children}</>;
}
```

This authentication system provides a solid foundation for user management in your application. It's secure, user-friendly, and easily extensible for future requirements.
