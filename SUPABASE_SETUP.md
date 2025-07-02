# Supabase Setup Guide

## Environment Variables Required

Create a `.env.local` file in your project root with the following variables:

```bash
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Admin Authentication (existing)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# OpenAI Configuration (existing)
OPENAI_API_KEY=your_openai_api_key_here
```

## How to Get Supabase Credentials

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Sign up or log in
   - Create a new project
   - Wait for the project to be set up

2. **Get Your Project URL and Keys**:
   - In your Supabase dashboard, go to Settings > API
   - Copy the "Project URL" (this is your `NEXT_PUBLIC_SUPABASE_URL`)
   - Copy the "anon public" key (this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - Copy the "service_role secret" key (this is your `SUPABASE_SERVICE_ROLE_KEY`)

3. **Enable Authentication**:
   - Go to Authentication > Settings
   - Enable Email authentication
   - Optionally enable Google and GitHub OAuth providers

4. **Configure OAuth Redirect URLs** (if using social login):
   - Add `http://localhost:3000/auth/callback` for development
   - Add `https://yourdomain.com/auth/callback` for production

## Example .env.local

```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNjU0NjQwMCwiZXhwIjoxOTUyMTIyNDAwfQ.example
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjM2NTQ2NDAwLCJleHAiOjE5NTIxMjI0MDB9.example
```

## Troubleshooting

### "supabaseKey is required" Error

This error occurs when the environment variables are not properly set. Make sure:

1. Your `.env.local` file exists in the project root
2. The environment variables are correctly named
3. You've restarted your development server after adding the variables
4. The values are not empty or contain extra spaces

### Restart Development Server

After adding environment variables, restart your development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
# or
pnpm dev
# or
yarn dev
```

### Verify Environment Variables

You can verify your environment variables are loaded by adding a console.log in your code:

```typescript
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
```

## Security Notes

- Never commit your `.env.local` file to version control
- The `SUPABASE_SERVICE_ROLE_KEY` should only be used on the server side
- The `NEXT_PUBLIC_` prefixed variables are safe to expose to the client
- Rotate your keys regularly in production 