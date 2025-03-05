#!/bin/bash

# Build script for Docker MCP server

echo "Building Docker MCP server..."

# Create dist directory if it doesn't exist
mkdir -p dist

# Run TypeScript compiler
echo "Compiling TypeScript..."
npx tsc

echo "Build completed!"

# Build templates
echo "Checking templates directory..."
if [ ! -d "templates" ]; then
  echo "Creating templates directory..."
  mkdir -p templates
fi

echo "Docker MCP server is ready!"