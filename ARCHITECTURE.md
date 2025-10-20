# Architecture Documentation

## System Overview

The Blockchain Omnibus Demo is a comprehensive demonstration of how to use TigerBeetle's distributed ledger to manage blockchain asset pooling (omnibus accounts) with perfect accounting integrity.

## Core Components

### 1. TigerBeetle Ledger

**Purpose**: Distributed financial accounting database providing ACID guarantees

**Key Features**:
- Double-entry bookkeeping enforced at the database level
- 128-bit account and transfer IDs
- Atomic linked transfers for multi-step operations
- Sub-millisecond latency for most operations

### 2. Account Types

#### User Accounts
- **Purpose**: Individual user balances on each blockchain
- **Ledger**: Blockchain-specific (1, 2, 3)
- **Code**: `AccountCode.USER_ACCOUNT` (1)
- **Flags**: `DEBITS_MUST_NOT_EXCEED_CREDITS` (cannot go negative)
- **Balance**: credits_posted - debits_posted

#### Omnibus Accounts
- **Purpose**: Pool all user funds per blockchain
- **Ledger**: Blockchain-specific (1, 2, 3)
- **Code**: `AccountCode.OMNIBUS_ACCOUNT` (2)
- **Flags**: None (flexible balance)
- **Function**: Bridge between on-chain and internal ledger

#### Bridge Accounts
- **Purpose**: Temporary holding during cross-chain transfers
- **Ledger**: Bridge layer (999)
- **Code**: `AccountCode.BRIDGE_ACCOUNT` (4)
- **Flags**: None

#### Fee/System Accounts
- **Purpose**: Collect transaction fees and system operations
- **Ledger**: System (0)
- **Code**: Various system codes
- **Flags**: `CREDITS_MUST_NOT_EXCEED_DEBITS` (accumulate only)

### 3. Ledger Segmentation

```
Ledger 0 (System)
├── Fee Account
└── Treasury Account

Ledger 1 (Ethereum)
├── Omnibus Account
├── User Accounts...
└── User Accounts...

Ledger 2 (Polygon)
├── Omnibus Account
├── User Accounts...
└── User Accounts...

Ledger 3 (Arbitrum)
├── Omnibus Account
├── User Accounts...
└── User Accounts...

Ledger 999 (Bridge)
└── Bridge Transit Accounts
```

## Transaction Flows

### Flow 1: Same-Blockchain User Transfer

```
User A (ETH) → User B (ETH)

TigerBeetle Operations:
1. Single transfer:
   - Debit: User A's ETH account
   - Credit: User B's ETH account
   - Ledger: 1 (Ethereum)
   - Code: USER_TRANSFER

Result: Atomic balance update, instant finality
```

### Flow 2: Deposit (Blockchain → Internal Ledger)

```
External Deposit → User Account

Steps:
1. Mock blockchain confirms deposit
2. TigerBeetle transfer:
   - Debit: Omnibus account (ETH)
   - Credit: User account (ETH)
   - Ledger: 1 (Ethereum)
   - Code: DEPOSIT

Result: User's internal balance increases, omnibus decreases
Note: In production, this would be triggered by blockchain event
```

### Flow 3: Withdrawal (Internal Ledger → Blockchain)

```
User Account → External Withdrawal

Steps:
1. TigerBeetle transfer:
   - Debit: User account (ETH)
   - Credit: Omnibus account (ETH)
   - Ledger: 1 (Ethereum)
   - Code: WITHDRAWAL

2. Initiate blockchain transaction
3. Wait for confirmation
4. Mark withdrawal complete

Result: User's internal balance decreases, omnibus increases
```

### Flow 4: Cross-Blockchain Bridge Transfer

```
User Account (ETH) → User Account (Polygon)

TigerBeetle Operations (Linked Transfers):
1. Transfer 1 (LINKED):
   - Debit: User account on Ethereum (Ledger 1)
   - Credit: Omnibus on Ethereum (Ledger 1)
   - Code: BRIDGE_OUTBOUND

2. Transfer 2 (FINAL):
   - Debit: Omnibus on Polygon (Ledger 2)
   - Credit: User account on Polygon (Ledger 2)
   - Code: BRIDGE_INBOUND

Result: Atomic cross-ledger transfer
- If both succeed: User moved funds between chains
- If either fails: Complete rollback, no partial state
```

## Data Flow

```
┌──────────────┐
│   Frontend   │
│  (Next.js)   │
└──────┬───────┘
       │ HTTP
       ▼
┌──────────────┐
│   Backend    │
│  (Express)   │
└──────┬───────┘
       │ Services
       ▼
┌──────────────┐      ┌──────────────┐
│ TigerBeetle  │◄────►│ Mock Blockchain│
│   Client     │      │   Service    │
└──────┬───────┘      └──────────────┘
       │ Native
       ▼
┌──────────────┐
│ TigerBeetle  │
│   Server     │
└──────────────┘
```

## Reconciliation

### Purpose
Ensure internal ledger matches blockchain state

### Process
```typescript
For each blockchain:
  omnibus_balance = getOmnibusBalance(blockchain)
  total_user_balances = sum(getAllUserBalances(blockchain))
  
  // In perfect state with no pending operations:
  expected_relationship = omnibus_balance + total_user_balances == initial_omnibus_funding
  
  // More generally:
  discrepancy = omnibus_balance - total_user_balances
  
  if discrepancy != 0:
    // Normal during active deposits/withdrawals
    // Investigate if persistent
```

### Balance Equation
```
Initial State:
  Omnibus Balance = $10,000
  User Balances = $0

After Operations:
  Omnibus Balance = $7,000
  User Balances = $3,000
  Total = $10,000 ✅

Imbalance Detection:
  If Omnibus + Users ≠ Initial Funding:
    → Pending operations OR error condition
```

## Error Handling

### TigerBeetle Errors

**Insufficient Balance** (`EXCEEDS_CREDITS`):
```
User attempts transfer exceeding balance
→ Transfer rejected
→ Balance unchanged
→ No compensating action needed
```

**Account Not Found** (`DEBIT_ACCOUNT_NOT_FOUND`):
```
Invalid account referenced
→ Transfer rejected
→ Return error to user
→ No state change
```

**Linked Transfer Failure** (`LINKED_EVENT_FAILED`):
```
One transfer in linked chain fails
→ All transfers rolled back automatically
→ No partial state
→ Retry entire operation if appropriate
```

### Application Errors

**Blockchain Timeout**:
```
Withdrawal initiated but blockchain slow
→ TigerBeetle transfer succeeds
→ Omnibus balance updated
→ Mark withdrawal as pending
→ Retry blockchain transaction
→ Eventually consistent
```

**User Not Found**:
```
API receives invalid user ID
→ Validation fails before TigerBeetle
→ Return 404 error
→ No ledger impact
```

## Security Considerations

### Account Protection
- User accounts: Cannot go negative (enforced by TigerBeetle)
- Omnibus accounts: Monitored for reconciliation
- All operations: Idempotent with unique transfer IDs

### Audit Trail
- Every transfer recorded with metadata
- User IDs stored in `user_data_128`
- Transaction IDs tracked in application layer
- Complete history queryable via TigerBeetle APIs

### Atomicity Guarantees
- Same-blockchain: Single transfer (atomic)
- Cross-blockchain: Linked transfers (all-or-nothing)
- No partial failures possible
- No lost funds possible

## Performance Characteristics

### TigerBeetle Operations
- Account creation: ~1ms
- Single transfer: ~1ms
- Linked transfers: ~2-3ms
- Account lookup: ~0.5ms
- Balance query: ~0.5ms

### System Throughput
- Single instance: ~1M transfers/second
- Clustered: Higher throughput with replication
- Latency: P99 < 10ms for most operations

### Scalability
- Accounts: Billions supported
- Transfers: Unlimited history
- Concurrent operations: Fully concurrent
- No locking required for most operations

## Future Enhancements

### Production Readiness
1. Real blockchain integration (Web3.js, ethers.js)
2. Webhook handlers for deposit events
3. Transaction confirmation polling
4. Retry logic with exponential backoff
5. Dead letter queues for failed operations

### Features
1. Multi-currency support
2. Fee collection and distribution
3. Batch operations for efficiency
4. Advanced reconciliation dashboard
5. Alerting for discrepancies

### Security
1. API authentication and authorization
2. Rate limiting
3. Withdrawal limits and verification
4. Multi-signature requirements
5. Audit log analysis

## Technology Decisions

### Why TigerBeetle?
- **ACID guarantees**: Perfect consistency
- **Performance**: Orders of magnitude faster than traditional DBs
- **Purpose-built**: Designed for financial ledgers
- **No data loss**: Strict durability guarantees
- **Correctness**: Impossible to create inconsistent state

### Why Monorepo?
- **Code sharing**: Types shared between frontend/backend
- **Consistency**: Same TypeScript version everywhere
- **Development speed**: Change types once, affects all packages
- **Build optimization**: Turborepo caches intelligently

### Why Next.js?
- **Developer experience**: Best-in-class React framework
- **Type safety**: Full TypeScript support
- **Performance**: Server-side rendering when needed
- **Ecosystem**: Large community and packages

## Conclusion

This architecture demonstrates production-ready patterns for managing blockchain assets with perfect accounting integrity. TigerBeetle's guarantees ensure no lost funds, no double-spending, and perfect reconciliation at all times.

