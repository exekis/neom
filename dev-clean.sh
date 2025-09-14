#!/bin/bash

# Clean dev server script - prevents multiple instances

echo "🧹 Cleaning up existing dev servers..."

# Kill any existing Next.js processes
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true

# Wait for processes to terminate
sleep 2

# Clean build cache
echo "🗂️  Cleaning build cache..."
rm -rf .next

echo "🚀 Starting clean dev server..."
npm run dev