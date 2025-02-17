module.exports = {
  apps: [
    {
      name: "open-scroll", // Name of your app in PM2
      cwd: "/var/www/open-scroll", // Working directory
      script: "yarn", // Command to run
      args: "start", // Arguments for the command
      env: {
        NODE_ENV: "production", // Sets production environment
        PORT: 3004, // Port for Next.js
      },
    },
  ],
};
