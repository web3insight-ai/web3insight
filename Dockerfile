# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files and pnpm configuration
COPY package.json pnpm-lock.yaml .npmrc ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Build the application
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat python3 make g++

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy pnpm configuration first
COPY .npmrc ./

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
# Skip environment validation during build if needed
ENV SKIP_ENV_VALIDATION=true
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DATA_API_URL=https://api.web3insight.ai
ENV DATA_API_TOKEN=dummy_token
ENV OPENDIGGER_URL=https://oss.x-lab.info
ENV OSSINSIGHT_URL=https://api.ossinsight.io
ENV SESSION_SECRET=dummy_secret
ENV NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=dummy_id
ENV NEXT_PUBLIC_GITHUB_CLIENT_ID=dummy_client_id

# Build the application
RUN pnpm build

# Stage 3: Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]