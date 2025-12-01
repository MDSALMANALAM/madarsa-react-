#!/bin/bash
# =============================================
# Madarsa Imdadul Uloom - VPS Deploy Script
# Hostinger VPS (Ubuntu 22.04)
# =============================================

set -e

echo "🚀 Madarsa Imdadul Uloom - Deployment Starting..."
echo "=================================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Step 1: Update System
echo -e "${YELLOW}📦 Step 1: Updating system...${NC}"
apt update && apt upgrade -y

# Step 2: Install Docker
echo -e "${YELLOW}🐳 Step 2: Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    echo -e "${GREEN}✅ Docker installed${NC}"
else
    echo -e "${GREEN}✅ Docker already installed${NC}"
fi

# Step 3: Install Docker Compose
echo -e "${YELLOW}🐳 Step 3: Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    apt install docker-compose -y
    echo -e "${GREEN}✅ Docker Compose installed${NC}"
else
    echo -e "${GREEN}✅ Docker Compose already installed${NC}"
fi

# Step 4: Install Nginx
echo -e "${YELLOW}🌐 Step 4: Installing Nginx...${NC}"
apt install nginx -y
systemctl enable nginx
echo -e "${GREEN}✅ Nginx installed${NC}"

# Step 5: Create project directory
echo -e "${YELLOW}📁 Step 5: Setting up project directory...${NC}"
mkdir -p /var/www/madarsa
cd /var/www/madarsa

# Step 6: Copy files (if not already there)
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Please copy project files to /var/www/madarsa first!${NC}"
    echo "Use: scp -r ./* root@YOUR_VPS_IP:/var/www/madarsa/"
    exit 1
fi

# Step 7: Setup environment
echo -e "${YELLOW}⚙️ Step 6: Setting up environment...${NC}"
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}⚠️ Please edit backend/.env with your production values${NC}"
    echo "Run: nano backend/.env"
fi

# Step 8: Start Docker containers
echo -e "${YELLOW}🚀 Step 7: Starting Docker containers...${NC}"
docker-compose down 2>/dev/null || true
docker-compose up -d --build

# Step 9: Wait for services
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 10

# Step 10: Check status
echo -e "${YELLOW}📊 Step 8: Checking service status...${NC}"
docker ps

# Step 11: Test API
echo -e "${YELLOW}🧪 Step 9: Testing API...${NC}"
if curl -s http://localhost:5000/api/finance/test | grep -q "success"; then
    echo -e "${GREEN}✅ API is working!${NC}"
else
    echo -e "${RED}❌ API test failed. Check logs: docker-compose logs backend${NC}"
fi

echo ""
echo -e "${GREEN}=================================================="
echo "🎉 Deployment Complete!"
echo "==================================================${NC}"
echo ""
echo "📌 Next Steps:"
echo "1. Edit .env: nano backend/.env"
echo "2. Setup domain in Nginx (see HOSTINGER_DEPLOY.md)"
echo "3. Setup SSL: certbot --nginx -d yourdomain.com"
echo "4. Connect WhatsApp: http://YOUR_IP:5000/whatsapp-setup.html"
echo ""
echo "📊 Useful Commands:"
echo "  docker-compose logs -f     # View logs"
echo "  docker-compose restart     # Restart services"
echo "  docker-compose down        # Stop services"
echo ""

