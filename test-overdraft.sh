#!/bin/bash

# Test script for overdraft functionality

API="http://localhost:3001"

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║        Testing Overdraft / Credit Line Feature          ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Create a regular user (no overdraft)
echo "1️⃣  Creating regular user (Alice - NO overdraft)..."
ALICE=$(curl -s -X POST "$API/api/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice (No Overdraft)",
    "email": "alice@example.com",
    "initialBlockchains": [1],
    "allowOverdraft": false
  }' | jq -r '.data.id')

echo "   ✅ Alice ID: $ALICE"
echo ""

# Create a user with overdraft privilege
echo "2️⃣  Creating privileged user (Bob - WITH overdraft)..."
BOB=$(curl -s -X POST "$API/api/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob (With Overdraft)",
    "email": "bob@example.com",
    "initialBlockchains": [1],
    "allowOverdraft": true
  }' | jq -r '.data.id')

echo "   ✅ Bob ID: $BOB"
echo ""

# Deposit $100 to both
echo "3️⃣  Depositing \$100 to both users..."
curl -s -X POST "$API/api/transactions/deposit" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$ALICE\",
    \"amount\": 10000,
    \"ledger\": 1
  }" > /dev/null

curl -s -X POST "$API/api/transactions/deposit" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$BOB\",
    \"amount\": 10000,
    \"ledger\": 1
  }" > /dev/null

echo "   ✅ Both users now have \$100"
echo ""

# Try to withdraw $150 from Alice (should fail - no overdraft)
echo "4️⃣  Trying to withdraw \$150 from Alice (has only \$100, no overdraft)..."
RESULT=$(curl -s -X POST "$API/api/transactions/withdrawal" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$ALICE\",
    \"amount\": 15000,
    \"ledger\": 1,
    \"address\": \"0xALICE...\",
    \"forceOverdraft\": true
  }")

if echo "$RESULT" | jq -e '.error' > /dev/null; then
  echo "   ❌ Failed (as expected): $(echo $RESULT | jq -r '.error')"
else
  echo "   ⚠️  Transaction succeeded (unexpected)"
fi
echo ""

# Try to withdraw $150 from Bob WITH forceOverdraft (should succeed)
echo "5️⃣  Trying to withdraw \$150 from Bob (has only \$100, WITH overdraft permission)..."
RESULT=$(curl -s -X POST "$API/api/transactions/withdrawal" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$BOB\",
    \"amount\": 15000,
    \"ledger\": 1,
    \"address\": \"0xBOB...\",
    \"forceOverdraft\": true
  }")

if echo "$RESULT" | jq -e '.data.id' > /dev/null; then
  echo "   ✅ Success! Bob can go into overdraft"
  TX_ID=$(echo $RESULT | jq -r '.data.id')
  echo "   Transaction ID: $TX_ID"
else
  echo "   ❌ Failed: $(echo $RESULT | jq -r '.error')"
fi
echo ""

# Check balances
echo "6️⃣  Checking final balances..."
echo ""
echo "   Alice's balance:"
curl -s "$API/api/users" | jq -r ".data.users[] | select(.id == \"$ALICE\") | \"   - Ethereum: \(.balances[0].balanceFormatted)\""

echo ""
echo "   Bob's balance:"
curl -s "$API/api/users" | jq -r ".data.users[] | select(.id == \"$BOB\") | \"   - Ethereum: \(.balances[0].balanceFormatted) (NEGATIVE - Credit Line Used!)\""

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                    Test Complete!                        ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "Key takeaways:"
echo "  • Alice (no overdraft): Cannot go negative"
echo "  • Bob (with overdraft): Can go negative when forceOverdraft=true"
echo "  • forceOverdraft only works if user has allowOverdraft permission"
echo ""


