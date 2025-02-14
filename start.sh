#!/bin/bash

cd /var/www/open-scroll

# Load environment variables
export $(grep -v '^#' .env.production | xargs)

# Install dependencies
yarn install

# Build the application
yarn build

# Restart the application (adjust the command based on your setup)
pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js
