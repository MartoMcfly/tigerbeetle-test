# Usage Examples

Practical examples of using the Blockchain Omnibus Demo.

## Example 1: Basic User-to-User Transfer

### Scenario
Alice wants to send $100 to Bob on Ethereum.

### Prerequisites
- Both users exist with Ethereum accounts
- Alice has sufficient balance (at least $100)

### Steps

**1. Via UI:**
- Select "User Transfer (Same Blockchain)"
- From: Alice
- To: Bob
- Amount: 100
- Blockchain: Ethereum
- Click "Execute Transaction"

**2. Via API:**
```bash
curl -X POST http://localhost:3001/api/transactions/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "fromUserId": "alice-uuid-here",
    "toUserId": "bob-uuid-here",
    "amount": 100,
    "ledger": 1
  }'
```

### Expected Result
```json
{
  "status": "success",
  "data": {
    "transaction": {
      "id": "trans-xxx",
      "type": "same_blockchain",
      "status": "posted",
      "fromUserId": "alice-uuid",
      "toUserId": "bob-uuid",
      "amount": "10000",
      "amountFormatted": "100.00",
      "sourceLedger": 1,
      "destinationLedger": 1
    }
  }
}
```

### Balance Changes
- Alice's Ethereum balance: -$100
- Bob's Ethereum balance: +$100

---

## Example 2: Deposit Funds

### Scenario
Simulate a blockchain deposit of $500 to Carol's Polygon account.

### Steps

**1. Via UI:**
- Select "Deposit (Blockchain → User)"
- User: Carol
- Amount: 500
- Blockchain: Polygon
- Click "Execute Transaction"

**2. Via API:**
```bash
curl -X POST http://localhost:3001/api/transactions/deposit \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "carol-uuid-here",
    "amount": 500,
    "ledger": 2
  }'
```

### What Happens
1. Mock blockchain confirms deposit (2 second delay)
2. TigerBeetle executes transfer:
   - Debit: Polygon omnibus account
   - Credit: Carol's Polygon account
3. Transaction marked as posted

### Expected Result
- Carol's Polygon balance: +$500
- Polygon omnibus balance: -$500
- Transaction history shows deposit with blockchain TxHash

---

## Example 3: Cross-Blockchain Bridge

### Scenario
Alice wants to move $300 from Ethereum to Polygon.

### Prerequisites
- Alice has accounts on both Ethereum and Polygon
- Alice has at least $300 on Ethereum

### Steps

**1. Via UI:**
- Select "Bridge (Cross-Blockchain)"
- User: Alice
- Amount: 300
- Source Blockchain: Ethereum
- Destination Blockchain: Polygon
- Click "Execute Transaction"

**2. Via API:**
```bash
curl -X POST http://localhost:3001/api/transactions/bridge \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "alice-uuid-here",
    "amount": 300,
    "sourceLedger": 1,
    "destinationLedger": 2
  }'
```

### What Happens (Atomic)
1. TigerBeetle linked transfer #1:
   - Debit: Alice's Ethereum account (-$300)
   - Credit: Ethereum omnibus (+$300)
2. TigerBeetle linked transfer #2:
   - Debit: Polygon omnibus (-$300)
   - Credit: Alice's Polygon account (+$300)

Both transfers succeed or both fail!

### Expected Result
- Alice's Ethereum: -$300
- Alice's Polygon: +$300
- Alice's total balance: Unchanged
- Transaction type: "cross_blockchain"
- Status: "posted"

---

## Example 4: Withdrawal

### Scenario
Bob wants to withdraw $200 from Ethereum to an external address.

### Prerequisites
- Bob has at least $200 on Ethereum
- External wallet address available

### Steps

**1. Via UI:**
- Select "Withdrawal (User → Blockchain)"
- From User: Bob
- Amount: 200
- Blockchain: Ethereum
- Withdrawal Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
- Click "Execute Transaction"

**2. Via API:**
```bash
curl -X POST http://localhost:3001/api/transactions/withdraw \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "bob-uuid-here",
    "amount": 200,
    "ledger": 1,
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }'
```

### What Happens
1. TigerBeetle transfer:
   - Debit: Bob's Ethereum account (-$200)
   - Credit: Ethereum omnibus (+$200)
2. Mock blockchain processes withdrawal
3. Blockchain TxHash generated
4. Withdrawal marked complete

### Expected Result
- Bob's Ethereum balance: -$200
- Ethereum omnibus: +$200
- Transaction metadata includes withdrawal address and TxHash

---

## Example 5: Creating Users with Multiple Blockchains

### Scenario
Create a new user "David" with accounts on all three blockchains.

### Steps

**1. Via UI:**
- Enter name: David
- Enter email: david@example.com
- Check all blockchains:
  - ✅ Ethereum
  - ✅ Polygon
  - ✅ Arbitrum
- Click "Create User"

**2. Via API:**
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "David",
    "email": "david@example.com",
    "initialBlockchains": [1, 2, 3]
  }'
```

### Expected Result
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "david-uuid",
      "name": "David",
      "email": "david@example.com",
      "balances": [
        {
          "ledger": 1,
          "blockchainName": "Ethereum",
          "balance": "0",
          "balanceFormatted": "0.00"
        },
        {
          "ledger": 2,
          "blockchainName": "Polygon",
          "balance": "0",
          "balanceFormatted": "0.00"
        },
        {
          "ledger": 3,
          "blockchainName": "Arbitrum",
          "balance": "0",
          "balanceFormatted": "0.00"
        }
      ],
      "totalBalance": "0"
    }
  }
}
```

David now has three accounts (one per blockchain), all with $0 balance.

---

## Example 6: Checking Reconciliation

### Scenario
Verify that all omnibus accounts are properly reconciled.

### Steps

**1. Via UI:**
- Click "Omnibus Overview" tab
- View reconciliation status for each blockchain
- Click "Refresh Data" to update

**2. Via API:**
```bash
curl http://localhost:3001/api/admin/reconcile
```

### Expected Result
```json
{
  "status": "success",
  "data": {
    "allReconciled": true,
    "statuses": [
      {
        "ledger": 1,
        "blockchainName": "Ethereum",
        "omnibusAccountId": "123456",
        "omnibusBalance": "700000",
        "totalUserBalances": "300000",
        "discrepancy": "400000",
        "userAccountCount": 3,
        "isReconciled": true
      }
    ]
  }
}
```

### What It Means
- **omnibusBalance**: Funds held in omnibus ($7,000)
- **totalUserBalances**: Sum of all user balances ($3,000)
- **discrepancy**: Available liquidity ($4,000)
- **isReconciled**: true = system is balanced ✅

---

## Example 7: Seeding Test Data

### Scenario
Quickly populate the system with sample users and balances for testing.

### Steps

**1. Via UI:**
- Click "Seed Test Data" button

**2. Via API:**
```bash
curl -X POST http://localhost:3001/api/admin/seed
```

### What Gets Created
1. **Alice Johnson**
   - Email: alice@example.com
   - Ethereum: $1,000
   - Polygon: $500

2. **Bob Smith**
   - Email: bob@example.com
   - Ethereum: $750

3. **Carol Williams**
   - Email: carol@example.com
   - Polygon: $300

### Use Cases
- Quick demo setup
- Testing transaction flows
- UI development
- Integration testing

---

## Example 8: Complex Transaction Flow

### Scenario
Multi-step transaction flow demonstrating the system's capabilities.

### Complete Flow

**Step 1: Create Users**
```bash
# Create Alice
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "initialBlockchains": [1, 2]}'

# Create Bob
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Bob", "initialBlockchains": [1]}'
```

**Step 2: Fund Alice**
```bash
# Deposit $1000 to Alice on Ethereum
curl -X POST http://localhost:3001/api/transactions/deposit \
  -H "Content-Type: application/json" \
  -d '{"userId": "alice-id", "amount": 1000, "ledger": 1}'

# Deposit $500 to Alice on Polygon
curl -X POST http://localhost:3001/api/transactions/deposit \
  -H "Content-Type: application/json" \
  -d '{"userId": "alice-id", "amount": 500, "ledger": 2}'
```

**Step 3: Alice Sends to Bob**
```bash
# Transfer $250 from Alice to Bob on Ethereum
curl -X POST http://localhost:3001/api/transactions/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "fromUserId": "alice-id",
    "toUserId": "bob-id",
    "amount": 250,
    "ledger": 1
  }'
```

**Step 4: Alice Bridges Funds**
```bash
# Bridge $300 from Ethereum to Polygon
curl -X POST http://localhost:3001/api/transactions/bridge \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "alice-id",
    "amount": 300,
    "sourceLedger": 1,
    "destinationLedger": 2
  }'
```

**Step 5: Verify Balances**
```bash
# Get Alice's balances
curl http://localhost:3001/api/users/alice-id

# Expected:
# Ethereum: $1000 - $250 - $300 = $450
# Polygon: $500 + $300 = $800
# Total: $1250

# Get Bob's balances
curl http://localhost:3001/api/users/bob-id

# Expected:
# Ethereum: $250
```

**Step 6: Check Reconciliation**
```bash
curl http://localhost:3001/api/admin/reconcile

# Should show all blockchains reconciled ✅
```

### Final State
- Alice: $450 ETH, $800 Polygon = $1,250 total
- Bob: $250 ETH
- All transactions posted successfully
- System fully reconciled

---

## Example 9: Error Handling

### Scenario
Demonstrate how the system handles errors gracefully.

### Test Case 1: Insufficient Balance
```bash
# Bob tries to transfer more than he has
curl -X POST http://localhost:3001/api/transactions/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "fromUserId": "bob-id",
    "toUserId": "alice-id",
    "amount": 10000,
    "ledger": 1
  }'

# Result:
# - Status: 201 (request accepted)
# - Transaction status: "failed"
# - Error: "Exceeds credits (insufficient balance)"
# - Balances: Unchanged ✅
```

### Test Case 2: Invalid User
```bash
# Try to transfer with non-existent user
curl -X POST http://localhost:3001/api/transactions/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "fromUserId": "invalid-id",
    "toUserId": "alice-id",
    "amount": 100,
    "ledger": 1
  }'

# Result:
# - Status: 500
# - Error: "User accounts not found on specified blockchain"
# - No TigerBeetle operations attempted ✅
```

### Test Case 3: Validation Error
```bash
# Invalid request format
curl -X POST http://localhost:3001/api/transactions/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "fromUserId": "alice-id",
    "amount": -100,
    "ledger": 1
  }'

# Result:
# - Status: 400
# - Error: "Validation error: amount must be positive"
# - Request rejected before processing ✅
```

---

## Tips for Exploring

1. **Start with Seed Data**: Gets you up and running quickly
2. **Try Each Transaction Type**: Understand the different flows
3. **Check Reconciliation Often**: See how omnibus balances work
4. **Experiment with Errors**: See TigerBeetle's protections in action
5. **Use the UI and API**: Both provide full functionality
6. **Monitor Transaction History**: Track all operations
7. **Bridge Between Chains**: See atomic cross-ledger transfers
8. **Test Edge Cases**: Zero amounts, same user transfers, etc.

Enjoy exploring the system! 🚀

