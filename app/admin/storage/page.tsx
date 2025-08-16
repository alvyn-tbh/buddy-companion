"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AdminNav } from '@/components/admin-nav';
import {
  Database,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  RefreshCw,
  Server,
  HardDrive,
  Network,
  Zap,
  Database as DatabaseIcon,
  Activity,
  // Info,
  // PieChart,
  // BarChart3,
} from 'lucide-react';

interface DatabaseMetrics {
  avg_total_size_bytes: number;
  avg_table_count: number;
  avg_active_connections: number;
  avg_cache_hit_ratio: number;
  latest_total_size_bytes: number;
  latest_table_count: number;
  latest_active_connections: number;
  latest_cache_hit_ratio: number;
  size_trend: 'increasing' | 'decreasing' | 'stable';
}

interface RecentDatabaseMetric {
  id: string;
  total_size_bytes: number;
  table_count: number;
  active_connections: number;
  cache_hit_ratio: number;
  created_at: string;
}

export default function StorageDashboard() {
  const [databaseData, setDatabaseData] = useState<DatabaseMetrics | null>(null);
  const [recentMetrics, setRecentMetrics] = useState<RecentDatabaseMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [environment] = useState<'dev' | 'prod'>('prod');
  const [timeRange, setTimeRange] = useState(30);

  // Mock storage limits for demonstration (in bytes)
  const STORAGE_LIMITS = {
    dev: 1024 * 1024 * 1024 * 10, // 10 GB for dev
    prod: 1024 * 1024 * 1024 * 100, // 100 GB for prod
  };

  const fetchDatabaseData = useCallback(async () => {
    try {
      const response = await fetch(`/api/analytics/database?environment=${environment}&days=${timeRange}`, {
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
      if (result.success) {
        setDatabaseData(result.summary);
        setRecentMetrics(result.recentMetrics || []);
      }
    } catch (error) {
      console.error('Error fetching database data:', error);
      toast.error('Failed to fetch database data');
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
    fetchDatabaseData().finally(() => setLoading(false));
  }, [fetchDatabaseData]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) { return '0 Bytes' };
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-green-600';
      case 'decreasing':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getUsagePercentage = (used: number, total: number) => {
    return Math.min((used / total) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) { return 'bg-red-500' };
    if (percentage >= 75) { return 'bg-yellow-500' };
    if (percentage >= 50) { return 'bg-blue-500' };
    return 'bg-green-500';
  };

  const getUsageTextColor = (percentage: number) => {
    if (percentage >= 90) { return 'text-red-600' };
    if (percentage >= 75) { return 'text-yellow-600' };
    if (percentage >= 50) { return 'text-blue-600' };
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading Storage Dashboard...</span>
        </div>
      </div>
    );
  }

  const currentStorageLimit = STORAGE_LIMITS[environment];
  const usagePercentage = databaseData ? getUsagePercentage(databaseData.latest_total_size_bytes, currentStorageLimit) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav onLogout={handleLogout} />

      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Storage Dashboard</h1>
                <p className="text-gray-600">Database storage usage and performance metrics</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
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
              <Button onClick={fetchDatabaseData} disabled={loading} size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Database Usage Statistics */}
          {databaseData && (
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center gap-3 mb-6">
                <DatabaseIcon className="h-6 w-6 text-indigo-600" />
                <h2 className="text-xl font-semibold">Database Usage Statistics</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Database Size</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {formatBytes(databaseData.latest_total_size_bytes)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {usagePercentage.toFixed(1)}% of limit
                  </p>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Active Tables</p>
                  <p className="text-2xl font-bold text-green-600">
                    {databaseData.latest_table_count}
                  </p>
                  <p className="text-xs text-gray-500">
                    Avg: {databaseData.avg_table_count}
                  </p>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Connections</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {databaseData.latest_active_connections}
                  </p>
                  <p className="text-xs text-gray-500">
                    Avg: {databaseData.avg_active_connections}
                  </p>
                </div>

                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Cache Hit Rate</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {formatPercentage(databaseData.latest_cache_hit_ratio)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Avg: {formatPercentage(databaseData.avg_cache_hit_ratio)}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Storage Growth</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {getTrendIcon(databaseData.size_trend)}
                    <span className={`text-sm font-semibold ${getTrendColor(databaseData.size_trend)}`}>
                      {databaseData.size_trend}
                    </span>
                  </div>
                </div>

                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Available Space</p>
                  <p className="text-lg font-semibold text-green-600">
                    {formatBytes(currentStorageLimit - databaseData.latest_total_size_bytes)}
                  </p>
                </div>

                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Storage Status</p>
                  <p className={`text-lg font-semibold ${usagePercentage >= 90 ? 'text-red-600' :
                    usagePercentage >= 75 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                    {usagePercentage >= 90 ? 'Critical' :
                      usagePercentage >= 75 ? 'Warning' :
                        'Healthy'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Storage Usage Overview */}
          {databaseData && (
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center gap-3 mb-6">
                <HardDrive className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold">Storage Usage Overview</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Current Usage */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Current Database Size</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {formatBytes(databaseData.latest_total_size_bytes)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {getTrendIcon(databaseData.size_trend)}
                      <span className={`text-sm ${getTrendColor(databaseData.size_trend)}`}>
                        {databaseData.size_trend}
                      </span>
                    </div>
                  </div>

                  {/* Usage Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Storage Used</span>
                      <span className={`font-semibold ${getUsageTextColor(usagePercentage)}`}>
                        {usagePercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${getUsageColor(usagePercentage)}`}
                        style={{ width: `${usagePercentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{formatBytes(databaseData.latest_total_size_bytes)} used</span>
                      <span>{formatBytes(currentStorageLimit)} total</span>
                    </div>
                  </div>
                </div>

                {/* Storage Limits */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Storage Limit</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {formatBytes(currentStorageLimit)}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">{environment} environment</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Available Space</span>
                      <span className="font-semibold text-green-600">
                        {formatBytes(currentStorageLimit - databaseData.latest_total_size_bytes)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {((currentStorageLimit - databaseData.latest_total_size_bytes) / currentStorageLimit * 100).toFixed(1)}% remaining
                    </div>
                  </div>
                </div>

                {/* Growth Metrics */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Average Size (Last {timeRange} days)</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatBytes(databaseData.avg_total_size_bytes)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Size Difference</span>
                      <span className={`font-semibold ${databaseData.latest_total_size_bytes > databaseData.avg_total_size_bytes
                        ? 'text-red-600'
                        : 'text-green-600'
                        }`}>
                        {databaseData.latest_total_size_bytes > databaseData.avg_total_size_bytes ? '+' : ''}
                        {formatBytes(databaseData.latest_total_size_bytes - databaseData.avg_total_size_bytes)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      vs average
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Database Storage Metrics */}
          {databaseData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Server className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Tables</p>
                    <p className="text-2xl font-bold">{databaseData.latest_table_count}</p>
                    <p className="text-sm text-gray-500">Avg: {databaseData.avg_table_count}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Network className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Active Connections</p>
                    <p className="text-2xl font-bold">{databaseData.latest_active_connections}</p>
                    <p className="text-sm text-gray-500">Avg: {databaseData.avg_active_connections}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Zap className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">Cache Hit Ratio</p>
                    <p className="text-2xl font-bold">{formatPercentage(databaseData.latest_cache_hit_ratio)}</p>
                    <p className="text-sm text-gray-500">Avg: {formatPercentage(databaseData.avg_cache_hit_ratio)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Activity className="h-8 w-8 text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-600">Storage Efficiency</p>
                    <p className="text-2xl font-bold">{formatPercentage(databaseData.latest_cache_hit_ratio)}</p>
                    <p className="text-sm text-gray-500">Cache performance</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Storage Performance Overview */}
          {databaseData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center gap-3 mb-4">
                  <DatabaseIcon className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-semibold">Storage Performance</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Size:</span>
                    <span className="font-semibold">{formatBytes(databaseData.latest_total_size_bytes)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Size:</span>
                    <span className="font-semibold">{formatBytes(databaseData.avg_total_size_bytes)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Growth Trend:</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(databaseData.size_trend)}
                      <span className={`text-sm font-semibold ${getTrendColor(databaseData.size_trend)}`}>
                        {databaseData.size_trend}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Usage Level:</span>
                    <span className={`text-sm font-semibold ${getUsageTextColor(usagePercentage)}`}>
                      {usagePercentage.toFixed(1)}% of limit
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="h-6 w-6 text-green-600" />
                  <h3 className="text-lg font-semibold">Database Health</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Cache Efficiency:</span>
                    <span className="font-semibold">{formatPercentage(databaseData.latest_cache_hit_ratio)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Connection Load:</span>
                    <span className="font-semibold">{databaseData.latest_active_connections}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Table Count:</span>
                    <span className="font-semibold">{databaseData.latest_table_count}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Storage Status:</span>
                    <span className={`text-sm font-semibold ${usagePercentage >= 90 ? 'text-red-600' :
                      usagePercentage >= 75 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                      {usagePercentage >= 90 ? 'Critical' :
                        usagePercentage >= 75 ? 'Warning' :
                          'Healthy'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Database Metrics Chart */}
          {recentMetrics.length > 0 && (
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Storage Metrics
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Date</th>
                      <th className="text-right py-2">Size</th>
                      <th className="text-right py-2">Usage %</th>
                      <th className="text-right py-2">Tables</th>
                      <th className="text-right py-2">Connections</th>
                      <th className="text-right py-2">Cache Hit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentMetrics.slice(0, 10).map((metric) => {
                      const metricUsagePercentage = getUsagePercentage(metric.total_size_bytes, currentStorageLimit);
                      return (
                        <tr key={metric.id} className="border-b hover:bg-gray-50">
                          <td className="py-2">
                            {new Date(metric.created_at).toLocaleDateString()}
                          </td>
                          <td className="text-right py-2">{formatBytes(metric.total_size_bytes)}</td>
                          <td className="text-right py-2">
                            <span className={`font-semibold ${getUsageTextColor(metricUsagePercentage)}`}>
                              {metricUsagePercentage.toFixed(1)}%
                            </span>
                          </td>
                          <td className="text-right py-2">{metric.table_count}</td>
                          <td className="text-right py-2">{metric.active_connections}</td>
                          <td className="text-right py-2">{formatPercentage(metric.cache_hit_ratio)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
