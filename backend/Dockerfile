# --- Etapa 1: compilacion (incluye devDependencies) ---
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig*.json ./
COPY src ./src

RUN npm run build

# --- Etapa 2: produccion (solo dependencias de runtime) ---
FROM node:20-alpine AS production

# dumb-init maneja las senales para un apagado ordenado
RUN apk add --no-cache dumb-init

ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY migrations ./migrations
COPY migrate-mongo-config.js ./

# El usuario "node" ya existe en la imagen base; nunca ejecutar como root
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
