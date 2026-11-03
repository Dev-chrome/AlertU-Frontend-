FROM node:22-bookworm-slim

ENV NODE_ENV=production
WORKDIR /app

# Install production dependencies first so Docker can cache this layer.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .

# Render (and most hosts) inject PORT at runtime; 5000 is only the local default.
EXPOSE 5000

# Migrations are idempotent, so running them on every boot is safe for a
# single-instance deployment and keeps the schema current after each release.
CMD ["sh", "-c", "npm run db:migrate && node index.js"]
