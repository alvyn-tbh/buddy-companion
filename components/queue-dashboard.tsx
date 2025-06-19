"use client";

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { RefreshCw, Activity, AlertTriangle, CheckCircle, Clock, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Bull Queue Job interface
interface BullJob {
  id: string | number;
  data: Record<string, unknown>;
  opts: Record<string, unknown>;
  progress: number;
  delay: number;
  timestamp: number;
  processedOn?: number;
  finishedOn?: number;
  failedReason?: string;
  stacktrace?: string[];
  returnvalue?: unknown;
  attemptsMade: number;
  name: string;
  queue: {
    name: string;
  };
}

interface QueueStats {
  waiting: BullJob[];
  active: BullJob[];
  completed: BullJob[];
  failed: BullJob[];
}

interface QueueStatus {
  timestamp: string;
  redis: {
    health: boolean;
    info: {
      url: string;
      isConnected: boolean;
    };
  };
  queues: {
    openaiChat: QueueStats;
    audioProcessing: QueueStats;
    largeRequests: QueueStats;
    analytics: QueueStats;
  };
  summary: {
    totalWaiting: number;
    totalActive: number;
    totalCompleted: number;
    totalFailed: number;
  };
  system: {
    uptime: number;
    memory: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    platform: string;
    nodeVersion: string;
  };
}

export function QueueDashboard() {
  const [status, setStatus] = useState<QueueStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const router = useRouter();

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/queue/status');
      if (!response.ok) {
        if (response.status === 401) {
          // Redirect to login if unauthorized
          router.push('/admin/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
      });
      
      if (response.ok) {
        toast.success('Logged out successfully');
        router.push('/admin/login');
      } else {
        toast.error('Logout failed');
      }
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="font-semibold">Error Loading Queue Status</h3>
        </div>
        <p className="text-red-600 mt-2">{error}</p>
        <Button onClick={fetchStatus} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Queue Dashboard</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto Refresh On' : 'Auto Refresh Off'}
          </Button>
          <Button onClick={fetchStatus} disabled={loading} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {status && (
        <>
          {/* Redis Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white border rounded-lg">
              <div className="flex items-center gap-2">
                {status.redis.health ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
                <h3 className="font-semibold">Redis Status</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {status.redis.health ? 'Connected' : 'Disconnected'}
              </p>
              <p className="text-xs text-gray-500 mt-1 truncate">
                {status.redis.info.url}
              </p>
            </div>

            <div className="p-4 bg-white border rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">System Uptime</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {formatUptime(status.system.uptime)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Node {status.system.nodeVersion}
              </p>
            </div>

            <div className="p-4 bg-white border rounded-lg">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold">Memory Usage</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {formatBytes(status.system.memory.heapUsed)} / {formatBytes(status.system.memory.heapTotal)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                RSS: {formatBytes(status.system.memory.rss)}
              </p>
            </div>
          </div>

          {/* Queue Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">Waiting</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {status.summary.totalWaiting}
              </p>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-800">Active</h3>
              </div>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {status.summary.totalActive}
              </p>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-800">Completed</h3>
              </div>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {status.summary.totalCompleted}
              </p>
            </div>

            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-red-800">Failed</h3>
              </div>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {status.summary.totalFailed}
              </p>
            </div>
          </div>

          {/* Queue Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(status.queues).map(([queueName, queueStats]) => (
              <div key={queueName} className="p-4 bg-white border rounded-lg">
                <h3 className="font-semibold text-lg mb-3 capitalize">
                  {queueName.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{queueStats.waiting.length}</p>
                    <p className="text-sm text-gray-600">Waiting</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">{queueStats.active.length}</p>
                    <p className="text-sm text-gray-600">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{queueStats.completed.length}</p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{queueStats.failed.length}</p>
                    <p className="text-sm text-gray-600">Failed</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Last Updated */}
          <div className="text-center text-sm text-gray-500">
            Last updated: {new Date(status.timestamp).toLocaleString()}
          </div>
        </>
      )}
    </div>
  );
}