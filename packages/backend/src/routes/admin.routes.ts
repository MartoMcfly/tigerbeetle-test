import { Router } from 'express';
import { asyncHandler } from '../middleware/error-handler';
import { checkReconciliation } from '../services/omnibus.service';
import { getAllBlockchains } from '../services/blockchain-mock.service';
import { createUser } from '../services/user.service';
import { depositToUser } from '../services/transaction.service';
import { toTigerBeetleAmount } from '../utils/amount-converter';
import { Ledger, BLOCKCHAIN_LEDGERS } from '@blockchain-omnibus/shared';

const router = Router();

// Health check
router.get(
  '/health',
  asyncHandler(async (req, res) => {
    res.json({
      status: 'success',
      data: {
        service: 'blockchain-omnibus-backend',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
    });
  })
);

// Get all ledgers summary
router.get(
  '/ledgers',
  asyncHandler(async (req, res) => {
    const blockchains = getAllBlockchains();
    
    res.json({
      status: 'success',
      data: { blockchains },
    });
  })
);

// Check reconciliation
router.get(
  '/reconcile',
  asyncHandler(async (req, res) => {
    const result = await checkReconciliation();
    
    // Convert bigints to strings
    const formatted = {
      allReconciled: result.allReconciled,
      statuses: result.statuses.map(status => ({
        ...status,
        omnibusAccountId: status.omnibusAccountId.toString(),
        omnibusBalance: status.omnibusBalance.toString(),
        totalUserBalances: status.totalUserBalances.toString(),
        discrepancy: status.discrepancy.toString(),
      })),
    };
    
    res.json({
      status: 'success',
      data: formatted,
    });
  })
);

// Seed test data
router.post(
  '/seed',
  asyncHandler(async (req, res) => {
    const users = [];
    
    // Create test users
    const alice = await createUser({
      name: 'Alice Johnson',
      email: 'alice@example.com',
      initialBlockchains: [Ledger.ETHEREUM, Ledger.POLYGON],
    });
    users.push(alice);

    const bob = await createUser({
      name: 'Bob Smith',
      email: 'bob@example.com',
      initialBlockchains: [Ledger.ETHEREUM, Ledger.ARBITRUM],
    });
    users.push(bob);

    const carol = await createUser({
      name: 'Carol Williams',
      email: 'carol@example.com',
      initialBlockchains: [Ledger.POLYGON, Ledger.ARBITRUM],
    });
    users.push(carol);

    // Deposit initial funds
    await depositToUser({
      userId: alice.id,
      amount: toTigerBeetleAmount(1000),
      ledger: Ledger.ETHEREUM,
    });

    await depositToUser({
      userId: alice.id,
      amount: toTigerBeetleAmount(500),
      ledger: Ledger.POLYGON,
    });

    await depositToUser({
      userId: bob.id,
      amount: toTigerBeetleAmount(750),
      ledger: Ledger.ETHEREUM,
    });

    await depositToUser({
      userId: carol.id,
      amount: toTigerBeetleAmount(300),
      ledger: Ledger.POLYGON,
    });

    res.json({
      status: 'success',
      message: 'Test data seeded successfully',
      data: {
        users: users.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
        })),
      },
    });
  })
);

export default router;

