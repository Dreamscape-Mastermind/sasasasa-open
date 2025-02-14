This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

# 🚀 Deploy Next.js on sasasasa.co with nginx and pm2 🌐

Get the Next.js app live on **sasasasa.co** using **nginx** and **pm2**. Let's dive in! ⚡️

---

## Prerequisites 🛠️

- **Domain**: `sasasasa.co` pointing to the server.
- **Server**: SSH access to a Linux server (Ubuntu).
- **User**: Non-root user with `sudo` privileges.

---

## Steps 📋

### 1️⃣ Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

### 2️⃣ Install Node.js and Yarn 🐢

#### Install NVM (Node Version Manager)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash

# Load NVM
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
```

#### Install Node.js LTS Version

```bash
nvm install --lts
node -v
```

#### Install Yarn

```bash
npm install -g yarn
yarn -v
```

### 3️⃣ Clone the Next.js App 📦

```bash
cd ~
git clone https://github.com/username/nextjs-app.git sasasasa-app
cd sasasasa-app
```

### 4️⃣ Install Dependencies and Build 🛠️

```bash
yarn install
yarn build
```

### 5️⃣ Install pm2 🌳

```bash
npm install -g pm2
pm2 -v
```

### 6️⃣ Start the App with pm2 🚀

#### Start the App

```bash
pm2 start yarn --name "sasasasa-app" -- start
```

- **Explanation**:
  - `pm2 start`: Command to start a new process.
  - `yarn`: The process to run.
  - `--name "sasasasa-app"`: Assigns a name to the process.
  - `-- start`: Passes the `start` command to `yarn`.

#### Check pm2 Status

```bash
pm2 status
```

The app should be listed and running.

### 7️⃣ Set pm2 to Start on Boot 🔄

```bash
pm2 startup

# Follow the instructions displayed, e.g.:
sudo env PATH=$PATH:/home/username/.nvm/versions/node/vX.X.X/bin pm2 startup systemd -u username --hp /home/username
```

- **Save the pm2 process list**:

  ```bash
  pm2 save
  ```

### 8️⃣ Install nginx 🕸️

```bash
sudo apt install nginx -y
```

### 9️⃣ Configure nginx 📝

#### Create nginx Server Block

```bash
sudo nano /etc/nginx/sites-available/sasasasa.co
```

#### Add the Following Configuration

```nginx
server {
    listen 80;
    server_name sasasasa.co www.sasasasa.co;

    location / {
        proxy_pass http://localhost:3000;  # Next.js default port
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}
```

#### Enable the nginx Configuration

```bash
sudo ln -s /etc/nginx/sites-available/sasasasa.co /etc/nginx/sites-enabled/
```

#### Test nginx Configuration and Restart

```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 🔟 Secure with SSL 🔒

#### Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

#### Obtain SSL Certificate

```bash
sudo certbot --nginx -d sasasasa.co -d www.sasasasa.co
```

- Follow the prompts to set up HTTPS.
- Certbot will automatically configure nginx for SSL.

### 1️⃣1️⃣ Verify Everything is Running ✅

- Visit **https://sasasasa.co** in a browser.
- The Next.js app should be live! 🎉

---

## pm2 Basics for Beginners 📖

### Check Running Processes

```bash
pm2 list
```

### View Logs

```bash
pm2 logs sasasasa-app
```

### Restart the App

```bash
pm2 restart sasasasa-app
```

### Stop the App

```bash
pm2 stop sasasasa-app
```

### Delete the App from pm2

```bash
pm2 delete sasasasa-app
```

---

## Troubleshooting and Additional Setup 🛠️


## Updating the Live Application 🔄

When you need to update the live application with the latest changes from your Git repository, follow these steps:

### 1️⃣ Pull Latest Changes

```bash
cd ~/sasasasa-app
git pull origin main  # Replace 'main' with your branch name if different
```

### 2️⃣ Install New Dependencies (if any)

```bash
yarn install
```

### 3️⃣ Rebuild the Application

```bash
yarn build
```

### 4️⃣ Restart the pm2 Process

```bash
pm2 restart sasasasa-app
```

### 5️⃣ Verify the Update

- Check the pm2 status:
  ```bash
  pm2 status
  ```
- View logs for any errors:
  ```bash
  pm2 logs sasasasa-app
  ```
- Visit your website to ensure everything is working correctly.

### ⚠️ Rollback (if needed)

If you encounter issues after updating:

1. Revert to the previous Git commit:
   ```bash
   git reset --hard HEAD~1
   ```
2. Rebuild and restart:
   ```bash
   yarn build
   pm2 restart sasasasa-app
   ```

### 🔁 Automating Updates (Optional)

For more frequent updates, consider creating a bash script:

```bash
#!/bin/bash
# File: update_app.sh

cd ~/sasasasa-app
git pull origin main
yarn install
yarn build
pm2 restart sasasasa-app

echo "Application updated and restarted!"
```

Make it executable:
```bash
chmod +x update_app.sh
```

Run it to update:
```bash
./update_app.sh
```

Remember to always test updates in a staging environment before applying them to production!


### Linux Configuration and Essential Packages 🖥️

If encountering issues due to missing dependencies or for setting up a fresh Ubuntu server with necessary tools, follow these steps:

#### Install Essential Packages

##### Install git 📂

```bash
sudo apt install git -y
```

##### Install Build Essentials 🛠️

```bash
sudo apt install build-essential -y
```

##### Install curl and Other Utilities 🌐

```bash
sudo apt install curl software-properties-common -y
```

#### Install TypeScript 📘

TypeScript is commonly used in Next.js applications.

```bash
npm install -g typescript
tsc -v
```

#### Install Python 🐍

Python is required by some tools and useful for scripts.

```bash
sudo apt install python3 python3-pip -y
```

Verify Installation:

```bash
python3 --version
pip3 --version
```

#### Install Security and Monitoring Tools 🔒

##### Install UFW (Uncomplicated Firewall)

```bash
sudo apt install ufw -y
```

Enable UFW and allow necessary services:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

##### Install Fail2Ban

Protect the server from brute-force attacks.

```bash
sudo apt install fail2ban -y
```

##### Install htop (Interactive Process Viewer)

```bash
sudo apt install htop -y
```

##### Install Logwatch (Log Monitoring)

```bash
sudo apt install logwatch -y
```

##### Install Certbot for SSL Certificates

Already installed in previous steps, but if not:

```bash
sudo apt install certbot python3-certbot-nginx -y
```

---

## Additional pm2 Commands 🌟

- **Monitor Resource Usage**

  ```bash
  pm2 monit
  ```

- **Update pm2**

  ```bash
  pm2 update
  ```

- **Auto-Completion**

  ```bash
  pm2 completion install
  ```



## Summary 📝

- **Update System**
  - `sudo apt update && sudo apt upgrade -y`
- **Install NVM, Node.js, and Yarn**
  - Use NVM to manage Node.js versions.
- **Clone and Build the App**
  - `git clone`, `yarn install`, `yarn build`
- **Use pm2 to Manage the App**
  - `pm2 start yarn --name "sasasasa-app" -- start`
  - Set pm2 to start on boot with `pm2 startup` and `pm2 save`
- **Configure nginx**
  - Set up reverse proxy to the app.
- **Secure with SSL**
  - Use Certbot to obtain and configure SSL certificates.
- **Troubleshooting**
  - Install essential packages and security tools if issues arise.

