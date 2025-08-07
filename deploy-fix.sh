#!/bin/bash

echo "🚀 Deploying fixes for Next.js routing issues..."

# 1. Backup current nginx configuration
echo "📋 Backing up current nginx configuration..."
sudo cp /etc/nginx/sites-available/sasasasa-staging /etc/nginx/sites-available/sasasasa-staging.backup.$(date +%Y%m%d_%H%M%S)

# 2. Apply new nginx configuration
echo "🔧 Applying new nginx configuration..."
sudo cp nginx-fix.conf /etc/nginx/sites-available/sasasasa-staging

# 3. Test nginx configuration
echo "🧪 Testing nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"

    # 4. Reload nginx
    echo "🔄 Reloading nginx..."
    sudo systemctl reload nginx

    if [ $? -eq 0 ]; then
        echo "✅ Nginx reloaded successfully"
    else
        echo "❌ Failed to reload nginx"
        exit 1
    fi
else
    echo "❌ Nginx configuration test failed"
    echo "Restoring backup..."
    sudo cp /etc/nginx/sites-available/sasasasa-staging.backup.* /etc/nginx/sites-available/sasasasa-staging
    exit 1
fi

# 5. Rebuild and restart Next.js application
echo "🔨 Rebuilding Next.js application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Next.js build successful"

    # 6. Restart the application (assuming you're using PM2)
    echo "🔄 Restarting application..."
    pm2 restart all

    if [ $? -eq 0 ]; then
        echo "✅ Application restarted successfully"
    else
        echo "❌ Failed to restart application"
        exit 1
    fi
else
    echo "❌ Next.js build failed"
    exit 1
fi

echo "🎉 Deployment completed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Test the application at https://staging.sasasasa.co"
echo "2. Try navigating between pages to ensure client-side routing works"
echo "3. Check that direct URL access works properly"
echo ""
echo "🔍 If issues persist, check:"
echo "- nginx error logs: sudo tail -f /var/log/nginx/sasasasa-staging.error.log"
echo "- application logs: pm2 logs"
echo "- Cloudflare settings (disable proxy for testing)"
