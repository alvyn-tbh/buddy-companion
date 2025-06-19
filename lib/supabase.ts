import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client for client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

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

// Typed Supabase client
export const typedSupabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
export const typedSupabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
}); 