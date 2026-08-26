/**
 * PM2 Ecosystem Config — MADO Server
 *
 * Usage:
 *   cd server
 *   pm2 start ecosystem.config.cjs          # start
 *   pm2 restart mado-server                 # restart
 *   pm2 reload mado-server                  # zero-downtime reload
 *   pm2 stop mado-server                    # stop
 *   pm2 logs mado-server                    # tail logs
 *   pm2 save && pm2 startup                 # auto-start on reboot
 */

module.exports = {
  apps: [
    {
      // ── Identity ─────────────────────────────────────────────────────────
      name: 'mado-server',
      script: 'src/index.js',

      // ── Runtime ──────────────────────────────────────────────────────────
      // Node >= 18 supports ESM natively; no transpilation needed.
      node_args: '--experimental-vm-modules',

      // ── Instances & clustering ───────────────────────────────────────────
      // 'max' spawns one worker per CPU core.
      // Use instances: 1 if you hit file-write conflicts with local uploads.
      instances: 1,
      exec_mode: 'fork', // use 'cluster' only when sessions are stateless

      // ── Watch & reload ───────────────────────────────────────────────────
      watch: false, // never watch in production
      ignore_watch: ['node_modules', 'uploads', 'logs'],

      // ── Restart policy ───────────────────────────────────────────────────
      autorestart: true,
      max_restarts: 10,
      min_uptime: '5s',     // must stay up ≥ 5 s to count as successful start
      restart_delay: 3000,  // wait 3 s between crash restarts

      // ── Logging ──────────────────────────────────────────────────────────
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // ── Environment: production ──────────────────────────────────────────
      // Secrets are read from server/.env by dotenv inside the app.
      // Do NOT put secrets here — this file is committed to git.
      env_production: {
        NODE_ENV: 'production',
      },

      // ── Environment: development ─────────────────────────────────────────
      env_development: {
        NODE_ENV: 'development',
      },
    },
  ],
};
