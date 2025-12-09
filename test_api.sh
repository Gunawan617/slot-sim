#!/bin/bash

BASE_URL="http://localhost:8080"
USERNAME="testUser$RANDOM"
PASSWORD="secretPassword"

echo "=========================================="
echo "Testing Slot Sim API"
echo "=========================================="
echo

echo "[1/5] Registering new user: $USERNAME"
curl -s -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$USERNAME\", \"password\": \"$PASSWORD\"}"
echo
echo

echo "[2/5] Logging in..."
RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$USERNAME\", \"password\": \"$PASSWORD\"}")

echo "Response: $RESPONSE"

# Extract token using grep/sed (simple extraction)
TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')

echo
echo "Extracted Token: $TOKEN"
echo

if [ -z "$TOKEN" ]; then
    echo "Failed to get token. Exiting."
    exit 1
fi

echo "[3/5] Getting Profile..."
curl -s -X GET "$BASE_URL/user/me" \
  -H "Authorization: Bearer $TOKEN"
echo
echo

echo "[4/5] Playing Slot..."
curl -s -X POST "$BASE_URL/user/play-slot" \
  -H "Authorization: Bearer $TOKEN"
echo
echo

echo "[5/5] Getting History..."
curl -s -X GET "$BASE_URL/user/history" \
  -H "Authorization: Bearer $TOKEN"
echo
echo

echo "=========================================="
echo "Tests Completed"
echo "=========================================="
