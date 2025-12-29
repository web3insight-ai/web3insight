# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk update && apk add --no-cache --no-scripts python3 make g++

# Install pnpm (use specific version from package.json)
RUN corepack enable && corepack prepare pnpm@9.4.0 --activate

WORKDIR /app

# Copy package files and pnpm configuration
COPY package.json pnpm-lock.yaml .npmrc ./

# Install ALL dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile --prod=false

# Stage 2: Build the application
FROM node:20-alpine AS builder
RUN apk update && apk add --no-cache --no-scripts python3 make g++

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
ARG OPENAI_API_KEY
ARG OPENAI_BASE_URL
ARG OPENAI_MODEL
ARG DATA_API_TOKEN
ARG DATA_API_URL
ARG OSSINSIGHT_URL
ARG NEXT_PUBLIC_PRIVY_APP_ID
ARG NEXT_PUBLIC_UMAMI_WEBSITE_ID

# Set environment variables for build
ENV SKIP_ENV_VALIDATION=true
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV OPENAI_API_KEY=${OPENAI_API_KEY}
ENV OPENAI_BASE_URL=${OPENAI_BASE_URL:-https://burn.hair/v1}
ENV OPENAI_MODEL=${OPENAI_MODEL:-gpt-4o}
ENV DATA_API_TOKEN=${DATA_API_TOKEN}
ENV DATA_API_URL=${DATA_API_URL:-https://api.web3insight.ai}
ENV OSSINSIGHT_URL=${OSSINSIGHT_URL:-https://api.ossinsight.io}
ENV NEXT_PUBLIC_PRIVY_APP_ID=${NEXT_PUBLIC_PRIVY_APP_ID}
ENV NEXT_PUBLIC_UMAMI_WEBSITE_ID=${NEXT_PUBLIC_UMAMI_WEBSITE_ID}

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
ENV OPENAI_API_KEY=""
ENV OPENAI_BASE_URL="https://burn.hair/v1"
ENV OPENAI_MODEL="gpt-4o"
ENV DATA_API_TOKEN=""
ENV DATA_API_URL="https://api.web3insight.ai"
ENV OSSINSIGHT_URL="https://api.ossinsight.io"

# Note: NEXT_PUBLIC_* variables are baked into the build and cannot be changed at runtime

# Start the application
CMD ["node", "server.js"]
