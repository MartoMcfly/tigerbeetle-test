# Frontend - Blockchain Omnibus Demo

Next.js 14 frontend application for blockchain omnibus account demonstration.

## Features

- **User Management**: Create and manage users with multi-blockchain accounts
- **Transaction Simulator**: Execute various transaction types
- **Balance Dashboard**: Real-time balance viewing across blockchains
- **Transaction History**: Complete transaction log with filters
- **Omnibus Overview**: Reconciliation status and system health
- **Responsive UI**: Modern, clean interface with Tailwind CSS

## Project Structure

```
packages/frontend/
├── src/
│   ├── app/              # Next.js 14 app directory
│   ├── components/       # React components
│   ├── services/         # API client
│   └── types/            # TypeScript types
└── public/               # Static assets
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Components

- **UserManager**: User creation and listing
- **BalanceViewer**: Display user balances by blockchain
- **TransactionForm**: Transaction execution interface
- **TransactionHistory**: Transaction log and history
- **OmnibusOverview**: Omnibus account reconciliation view

## Usage

1. Create users with initial blockchain accounts
2. Deposit funds to users (simulates blockchain deposit)
3. Execute transactions (transfers, withdrawals, bridges)
4. Monitor balances and omnibus reconciliation

