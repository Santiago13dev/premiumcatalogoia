module.exports = {
  apps: [{
    name: 'ai-catalog-api',
    script: './server/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    kill_timeout: 5000,
    listen_timeout: 5000,
    shutdown_with_message: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    cron_restart: '0 3 * * *',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    node_args: '--max_old_space_size=4096',
    
    // Monitoring
    monitoring: true,
    max_memory_usage: '90%',
    
    // Graceful shutdown
    wait_ready: true,
    shutdown_with_message: true,
    
    // Health check
    health_check: {
      interval: 30000,
      url: 'http://localhost:3000/health',
      max_consecutive_failures: 3
    }
  }]
};