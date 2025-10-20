# Backend - Blockchain Omnibus Demo

Express.js backend with TigerBeetle integration for blockchain omnibus account management.

## Features

- **TigerBeetle Integration**: Direct connection to TigerBeetle distributed ledger
- **RESTful API**: Complete API for user, account, and transaction management
- **Transaction Services**: Same-blockchain, deposits, withdrawals, and cross-blockchain bridges
- **Mock Blockchain**: Simulated blockchain interactions for testing
- **Double-Entry Accounting**: Enforced balance integrity
- **Omnibus Management**: Pooled account reconciliation

## Project Structure

```
packages/backend/
├── src/
│   ├── tigerbeetle/       # TigerBeetle client and operations
│   ├── services/          # Business logic services
│   ├── routes/            # API route handlers
│   ├── middleware/        # Express middleware
│   ├── utils/             # Utility functions
│   └── server.ts          # Main server file
└── tests/                 # Integration and unit tests
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Environment Variables

Create a `.env` file:

```env
PORT=3001
NODE_ENV=development
TIGERBEETLE_CLUSTER_ID=0
TIGERBEETLE_REPLICA_ADDRESSES=3000
OMNIBUS_INITIAL_BALANCE=1000000000
FEE_PERCENTAGE=0.001
PENDING_TRANSFER_TIMEOUT=300
```

## API Documentation

See main README.md for complete API documentation.

