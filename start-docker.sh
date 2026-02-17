#!/bin/bash

# Script to start the EHR System with Docker
# Usage: ./start-docker.sh

set -e

echo "🐳 Starting Electronic Health Record System with Docker..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed"
    echo "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: Docker Compose is not installed"
    echo "Please install Docker Compose from: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if .env.docker exists, if not create from example
if [ ! -f .env.docker ]; then
    if [ -f .env.docker.example ]; then
        echo "📝 Creating .env.docker from .env.docker.example..."
        cp .env.docker.example .env.docker
        echo "⚠️  Remember to update .env.docker with your actual credentials!"
        echo ""
    fi
fi

echo "🔨 Building and starting Docker containers..."
echo ""

# Build and start containers
docker-compose up --build

echo ""
echo "✅ EHR System is running!"
echo ""
echo "📍 API: http://localhost:5000"
echo "📍 API Docs: http://localhost:5000/api-docs"
echo "📍 Database: localhost:5432"
echo ""
echo "To stop: Press Ctrl+C or run: docker-compose down"
