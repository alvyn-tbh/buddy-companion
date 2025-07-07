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

-- Create usage tracking table
CREATE TABLE IF NOT EXISTS api_usage (
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_engagement_metrics_visitor_id ON engagement_metrics(visitor_id);
CREATE INDEX IF NOT EXISTS idx_engagement_metrics_session_id ON engagement_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_engagement_metrics_service_used ON engagement_metrics(service_used);
CREATE INDEX IF NOT EXISTS idx_engagement_metrics_environment ON engagement_metrics(environment);
CREATE INDEX IF NOT EXISTS idx_engagement_metrics_timestamp ON engagement_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_engagement_metrics_created_at ON engagement_metrics(created_at);

CREATE INDEX IF NOT EXISTS idx_database_metrics_environment ON database_metrics(environment);
CREATE INDEX IF NOT EXISTS idx_database_metrics_timestamp ON database_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_database_metrics_created_at ON database_metrics(created_at);

CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_timestamp ON api_usage(timestamp);
CREATE INDEX IF NOT EXISTS idx_api_usage_api_type ON api_usage(api_type);

-- Create a function to get engagement analytics
CREATE OR REPLACE FUNCTION get_engagement_analytics(
    p_environment TEXT DEFAULT 'prod',
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    total_visitors BIGINT,
    unique_visitors BIGINT,
    total_sessions BIGINT,
    unique_sessions BIGINT,
    service_usage JSONB,
    top_service TEXT,
    top_service_count BIGINT,
    daily_visitors JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH visitor_stats AS (
        SELECT 
            COUNT(*) as total_visitors,
            COUNT(DISTINCT visitor_id) as unique_visitors,
            COUNT(DISTINCT session_id) as unique_sessions
        FROM engagement_metrics 
        WHERE environment = p_environment 
        AND created_at >= NOW() - INTERVAL '1 day' * p_days
    ),
    service_stats AS (
        SELECT 
            service_used,
            COUNT(*) as usage_count
        FROM engagement_metrics 
        WHERE environment = p_environment 
        AND created_at >= NOW() - INTERVAL '1 day' * p_days
        GROUP BY service_used
        ORDER BY usage_count DESC
    ),
    daily_stats AS (
        SELECT 
            DATE(created_at) as date,
            COUNT(DISTINCT visitor_id) as daily_visitors
        FROM engagement_metrics 
        WHERE environment = p_environment 
        AND created_at >= NOW() - INTERVAL '1 day' * p_days
        GROUP BY DATE(created_at)
        ORDER BY date
    )
    SELECT 
        vs.total_visitors,
        vs.unique_visitors,
        vs.unique_sessions,
        vs.unique_sessions,
        (SELECT jsonb_object_agg(service_used, usage_count) FROM service_stats) as service_usage,
        (SELECT service_used FROM service_stats LIMIT 1) as top_service,
        (SELECT usage_count FROM service_stats LIMIT 1) as top_service_count,
        (SELECT jsonb_object_agg(ds.date::text, ds.daily_visitors) FROM daily_stats ds) as daily_visitors
    FROM visitor_stats vs;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get database metrics summary
CREATE OR REPLACE FUNCTION get_database_metrics_summary(
    p_environment TEXT DEFAULT 'prod',
    p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
    avg_total_size_bytes BIGINT,
    avg_table_count INTEGER,
    avg_active_connections INTEGER,
    avg_cache_hit_ratio DECIMAL(5,4),
    latest_total_size_bytes BIGINT,
    latest_table_count INTEGER,
    latest_active_connections INTEGER,
    latest_cache_hit_ratio DECIMAL(5,4),
    size_trend TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH metrics_summary AS (
        SELECT 
            AVG(total_size_bytes)::BIGINT as avg_total_size_bytes,
            AVG(table_count)::INTEGER as avg_table_count,
            AVG(active_connections)::INTEGER as avg_active_connections,
            AVG(cache_hit_ratio) as avg_cache_hit_ratio
        FROM database_metrics 
        WHERE environment = p_environment 
        AND created_at >= NOW() - INTERVAL '1 day' * p_days
    ),
    latest_metrics AS (
        SELECT 
            total_size_bytes,
            table_count,
            active_connections,
            cache_hit_ratio
        FROM database_metrics 
        WHERE environment = p_environment 
        ORDER BY created_at DESC 
        LIMIT 1
    ),
    size_trend_calc AS (
        SELECT 
            CASE 
                WHEN lm.total_size_bytes > ms.avg_total_size_bytes THEN 'increasing'
                WHEN lm.total_size_bytes < ms.avg_total_size_bytes THEN 'decreasing'
                ELSE 'stable'
            END as size_trend
        FROM latest_metrics lm, metrics_summary ms
    )
    SELECT 
        ms.avg_total_size_bytes,
        ms.avg_table_count,
        ms.avg_active_connections,
        ms.avg_cache_hit_ratio,
        lm.total_size_bytes,
        lm.table_count,
        lm.active_connections,
        lm.cache_hit_ratio,
        st.size_trend
    FROM metrics_summary ms, latest_metrics lm, size_trend_calc st;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS)
ALTER TABLE engagement_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE database_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access (you'll need to implement proper authentication)
CREATE POLICY "Allow admin read access to engagement_metrics" ON engagement_metrics
    FOR SELECT USING (true);

CREATE POLICY "Allow admin read access to database_metrics" ON database_metrics
    FOR SELECT USING (true);

CREATE POLICY "Allow admin insert access to engagement_metrics" ON engagement_metrics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin insert access to database_metrics" ON database_metrics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own usage" ON api_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all usage" ON api_usage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN (
        SELECT email FROM auth.users WHERE email = auth.users.email
      )
    )
  );

CREATE POLICY "Service can insert usage" ON api_usage
  FOR INSERT WITH CHECK (true);
