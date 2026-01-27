FROM node:20-alpine AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PNPM_STORE_PATH="/pnpm-store"
ENV PNPM_FETCH_TIMEOUT=120000
ENV PNPM_FETCH_RETRIES=5
ENV PNPM_FETCH_RETRY_FACTOR=2
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm install --frozen-lockfile --prefer-offline
RUN DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder \
    NEXTAUTH_SECRET=dummy-secret \
    pnpm prisma generate
RUN pnpm run build
RUN pnpm prune --prod --ignore-scripts

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["pnpm", "start"]
