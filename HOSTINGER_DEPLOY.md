# 🚀 Hostinger VPS Deployment Guide
# Madarsa Imdadul Uloom

## Prerequisites
- Hostinger VPS (Ubuntu 22.04 recommended)
- SSH access to your VPS
- Domain pointed to VPS IP

---

## Step 1: Connect to VPS via SSH

```bash
ssh root@YOUR_VPS_IP
```

---

## Step 2: Install Docker & Docker Compose

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Verify installation
docker --version
docker-compose --version
```

---

## Step 3: Install Git & Clone Project

```bash
# Install Git
apt install git -y

# Clone your project (replace with your repo)
cd /var/www
git clone https://github.com/YOUR_USERNAME/madarsa_complete_project_production.git
cd madarsa_complete_project_production
```

---

## Step 4: Configure Environment

```bash
# Copy example env to production
cp backend/.env.example backend/.env

# Edit with your production values
nano backend/.env
```

**Important changes in .env:**
```
NODE_ENV=production
MONGODB_URI=mongodb://mongo:27017/madarsa_db
MYSQL_HOST=mysql
NATS_URL=nats://nats:4222
BASE_URL=https://yourdomain.com
```

---

## Step 5: Start with Docker Compose

```bash
# Build and start all services
docker-compose up -d --build

# Check running containers
docker ps

# View logs
docker-compose logs -f backend
```

---

## Step 6: Setup Nginx Reverse Proxy (Optional but Recommended)

```bash
# Install Nginx
apt install nginx -y

# Create config
nano /etc/nginx/sites-available/madarsa
```

Add this config:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:
```bash
ln -s /etc/nginx/sites-available/madarsa /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## Step 7: Setup SSL (HTTPS) with Let's Encrypt

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (already setup by certbot)
```

---

## Step 8: Connect WhatsApp

1. Open browser: `https://yourdomain.com/whatsapp-setup.html`
2. Scan QR code with WhatsApp
3. Done! ✅

---

## 🔧 Useful Commands

```bash
# Restart services
docker-compose restart

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Update code
git pull
docker-compose up -d --build

# Check disk space
df -h

# Check memory
free -m
```

---

## 🚨 Troubleshooting

### Port already in use
```bash
docker-compose down
docker system prune -f
docker-compose up -d
```

### MongoDB connection failed
```bash
docker-compose logs mongo
```

### WhatsApp not connecting
```bash
docker-compose restart backend
# Then scan QR again
```

---

## 📞 Support
- Email: info@madarasaimdadululoom.in
- Phone: 9304678815

