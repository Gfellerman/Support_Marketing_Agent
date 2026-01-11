# Base stage
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Dependencies stage
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS build
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN pnpm build
# Builds the production Express server from server/index.ts

# Production stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
# Railway injects PORT - do not override it

# Create a non-root user for security (and to match unexpected Railway permissions)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 reactjs

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

USER reactjs

# Railway handles port exposure dynamically

CMD ["node", "dist/index.cjs"]
