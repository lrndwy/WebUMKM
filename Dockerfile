# Stage 1: Build the Vue.js application
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY client/package.json client/pnpm-lock.yaml client/
COPY server/package.json server/pnpm-lock.yaml server/

RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile && \
    pnpm install --prefix client --frozen-lockfile && \
    pnpm install --prefix server --frozen-lockfile

COPY . .

RUN pnpm --prefix client run build

# Stage 2: Run the application
FROM node:20-alpine AS production

COPY --from=builder /app /app

WORKDIR /app

EXPOSE 3000
EXPOSE 8080

CMD ["pnpm", "start"]
