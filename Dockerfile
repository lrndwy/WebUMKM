# Stage 1: Build the Vue.js application
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

# Stage 2: Serve the application with Nginx
FROM node:20-alpine AS production

# Install serve
RUN npm install -g serve

# Copy the built application files from the builder stage
COPY --from=builder /app/dist /app/dist

# Set working directory to the built application files
WORKDIR /app/dist

EXPOSE 3000

CMD ["serve", "-s", "."]