# Quick Start Guide

Get the Blockchain Omnibus Demo running in under 5 minutes!

## Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **Terminal** access
- **Web Browser**

## Step-by-Step Setup

### 1. Clone and Install (2 minutes)

```bash
# Navigate to your projects directory
cd ~/projects

# If you haven't already, the project is in ~/blockchain-omnibus-demo
cd /Users/martinp/blockchain-omnibus-demo

# Install all dependencies
npm install
```

### 2. Set Up TigerBeetle (1 minute)

```bash
# Run the automated setup script
npm run setup:tigerbeetle
```

This will:
- Download TigerBeetle binary for your platform
- Create and initialize the data file
- Set up the cluster

### 3. Build Shared Package (30 seconds)

```bash
cd packages/shared
npm run build
cd ../..
```

### 4. Start Everything (1 minute)

**Option A: Manual Start (Recommended for first time)**

Open 3 terminal windows:

**Terminal 1 - TigerBeetle:**
```bash
./tigerbeetle-bin/tigerbeetle start --addresses=3000 data.tigerbeetle
```

**Terminal 2 - Backend:**
```bash
cd packages/backend
npm run dev
```

**Terminal 3 - Frontend:**
```bash
cd packages/frontend
npm run dev
```

**Option B: Automated Start (All in one)**

```bash
./scripts/start-dev.sh
```

### 5. Open Your Browser

Navigate to: **http://localhost:3000**

You should see the Blockchain Omnibus Demo interface! 🎉

## First Steps in the App

### 1. Seed Test Data

Click the **"Seed Test Data"** button to create sample users with funds:
- Alice with $1,000 on Ethereum and $500 on Polygon
- Bob with $750 on Ethereum
- Carol with $300 on Polygon

### 2. Try a Transfer

1. Go to the right panel
2. Select **"User Transfer (Same Blockchain)"**
3. Choose Alice → Bob
4. Enter amount: **100**
5. Select Ethereum
6. Click **"Execute Transaction"**
7. Watch balances update in real-time!

### 3. Try a Bridge Transfer

1. Select **"Bridge (Cross-Blockchain)"**
2. Choose Alice
3. Enter amount: **200**
4. Source: Ethereum
5. Destination: Polygon
6. Execute and see Alice's balance move between chains!

### 4. Check Omnibus Status

Click the **"Omnibus Overview"** tab to see:
- Total balances per blockchain
- Reconciliation status
- User account counts

## Verify Everything Works

### Health Check

Visit: **http://localhost:3001/api/admin/health**

You should see:
```json
{
  "status": "success",
  "data": {
    "service": "blockchain-omnibus-backend",
    "uptime": ...,
    "timestamp": "..."
  }
}
```

### Check Reconciliation

Visit: **http://localhost:3001/api/admin/reconcile**

All blockchains should show `isReconciled: true` after initial setup.

## Common Issues

### Port Already in Use

```bash
# Kill processes on ports 3000 and 3001
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### TigerBeetle Not Starting

```bash
# Check if data file exists
ls -lh data.tigerbeetle

# If not, reinitialize
./tigerbeetle-bin/tigerbeetle format --cluster=0 --replica=0 --replica-count=1 data.tigerbeetle
```

### Cannot Find Module '@blockchain-omnibus/shared'

```bash
# Rebuild shared package
cd packages/shared
npm run build
```

### Frontend Build Errors

```bash
# Clear Next.js cache
cd packages/frontend
rm -rf .next
npm run dev
```

## What to Try Next

1. **Create Your Own User**
   - Add a custom user with your name
   - Select multiple blockchains
   - Deposit funds

2. **Test Edge Cases**
   - Try transferring more than you have (should fail)
   - Bridge funds between all blockchain combinations
   - Check balances after each operation

3. **Watch Omnibus Reconciliation**
   - Execute several transactions
   - Go to Omnibus tab
   - Click "Refresh Data"
   - Verify all balances reconcile

4. **Explore the API**
   - Open **http://localhost:3001/api/admin/ledgers**
   - Try the `/api/users` endpoint
   - Check transaction history

## API Examples

### Create a User
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "initialBlockchains": [1, 2]
  }'
```

### Get All Users
```bash
curl http://localhost:3001/api/users
```

### Make a Deposit
```bash
curl -X POST http://localhost:3001/api/transactions/deposit \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID_HERE",
    "amount": 500,
    "ledger": 1
  }'
```

## Next Steps

- Read [README.md](README.md) for complete documentation
- Check [ARCHITECTURE.md](ARCHITECTURE.md) to understand the system
- Explore the code in `packages/backend/src/`
- Customize the frontend in `packages/frontend/src/`

## Stop the Application

Press **Ctrl+C** in each terminal window to stop:
1. TigerBeetle server
2. Backend server
3. Frontend server

Or if using the automated script, just Ctrl+C once.

---

**Congratulations! You're now running a complete blockchain omnibus system with TigerBeetle!** 🐯🎉

For questions or issues, check the main [README.md](README.md) or [CONTRIBUTING.md](CONTRIBUTING.md).

