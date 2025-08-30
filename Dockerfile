# Dockerfile root pour Railway - Build API
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat dumb-init
WORKDIR /app

FROM base AS deps
COPY package*.json ./
COPY packages/ttt-api/package*.json ./packages/ttt-api/
RUN npm ci

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
WORKDIR /app/packages/ttt-api
RUN npm run build

FROM base AS production
ENV NODE_ENV=production
WORKDIR /app/packages/ttt-api

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/packages/ttt-api/build ./build
COPY --from=build /app/packages/ttt-api/package.json ./package.json

# Railway fournit $PORT automatiquement
EXPOSE $PORT

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "build/bin/server.js"]
