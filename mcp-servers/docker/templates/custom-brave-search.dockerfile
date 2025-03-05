FROM node:18-alpine AS builder

WORKDIR /app

# Create the tsconfig.json file
RUN echo '{"compilerOptions":{"target":"ES2022","module":"Node16","moduleResolution":"Node16","strict":true,"esModuleInterop":true,"skipLibCheck":true,"forceConsistentCasingInFileNames":true,"resolveJsonModule":true,"outDir":"./dist","rootDir":"."},"include":["./**/*.ts"],"exclude":["node_modules","*/dist"]}' > tsconfig.json

# Copy source files next
COPY . .

# Install dependencies (without running scripts automatically)
RUN npm install --ignore-scripts

# Run the build manually 
RUN npm run build

FROM node:18-alpine AS release

WORKDIR /app

# Copy only the necessary files from the builder
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/package-lock.json /app/package-lock.json

# Install production dependencies only
ENV NODE_ENV=production
RUN npm ci --omit=dev --ignore-scripts

# Set environment variables
ENV BRAVE_API_KEY=${BRAVE_API_KEY}

# Set labels
LABEL org.opencontainers.image.title="brave-search"
LABEL org.opencontainers.image.description="Docker image for brave-search MCP server"
LABEL dev.type="brave-search"
LABEL dev.managed="true"

# Run the application
ENTRYPOINT ["node", "dist/index.js"]