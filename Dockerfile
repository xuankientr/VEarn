# Production image (không dùng standalone để build ổn định trên Windows; CI/Linux có thể bật NEXT_STANDALONE_OUTPUT=true)
# Build: docker build -t vearn .
# Run:   docker run -p 3000:3000 --env-file .env.production vearn

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

FROM base AS deps
RUN corepack enable && corepack prepare pnpm@9 --activate
COPY package.json pnpm-lock.yaml ./
# postinstall chạy `prisma generate` — cần schema trước khi install
COPY prisma/schema.prisma prisma/schema.prisma
RUN pnpm install --frozen-lockfile

FROM base AS builder
RUN corepack enable && corepack prepare pnpm@9 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Giá trị giả lập chỉ cho bước `next build` (layer builder); runtime dùng --env-file / biến orchestrator.
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vearn?schema=public"
ENV NEXTAUTH_URL="http://localhost:3000"
ENV NEXTAUTH_SECRET="01234567890123456789012345678901"
ENV JWT_SECRET="01234567890123456789012345678901"
ENV NEXT_PUBLIC_APP_URL="http://localhost:3000"
ENV SKIP_ENV_VALIDATION="true"
RUN pnpm prisma generate && pnpm build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
RUN corepack enable && corepack prepare pnpm@9 --activate

COPY package.json pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/next.config.js ./next.config.js

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["pnpm", "start"]
