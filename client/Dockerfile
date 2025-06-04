# Stage 1: Build the Vue.js application
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml (if exists) to leverage Docker cache
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN pnpm run build

# Stage 2: Serve the application with 'serve'
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml to install serve
COPY package.json pnpm-lock.yaml* ./

# Install production dependencies, including 'serve'
RUN pnpm install --prod --frozen-lockfile

# Copy the built application from the build stage
COPY --from=build /app/dist ./dist

# Expose the port that 'serve' will listen on (default is 3000)
EXPOSE 3000

# Start the application using the 'serve' script
CMD ["pnpm", "run", "serve"]
