# Blockchain Omnibus Demo with TigerBeetle

A comprehensive demonstration of omnibus account patterns for blockchain transactions using TigerBeetle's distributed ledger. This project showcases best practices for pooled account management, cross-blockchain transfers, and double-entry bookkeeping with zero data loss.

## 🎯 Project Overview

This monorepo application demonstrates:

- **Double-Entry Accounting**: TigerBeetle ensures perfect balance integrity
- **Omnibus Pattern**: Pooled account management for blockchain assets
- **Cross-Blockchain Transfers**: Mock blockchain bridging with atomic transactions
- **Real-Time Reconciliation**: Continuous balance verification
- **Educational Tool**: Understanding distributed ledger best practices

## 🏗️ Architecture

### Account Structure

```
├── USER_ACCOUNT: Individual user balances (per blockchain)
├── OMNIBUS_ACCOUNT: Pooled account per blockchain
├── FEE_ACCOUNT: Transaction fee collection
└── BRIDGE_ACCOUNT: Cross-blockchain transit accounts
```

### Ledger Segmentation

- **Ledger 0**: System accounts (fees, treasury)
- **Ledger 1**: Ethereum
- **Ledger 2**: Polygon
- **Ledger 3**: Arbitrum
- **Ledger 999**: Bridge/Settlement layer

### Transaction Flows

1. **Same-Blockchain Transfer**: User A → User B on same chain
2. **Deposit**: Blockchain → User Account (via omnibus)
3. **Withdrawal**: User Account → Blockchain (via omnibus)
4. **Cross-Blockchain Bridge**: User Account (Chain A) → User Account (Chain B)

## 📦 Monorepo Structure

```
blockchain-omnibus-demo/
├── packages/
│   ├── shared/          # Shared types and constants
│   ├── backend/         # Express API + TigerBeetle integration
│   └── frontend/        # Next.js UI
├── scripts/             # Setup and utility scripts
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ and npm
- **TigerBeetle** binary (will be downloaded automatically)

### Installation

1. **Clone and Install Dependencies**

```bash
git clone <repository-url>
cd blockchain-omnibus-demo
npm install
```

2. **Set Up TigerBeetle**

```bash
# Download and initialize TigerBeetle
npm run setup:tigerbeetle

# Or manually:
# macOS/Linux
curl -Lo tigerbeetle.zip https://github.com/tigerbeetle/tigerbeetle/releases/latest/download/tigerbeetle-$(uname -m)-$(uname -s | tr '[:upper:]' '[:lower:]').zip
unzip tigerbeetle.zip -d tigerbeetle-bin
chmod +x tigerbeetle-bin/tigerbeetle

# Format and start TigerBeetle
./tigerbeetle-bin/tigerbeetle format --cluster=0 --replica=0 --replica-count=1 data.tigerbeetle
./tigerbeetle-bin/tigerbeetle start --addresses=3000 data.tigerbeetle
```

3. **Configure Environment**

```bash
# Backend
cp packages/backend/.env.example packages/backend/.env

# Frontend
cp packages/frontend/.env.local.example packages/frontend/.env.local
```

4. **Build Shared Package**

```bash
cd packages/shared
npm run build
cd ../..
```

5. **Start Development Servers**

```bash
# Terminal 1: Start TigerBeetle (if not already running)
./tigerbeetle-bin/tigerbeetle start --addresses=3000 data.tigerbeetle

# Terminal 2: Start Backend
cd packages/backend
npm run dev

# Terminal 3: Start Frontend
cd packages/frontend
npm run dev
```

6. **Access the Application**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/admin/health

## 🎮 Usage Guide

### 1. Create Users

- Click "Create New User" in the UI
- Provide name, email (optional), and select initial blockchains
- Or use "Seed Test Data" to create sample users

### 2. Deposit Funds

- Select "Deposit" transaction type
- Choose user and blockchain
- Enter amount (simulates blockchain deposit)

### 3. Transfer Money

**Same Blockchain:**
- Select "User Transfer (Same Blockchain)"
- Choose from/to users and amount
- Select blockchain

**Cross-Blockchain Bridge:**
- Select "Bridge (Cross-Blockchain)"
- Choose user, amount, source and destination blockchains
- Atomic operation ensures all-or-nothing transfer

### 4. Monitor System

- **Balances Tab**: View all user balances by blockchain
- **Transactions Tab**: Complete transaction history
- **Omnibus Tab**: Reconciliation status and omnibus account health

## 🧪 Testing

### Run Integration Tests

```bash
cd packages/backend
npm test
```

### Manual Testing Scenarios

**Scenario 1: Basic Transfer**
```bash
# Create Alice and Bob on Ethereum
# Deposit $1000 to Alice
# Transfer $250 from Alice to Bob
# Expected: Alice=$750, Bob=$250
```

**Scenario 2: Cross-Blockchain Bridge**
```bash
# Create user on Ethereum and Polygon
# Deposit $1000 to Ethereum
# Bridge $400 from Ethereum to Polygon
# Expected: ETH=$600, Polygon=$400
```

**Scenario 3: Insufficient Funds**
```bash
# Attempt transfer exceeding balance
# Expected: Transaction fails, balances unchanged
```

## 🔧 API Endpoints

### Users

- `POST /api/users` - Create user
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user with balances

### Transactions

- `POST /api/transactions/transfer` - Same-blockchain transfer
- `POST /api/transactions/deposit` - Deposit funds
- `POST /api/transactions/withdraw` - Withdraw funds
- `POST /api/transactions/bridge` - Cross-blockchain transfer
- `GET /api/transactions` - List transactions
- `GET /api/transactions/:id` - Get transaction details

### Accounts

- `GET /api/accounts/:id/balance` - Get account balance
- `GET /api/accounts/omnibus` - Omnibus accounts status

### Admin

- `GET /api/admin/health` - Health check
- `GET /api/admin/ledgers` - List all ledgers
- `GET /api/admin/reconcile` - Check reconciliation
- `POST /api/admin/seed` - Seed test data

## 📚 Key Concepts

### Double-Entry Bookkeeping

Every transaction has equal debits and credits:
```
Transfer $100 from Alice to Bob:
- Debit Alice's account: $100
- Credit Bob's account: $100
Total: $0 (balanced)
```

### Omnibus Accounts

Pool blockchain assets for all users:
```
Initial State:
- Omnibus (Ethereum): $10,000
- User accounts: $0

After deposits:
- Omnibus (Ethereum): $7,000
- Alice: $1,500
- Bob: $1,000
- Carol: $500
Total: $10,000 (reconciled)
```

### Linked Transfers

Atomic multi-step operations:
```
Cross-blockchain bridge uses linked transfers:
1. Debit source user account
2. Credit source omnibus
3. Debit destination omnibus
4. Credit destination user account

All succeed or all fail together.
```

## 🛠️ Technology Stack

- **Backend**: TypeScript, Node.js, Express.js
- **Frontend**: Next.js 14, React, Tailwind CSS
- **Ledger**: TigerBeetle (distributed financial database)
- **Testing**: Jest, Supertest
- **Monorepo**: npm workspaces + Turborepo

## 📖 TigerBeetle Integration

### Account Creation

```typescript
const account = {
  id: generateId(),
  user_data_128: uuidToBigInt(userId),
  ledger: Ledger.ETHEREUM,
  code: AccountCode.USER_ACCOUNT,
  flags: AccountFlags.DEBITS_MUST_NOT_EXCEED_CREDITS,
};
```

### Transfer Execution

```typescript
const transfer = {
  id: generateId(),
  debit_account_id: fromAccountId,
  credit_account_id: toAccountId,
  amount: toTigerBeetleAmount(100.50), // $100.50
  ledger: Ledger.ETHEREUM,
  code: TransferCode.USER_TRANSFER,
};
```

## 🐛 Troubleshooting

### TigerBeetle Connection Failed

```bash
# Ensure TigerBeetle is running
ps aux | grep tigerbeetle

# Check data file exists
ls -lh data.tigerbeetle

# Restart TigerBeetle
./tigerbeetle-bin/tigerbeetle start --addresses=3000 data.tigerbeetle
```

### Port Already in Use

```bash
# Backend (3001)
lsof -ti:3001 | xargs kill -9

# Frontend (3000)
lsof -ti:3000 | xargs kill -9
```

### Shared Package Not Found

```bash
# Rebuild shared package
cd packages/shared
npm run build
```

## 🤝 Contributing

This is an educational demo project. Feel free to:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- [TigerBeetle](https://tigerbeetle.com/) - High-performance distributed financial accounting database
- Built as an educational demonstration of omnibus account patterns

## 📞 Support

For questions or issues:
- Open a GitHub issue
- Check TigerBeetle documentation: https://docs.tigerbeetle.com/

---

**Built with ❤️ to demonstrate TigerBeetle's capabilities**

# tigerbeetle-test
# tigerbeetle-test
