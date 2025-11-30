# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++

# Install pnpm (use specific version from package.json)
RUN corepack enable && corepack prepare pnpm@9.4.0 --activate

WORKDIR /app

# Copy package files and pnpm configuration
COPY package.json pnpm-lock.yaml .npmrc ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Build the application
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat python3 make g++

# Install pnpm (use specific version from package.json)
RUN corepack enable && corepack prepare pnpm@9.4.0 --activate

WORKDIR /app

# Copy package files first (needed for pnpm to recognize the workspace)
COPY package.json pnpm-lock.yaml .npmrc ./

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code and configuration files
COPY . .

# Build arguments for environment variables
ARG AI_API_TOKEN
ARG AI_API_URL
ARG DATA_API_TOKEN
ARG DATA_API_URL
ARG OPENDIGGER_URL
ARG OSSINSIGHT_URL
ARG SESSION_SECRET
ARG NEXT_PUBLIC_GITHUB_CLIENT_ID
ARG NEXT_PUBLIC_ORIGIN_CLIENT_ID
ARG NEXT_PUBLIC_PRIVY_APP_ID
ARG NEXT_PUBLIC_UMAMI_WEBSITE_ID
ARG NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

# Set environment variables for build
ENV SKIP_ENV_VALIDATION=true
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV AI_API_TOKEN=${AI_API_TOKEN}
ENV AI_API_URL=${AI_API_URL}
ENV DATA_API_TOKEN=${DATA_API_TOKEN}
ENV DATA_API_URL=${DATA_API_URL:-https://api.web3insight.ai}
ENV OPENDIGGER_URL=${OPENDIGGER_URL:-https://oss.x-lab.info/open_digger}
ENV OSSINSIGHT_URL=${OSSINSIGHT_URL:-https://api.ossinsight.io}
ENV SESSION_SECRET=${SESSION_SECRET:-dummy_secret}
ENV NEXT_PUBLIC_GITHUB_CLIENT_ID=${NEXT_PUBLIC_GITHUB_CLIENT_ID}
ENV NEXT_PUBLIC_ORIGIN_CLIENT_ID=${NEXT_PUBLIC_ORIGIN_CLIENT_ID}
ENV NEXT_PUBLIC_PRIVY_APP_ID=${NEXT_PUBLIC_PRIVY_APP_ID}
ENV NEXT_PUBLIC_UMAMI_WEBSITE_ID=${NEXT_PUBLIC_UMAMI_WEBSITE_ID}
ENV NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=${NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID}

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

# Runtime environment variables (these can be overridden at container start)
# Server-side only variables
ENV AI_API_TOKEN=""
ENV AI_API_URL=""
ENV DATA_API_TOKEN=""
ENV DATA_API_URL="https://api.web3insight.ai"
ENV OPENDIGGER_URL="https://oss.x-lab.info/open_digger"
ENV OSSINSIGHT_URL="https://api.ossinsight.io"
ENV SESSION_SECRET=""

# Note: NEXT_PUBLIC_* variables are baked into the build and cannot be changed at runtime

# Start the application
CMD ["node", "server.js"]