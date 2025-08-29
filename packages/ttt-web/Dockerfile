FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY package*.json ./
COPY packages/ttt-web/package*.json ./packages/ttt-web/
RUN npm ci --workspaces=false
RUN cd packages/ttt-web && npm ci

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/ttt-web/node_modules ./packages/ttt-web/node_modules
COPY . .
WORKDIR /app/packages/ttt-web
ENV NODE_ENV=production
RUN npm run build

FROM nginx:1.25-alpine AS production
COPY --from=build /app/packages/ttt-web/dist /usr/share/nginx/html
COPY packages/ttt-web/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]