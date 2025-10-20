import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/error-handler';
import { validateRequest } from '../middleware/validation';
import { getBalance } from '../tigerbeetle/accounts';
import { getAllOmnibusStatuses } from '../services/omnibus.service';
import { fromTigerBeetleAmount } from '../utils/amount-converter';

const router = Router();

// Validation schemas
const accountBalanceSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/), // BigInt as string
  }),
});

// Get account balance
router.get(
  '/:id/balance',
  validateRequest(accountBalanceSchema),
  asyncHandler(async (req, res) => {
    const accountId = BigInt(req.params.id);
    const balance = await getBalance(accountId);
    
    res.json({
      status: 'success',
      data: {
        accountId: accountId.toString(),
        balance: balance.toString(),
        balanceFormatted: fromTigerBeetleAmount(balance),
      },
    });
  })
);

// Get omnibus accounts status
router.get(
  '/omnibus',
  asyncHandler(async (req, res) => {
    const statuses = await getAllOmnibusStatuses();
    
    // Convert bigints to strings for JSON serialization
    const formatted = statuses.map(status => ({
      ...status,
      omnibusAccountId: status.omnibusAccountId.toString(),
      omnibusBalance: status.omnibusBalance.toString(),
      omnibusBalanceFormatted: fromTigerBeetleAmount(status.omnibusBalance),
      totalUserBalances: status.totalUserBalances.toString(),
      totalUserBalancesFormatted: fromTigerBeetleAmount(status.totalUserBalances),
      discrepancy: status.discrepancy.toString(),
      discrepancyFormatted: fromTigerBeetleAmount(status.discrepancy),
    }));
    
    res.json({
      status: 'success',
      data: { omnibusAccounts: formatted },
    });
  })
);

export default router;

