"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AdminNav } from '@/components/admin-nav';
import {
  Users,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Globe,
  RefreshCw,
  UserCheck,
  Clock,
  Target,
} from 'lucide-react';

interface EngagementAnalytics {
  total_visitors: number;
  unique_visitors: number;
  total_sessions: number;
  unique_sessions: number;
  service_usage: Record<string, number>;
  top_service: string;
  top_service_count: number;
  daily_visitors: Record<string, number>;
}

export default function AnalyticsDashboard() {
  const [engagementData, setEngagementData] = useState<EngagementAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [environment, setEnvironment] = useState<'dev' | 'prod'>('prod');
  const [timeRange, setTimeRange] = useState(30);
  
  const fetchEngagementData = useCallback(async () => {
    try {
      const response = await fetch(`/api/analytics/track?environment=${environment}&days=${timeRange}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/admin/login';
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success && result.data) {
        setEngagementData(result.data);
      }
    } catch (error) {
      console.error('Error fetching engagement data:', error);
      toast.error('Failed to fetch engagement data');
    }
  }, [environment, timeRange]);
  
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        window.location.href = '/admin/login';
      } else {
        toast.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed');
    }
  };
  
  useEffect(() => {
    setLoading(true);
    fetchEngagementData().finally(() => setLoading(false));
  }, [fetchEngagementData]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading Analytics Dashboard...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav onLogout={handleLogout} />
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600">Visitor metrics and engagement analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value as 'dev' | 'prod')}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="prod">Production</option>
                  <option value="dev">Development</option>
                </select>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                </select>
              </div>
              <Button onClick={fetchEngagementData} disabled={loading} size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
          
          {/* Visitor Metrics */}
          {engagementData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Visitors</p>
                    <p className="text-2xl font-bold">{engagementData.total_visitors?.toLocaleString() || '0'}</p>
                    <p className="text-sm text-gray-500">All time visits</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center gap-3">
                  <UserCheck className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Unique Visitors</p>
                    <p className="text-2xl font-bold">{engagementData.unique_visitors?.toLocaleString() || '0'}</p>
                    <p className="text-sm text-gray-500">Distinct users</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Activity className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Sessions</p>
                    <p className="text-2xl font-bold">{engagementData.total_sessions?.toLocaleString() || '0'}</p>
                    <p className="text-sm text-gray-500">All sessions</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">Unique Sessions</p>
                    <p className="text-2xl font-bold">{engagementData.unique_sessions?.toLocaleString() || '0'}</p>
                    <p className="text-sm text-gray-500">Distinct sessions</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Additional Metrics */}
          {engagementData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-semibold">Top Performing Service</h3>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600 mb-2">
                    {engagementData.top_service || 'N/A'}
                  </p>
                  <p className="text-gray-600">
                    {engagementData.top_service_count?.toLocaleString() || '0'} uses
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="h-6 w-6 text-green-600" />
                  <h3 className="text-lg font-semibold">Environment Overview</h3>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600 mb-2 capitalize">
                    {environment}
                  </p>
                  <p className="text-gray-600">
                    Last {timeRange} days
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Service Usage Breakdown */}
          {engagementData?.service_usage && (
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Service Usage Breakdown
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Object.entries(engagementData.service_usage).map(([service, count]) => (
                  <div key={service} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-sm capitalize">{service.replace(/_/g, ' ')}</p>
                    <p className="text-2xl font-bold text-blue-600">{count.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">
                      {((count / engagementData.total_visitors) * 100).toFixed(1)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Daily Visitors Chart */}
          {engagementData?.daily_visitors && (
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Daily Visitor Trends
              </h3>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Object.entries(engagementData.daily_visitors)
                    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                    .slice(0, 12)
                    .map(([date, count]) => (
                      <div key={date} className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="font-semibold text-sm">
                          {new Date(date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-xl font-bold text-blue-600">{count.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">visitors</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
