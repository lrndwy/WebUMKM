# Stage 1: Build the Vue.js application
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY client/package.json client/
COPY server/package.json server/

RUN npm install -g pnpm && \
    pnpm install && \
    pnpm install --prefix client && \
    pnpm install --prefix server

COPY . .

RUN pnpm --prefix client run build

# Stage 2: Run the application
FROM node:20-alpine AS production

COPY --from=builder /app /app

WORKDIR /app

EXPOSE 3000
EXPOSE 8080

CMD ["pnpm", "start"]
