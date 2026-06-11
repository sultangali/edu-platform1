// PM2 process configuration for the EduKZ backend (Express API).
//
//   pm2 start ecosystem.config.cjs        # first run
//   pm2 reload ecosystem.config.cjs       # zero-downtime redeploy
//   pm2 save && pm2 startup               # persist across reboots
//
// The frontend is a static build served directly by nginx, so it is NOT a PM2
// process. Only the API runs under PM2.

module.exports = {
  apps: [
    {
      name: 'edu-api',
      cwd: './backend',
      script: 'src/server.js',
      // src/server.js calls dotenv, so backend/.env is the source of truth for
      // secrets. NODE_ENV here just flips Express into production mode.
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '400M',
      // Keep restarts sane if the DB is briefly unavailable on boot.
      restart_delay: 3000,
      max_restarts: 10,
      out_file: './logs/edu-api.out.log',
      error_file: './logs/edu-api.err.log',
      merge_logs: true,
      time: true
    }
  ]
};
