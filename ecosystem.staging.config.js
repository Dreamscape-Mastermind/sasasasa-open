module.exports = {
  apps: [
    {
      name: "sasasasa-staging", // Name of your app in PM2
      cwd: "/var/www/sasasasa/staging", // Working directory
      script: "yarn", // Command to run
      args: "start", // Arguments for the command
      env: {
        NODE_ENV: "production", // Sets production environment
        PORT: 3001, // Port for Next.js
      },
    },
  ],
};
