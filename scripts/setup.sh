#!/bin/bash

# Initial setup script for new environments

set -e

echo "==============================================="
echo "Premium Catalog IA - Environment Setup"
echo "==============================================="

# Update system
echo "Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y

# Install Node.js
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
echo "Installing MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Redis
echo "Installing Redis..."
sudo apt-get install -y redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Install NGINX
echo "Installing NGINX..."
sudo apt-get install -y nginx

# Install PM2
echo "Installing PM2..."
sudo npm install -g pm2
pm2 startup systemd -u $USER --hp /home/$USER

# Install Certbot
echo "Installing Certbot..."
sudo apt-get install -y certbot python3-certbot-nginx

# Create application directory
echo "Creating application directory..."
sudo mkdir -p /var/www/premiumcatalogoia
sudo chown -R $USER:$USER /var/www/premiumcatalogoia

# Clone repository
echo "Cloning repository..."
cd /var/www/premiumcatalogoia
git clone https://github.com/Santiago13dev/premiumcatalogoia.git .

# Install dependencies
echo "Installing dependencies..."
npm install
cd server && npm install
cd ..

# Build application
echo "Building application..."
npm run build

# Create environment file
echo "Creating environment file..."
cat > .env << EOL
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/premiumcatalogoia
REDIS_URL=redis://localhost:6379
JWT_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)
EOL

# Setup NGINX
echo "Configuring NGINX..."
sudo cp nginx.conf /etc/nginx/sites-available/premiumcatalogoia
sudo ln -s /etc/nginx/sites-available/premiumcatalogoia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Setup firewall
echo "Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Create backup directory
echo "Creating backup directory..."
sudo mkdir -p /var/backups/premiumcatalogoia
sudo chown -R $USER:$USER /var/backups/premiumcatalogoia

# Setup cron jobs
echo "Setting up cron jobs..."
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/premiumcatalogoia/scripts/backup.sh") | crontab -
(crontab -l 2>/dev/null; echo "*/5 * * * * /var/www/premiumcatalogoia/scripts/health-check.sh") | crontab -

# Start application
echo "Starting application..."
pm2 start pm2.config.js
pm2 save

echo "==============================================="
echo "Setup completed successfully!"
echo "==============================================="
echo ""
echo "Next steps:"
echo "1. Configure SSL: sudo certbot --nginx -d yourdomain.com"
echo "2. Update environment variables in .env"
echo "3. Configure MongoDB authentication"
echo "4. Setup monitoring and alerts"
echo ""