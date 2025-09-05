#!/bin/bash

# GlamAI Admin Panel Deployment Script
# This script handles deployment to production environment

set -e

echo "🚀 Starting GlamAI Admin Panel Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_ENV=${1:-production}
BRANCH=${2:-main}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists docker; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

if ! command_exists docker-compose; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites met${NC}"

# Pull latest code
echo "📥 Pulling latest code from ${BRANCH} branch..."
git pull origin ${BRANCH}

# Load environment variables
if [ -f ".env.${DEPLOY_ENV}" ]; then
    echo "🔧 Loading environment variables for ${DEPLOY_ENV}..."
    export $(cat .env.${DEPLOY_ENV} | grep -v '^#' | xargs)
else
    echo -e "${YELLOW}⚠️  No .env.${DEPLOY_ENV} file found, using defaults${NC}"
fi

# Build and deploy with Docker Compose
echo "🏗️  Building Docker images..."
docker-compose build --no-cache

echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🏥 Checking service health..."

# Check backend
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    docker-compose logs backend
    exit 1
fi

# Check frontend
if curl -f http://localhost > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is healthy${NC}"
else
    echo -e "${RED}❌ Frontend health check failed${NC}"
    docker-compose logs frontend
    exit 1
fi

# Run database migrations if needed
echo "🗄️  Running database setup..."
docker-compose exec -T backend node scripts/setup-db.js || true

# Create admin user if not exists
echo "👤 Setting up admin user..."
docker-compose exec -T backend node scripts/create-admin.js || true

# Show deployment info
echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📊 Service Status:"
docker-compose ps
echo ""
echo "🌐 Access the application at:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost:5000"
echo ""
echo "📝 View logs with: docker-compose logs -f [service-name]"
echo "🛑 Stop services with: docker-compose down"

# Cleanup old images
echo "🧹 Cleaning up old Docker images..."
docker image prune -f

echo -e "${GREEN}✨ Deployment complete!${NC}"