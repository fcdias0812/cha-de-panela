# ── Etapa 1: compila o frontend (React) ────────────────────────────
FROM node:20-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build          # gera /app/frontend/dist

# ── Etapa 2: backend + serve o site compilado ──────────────────────
FROM node:20-slim
WORKDIR /app

# O Prisma precisa do OpenSSL instalado (é o que faltava no Alpine).
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# Dependências do backend
COPY backend/package*.json ./
RUN npm install

# Código do backend (inclui prisma/schema.prisma e as migrations)
COPY backend/ ./
RUN npx prisma generate

# Coloca o site compilado onde o Express vai servir
COPY --from=frontend-build /app/frontend/dist ./public

# Garante a pasta de dados (é sobreposta pelo volume quando existir).
# DATA_DIR = onde ficam o banco e as fotos enviadas pelo casal.
ENV DATA_DIR=/app/data
RUN mkdir -p /app/data/uploads

EXPOSE 3000

# Ao subir: aplica migrations pendentes e inicia o servidor.
CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]
