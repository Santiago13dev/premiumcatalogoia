import mongoose from 'mongoose';
import Redis from 'ioredis';
import os from 'os';
import fs from 'fs/promises';

class HealthChecker {
  constructor() {
    this.checks = new Map();
    this.setupChecks();
  }
  
  setupChecks() {
    // Database check
    this.checks.set('database', async () => {
      try {
        const state = mongoose.connection.readyState;
        const states = {
          0: 'disconnected',
          1: 'connected',
          2: 'connecting',
          3: 'disconnecting'
        };
        
        const isHealthy = state === 1;
        const dbStats = await mongoose.connection.db.stats();
        
        return {
          status: isHealthy ? 'healthy' : 'unhealthy',
          state: states[state],
          details: {
            collections: dbStats.collections,
            dataSize: dbStats.dataSize,
            indexes: dbStats.indexes
          }
        };
      } catch (error) {
        return {
          status: 'unhealthy',
          error: error.message
        };
      }
    });
    
    // Redis check
    this.checks.set('redis', async () => {
      try {
        const redis = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT || 6379
        });
        
        const pong = await redis.ping();
        const info = await redis.info('server');
        await redis.quit();
        
        return {
          status: pong === 'PONG' ? 'healthy' : 'unhealthy',
          details: {
            version: info.match(/redis_version:(.+)/)?.[1],
            uptime: info.match(/uptime_in_seconds:(\d+)/)?.[1]
          }
        };
      } catch (error) {
        return {
          status: 'unhealthy',
          error: error.message
        };
      }
    });
    
    // Memory check
    this.checks.set('memory', async () => {
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const memoryUsagePercent = (usedMemory / totalMemory) * 100;
      
      return {
        status: memoryUsagePercent < 90 ? 'healthy' : 'warning',
        details: {
          total: `${(totalMemory / 1024 / 1024 / 1024).toFixed(2)} GB`,
          free: `${(freeMemory / 1024 / 1024 / 1024).toFixed(2)} GB`,
          used: `${(usedMemory / 1024 / 1024 / 1024).toFixed(2)} GB`,
          percentage: `${memoryUsagePercent.toFixed(2)}%`
        }
      };
    });
    
    // CPU check
    this.checks.set('cpu', async () => {
      const cpus = os.cpus();
      const loadAverage = os.loadavg();
      
      return {
        status: loadAverage[0] < cpus.length * 0.8 ? 'healthy' : 'warning',
        details: {
          cores: cpus.length,
          model: cpus[0].model,
          loadAverage: {
            '1min': loadAverage[0].toFixed(2),
            '5min': loadAverage[1].toFixed(2),
            '15min': loadAverage[2].toFixed(2)
          }
        }
      };
    });
    
    // Disk check
    this.checks.set('disk', async () => {
      try {
        const stats = await fs.statfs('/');
        const totalSpace = stats.blocks * stats.bsize;
        const freeSpace = stats.bavail * stats.bsize;
        const usedSpace = totalSpace - freeSpace;
        const usagePercent = (usedSpace / totalSpace) * 100;
        
        return {
          status: usagePercent < 80 ? 'healthy' : 'warning',
          details: {
            total: `${(totalSpace / 1024 / 1024 / 1024).toFixed(2)} GB`,
            free: `${(freeSpace / 1024 / 1024 / 1024).toFixed(2)} GB`,
            used: `${(usedSpace / 1024 / 1024 / 1024).toFixed(2)} GB`,
            percentage: `${usagePercent.toFixed(2)}%`
          }
        };
      } catch (error) {
        return {
          status: 'unknown',
          error: error.message
        };
      }
    });
    
    // External APIs check
    this.checks.set('external_apis', async () => {
      const apis = [
        { name: 'OpenAI', url: 'https://api.openai.com/v1/models', requiresAuth: true },
        { name: 'Anthropic', url: 'https://api.anthropic.com/v1/messages', requiresAuth: true },
        { name: 'HuggingFace', url: 'https://api-inference.huggingface.co/', requiresAuth: true }
      ];
      
      const results = {};
      
      for (const api of apis) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(api.url, {
            method: 'HEAD',
            signal: controller.signal
          });
          
          clearTimeout(timeout);
          
          results[api.name] = {
            status: response.ok || response.status === 401 ? 'healthy' : 'unhealthy',
            responseTime: response.headers.get('x-response-time') || 'N/A'
          };
        } catch (error) {
          results[api.name] = {
            status: 'unhealthy',
            error: error.message
          };
        }
      }
      
      const allHealthy = Object.values(results).every(r => r.status === 'healthy');
      
      return {
        status: allHealthy ? 'healthy' : 'degraded',
        details: results
      };
    });
  }
  
  // Run all checks
  async runAllChecks() {
    const results = {};
    let overallStatus = 'healthy';
    
    for (const [name, check] of this.checks) {
      try {
        results[name] = await check();
        
        if (results[name].status === 'unhealthy') {
          overallStatus = 'unhealthy';
        } else if (results[name].status === 'warning' && overallStatus !== 'unhealthy') {
          overallStatus = 'degraded';
        }
      } catch (error) {
        results[name] = {
          status: 'error',
          error: error.message
        };
        overallStatus = 'unhealthy';
      }
    }
    
    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: results,
      uptime: process.uptime(),
      version: process.env.APP_VERSION || '1.0.0'
    };
  }
  
  // Liveness probe (simple check)
  async getLiveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString()
    };
  }
  
  // Readiness probe (check if ready to serve traffic)
  async getReadiness() {
    const dbCheck = await this.checks.get('database')();
    const redisCheck = await this.checks.get('redis')();
    
    const isReady = dbCheck.status === 'healthy' && redisCheck.status === 'healthy';
    
    return {
      ready: isReady,
      timestamp: new Date().toISOString(),
      checks: {
        database: dbCheck.status,
        redis: redisCheck.status
      }
    };
  }
}

export default new HealthChecker();