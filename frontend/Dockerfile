# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* yarn.lock* ./

RUN if [ -f package-lock.json ]; then npm ci; elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; else npm install; fi

COPY . .

RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install a simple HTTP server to serve static files
RUN npm install -g http-server

# Copy only the built dist folder
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["http-server", "dist", "-p", "3000", "-c-1"]
