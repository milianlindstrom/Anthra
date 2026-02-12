#!/bin/bash

# Anthra MCP Server - Installation and Test Script
# This script installs dependencies and tests the complete setup

set -e  # Exit on error

echo "=================================================="
echo "  Anthra MCP Server - Installation & Test Script"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check Node.js version
echo "Step 1: Checking Node.js version..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    print_error "Node.js version 20+ required. Current version: $(node -v)"
    exit 1
fi
print_success "Node.js version: $(node -v)"
echo ""

# Install UI dependencies
echo "Step 2: Installing UI dependencies..."
if npm install; then
    print_success "UI dependencies installed"
else
    print_error "Failed to install UI dependencies"
    exit 1
fi
echo ""

# Setup database
echo "Step 3: Setting up database..."
if npm run db:push; then
    print_success "Database schema created"
else
    print_error "Failed to create database"
    exit 1
fi
echo ""

# Seed database
echo "Step 4: Seeding database..."
if npm run db:seed; then
    print_success "Database seeded with sample data"
else
    print_warning "Database seeding failed (may already be seeded)"
fi
echo ""

# Install MCP server dependencies
echo "Step 5: Installing MCP server dependencies..."
cd mcp-server
if npm install; then
    print_success "MCP server dependencies installed"
else
    print_error "Failed to install MCP server dependencies"
    exit 1
fi
echo ""

# Build MCP server
echo "Step 6: Building MCP server..."
if npm run build; then
    print_success "MCP server built successfully"
else
    print_error "Failed to build MCP server"
    exit 1
fi
cd ..
echo ""

# Check if UI is running
echo "Step 7: Checking if UI is running..."
if curl -s http://localhost:3000/api/tasks > /dev/null 2>&1; then
    print_success "UI is running on http://localhost:3000"
    UI_RUNNING=true
else
    print_warning "UI is not running. Starting it now..."
    print_info "Run './start-dev.sh' in a separate terminal to start the UI"
    UI_RUNNING=false
fi
echo ""

# Test MCP server
echo "Step 8: Testing MCP server..."
cd mcp-server

if [ "$UI_RUNNING" = true ]; then
    print_info "Testing MCP server connection..."
    
    # Start MCP server in background and test
    export ANTHRA_API_URL=http://localhost:3000
    timeout 5s node dist/index.js > /tmp/anthra-mcp-test.log 2>&1 &
    MCP_PID=$!
    sleep 2
    
    if ps -p $MCP_PID > /dev/null; then
        print_success "MCP server started successfully"
        kill $MCP_PID 2>/dev/null || true
    else
        print_error "MCP server failed to start"
        cat /tmp/anthra-mcp-test.log
        exit 1
    fi
else
    print_warning "Skipping MCP server test (UI not running)"
fi

cd ..
echo ""

# Summary
echo "=================================================="
echo "  Installation Complete! 🎉"
echo "=================================================="
echo ""
print_success "All components installed successfully"
echo ""
echo "Next steps:"
echo ""
echo "1. Start the UI:"
echo "   ${BLUE}./start-dev.sh${NC}"
echo ""
echo "2. (Optional) Start MCP server in development mode:"
echo "   ${BLUE}cd mcp-server && npm run dev${NC}"
echo ""
echo "3. Connect to Claude Desktop:"
echo "   ${BLUE}See CLAUDE_INTEGRATION.md for setup instructions${NC}"
echo ""
echo "4. Or use Docker Compose:"
echo "   ${BLUE}docker-compose up -d${NC}"
echo ""
echo "Documentation:"
echo "  - Quick Start: ${BLUE}MCP_QUICKSTART.md${NC}"
echo "  - Claude Setup: ${BLUE}CLAUDE_INTEGRATION.md${NC}"
echo "  - MCP Server: ${BLUE}mcp-server/README.md${NC}"
echo "  - Main README: ${BLUE}README.md${NC}"
echo ""
print_success "Ready for AI-powered task management! 🚀"
