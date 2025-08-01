module.exports = {
  apps: [
    {
      name: "sasasasa-production", // Name of your app in PM2
      cwd: "/var/www/sasasasa/production", // Working directory
      script: "yarn", // Command to run
      args: "start", // Arguments for the command
      env: {
        NODE_ENV: "production", // Sets production environment
        PORT: 3000, // Port for Next.js
      },
    },
  ],
};
