# Supabase Integration for Analytics and Database Metrics

This document explains how to set up and use the Supabase integration for tracking engagement metrics and database performance.

## Overview

The Supabase integration provides:
1. **Engagement Analytics**: Track visitor behavior, service usage, and user interactions
2. **Database Metrics**: Monitor database performance, size, and connection statistics
3. **Admin Dashboard**: Visual interface for viewing analytics and metrics
4. **Environment Tracking**: Separate metrics for development and production environments

## Setup Instructions

### 1. Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. Database Schema

Run the SQL commands from `supabase-schema.sql` in your Supabase SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create engagement_metrics table
CREATE TABLE IF NOT EXISTS engagement_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    visitor_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    service_used TEXT NOT NULL,
    environment TEXT NOT NULL CHECK (environment IN ('dev', 'prod')),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_agent TEXT,
    ip_address INET,
    country TEXT,
    city TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create database_metrics table
CREATE TABLE IF NOT EXISTS database_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    total_size_bytes BIGINT NOT NULL,
    table_count INTEGER NOT NULL,
    active_connections INTEGER NOT NULL,
    cache_hit_ratio DECIMAL(5,4) NOT NULL,
    environment TEXT NOT NULL CHECK (environment IN ('dev', 'prod')),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes and functions (see supabase-schema.sql for full details)
```

### 3. Row Level Security (RLS)

The tables have RLS enabled with policies that allow admin access. You may need to adjust these policies based on your authentication setup.

## Usage

### Tracking Engagement

Use the analytics utility functions to track user interactions:

```typescript
import { 
  trackServiceUsage, 
  trackPageView, 
  trackChatInteraction,
  trackFeatureUsage 
} from '@/lib/analytics';

// Track page views
await trackPageView('home');
await trackPageView('chat');

// Track chat interactions
await trackChatInteraction('corporate');
await trackChatInteraction('emotional');
await trackChatInteraction('culture');
await trackChatInteraction('travel');

// Track feature usage
await trackFeatureUsage('audio_playback');
await trackFeatureUsage('voice_input');

// Track custom service usage
await trackServiceUsage('api_call_openai');
await trackServiceUsage('queue_job_processed');
```

### Collecting Database Metrics

Database metrics can be collected manually or automatically:

```typescript
// Manual collection
import { collectAndStoreMetrics } from '@/lib/database-metrics-collector';

await collectAndStoreMetrics();
```

### API Endpoints

#### Engagement Tracking
- `POST /api/analytics/track` - Track user engagement
- `GET /api/analytics/track?environment=prod&days=30` - Get engagement analytics

#### Database Metrics
- `POST /api/analytics/database` - Store database metrics
- `GET /api/analytics/database?environment=prod&days=7` - Get database metrics

#### Manual Collection
- `GET /api/analytics/collect-metrics` - Manually trigger metrics collection

## Admin Dashboard

Access the Supabase admin dashboard at `/admin/supabase` to view:

### Database Metrics
- **Database Size**: Total storage used with trend indicators
- **Table Count**: Number of tables with averages
- **Active Connections**: Current database connections
- **Cache Hit Ratio**: Database cache performance

### Engagement Analytics
- **Visitor Statistics**: Total and unique visitors
- **Session Data**: Total and unique sessions
- **Service Usage**: Breakdown of which services are used most
- **Top Services**: Most popular features and pages

### Features
- **Environment Filtering**: Switch between dev and prod data
- **Time Range Selection**: View data for different periods
- **Real-time Updates**: Refresh data manually
- **Responsive Design**: Works on desktop and mobile

## Database Functions

The schema includes PostgreSQL functions for analytics:

### `get_engagement_analytics(p_environment, p_days)`
Returns comprehensive engagement statistics including:
- Total and unique visitors
- Service usage breakdown
- Top performing services
- Daily visitor trends

### `get_database_metrics_summary(p_environment, p_days)`
Returns database performance metrics including:
- Average and latest database size
- Connection statistics
- Cache performance
- Size trends

## Integration with Existing Services

### Chat Services
Add tracking to your chat components:

```typescript
// In your chat components
import { trackChatInteraction } from '@/lib/analytics';

// Track when users start a chat
const handleStartChat = async () => {
  await trackChatInteraction('corporate'); // or 'emotional', 'culture', 'travel'
  // ... rest of your chat logic
};
```

### API Routes
Add tracking to your API routes:

```typescript
// In your API routes
import { trackApiCall } from '@/lib/analytics';

export async function POST(request: NextRequest) {
  await trackApiCall('openai_chat');
  // ... rest of your API logic
}
```

### Page Views
Add tracking to your pages:

```typescript
// In your page components
import { trackPageView } from '@/lib/analytics';

useEffect(() => {
  trackPageView('corporate_chat');
}, []);
```

## Scheduled Metrics Collection

For production, set up scheduled collection of database metrics:

### Vercel Cron Jobs
Add to your `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/analytics/collect-metrics",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

### Manual Collection
You can also trigger collection manually via the admin dashboard or API.

## Security Considerations

1. **Authentication**: All admin endpoints require authentication
2. **RLS Policies**: Database tables have appropriate access controls
3. **Environment Separation**: Dev and prod data are kept separate
4. **IP Tracking**: User IPs are stored for analytics (consider privacy implications)

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   - Ensure all Supabase environment variables are set
   - Check that the service role key has appropriate permissions

2. **Database Connection Errors**
   - Verify your Supabase URL and keys
   - Check that the database schema has been created

3. **RLS Policy Issues**
   - Ensure RLS policies allow the necessary operations
   - Check authentication is working properly

4. **Metrics Not Collecting**
   - Verify the collection functions are being called
   - Check for errors in the browser console or server logs

### Debug Mode

Enable debug logging by setting:

```bash
DEBUG=supabase:*
```

## Performance Considerations

1. **Indexing**: The schema includes appropriate indexes for common queries
2. **Caching**: Consider implementing caching for frequently accessed analytics
3. **Batch Processing**: For high-volume tracking, consider batching requests
4. **Data Retention**: Implement data retention policies for old metrics

## Future Enhancements

1. **Real-time Analytics**: WebSocket-based real-time dashboard updates
2. **Advanced Filtering**: More granular filtering options
3. **Export Functionality**: Export analytics data to CSV/JSON
4. **Alerting**: Set up alerts for unusual metrics
5. **Geolocation**: Integrate with IP geolocation services
6. **User Segmentation**: Track different user types and behaviors

## Support

For issues or questions about the Supabase integration:
1. Check the troubleshooting section above
2. Review the Supabase documentation
3. Check the application logs for error messages
4. Verify your environment variables and database schema 