import { NextResponse } from 'next/server';
import { getQueueStats } from '@/lib/queue/bull-queue';
import { redisHealthCheck, getRedisInfo } from '@/lib/redis';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Check Redis health
    const redisHealth = await redisHealthCheck();
    const redisInfo = getRedisInfo();
    
    // Get queue statistics
    const queueStats = await getQueueStats();
    
    // Calculate summary statistics
    const summary = {
      totalWaiting: Object.values(queueStats).reduce((sum, queue) => sum + queue.waiting.length, 0),
      totalActive: Object.values(queueStats).reduce((sum, queue) => sum + queue.active.length, 0),
      totalCompleted: Object.values(queueStats).reduce((sum, queue) => sum + queue.completed.length, 0),
      totalFailed: Object.values(queueStats).reduce((sum, queue) => sum + queue.failed.length, 0),
    };
    
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