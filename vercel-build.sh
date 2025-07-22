#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Vite build for Vercel..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run Prisma generate
echo "🔧 Running Prisma generate..."
npx prisma generate

# Run database migrations if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
  echo "🔄 Running database migrations..."
  npx prisma migrate deploy || npx prisma db push --accept-data-loss
else
  echo "⚠️  DATABASE_URL not set, skipping database setup"
fi

# Run Vite build
echo "🏗️  Building application with Vite..."
npm run build

echo "✅ Build completed successfully!"
