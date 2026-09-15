# Image de production de l'app Next.js (T1.3).
# Build multi-étapes, utilise la sortie "standalone" de Next.js pour une
# image finale minimale. Contexte de build : la racine du dépôt
# (voir docker-compose.yml : `context: ..`).

FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Outils de maintenance (T1.5) : migrations et import des jeux, lancés à la
# demande via le profil Compose « tools », jamais démarrés en continu.
# Sources complètes et dépendances de développement (tsx, drizzle-kit).
# Tourne en root pour pouvoir retirer les kit.pdf du dossier content/ monté
# depuis l'hôte ; l'application, elle, reste en utilisateur non root.
FROM node:24-alpine AS tools
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .

FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# /data/private appartient à nextjs : un volume neuf hérite de ce propriétaire,
# ce qui permettra à l'application d'y écrire (factures PDF, T1.8).
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs \
  && mkdir -p /data/private \
  && chown nextjs:nodejs /data/private

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
