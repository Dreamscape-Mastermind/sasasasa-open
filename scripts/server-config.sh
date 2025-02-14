#!/bin/bash

# Install git
sudo apt install git -y

# Install build essentials
sudo apt install build-essential -y

# Install curl and other utilities
sudo apt install curl software-properties-common -y

# Install TypeScript
npm install -g typescript
tsc -v

# Install Python
sudo apt install python3 python3-pip -y
python3 --version
pip3 --version

# Install UFW (Uncomplicated Firewall)
sudo apt install ufw -y
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Install Fail2Ban
sudo apt install fail2ban -y

# Install htop
sudo apt install htop -y

# Install Logwatch
sudo apt install logwatch -y

# Update pm2 and enable auto-completion
pm2 update
pm2 completion install

echo "Server config setup complete!"
