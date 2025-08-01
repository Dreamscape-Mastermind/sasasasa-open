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

# Determine environment and select appropriate ecosystem config
DEPLOYMENT_ENV="${NODE_ENV:-production}"

if [ "${DEPLOYMENT_ENV}" = "staging" ]; then
    ECOSYSTEM_CONFIG="ecosystem.staging.config.js"
    APP_NAME="sasasasa-staging"
    # Set NODE_ENV to production for Next.js build (staging is still a production-like environment)
    export NODE_ENV="production"
elif [ "${DEPLOYMENT_ENV}" = "production" ]; then
    ECOSYSTEM_CONFIG="ecosystem.config.js"
    APP_NAME="sasasasa-production"
    export NODE_ENV="production"
else
    # Default to production if NODE_ENV is not set
    ECOSYSTEM_CONFIG="ecosystem.config.js"
    APP_NAME="sasasasa-production"
    export NODE_ENV="production"
    echo "WARNING: NODE_ENV not set, defaulting to production"
fi

echo "Deployment environment: ${DEPLOYMENT_ENV}"
echo "Using ecosystem config: ${ECOSYSTEM_CONFIG}"
echo "App name: ${APP_NAME}"
echo "Next.js NODE_ENV: ${NODE_ENV}"

# Restart the application
if pm2 list | grep -q "${APP_NAME}"; then
    pm2 restart "${ECOSYSTEM_CONFIG}"
else
    pm2 start "${ECOSYSTEM_CONFIG}"
fi
