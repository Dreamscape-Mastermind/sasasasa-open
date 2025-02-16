#!/bin/bash
set -euo pipefail  # Exit on error, undefined vars, and pipe failures

# Ensure PROJECT_PATH is set
if [ -z "${PROJECT_PATH:-}" ]; then
    echo "ERROR: PROJECT_PATH is not set"
    exit 1
fi

cd "${PROJECT_PATH}"

# Load environment variables (safer version)
if [ -f .env.production ]; then
    set -a
    source .env.production
    set +a
else
    echo "WARNING: .env.production file not found"
fi

# Install dependencies
yarn install

# Build the application
yarn build

# Restart the application
if pm2 list | grep -q "ecosystem.config.js"; then
    pm2 restart ecosystem.config.js
else
    pm2 start ecosystem.config.js
fi
