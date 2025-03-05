FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy all source files
COPY . .

# Determine installation method based on available lock files
# and run the appropriate install command
RUN if [ -f package-lock.json ]; then \
        echo "Using package-lock.json"; \
        npm ci --omit=dev --ignore-scripts; \
    elif [ -f yarn.lock ]; then \
        echo "Using yarn.lock"; \
        yarn install --production --frozen-lockfile; \
    else \
        echo "No lockfile found, using npm install"; \
        npm install --omit=dev --ignore-scripts; \
    fi

# Set labels
LABEL org.opencontainers.image.title="mcp-server"
LABEL org.opencontainers.image.description="Docker image for MCP server"
LABEL dev.type="mcp-server"
LABEL dev.managed="true"

# This will be passed at runtime
ARG SERVER_NAME
ENV SERVER_NAME=${SERVER_NAME}

# Run the application
ENTRYPOINT ["node", "dist/index.js"]