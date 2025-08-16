"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Users, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { AdminNav } from '@/components/admin-nav';
import { useRouter } from 'next/navigation';

interface UsageStats {
  totalCost: number;
  usageByType: Record<string, number>;
  usageByUser: Record<string, number>;
  dailyUsage: Array<{ date: string; cost: number }>;
}

interface UserInfo {
  id: string;
  email: string;
  name?: string;
}

export default function UsageDashboard() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [previousStats, setPreviousStats] = useState<UsageStats | null>(null);
  const router = useRouter();

  const handleLogout = () => {
    // Clear admin auth cookie
    document.cookie = 'admin-auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/admin/login');
  };

  const fetchUsageStats = useCallback(async () => {
    try {
      setLoading(true);

      const endDate = new Date();
      const startDate = new Date();

      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      const response = await fetch(`/api/admin/usage?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&userId=${selectedUser !== 'all' ? selectedUser : ''}`);

      if (!response.ok) {
        throw new Error('Failed to fetch usage stats');
      }

      const data = await response.json();
      setStats(data.current);
      setPreviousStats(data.previous);

      // Fetch users if not already loaded
      if (users.length === 0) {
        const usersResponse = await fetch('/api/admin/users');
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData);
        }
      }
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      toast.error('Failed to load usage statistics');
    } finally {
      setLoading(false);
    }
  }, [timeRange, selectedUser, users.length]);

  useEffect(() => {
    fetchUsageStats();
  }, [fetchUsageStats]);

  const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) { return current > 0 ? 100 : 0 };
    return ((current - previous) / previous) * 100;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(amount);
  };

  const getTrendIcon = (percentage: number) => {
    if (percentage > 0) { return <TrendingUp className="h-4 w-4 text-green-600" /> };
    if (percentage < 0) { return <TrendingDown className="h-4 w-4 text-red-600" /> };
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const getTrendColor = (percentage: number) => {
    if (percentage > 0) { return 'text-green-600' };
    if (percentage < 0) { return 'text-red-600' };
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav onLogout={handleLogout} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav onLogout={handleLogout} />
      <div className="container mx-auto p-6 space-y-6 max-w-full px-2 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Usage Dashboard</h1>
            <p className="text-gray-600 text-sm sm:text-base">Monitor API usage and costs</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.totalCost || 0)}</div>
              {previousStats && (
                <div className="flex items-center text-xs text-muted-foreground">
                  {getTrendIcon(calculatePercentageChange(stats?.totalCost || 0, previousStats.totalCost))}
                  <span className={`ml-1 ${getTrendColor(calculatePercentageChange(stats?.totalCost || 0, previousStats.totalCost))}`}>
                    {Math.abs(calculatePercentageChange(stats?.totalCost || 0, previousStats.totalCost)).toFixed(1)}%
                  </span>
                  <span className="ml-1">vs previous period</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(stats?.usageByUser || {}).length}</div>
              <p className="text-xs text-muted-foreground">
                Users with API activity
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Types</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(stats?.usageByType || {}).length}</div>
              <p className="text-xs text-muted-foreground">
                Different API types used
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.dailyUsage.length ? formatCurrency(stats.totalCost / stats.dailyUsage.length) : '$0.00'}
              </div>
              <p className="text-xs text-muted-foreground">
                Average daily cost
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Usage by Type */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage by API Type</CardTitle>
              <CardDescription>Cost breakdown by API type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats?.usageByType || {}).map(([type, cost]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{type}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {((cost / (stats?.totalCost || 1)) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <span className="font-medium">{formatCurrency(cost)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Users</CardTitle>
              <CardDescription>Users with highest usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats?.usageByUser || {})
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([userId, cost]) => {
                    const user = users.find(u => u.id === userId);
                    return (
                      <div key={userId} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {(user?.name || user?.email || 'Unknown').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm">
                            {user?.name || user?.email || 'Unknown User'}
                          </span>
                        </div>
                        <span className="font-medium">{formatCurrency(cost)}</span>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Usage Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Usage Trend</CardTitle>
            <CardDescription>Cost over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end space-x-1 overflow-x-auto">
              {stats?.dailyUsage.map((day) => {
                const maxCost = Math.max(...stats.dailyUsage.map(d => d.cost));
                const height = maxCost > 0 ? (day.cost / maxCost) * 100 : 0;
                return (
                  <div key={day.date} className="flex-1 min-w-[40px] flex flex-col items-center">
                    <div
                      className="w-full bg-blue-500 rounded-t"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-muted-foreground mt-1">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-xs font-medium">
                      {formatCurrency(day.cost)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
