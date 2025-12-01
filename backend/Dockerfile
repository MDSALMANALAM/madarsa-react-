# =============================================
# Docker setup for Madarsa Imdadul Uloom
# Backend with NATS + WhatsApp (Baileys)
# =============================================

FROM node:18-alpine

# Install necessary packages for Baileys (WhatsApp) + git for npm
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    ffmpeg \
    && rm -rf /var/cache/apk/*

# Work directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy backend code
COPY . .

# Create directories for uploads and WhatsApp auth
RUN mkdir -p uploads/library uploads/students uploads/admission_docs uploads/materials uploads/reports receipts whatsapp_auth

# Set non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S madarsa -u 1001 -G nodejs && \
    chown -R madarsa:nodejs /app

USER madarsa

# Expose backend port
EXPOSE 5000

# Environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget -q --spider http://localhost:5000/api/finance/test || exit 1

# Start command
CMD ["node", "server.js"]





