FROM node:20-alpine AS base

RUN apk update && apk add --no-cache python3 make g++

RUN npm i -g pnpm

FROM base AS dependencies

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

FROM base AS build

WORKDIR /app

COPY . .

COPY --from=dependencies /app/node_modules ./node_modules

RUN pnpm build

RUN pnpm prune --prod

FROM base AS deplay

WORKDIR /app

COPY --from=build /app/dist ./dist

COPY --from=build /app/node_modules ./node_modules  

CMD ["node", "dist/main.js"]