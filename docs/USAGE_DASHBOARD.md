# Usage Dashboard

The Usage Dashboard provides comprehensive tracking and analytics for OpenAI API usage across the application.

## Features

### 📊 Real-time Usage Tracking
- **Cost Calculation**: Automatically calculates costs based on OpenAI's current pricing
- **User-specific Tracking**: Tracks usage per user when authentication is enabled
- **API Type Breakdown**: Separates usage by text, speech, transcription, and TTS
- **Time-based Analytics**: View usage trends over different time periods

### 📈 Dashboard Components

#### Summary Cards
- **Total Cost**: Overall API spending with trend indicators
- **Active Users**: Number of users with API activity
- **API Types**: Different types of APIs being used
- **Daily Average**: Average daily cost

#### Usage Analytics
- **Usage by API Type**: Cost breakdown by API type (text, speech, transcription)
- **Top Users**: Users with highest usage
- **Daily Usage Trend**: Visual chart showing cost over time

#### Filtering Options
- **Time Range**: 7 days, 30 days, 90 days, 1 year
- **User Filter**: View usage for specific users or all users

## Database Schema

### `api_usage` Table
```sql
CREATE TABLE api_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  usage_dollars DECIMAL(10,6) NOT NULL,
  api_type TEXT NOT NULL CHECK (api_type IN ('speech', 'text', 'tts', 'transcription')),
  model TEXT,
  tokens_used INTEGER,
  request_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Pricing (OpenAI 2024)

### GPT Models (per 1K tokens)
- `gpt-4o`: $0.005 input, $0.015 output
- `gpt-4o-mini`: $0.00015 input, $0.0006 output
- `gpt-4-turbo`: $0.01 input, $0.03 output
- `gpt-4`: $0.03 input, $0.06 output
- `gpt-3.5-turbo`: $0.0005 input, $0.0015 output

### Audio Models
- **Whisper (per minute)**: $0.006
- **TTS-1 (per 1K characters)**: $0.015
- **TTS-1-HD (per 1K characters)**: $0.03

## Usage Tracking Implementation

### Text API (Corporate Chat)
```typescript
await usageTracker.trackUsage({
  user_id: userId,
  api_type: 'text',
  model: 'gpt-4o-mini',
  tokens_used: totalTokens,
  request_id: requestId,
  metadata: {
    thread_id: existingThreadId,
    message_count: messages.length,
    response_length: responseContent.length,
  },
});
```

### Transcription API
```typescript
await usageTracker.trackUsage({
  user_id: userId,
  api_type: 'transcription',
  model: 'whisper-1',
  minutes_used: durationMinutes,
  request_id: requestId,
  metadata: {
    file_size: audioFile.size,
    file_type: audioFile.type,
    language,
    response_format: responseFormat,
  },
});
```

## API Endpoints

### GET `/api/admin/usage`
Fetches usage statistics with optional filters:
- `startDate`: Start date for the period
- `endDate`: End date for the period
- `userId`: Specific user ID (optional)

Returns:
```json
{
  "current": {
    "totalCost": 12.34,
    "usageByType": {
      "text": 8.50,
      "transcription": 3.84
    },
    "usageByUser": {
      "user-id-1": 5.20,
      "user-id-2": 7.14
    },
    "dailyUsage": [
      {"date": "2024-01-01", "cost": 1.23},
      {"date": "2024-01-02", "cost": 2.45}
    ]
  },
  "previous": {
    // Same structure for comparison period
  }
}
```

### GET `/api/admin/users`
Fetches all users for the admin dashboard.

## Access Control

- **Admin Only**: Usage dashboard requires admin authentication
- **User Privacy**: Individual users can only see their own usage
- **Admin Override**: Admins can view all users' usage

## Environment Variables

The usage tracking respects the `USER_AUTH` environment variable:
- When `USER_AUTH=true`: Tracks usage per user
- When `USER_AUTH=false`: Tracks usage without user association

## Future Enhancements

1. **Usage Alerts**: Set spending limits and receive notifications
2. **Export Data**: Download usage reports in CSV/JSON format
3. **Cost Optimization**: Suggestions for reducing API costs
4. **Usage Forecasting**: Predict future costs based on trends
5. **Integration**: Connect with billing systems for automatic invoicing

## Troubleshooting

### Common Issues

1. **No Usage Data**: Ensure the database schema is properly migrated
2. **Incorrect Costs**: Verify OpenAI pricing is up to date
3. **Missing User Data**: Check authentication is properly configured
4. **Permission Errors**: Ensure user has admin access

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG_USAGE=true
```

This will log all usage tracking events to the console.
