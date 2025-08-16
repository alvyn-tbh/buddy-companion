import { NextRequest, NextResponse } from 'next/server';
import { getQueueStats } from '@/lib/queue/bull-queue';
import { redisHealthCheck, getRedisInfo } from '@/lib/redis';
import crypto from 'crypto';
import type { Job } from 'bull';

export const runtime = 'nodejs';

// Queue stats interface using Bull Queue Job type
interface QueueStats {
  waiting: Job[];
  active: Job[];
  completed: Job[];
  failed: Job[];
}

// JWT verification function (same as in auth route)
function verifyToken(token: string): boolean {
  try {
    const { JWT_SECRET } = process.env;
    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return false;
    }

    const parts = token.split('.');
    if (parts.length !== 3) { return false };

    const [header, payload, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    return signature === expectedSignature;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('admin-auth')?.value;

    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check Redis health with better error handling
    let redisHealth = false;
    let redisInfo = { url: 'unknown', isConnected: false, isInitialized: false };

    try {
      redisHealth = await redisHealthCheck();
      redisInfo = getRedisInfo();
    } catch (redisError) {
      console.error('Redis health check error:', redisError);
      redisHealth = false;
      redisInfo = {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        isConnected: false,
        isInitialized: false,
      };
    }

    // Get queue statistics (only if Redis is healthy)
    let queueStats: Record<string, QueueStats> = {};
    let summary = {
      totalWaiting: 0,
      totalActive: 0,
      totalCompleted: 0,
      totalFailed: 0,
    };

    if (redisHealth) {
      try {
        queueStats = await getQueueStats() as Record<string, QueueStats>;

        // Calculate summary statistics
        summary = {
          totalWaiting: Object.values(queueStats).reduce((sum: number, queue) => sum + queue.waiting.length, 0),
          totalActive: Object.values(queueStats).reduce((sum: number, queue) => sum + queue.active.length, 0),
          totalCompleted: Object.values(queueStats).reduce((sum: number, queue) => sum + queue.completed.length, 0),
          totalFailed: Object.values(queueStats).reduce((sum: number, queue) => sum + queue.failed.length, 0),
        };
      } catch (queueError) {
        console.error('Queue stats error:', queueError);
        // Continue with empty stats
      }
    }

    const status = {
      timestamp: new Date().toISOString(),
      redis: {
        health: redisHealth,
        info: redisInfo,
      },
      queues: queueStats,
      summary,
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        platform: process.platform,
        nodeVersion: process.version,
      },
    };

    return NextResponse.json(status, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error('Error getting queue status:', error);
    return NextResponse.json(
      {
        error: 'Failed to get queue status',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
} 