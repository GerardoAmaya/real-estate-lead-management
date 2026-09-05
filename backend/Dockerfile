# Contexto de build: la raiz del repositorio, porque la imagen necesita
# tanto backend/ como los datos de seed/.

# --- Etapa 1: compilacion (incluye devDependencies) ---
FROM node:20-alpine AS builder

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci

COPY backend/tsconfig*.json ./
COPY backend/src ./src

RUN npm run build

# --- Etapa 2: produccion (solo dependencias de runtime) ---
FROM node:20-alpine AS production

# dumb-init maneja las senales para un apagado ordenado
RUN apk add --no-cache dumb-init

ENV NODE_ENV=production
WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY backend/migrations ./migrations
COPY backend/migrate-mongo-config.js ./
COPY seed ./seed

# El usuario "node" ya existe en la imagen base; nunca ejecutar como root
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]

# --- Etapa 3: migraciones y seed ---
# Reutiliza el builder porque migrate-mongo es una devDependency: la imagen de
# produccion se mantiene sin herramientas que no necesita en tiempo de ejecucion.
FROM builder AS migrator

COPY backend/migrations ./migrations
COPY backend/migrate-mongo-config.js ./
COPY seed ./seed

CMD ["sh", "-c", "npx migrate-mongo up -f migrate-mongo-config.js && node dist/scripts/seed.js"]
