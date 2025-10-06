# Multi-stage Dockerfile for Node.js + TypeScript + Prisma

FROM node:20-bookworm AS builder
WORKDIR /app

# Install all dependencies for build
COPY package*.json ./
RUN npm ci

# Copy source and prisma schema
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

# Generate Prisma client for Linux and build TypeScript
RUN npx prisma generate
RUN npm run build


FROM node:20-bookworm AS runner
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy build outputs and Prisma client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Expect DATABASE_URL via environment
CMD ["node","dist/server.js"]