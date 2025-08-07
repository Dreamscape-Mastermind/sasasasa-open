#!/bin/bash
set -euo pipefail  # Exit on error, undefined vars, and pipe failures

# Ensure PROJECT_PATH is set
if [ -z "${PROJECT_PATH:-}" ]; then
    echo "ERROR: PROJECT_PATH is not set"
    exit 1
fi

cd "${PROJECT_PATH}"

# Determine environment and select appropriate configuration
DEPLOYMENT_ENV="${NODE_ENV:-production}"

# Set environment-specific variables
if [ "${DEPLOYMENT_ENV}" = "staging" ]; then
    ECOSYSTEM_CONFIG="ecosystem.staging.config.js"
    APP_NAME="sasasasa-staging"
    ENV_FILE=".env.staging"
    PORT=3001
    # Set NODE_ENV to production for Next.js build (staging is still a production-like environment)
    export NODE_ENV="production"
elif [ "${DEPLOYMENT_ENV}" = "production" ]; then
    ECOSYSTEM_CONFIG="ecosystem.config.js"
    APP_NAME="sasasasa-production"
    ENV_FILE=".env.production"
    PORT=3000
    export NODE_ENV="production"
else
    # Default to production if NODE_ENV is not set
    ECOSYSTEM_CONFIG="ecosystem.config.js"
    APP_NAME="sasasasa-production"
    ENV_FILE=".env.production"
    PORT=3000
    export NODE_ENV="production"
    echo "WARNING: NODE_ENV not set, defaulting to production"
fi

echo "Deployment environment: ${DEPLOYMENT_ENV}"
echo "Using ecosystem config: ${ECOSYSTEM_CONFIG}"
echo "App name: ${APP_NAME}"
echo "Next.js NODE_ENV: ${NODE_ENV}"
echo "Port: ${PORT}"
echo "Environment file: ${ENV_FILE}"

# Load environment variables based on deployment environment
if [ -f "${ENV_FILE}" ]; then
    echo "Loading environment variables from ${ENV_FILE}"
    set -a
    source "${ENV_FILE}"
    set +a
else
    echo "WARNING: ${ENV_FILE} file not found"
    # Fallback to .env.production if the specific env file doesn't exist
    if [ -f ".env.production" ]; then
        echo "Falling back to .env.production"
        set -a
        source ".env.production"
        set +a
    else
        echo "WARNING: No environment file found"
    fi
fi

# Install dependencies
echo "Installing dependencies..."
yarn install

# Build the application
echo "Building application..."
yarn build

# Restart the application
echo "Starting/restarting application with PM2..."
if pm2 list | grep -q "${APP_NAME}"; then
    echo "Restarting existing PM2 process: ${APP_NAME}"
    pm2 restart "${ECOSYSTEM_CONFIG}"
else
    echo "Starting new PM2 process: ${APP_NAME}"
    pm2 start "${ECOSYSTEM_CONFIG}"
fi

echo "Deployment completed successfully!"
echo "App: ${APP_NAME}"
echo "Environment: ${DEPLOYMENT_ENV}"
echo "Port: ${PORT}"
