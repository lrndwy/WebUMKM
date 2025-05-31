# Stage 1: Build the Vue.js application
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

# Stage 2: Serve the application with Node.js proxy
FROM node:20-alpine AS production

WORKDIR /app

# Copy package.json and pnpm-lock.yaml for proxy dependencies
COPY package.json pnpm-lock.yaml ./

# Install pnpm and proxy dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy the built application files from the builder stage
COPY --from=builder /app/dist /app/dist

# Copy the server directory
COPY server ./server

# Install concurrently to run both services
RUN npm install -g concurrently

EXPOSE 3000
EXPOSE 3001

CMD ["concurrently", "serve -s /app/dist -l 3000", "node server/index.js"]
