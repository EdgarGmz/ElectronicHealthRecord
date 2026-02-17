#!/bin/bash

# Script to validate Docker configuration
# This script checks if all Docker-related files are correctly configured

echo "🔍 Validating Docker Configuration for EHR System..."
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter for checks
PASS=0
FAIL=0

# Function to check if a file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} File exists: $1"
        ((PASS++))
        return 0
    else
        echo -e "${RED}✗${NC} File missing: $1"
        ((FAIL++))
        return 0
    fi
}

# Function to check if a directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} Directory exists: $1"
        ((PASS++))
        return 0
    else
        echo -e "${RED}✗${NC} Directory missing: $1"
        ((FAIL++))
        return 0
    fi
}

# Function to check file content
check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $1 contains: $2"
        ((PASS++))
        return 0
    else
        echo -e "${RED}✗${NC} $1 missing: $2"
        ((FAIL++))
        return 0  # Don't exit on failure
    fi
}

echo "📋 Checking required files..."
echo ""

# Check Dockerfile
check_file "api/Dockerfile"
if [ -f "api/Dockerfile" ]; then
    check_content "api/Dockerfile" "FROM node:18-alpine"
    check_content "api/Dockerfile" "AS builder"
    check_content "api/Dockerfile" "AS production"
    check_content "api/Dockerfile" "npx prisma generate"
    check_content "api/Dockerfile" "npm run build"
fi

echo ""
echo "📋 Checking .dockerignore..."
echo ""

# Check .dockerignore
check_file "api/.dockerignore"
if [ -f "api/.dockerignore" ]; then
    check_content "api/.dockerignore" "node_modules"
    check_content "api/.dockerignore" ".env"
    check_content "api/.dockerignore" "dist"
fi

echo ""
echo "📋 Checking docker-compose.yml..."
echo ""

# Check docker-compose.yml
check_file "docker-compose.yml"
if [ -f "docker-compose.yml" ]; then
    check_content "docker-compose.yml" "services:"
    check_content "docker-compose.yml" "db:"
    check_content "docker-compose.yml" "api:"
    check_content "docker-compose.yml" "postgres:15-alpine"
    check_content "docker-compose.yml" "redis:7-alpine"
    check_content "docker-compose.yml" "healthcheck:"
    check_content "docker-compose.yml" "npx prisma migrate deploy"
    check_content "docker-compose.yml" "volumes:"
    check_content "docker-compose.yml" "postgres_data:"
fi

echo ""
echo "📋 Checking documentation..."
echo ""

# Check documentation
check_file "DOCKER_GUIDE.md"
check_file ".env.docker.example"
check_file "start-docker.sh"

if [ -f "start-docker.sh" ]; then
    if [ -x "start-docker.sh" ]; then
        echo -e "${GREEN}✓${NC} start-docker.sh is executable"
        ((PASS++))
    else
        echo -e "${YELLOW}⚠${NC} start-docker.sh is not executable (run: chmod +x start-docker.sh)"
    fi
fi

echo ""
echo "📋 Checking .gitignore..."
echo ""

check_file ".gitignore"
if [ -f ".gitignore" ]; then
    check_content ".gitignore" ".env.docker"
fi

echo ""
echo "📋 Checking project structure..."
echo ""

# Check required directories
check_dir "api"
check_dir "api/src"
check_dir "api/prisma"

# Check required API files
check_file "api/package.json"
check_file "api/tsconfig.json"
check_file "api/prisma/schema.prisma"

echo ""
echo "📊 Validation Summary"
echo "===================="
echo -e "${GREEN}Passed: $PASS${NC}"
if [ $FAIL -gt 0 ]; then
    echo -e "${RED}Failed: $FAIL${NC}"
else
    echo -e "${GREEN}Failed: $FAIL${NC}"
fi
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Docker configuration is ready.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run: ./start-docker.sh"
    echo "2. Or: docker-compose up --build"
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Please fix the issues above.${NC}"
    exit 1
fi
