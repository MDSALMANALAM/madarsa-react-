# =============================================
# Docker setup for Madarsa Imdadul Uloom
# Backend with NATS + WhatsApp (Baileys)
# =============================================

FROM node:18-alpine

RUN apk add --no-cache python3 make g++ ffmpeg && rm -rf /var/cache/apk/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

RUN mkdir -p uploads/library uploads/students uploads/admission_docs uploads/materials receipts whatsapp_auth

RUN addgroup -g 1001 -S nodejs && \
    adduser -S madarsa -u 1001 -G nodejs && \
    chown -R madarsa:nodejs /app

USER madarsa

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget -q --spider http://localhost:5000/api/finance/test || exit 1

CMD ["node", "server.js"]
