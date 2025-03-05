FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create directory for server templates
RUN mkdir -p /app/templates

# Expose necessary ports (if any)
# EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV LOG_LEVEL=info
ENV MCP_SERVERS_PATH=/app/templates

# Run the application
CMD ["node", "dist/index.js"]