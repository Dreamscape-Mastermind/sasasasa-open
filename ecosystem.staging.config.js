module.exports = {
  apps: [
    {
      name: "sasasasa-staging", // Name of your app in PM2
      cwd: "/var/www/sasasasa/staging", // Working directory
      script: "yarn", // Command to run
      args: "start", // Arguments for the command
      env: {
        NODE_ENV: "production", // Sets production environment for Next.js
        PORT: 3001, // Port for Next.js staging
        DEPLOYMENT_ENV: "staging", // Custom environment identifier
      },
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "1G",
      error_file: "/var/log/pm2/sasasasa-staging-error.log",
      out_file: "/var/log/pm2/sasasasa-staging-out.log",
      log_file: "/var/log/pm2/sasasasa-staging-combined.log",
      time: true,
    },
  ],
};
