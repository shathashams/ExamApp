# ── Stage 1: Dependencies & Runtime ──────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Copy package files first (layer caching)
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy source code
COPY . .

EXPOSE 5000

CMD ["node", "src/index.js"]
