# Admin Authentication Setup

The admin/queue route is now protected with authentication. Here's how to set it up:

## Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Admin Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password-here
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## Security Features

1. **HTTP-Only Cookies**: Authentication tokens are stored in secure HTTP-only cookies
2. **JWT-like Tokens**: Custom token generation with HMAC-SHA256 signatures
3. **Automatic Expiration**: Tokens expire after 24 hours
4. **Middleware Protection**: All `/admin/*` routes are protected
5. **Secure Headers**: Cookies use secure flags in production

## Default Credentials

If no environment variables are set, the system uses these defaults:
- Username: `admin`
- Password: `admin123`
- JWT Secret: `your-secret-key-change-in-production`

**⚠️ Warning**: Change these defaults in production!

## Usage

1. Navigate to `/admin/login`
2. Enter your credentials
3. You'll be redirected to `/admin/queue` upon successful login
4. Use the logout button to sign out

## API Endpoints

- `POST /api/admin/auth` - Login
- `GET /api/admin/auth` - Check authentication status
- `POST /api/admin/logout` - Logout
- `GET /api/queue/status` - Protected queue status (requires auth)

## Production Recommendations

1. Use strong, unique passwords
2. Generate a random JWT secret (32+ characters)
3. Enable HTTPS in production
4. Consider implementing rate limiting
5. Monitor login attempts
6. Use a proper JWT library like `jsonwebtoken` for production 