# ---------------------------------------------------
# Estágio 1: Build (Instalação e Compilação)
# ---------------------------------------------------
FROM node:20-alpine AS builder

# Prisma requer bibliotecas nativas de C/SSL no Alpine
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copia apenas os manifestos de dependência primeiro (otimiza o cache do Docker)
COPY package*.json ./
COPY prisma ./prisma/

# Instala todas as dependências (incluindo devDependencies para o tsc)
RUN npm ci

# Copia o restante do código fonte
COPY . .

# Gera o Prisma Client e compila o TypeScript
RUN npx prisma generate
RUN npm run build

# Remove dependências de desenvolvimento para aliviar o peso final
RUN npm prune --production

# ---------------------------------------------------
# Estágio 2: Runner (Ambiente de Produção)
# ---------------------------------------------------
FROM node:20-alpine AS runner

# Dependência obrigatória do Prisma em tempo de execução
RUN apk add --no-cache openssl

WORKDIR /app

# Criação de um usuário não-root por segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -u 1001 -S nodejs -G nodejs

ENV NODE_ENV=production

# Copia do estágio 'builder' apenas o que é essencial para rodar
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

# Define o usuário seguro
USER nodejs

EXPOSE 3333

# O script 'start' do package.json executa 'node dist/server.js'
CMD ["npm", "start"]