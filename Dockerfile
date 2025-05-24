# Stage 1: Build the Vue.js application
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine AS production

# Copy custom Nginx configuration (optional, but good practice)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built application files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]