#!/bin/bash

# Web3Insight Docker Deployment Validation Script
# This script checks if all required environment variables and files are configured correctly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Web3Insight Deployment Validation${NC}"
echo -e "${BLUE}======================================${NC}\n"

# Track validation status
ERRORS=0
WARNINGS=0

# Function to check file existence
check_file() {
    local file=$1
    local required=$2

    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} Found: $file"
        return 0
    else
        if [ "$required" = "true" ]; then
            echo -e "${RED}✗${NC} Missing (Required): $file"
            ERRORS=$((ERRORS + 1))
        else
            echo -e "${YELLOW}⚠${NC} Missing (Optional): $file"
            WARNINGS=$((WARNINGS + 1))
        fi
        return 1
    fi
}

# Function to check environment variable
check_env_var() {
    local var_name=$1
    local required=$2
    local value="${!var_name}"

    if [ -n "$value" ] && [ "$value" != "your-"* ]; then
        echo -e "${GREEN}✓${NC} Set: $var_name"
        return 0
    else
        if [ "$required" = "true" ]; then
            echo -e "${RED}✗${NC} Not set (Required): $var_name"
            ERRORS=$((ERRORS + 1))
        else
            echo -e "${YELLOW}⚠${NC} Not set (Optional): $var_name"
            WARNINGS=$((WARNINGS + 1))
        fi
        return 1
    fi
}

# Check required files
echo -e "${BLUE}1. Checking Required Files...${NC}"
check_file "Dockerfile" "true"
check_file "docker-compose.yml" "true"
check_file "package.json" "true"
check_file "pnpm-lock.yaml" "true"
check_file ".npmrc" "true"
check_file "next.config.ts" "true"
check_file "tsconfig.json" "true"
echo ""

# Check optional files
echo -e "${BLUE}2. Checking Optional Files...${NC}"
check_file "docker-compose.prod.yml" "false"
check_file ".env.local" "false"
check_file ".env.production" "false"
check_file ".dockerignore" "false"
echo ""

# Load environment variables if .env.local exists
if [ -f ".env.local" ]; then
    echo -e "${BLUE}3. Loading environment from .env.local${NC}"
    export $(grep -v '^#' .env.local | xargs)
elif [ -f ".env.production" ]; then
    echo -e "${BLUE}3. Loading environment from .env.production${NC}"
    export $(grep -v '^#' .env.production | xargs)
else
    echo -e "${YELLOW}3. No .env file found, checking system environment${NC}"
fi
echo ""

# Check required environment variables
echo -e "${BLUE}4. Checking Required Environment Variables...${NC}"
check_env_var "DATA_API_TOKEN" "true"
check_env_var "OPENAI_API_KEY" "true"
echo ""

# Check optional environment variables
echo -e "${BLUE}5. Checking Optional Environment Variables...${NC}"
check_env_var "DATA_API_URL" "false"
check_env_var "OSSINSIGHT_URL" "false"
check_env_var "OPENAI_BASE_URL" "false"
check_env_var "OPENAI_MODEL" "false"
check_env_var "NEXT_PUBLIC_PRIVY_APP_ID" "false"
check_env_var "NEXT_PUBLIC_UMAMI_WEBSITE_ID" "false"
check_env_var "NEXT_PUBLIC_ORIGIN_CLIENT_ID" "false"
echo ""

# Check pnpm version
echo -e "${BLUE}6. Checking pnpm Version...${NC}"
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    echo -e "${GREEN}✓${NC} pnpm installed: v$PNPM_VERSION"

    # Check if version matches package.json
    EXPECTED_VERSION=$(grep '"packageManager":' package.json | sed -E 's/.*pnpm@([0-9.]+).*/\1/')
    if [ "$PNPM_VERSION" = "$EXPECTED_VERSION" ]; then
        echo -e "${GREEN}✓${NC} pnpm version matches package.json: $EXPECTED_VERSION"
    else
        echo -e "${YELLOW}⚠${NC} pnpm version mismatch. Expected: $EXPECTED_VERSION, Got: $PNPM_VERSION"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}✗${NC} pnpm not installed"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check Docker
echo -e "${BLUE}7. Checking Docker...${NC}"
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | sed -E 's/Docker version ([0-9.]+).*/\1/')
    echo -e "${GREEN}✓${NC} Docker installed: v$DOCKER_VERSION"
else
    echo -e "${RED}✗${NC} Docker not installed"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check Docker Compose
echo -e "${BLUE}8. Checking Docker Compose...${NC}"
if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker Compose available"
else
    echo -e "${RED}✗${NC} Docker Compose not available"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check Dockerfile syntax
echo -e "${BLUE}9. Checking Dockerfile Syntax...${NC}"
if docker build --check -f Dockerfile . &> /dev/null; then
    echo -e "${GREEN}✓${NC} Dockerfile syntax is valid"
else
    # Try basic check
    if grep -q "FROM node:20-alpine" Dockerfile; then
        echo -e "${GREEN}✓${NC} Dockerfile basic structure looks good"
    else
        echo -e "${YELLOW}⚠${NC} Cannot validate Dockerfile syntax"
        WARNINGS=$((WARNINGS + 1))
    fi
fi
echo ""

# Summary
echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Validation Summary${NC}"
echo -e "${BLUE}======================================${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo -e "${GREEN}✓ Ready for deployment${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ ${WARNINGS} warning(s) found${NC}"
    echo -e "${YELLOW}⚠ Deployment should work, but consider fixing warnings${NC}"
    exit 0
else
    echo -e "${RED}✗ ${ERRORS} error(s) found${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠ ${WARNINGS} warning(s) found${NC}"
    fi
    echo -e "${RED}✗ Please fix errors before deployment${NC}"
    exit 1
fi

