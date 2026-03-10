#!/bin/bash

# ESP01 Fuel Pump API Testing Script
# This script tests the pump registration and data endpoints
# Usage: bash test-pump-api.sh [server_ip] [pump_id]

SERVER_IP="${1:-10.126.234.42}"
SERVER_PORT="${2:-3000}"
PUMP_ID="${3:-PUMP-001}"
STATION_ID="${4:-STATION-A}"

API_URL="http://$SERVER_IP:$SERVER_PORT/api"

echo "=========================================="
echo "  Fuel Pump API Test Suite"
echo "=========================================="
echo "Server: $SERVER_IP:$SERVER_PORT"
echo "Pump ID: $PUMP_ID"
echo "Station ID: $STATION_ID"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

print_info() {
  echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Test 1: Register Pump
echo ""
echo "=========================================="
echo "Test 1: Register Pump"
echo "=========================================="
print_info "Sending POST /pumps/register"

REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/pumps/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"pumpId\": \"$PUMP_ID\",
    \"stationId\": \"$STATION_ID\"
  }")

echo "$REGISTER_RESPONSE" | jq . 2>/dev/null || echo "$REGISTER_RESPONSE"

# Extract API key from response
API_KEY=$(echo "$REGISTER_RESPONSE" | jq -r '.apiKey' 2>/dev/null)

if [ -z "$API_KEY" ] || [ "$API_KEY" = "null" ]; then
  print_error "Failed to extract API key from response"
  echo "Full response: $REGISTER_RESPONSE"
  exit 1
fi

print_success "Pump registered!"
print_info "API Key: ${API_KEY:0:16}...${API_KEY: -8}"
echo ""

# Test 2: Send Transaction Data
echo ""
echo "=========================================="
echo "Test 2: Send Transaction Data"
echo "=========================================="
print_info "Sending POST /pumps/data with x-api-key header"

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

TRANSACTION_RESPONSE=$(curl -s -X POST "$API_URL/pumps/data" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "{
    \"pumpId\": \"$PUMP_ID\",
    \"liters\": 12.5,
    \"amount\": 3500,
    \"nozzle\": 1,
    \"fuelType\": \"PETROL\",
    \"timestamp\": \"$TIMESTAMP\"
  }")

echo "$TRANSACTION_RESPONSE" | jq . 2>/dev/null || echo "$TRANSACTION_RESPONSE"

# Check if response contains an error
if echo "$TRANSACTION_RESPONSE" | jq . 2>/dev/null | grep -q "error\|Error\|401\|400"; then
  print_error "Failed to send transaction data"
  exit 1
fi

print_success "Transaction data sent successfully!"
echo ""

# Test 3: Test Invalid API Key
echo ""
echo "=========================================="
echo "Test 3: Test Invalid API Key (Expected to Fail)"
echo "=========================================="
print_info "Sending request with wrong API key (should get 401)"

INVALID_RESPONSE=$(curl -s -X POST "$API_URL/pumps/data" \
  -H "Content-Type: application/json" \
  -H "x-api-key: invalid-api-key-12345" \
  -d "{
    \"pumpId\": \"$PUMP_ID\",
    \"liters\": 5.0,
    \"timestamp\": \"$TIMESTAMP\"
  }")

if echo "$INVALID_RESPONSE" | grep -q "Invalid authorization header\|401\|Unauthorized"; then
  print_success "Correctly rejected invalid API key"
  echo "$INVALID_RESPONSE" | jq . 2>/dev/null || echo "$INVALID_RESPONSE"
else
  print_error "Should have received 401 error"
  echo "$INVALID_RESPONSE"
fi

echo ""

# Test 4: Test Missing API Key
echo ""
echo "=========================================="
echo "Test 4: Test Missing API Key (Expected to Fail)"
echo "=========================================="
print_info "Sending request without x-api-key header (should get 401)"

MISSING_KEY_RESPONSE=$(curl -s -X POST "$API_URL/pumps/data" \
  -H "Content-Type: application/json" \
  -d "{
    \"pumpId\": \"$PUMP_ID\",
    \"liters\": 5.0,
    \"timestamp\": \"$TIMESTAMP\"
  }")

if echo "$MISSING_KEY_RESPONSE" | grep -q "API key is required\|401\|Unauthorized"; then
  print_success "Correctly rejected request without API key"
  echo "$MISSING_KEY_RESPONSE" | jq . 2>/dev/null || echo "$MISSING_KEY_RESPONSE"
else
  print_error "Should have received 401 error"
  echo "$MISSING_KEY_RESPONSE"
fi

echo ""

# Summary
echo "=========================================="
echo "Test Summary"
echo "=========================================="
print_success "All tests completed!"
print_info "API Key for future requests: $API_KEY"
echo ""
echo "Use this API key in your ESP8266 config or future API requests"
echo ""
