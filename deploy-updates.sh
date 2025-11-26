#!/bin/bash

# Deploy script for production updates
# This script uploads updated files to VPS

VPS_IP="72.61.124.136"
VPS_USER="root"
REMOTE_DIR="/var/www/madarsa"

echo "🚀 Deploying updates to VPS..."

# Upload updated frontend files
echo "📤 Uploading frontend files..."
scp frontend/js/api.js $VPS_USER@$VPS_IP:$REMOTE_DIR/frontend/js/
scp frontend/js/library.js $VPS_USER@$VPS_IP:$REMOTE_DIR/frontend/js/
scp frontend/js/contact.js $VPS_USER@$VPS_IP:$REMOTE_DIR/frontend/js/
scp frontend/js/donation.js $VPS_USER@$VPS_IP:$REMOTE_DIR/frontend/js/
scp frontend/js/register.js $VPS_USER@$VPS_IP:$REMOTE_DIR/frontend/js/
scp frontend/js/admission.js $VPS_USER@$VPS_IP:$REMOTE_DIR/frontend/js/
scp "frontend/js/normal .Html" "$VPS_USER@$VPS_IP:$REMOTE_DIR/frontend/js/"
scp frontend/admin-dashboard.html $VPS_USER@$VPS_IP:$REMOTE_DIR/frontend/
scp frontend/admission.html $VPS_USER@$VPS_IP:$REMOTE_DIR/frontend/

# Upload updated backend files
echo "📤 Uploading backend files..."
scp backend/routes/admission.js $VPS_USER@$VPS_IP:$REMOTE_DIR/backend/routes/

# Restart backend service
echo "🔄 Restarting backend service..."
ssh $VPS_USER@$VPS_IP "cd $REMOTE_DIR/backend && pm2 restart madarsa-backend"

echo "✅ Deployment complete!"
echo ""
echo "🌐 Test your website:"
echo "   http://$VPS_IP"
echo ""
echo "📊 Check backend logs:"
echo "   ssh $VPS_USER@$VPS_IP 'pm2 logs madarsa-backend'"

