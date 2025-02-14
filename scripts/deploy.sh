#!/bin/bash

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash

# Load NVM
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"

# Install Node.js LTS and Yarn
nvm install --lts
node -v
npm install -g yarn
yarn -v

# Clone the Next.js app
cd ~
git clone git@github.com:Dreamscape-Mastermind/sasasasa-ui.git sasasasa-app
cd sasasasa-app

# Install dependencies and build the app
yarn install
yarn build

# Install pm2
npm install -g pm2
pm2 -v

# Start the app with pm2
pm2 start yarn --name "sasasasa-app" -- start
pm2 status

# Set pm2 to start on boot
pm2 startup << EOF
sudo env PATH=$PATH:$(dirname $(which node)) pm2 startup systemd -u $(whoami) --hp $HOME
EOF
pm2 save

# Install nginx
sudo apt install nginx -y

# Configure nginx
sudo tee /etc/nginx/sites-available/sasasasa.co > /dev/null << 'EOF'
server {
    listen 80;
    server_name sasasasa.co www.sasasasa.co;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}
EOF

# Enable nginx configuration
sudo ln -s /etc/nginx/sites-available/sasasasa.co /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Install Certbot and obtain SSL certificate
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d sasasasa.co -d www.sasasasa.co --non-interactive --agree-tos -m connect@dreamscapemastermind.com

echo "Sasasasa UI Deployment complete! Visit https://sasasasa.co"
