# 🚀 Production Deployment Fix Guide

## ❌ Problem
**"Unable to load data"** error on production because:
- Frontend files had hardcoded `http://localhost:5000` URLs
- These URLs don't work in production (VPS IP: 72.61.124.136)
- SSH connection timeout due to firewall blocking port 22

---

## ✅ Solution Applied

### 1. **Updated Frontend API URLs** (Auto-detect environment)

Changed all hardcoded `localhost:5000` URLs to auto-detect:
```javascript
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const API_BASE = isProduction 
    ? `http://${window.location.hostname}:5000/api`
    : 'http://localhost:5000/api';
```

**Files Updated:**
- ✅ `frontend/js/api.js`
- ✅ `frontend/js/library.js`
- ✅ `frontend/js/contact.js`
- ✅ `frontend/js/donation.js`
- ✅ `frontend/js/register.js`
- ✅ `frontend/js/admission.js`
- ✅ `frontend/js/normal .Html`
- ✅ `frontend/admin-dashboard.html`
- ✅ `frontend/admission.html`

### 2. **Updated Backend Receipt URL**

Changed hardcoded localhost in admission receipt:
```javascript
const baseUrl = process.env.BASE_URL || `http://${req.get('host')}`;
receiptUrl: receiptUrl ? `${baseUrl}${receiptUrl}` : null
```

**File Updated:**
- ✅ `backend/routes/admission.js`

---

## 🔥 URGENT: Fix Hostinger Firewall

### **Step 1: Add Firewall Rules in Hostinger Panel**

1. Go to: https://hpanel.hostinger.com/vps/1141493/overview
2. Click **"Firewall rules: 0"**
3. Add these rules:

| Port | Protocol | Source | Action | Description |
|------|----------|--------|--------|-------------|
| 22   | TCP      | 0.0.0.0/0 | Allow | SSH Access |
| 80   | TCP      | 0.0.0.0/0 | Allow | HTTP |
| 443  | TCP      | 0.0.0.0/0 | Allow | HTTPS |
| 5000 | TCP      | 0.0.0.0/0 | Allow | Backend API |

4. **Save** and wait 2-3 minutes

---

## 📤 Deploy Updated Files

### **Option A: Using Browser Console (If SSH blocked)**

1. Open Hostinger panel: https://hpanel.hostinger.com/vps/1141493/overview
2. Go to **"OS & Panel"** → **"Open Console"**
3. Run these commands:

```bash
# Disable UFW temporarily
ufw disable

# Navigate to project
cd /var/www/madarsa

# Pull latest changes (if using git)
git pull origin main

# Or manually upload files using Hostinger File Manager
```

### **Option B: Using SSH (After firewall fixed)**

```bash
# From local machine
bash deploy-updates.sh
```

---

## 🧪 Testing Steps

### **1. Test Backend API**
```bash
curl http://72.61.124.136:5000/api/dashboard
```

### **2. Test Frontend**
Open browser: `http://72.61.124.136`

### **3. Check Browser Console**
Press F12 → Console tab
Should see:
```
🌐 API_BASE: http://72.61.124.136:5000/api
```

### **4. Test Data Loading**
- Login to admin dashboard
- Check if students/teachers data loads
- Try submitting admission form

---

## 🔧 Backend Configuration

### **Start Backend (if not running)**
```bash
ssh root@72.61.124.136
cd /var/www/madarsa/backend
pm2 start server.js --name madarsa-backend
pm2 save
```

### **Check Backend Status**
```bash
pm2 status
pm2 logs madarsa-backend
```

---

## 🌐 Production URLs

- **Frontend:** http://72.61.124.136
- **Backend API:** http://72.61.124.136:5000/api
- **Admin Dashboard:** http://72.61.124.136/admin-dashboard.html

---

## 📝 Next Steps

1. ✅ Fix Hostinger firewall (add port 22, 80, 443, 5000)
2. ✅ Deploy updated files
3. ✅ Test website and data loading
4. 🔜 Setup domain name (optional)
5. 🔜 Setup SSL certificate (Let's Encrypt)
6. 🔜 Configure Nginx reverse proxy for port 5000

---

## 🆘 Troubleshooting

### **If SSH still not working:**
Use Hostinger browser console (OS & Panel → Open Console)

### **If data still not loading:**
```bash
# Check backend logs
pm2 logs madarsa-backend

# Check if backend is running
pm2 status

# Restart backend
pm2 restart madarsa-backend
```

### **If "Connection refused" error:**
```bash
# Check if port 5000 is listening
netstat -tlnp | grep 5000

# Check UFW status
ufw status verbose
```

---

## 📞 Support

If issues persist, check:
1. Browser console (F12) for errors
2. Backend logs: `pm2 logs madarsa-backend`
3. Nginx logs: `tail -f /var/log/nginx/error.log`

