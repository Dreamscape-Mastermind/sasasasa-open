module.exports = {
  apps: [
    {
      name: "sasasasa-production", // Name of your app in PM2
      cwd: "/var/www/sasasasa/production", // Working directory
      script: "yarn", // Command to run
      args: "start", // Arguments for the command
      env: {
        NODE_ENV: "production", // Sets production environment for Next.js
        PORT: 3002, // Port for Next.js production
        DEPLOYMENT_ENV: "production", // Custom environment identifier
      },
      max_memory_restart: "1G",
      error_file: "/var/log/pm2/sasasasa-production-error.log",
      out_file: "/var/log/pm2/sasasasa-production-out.log",
      log_file: "/var/log/pm2/sasasasa-production-combined.log",
      time: true,
    },
  ],
};
