// Database types
export interface Database {
  public: {
    Tables: {
      engagement_metrics: {
        Row: {
          id: string;
          visitor_id: string;
          session_id: string;
          service_used: string;
          environment: 'dev' | 'prod';
          timestamp: string;
          user_agent: string | null;
          ip_address: string | null;
          country: string | null;
          city: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          visitor_id: string;
          session_id: string;
          service_used: string;
          environment: 'dev' | 'prod';
          timestamp: string;
          user_agent?: string | null;
          ip_address?: string | null;
          country?: string | null;
          city?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          visitor_id?: string;
          session_id?: string;
          service_used?: string;
          environment?: 'dev' | 'prod';
          timestamp?: string;
          user_agent?: string | null;
          ip_address?: string | null;
          country?: string | null;
          city?: string | null;
          created_at?: string;
        };
      };
      database_metrics: {
        Row: {
          id: string;
          total_size_bytes: number;
          table_count: number;
          active_connections: number;
          cache_hit_ratio: number;
          environment: 'dev' | 'prod';
          timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          total_size_bytes: number;
          table_count: number;
          active_connections: number;
          cache_hit_ratio: number;
          environment: 'dev' | 'prod';
          timestamp: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          total_size_bytes?: number;
          table_count?: number;
          active_connections?: number;
          cache_hit_ratio?: number;
          environment?: 'dev' | 'prod';
          timestamp?: string;
          created_at?: string;
        };
      };
    };
  };
}

// Export the createClient function for use in components
export { createClient } from './supabase/client';

// Export server client creation function
export { createClient as createServerClient } from './supabase/server';
