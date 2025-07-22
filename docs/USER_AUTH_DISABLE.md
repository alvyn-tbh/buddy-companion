# Conditional User Authentication

This feature allows you to conditionally enable or disable user authentication based on the `USER_AUTH` environment variable.

## How to Use

### 1. Enable Authentication (Default Behavior)

**Option A: Set environment variable explicitly**
```bash
# Enable user authentication
USER_AUTH=true
NEXT_PUBLIC_USER_AUTH=true
```

**Option B: Don't set the variable (default behavior)**
```bash
# Authentication will be disabled by default
# No environment variables needed
```

### 2. Disable Authentication (For Testing)

```bash
# Disable user authentication (for testing only)
USER_AUTH=false
NEXT_PUBLIC_USER_AUTH=false
```

**Note**: You need both variables because:
- `USER_AUTH` is used in server-side code (middleware)
- `NEXT_PUBLIC_USER_AUTH` is used in client-side code (React components)

## Behavior Summary

| USER_AUTH Value | Authentication Status | Protected Routes | UI Indicator |
|-----------------|----------------------|------------------|--------------|
| `true` | ✅ **Enabled** | Require login | Sign In/User Profile |
| `false` or not set | ❌ **Disabled** | No login required | "Auth Disabled" button |

## What Happens When Auth is Disabled

When `USER_AUTH` is `false` or not set:

- **Middleware**: Skips authentication checks for protected routes
- **AuthGuard**: Allows access to protected components without authentication
- **useAuth Hook**: Returns a mock authenticated user
- **UserProfile**: Shows "Auth Disabled" indicator instead of login/signup buttons
- **Protected Routes**: All chat routes (`/corporate/chat`, `/travel/chat`, etc.) become accessible without login

## Mock User Details

When authentication is disabled, the system provides a mock user with these details:
- **ID**: `mock-user-id`
- **Email**: `test@example.com`
- **Name**: `Test User`
- **Provider**: `mock`
- **Created At**: Current timestamp

## UI Indicators

- The user profile component shows an orange "Auth Disabled" button when authentication is disabled
- Authentication-related actions (sign in, sign up, sign out) show info toasts instead of performing actions
- All protected routes become accessible

## Use Cases

### Development with Authentication Disabled
```bash
# .env.local
USER_AUTH=false
NEXT_PUBLIC_USER_AUTH=false
```

### Development with Authentication Enabled
```bash
# .env.local
USER_AUTH=true
NEXT_PUBLIC_USER_AUTH=true
```

### Production (Authentication Always Enabled)
```bash
# .env.production
USER_AUTH=true
NEXT_PUBLIC_USER_AUTH=true
```

## Security Warning

⚠️ **Never disable authentication in production!** This feature is for development and testing only.

## Implementation Details

The feature is implemented across several components:

1. **Middleware** (`middleware.ts`): Skips auth checks when `USER_AUTH !== 'true'`
2. **AuthGuard** (`components/auth-guard.tsx`): Allows access when `USER_AUTH !== 'true'`
3. **useAuth Hook** (`lib/hooks/use-auth.tsx`): Returns mock user when `USER_AUTH !== 'true'`
4. **UserProfile** (`components/user-profile.tsx`): Shows appropriate UI indicators

## Example Usage

```bash
# Development with auth disabled (default)
npm run dev

# Development with auth enabled
USER_AUTH=true NEXT_PUBLIC_USER_AUTH=true npm run dev

# Development with auth explicitly disabled
USER_AUTH=false NEXT_PUBLIC_USER_AUTH=false npm run dev
```

## Testing Different States

1. **Test with auth disabled** (default):
   - Visit `/corporate/chat` - should work without login
   - Check header - should show "Auth Disabled" button

2. **Test with auth enabled**:
   - Set `USER_AUTH=true` and `NEXT_PUBLIC_USER_AUTH=true`
   - Visit `/corporate/chat` - should redirect to `/corporate`
   - Check header - should show "Sign In" button 