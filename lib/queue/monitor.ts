import { getQueueStats, closeQueues } from './bull-queue';
import { initRedis, closeRedis, redisHealthCheck } from '../redis';

class QueueMonitor {
  private interval: NodeJS.Timeout | null = null;
  private isRunning = false;

  async start(intervalMs: number = 5000) {
    if (this.isRunning) {
      console.log('⚠️ Monitor is already running');
      return;
    }

    try {
      await initRedis();
      this.isRunning = true;
      
      console.log('🔍 Starting Queue Monitor...');
      console.log('📊 Monitoring queues every', intervalMs, 'ms');
      
      this.interval = setInterval(async () => {
        await this.logStats();
      }, intervalMs);

      // Initial stats
      await this.logStats();
      
    } catch (error) {
      console.error('❌ Failed to start monitor:', error);
      process.exit(1);
    }
  }

  async stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    this.isRunning = false;
    console.log('🛑 Queue Monitor stopped');
    
    await closeQueues();
    await closeRedis();
  }

  private async logStats() {
    try {
      const redisHealth = await redisHealthCheck();
      const stats = await getQueueStats();
      
      console.clear();
      console.log('='.repeat(60));
      console.log('🔍 QUEUE MONITOR -', new Date().toLocaleString());
      console.log('='.repeat(60));
      
      // Redis Health
      console.log(`🔴 Redis Health: ${redisHealth ? '✅ Connected' : '❌ Disconnected'}`);
      console.log('');
      
      // Queue Statistics
      console.log('📊 QUEUE STATISTICS:');
      console.log('-'.repeat(40));
      
      Object.entries(stats).forEach(([queueName, queueStats]) => {
        const waiting = queueStats.waiting.length;
        const active = queueStats.active.length;
        const completed = queueStats.completed.length;
        const failed = queueStats.failed.length;
        
        console.log(`📋 ${queueName.toUpperCase()}:`);
        console.log(`   ⏳ Waiting: ${waiting}`);
        console.log(`   🔄 Active: ${active}`);
        console.log(`   ✅ Completed: ${completed}`);
        console.log(`   ❌ Failed: ${failed}`);
        console.log(`   📈 Total: ${waiting + active + completed + failed}`);
        console.log('');
      });
      
      // Summary
      const totalWaiting = Object.values(stats).reduce((sum, queue) => sum + queue.waiting.length, 0);
      const totalActive = Object.values(stats).reduce((sum, queue) => sum + queue.active.length, 0);
      const totalCompleted = Object.values(stats).reduce((sum, queue) => sum + queue.completed.length, 0);
      const totalFailed = Object.values(stats).reduce((sum, queue) => sum + queue.failed.length, 0);
      
      console.log('📈 SUMMARY:');
      console.log('-'.repeat(40));
      console.log(`⏳ Total Waiting: ${totalWaiting}`);
      console.log(`🔄 Total Active: ${totalActive}`);
      console.log(`✅ Total Completed: ${totalCompleted}`);
      console.log(`❌ Total Failed: ${totalFailed}`);
      console.log(`📊 Total Jobs: ${totalWaiting + totalActive + totalCompleted + totalFailed}`);
      
      // Performance indicators
      if (totalWaiting > 10) {
        console.log('⚠️  High queue load detected!');
      }
      
      if (totalFailed > 5) {
        console.log('🚨 High failure rate detected!');
      }
      
      console.log('='.repeat(60));
      
    } catch (error) {
      console.error('❌ Error getting queue stats:', error);
    }
  }

  // Get current stats without logging
  async getCurrentStats() {
    try {
      const redisHealth = await redisHealthCheck();
      const stats = await getQueueStats();
      
      return {
        timestamp: new Date().toISOString(),
        redisHealth,
        queues: stats,
        summary: {
          totalWaiting: Object.values(stats).reduce((sum, queue) => sum + queue.waiting.length, 0),
          totalActive: Object.values(stats).reduce((sum, queue) => sum + queue.active.length, 0),
          totalCompleted: Object.values(stats).reduce((sum, queue) => sum + queue.completed.length, 0),
          totalFailed: Object.values(stats).reduce((sum, queue) => sum + queue.failed.length, 0),
        }
      };
    } catch (error) {
      console.error('❌ Error getting current stats:', error);
      return null;
    }
  }
}

// CLI usage
if (require.main === module) {
  const monitor = new QueueMonitor();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down...');
    await monitor.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down...');
    await monitor.stop();
    process.exit(0);
  });
  
  // Start monitoring
  const interval = process.argv[2] ? parseInt(process.argv[2]) : 5000;
  monitor.start(interval);
}

export { QueueMonitor };
