# System Diagrams

Visual representations of the Blockchain Omnibus Demo architecture and flows.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Next.js Frontend (Port 3000)               │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │    │
│  │  │  User    │  │Transaction│  │ Omnibus  │        │    │
│  │  │ Manager  │  │   Form    │  │ Overview │        │    │
│  │  └──────────┘  └──────────┘  └──────────┘        │    │
│  └────────────────────────────────────────────────────┘    │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/JSON
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Express Backend (Port 3001)                     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  API Routes                           │  │
│  │  /users  /accounts  /transactions  /admin            │  │
│  └─────────────────────┬─────────────────────────────────┘  │
│                        │                                     │
│  ┌─────────────────────▼─────────────────────────────────┐  │
│  │               Business Logic Services                 │  │
│  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  │  │
│  │  │User  │  │Trans-│  │Omni- │  │Bridge│  │Block-│  │  │
│  │  │Svc   │  │action│  │bus   │  │Svc   │  │chain │  │  │
│  │  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘  │  │
│  └─────────────────────┬─────────────────────────────────┘  │
│                        │                                     │
│  ┌─────────────────────▼─────────────────────────────────┐  │
│  │         TigerBeetle Client Wrapper                    │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │  │
│  │  │ Accounts │  │Transfers │  │  Client  │           │  │
│  │  └──────────┘  └──────────┘  └──────────┘           │  │
│  └─────────────────────┬─────────────────────────────────┘  │
└────────────────────────┼─────────────────────────────────────┘
                         │ Native Protocol
                         ▼
┌─────────────────────────────────────────────────────────────┐
│          TigerBeetle Server (Port 3000)                     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Distributed Ledger                       │  │
│  │                                                        │  │
│  │  Ledger 0 (System)  │  Ledger 1 (Ethereum)           │  │
│  │  Ledger 2 (Polygon) │  Ledger 3 (Arbitrum)           │  │
│  │  Ledger 999 (Bridge)                                  │  │
│  │                                                        │  │
│  │  [Accounts] [Transfers] [Balance Tracking]           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Persistent Storage                         │  │
│  │            data.tigerbeetle                           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Account Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    LEDGER 0 (SYSTEM)                        │
├─────────────────────────────────────────────────────────────┤
│  Account ID: xxx001  │  Fee Account                         │
│  Account ID: xxx002  │  Treasury Account                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  LEDGER 1 (ETHEREUM)                        │
├─────────────────────────────────────────────────────────────┤
│  Account ID: yyy001  │  Omnibus Account (Pooled)           │
│  ├─ Balance: $7,000                                         │
│  └─ Flags: None (flexible)                                  │
├─────────────────────────────────────────────────────────────┤
│  Account ID: zzz001  │  Alice's ETH Account                │
│  ├─ Balance: $1,500                                         │
│  └─ Flags: DEBITS_MUST_NOT_EXCEED_CREDITS                  │
├─────────────────────────────────────────────────────────────┤
│  Account ID: zzz002  │  Bob's ETH Account                  │
│  ├─ Balance: $1,000                                         │
│  └─ Flags: DEBITS_MUST_NOT_EXCEED_CREDITS                  │
├─────────────────────────────────────────────────────────────┤
│  Account ID: zzz003  │  Carol's ETH Account                │
│  ├─ Balance: $500                                           │
│  └─ Flags: DEBITS_MUST_NOT_EXCEED_CREDITS                  │
└─────────────────────────────────────────────────────────────┘
         Total User Balances: $3,000
         Omnibus + Users = $10,000 ✅ Reconciled

┌─────────────────────────────────────────────────────────────┐
│                  LEDGER 2 (POLYGON)                         │
├─────────────────────────────────────────────────────────────┤
│  Account ID: yyy002  │  Omnibus Account (Pooled)           │
│  User Accounts...                                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  LEDGER 3 (ARBITRUM)                        │
├─────────────────────────────────────────────────────────────┤
│  Account ID: yyy003  │  Omnibus Account (Pooled)           │
│  User Accounts...                                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  LEDGER 999 (BRIDGE)                        │
├─────────────────────────────────────────────────────────────┤
│  Account ID: bbb001  │  Bridge Transit Account             │
│  └─ Used for cross-chain atomic transfers                   │
└─────────────────────────────────────────────────────────────┘
```

## Transaction Flow 1: Same-Blockchain Transfer

```
┌─────────────────────────────────────────────────────────────┐
│           User Transfer: Alice → Bob (Ethereum)             │
│                    Amount: $250                             │
└─────────────────────────────────────────────────────────────┘

Before:
┌─────────────┐                           ┌─────────────┐
│   Alice     │                           │    Bob      │
│  (Ledger 1) │                           │ (Ledger 1)  │
│             │                           │             │
│ Balance:    │                           │ Balance:    │
│  $1,000     │                           │   $250      │
└─────────────┘                           └─────────────┘

Transfer Execution:
┌─────────────────────────────────────────────────────────────┐
│  TigerBeetle Transfer                                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │ ID: transfer_001                                    │    │
│  │ Debit:  Alice's Account  (zzz001)  $250           │    │
│  │ Credit: Bob's Account    (zzz002)  $250           │    │
│  │ Ledger: 1 (Ethereum)                              │    │
│  │ Code:   USER_TRANSFER                             │    │
│  │ Status: POSTED ✅                                  │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

After:
┌─────────────┐                           ┌─────────────┐
│   Alice     │                           │    Bob      │
│  (Ledger 1) │  ────$250────────────>    │ (Ledger 1)  │
│             │                           │             │
│ Balance:    │                           │ Balance:    │
│   $750 ✅   │                           │   $500 ✅   │
└─────────────┘                           └─────────────┘

Result: Atomic, instant, zero data loss
```

## Transaction Flow 2: Deposit

```
┌─────────────────────────────────────────────────────────────┐
│          Deposit: Blockchain → Alice (Ethereum)             │
│                    Amount: $500                             │
└─────────────────────────────────────────────────────────────┘

Step 1: Blockchain Event (Simulated)
┌─────────────────────────────────────────────────────────────┐
│  Mock Blockchain                                            │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Deposit Detected                                    │    │
│  │ TxHash: 0xabc123...                                │    │
│  │ Amount: $500                                        │    │
│  │ User:   Alice                                       │    │
│  │ Confirmation Time: ~2 seconds                      │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

Step 2: TigerBeetle Transfer
┌─────────────────────────────────────────────────────────────┐
│  Linked Transfer (Atomic)                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Debit:  Omnibus Account (yyy001)    $500          │    │
│  │ Credit: Alice's Account (zzz001)    $500          │    │
│  │ Ledger: 1 (Ethereum)                              │    │
│  │ Code:   DEPOSIT                                    │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

Balance Changes:
┌─────────────────┐              ┌─────────────────┐
│ Omnibus (ETH)   │              │  Alice (ETH)    │
│                 │              │                 │
│ Before: $7,500  │              │ Before: $1,000  │
│ After:  $7,000  │  <── ──>     │ After:  $1,500  │
│ Change:  -$500  │              │ Change:  +$500  │
└─────────────────┘              └─────────────────┘

Total System Balance: Unchanged ✅
Reconciliation: Pass ✅
```

## Transaction Flow 3: Cross-Blockchain Bridge

```
┌─────────────────────────────────────────────────────────────┐
│   Bridge Transfer: Alice ETH → Alice Polygon                │
│                    Amount: $400                             │
└─────────────────────────────────────────────────────────────┘

Initial State:
┌──────────────────┐              ┌──────────────────┐
│  Alice (ETH)     │              │ Alice (Polygon)  │
│  Ledger 1        │              │  Ledger 2        │
│  Balance: $1,500 │              │  Balance: $500   │
└──────────────────┘              └──────────────────┘

TigerBeetle Linked Transfers (All-or-Nothing):

Transfer 1 (LINKED):
┌─────────────────────────────────────────────────────────────┐
│ Debit:  Alice ETH (zzz001)      $400                       │
│ Credit: Omnibus ETH (yyy001)    $400                       │
│ Ledger: 1                                                   │
│ Code:   BRIDGE_OUTBOUND                                    │
│ Flags:  LINKED (must succeed with next)                    │
└─────────────────────────────────────────────────────────────┘
                           ↓
Transfer 2 (FINAL):
┌─────────────────────────────────────────────────────────────┐
│ Debit:  Omnibus Polygon (yyy002)  $400                     │
│ Credit: Alice Polygon (zzz004)    $400                     │
│ Ledger: 2                                                   │
│ Code:   BRIDGE_INBOUND                                     │
│ Flags:  None (final in chain)                              │
└─────────────────────────────────────────────────────────────┘

Final State:
┌──────────────────┐              ┌──────────────────┐
│  Alice (ETH)     │              │ Alice (Polygon)  │
│  Ledger 1        │   Bridge     │  Ledger 2        │
│  Balance: $1,100 │  ═══════>    │  Balance: $900   │
│  (-$400) ✅      │              │  (+$400) ✅      │
└──────────────────┘              └──────────────────┘

Omnibus Changes:
ETH Omnibus:     +$400 (holds user funds)
Polygon Omnibus: -$400 (released to user)

Result: Atomic cross-blockchain transfer
If either step fails, both rollback automatically! 🔒
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   REQUEST LIFECYCLE                          │
└─────────────────────────────────────────────────────────────┘

1. User Action (Frontend)
   │
   │  User clicks "Execute Transaction"
   │  Amount: $250, From: Alice, To: Bob
   │
   ▼
2. API Call
   │
   │  POST /api/transactions/transfer
   │  Body: { fromUserId, toUserId, amount, ledger }
   │
   ▼
3. Validation (Middleware)
   │
   │  Zod schema validation
   │  Type checking
   │  Required fields present
   │
   ▼
4. Route Handler
   │
   │  Parse request
   │  Convert amount to TigerBeetle format
   │  Call service layer
   │
   ▼
5. Transaction Service
   │
   │  Look up user account IDs
   │  Generate unique transfer ID
   │  Prepare transfer metadata
   │
   ▼
6. TigerBeetle Transfer
   │
   │  Execute transfer operation
   │  Check for errors
   │  Update internal state
   │
   ▼
7. TigerBeetle Processing
   │
   │  Validate accounts exist
   │  Check balance sufficient
   │  Apply double-entry rules
   │  Persist atomically to disk
   │  Return success/error
   │
   ▼
8. Response Processing
   │
   │  Create transaction record
   │  Format response
   │  Return to client
   │
   ▼
9. Frontend Update
   │
   │  Display success message
   │  Refresh balances
   │  Update transaction history
   │
   ✅ COMPLETE

Total Time: ~10-50ms
```

## Omnibus Reconciliation

```
┌─────────────────────────────────────────────────────────────┐
│              RECONCILIATION PROCESS                          │
└─────────────────────────────────────────────────────────────┘

For Each Blockchain:

┌─────────────────────────────────────────────────────────────┐
│  Ethereum (Ledger 1)                                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Step 1: Get Omnibus Balance                                │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Query: Account yyy001                              │    │
│  │ Result: credits_posted - debits_posted = $7,000    │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Step 2: Sum All User Balances                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Alice:  $1,500                                      │    │
│  │ Bob:    $1,000                                      │    │
│  │ Carol:    $500                                      │    │
│  │ ─────────────                                       │    │
│  │ Total:  $3,000                                      │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Step 3: Calculate Discrepancy                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Discrepancy = Omnibus - User Balances              │    │
│  │             = $7,000 - $3,000                       │    │
│  │             = $4,000                                │    │
│  │                                                      │    │
│  │ This represents funds available in omnibus          │    │
│  │ for new deposits or withdrawals                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Step 4: Verify Conservation                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Initial Funding:    $10,000                         │    │
│  │ Omnibus + Users:     $7,000 + $3,000 = $10,000    │    │
│  │ Status: ✅ RECONCILED                               │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

Conservation Law:
  Initial Omnibus = Current Omnibus + Total User Balances + Withdrawn
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────┐
│          INSUFFICIENT BALANCE SCENARIO                       │
└─────────────────────────────────────────────────────────────┘

Bob tries to transfer $1,000 but only has $500

Request:
  POST /api/transactions/transfer
  { fromUserId: Bob, toUserId: Alice, amount: 1000 }

Processing:
┌─────────────────────────────────────────────────────────────┐
│ 1. Validation ✅                                            │
│    - Request format valid                                   │
│    - Users exist                                            │
│    - Amount positive                                        │
├─────────────────────────────────────────────────────────────┤
│ 2. Account Lookup ✅                                        │
│    - Bob's account: zzz002                                  │
│    - Alice's account: zzz001                                │
├─────────────────────────────────────────────────────────────┤
│ 3. TigerBeetle Transfer ❌                                  │
│    ┌─────────────────────────────────────────────────┐    │
│    │ Debit: Bob (zzz002)  $1,000                     │    │
│    │ Credit: Alice        $1,000                     │    │
│    │                                                  │    │
│    │ TigerBeetle checks:                             │    │
│    │   Bob's balance: $500                           │    │
│    │   Transfer amount: $1,000                       │    │
│    │   Bob has DEBITS_MUST_NOT_EXCEED_CREDITS flag  │    │
│    │                                                  │    │
│    │ Result: EXCEEDS_CREDITS error                   │    │
│    │ ❌ Transfer REJECTED                             │    │
│    └─────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│ 4. Error Handling                                           │
│    - Catch TigerBeetle error                               │
│    - Create failed transaction record                       │
│    - Return error to client                                │
└─────────────────────────────────────────────────────────────┘

Response:
  {
    "status": "success",
    "data": {
      "transaction": {
        "id": "xxx",
        "status": "failed",
        "error": "Exceeds credits (insufficient balance)"
      }
    }
  }

Balances:
  Bob:   $500 (unchanged) ✅
  Alice: Balance (unchanged) ✅

Result: No partial state, no data corruption, perfect rollback
```

This demonstrates TigerBeetle's built-in protections!

