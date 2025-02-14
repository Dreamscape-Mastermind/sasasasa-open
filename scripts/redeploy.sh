#!/bin/bash
# File: update_app.sh

cd /var/www/sasasasa-ui
git pull origin main
yarn install
yarn build
pm2 restart sasasasa-ui

echo "Sasasasa UI updated and restarted!"
