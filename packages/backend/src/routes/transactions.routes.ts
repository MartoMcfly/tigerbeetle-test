import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/error-handler';
import { validateRequest } from '../middleware/validation';
import {
  sameBlockchainTransfer,
  depositToUser,
  withdrawFromUser,
  getAllTransactions,
  getTransaction,
  clearTransactions,
} from '../services/transaction.service';
import { crossBlockchainTransfer } from '../services/bridge.service';
import { toTigerBeetleAmount } from '../utils/amount-converter';
import { Ledger, TransactionStatus, TransactionType } from '@blockchain-omnibus/shared';

const router = Router();

// Get transaction storage (needed for bridge service)
const transactionsMap = new Map();

// Validation schemas
const transferSchema = z.object({
  body: z.object({
    fromUserId: z.string().uuid(),
    toUserId: z.string().uuid(),
    amount: z.number().positive(),
    ledger: z.nativeEnum(Ledger),
    forceOverdraft: z.boolean().optional(),
  }),
});

const depositSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    amount: z.number().positive(),
    ledger: z.nativeEnum(Ledger),
    txHash: z.string().optional(),
  }),
});

const withdrawalSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    amount: z.number().positive(),
    ledger: z.nativeEnum(Ledger),
    address: z.string().min(1),
    forceOverdraft: z.boolean().optional(),
  }),
});

const bridgeSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    amount: z.number().positive(),
    sourceLedger: z.nativeEnum(Ledger),
    destinationLedger: z.nativeEnum(Ledger),
  }),
});

const transactionIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

// Same-blockchain transfer
router.post(
  '/transfer',
  validateRequest(transferSchema),
  asyncHandler(async (req, res) => {
    const { fromUserId, toUserId, amount, ledger, forceOverdraft } = req.body;
    
    const transaction = await sameBlockchainTransfer({
      fromUserId,
      toUserId,
      amount: toTigerBeetleAmount(amount),
      ledger,
      forceOverdraft,
    });

    // Store in map for bridge service
    transactionsMap.set(transaction.id, transaction);
    
    res.status(201).json({
      status: 'success',
      data: { transaction: serializeTransaction(transaction) },
    });
  })
);

// Deposit
router.post(
  '/deposit',
  validateRequest(depositSchema),
  asyncHandler(async (req, res) => {
    const { userId, amount, ledger, txHash } = req.body;
    
    const transaction = await depositToUser({
      userId,
      amount: toTigerBeetleAmount(amount),
      ledger,
      txHash,
    });

    transactionsMap.set(transaction.id, transaction);
    
    res.status(201).json({
      status: 'success',
      data: { transaction: serializeTransaction(transaction) },
    });
  })
);

// Withdrawal
router.post(
  '/withdraw',
  validateRequest(withdrawalSchema),
  asyncHandler(async (req, res) => {
    const { userId, amount, ledger, address, forceOverdraft } = req.body;
    
    const transaction = await withdrawFromUser({
      userId,
      amount: toTigerBeetleAmount(amount),
      ledger,
      address,
      forceOverdraft,
    });

    transactionsMap.set(transaction.id, transaction);
    
    res.status(201).json({
      status: 'success',
      data: { transaction: serializeTransaction(transaction) },
    });
  })
);

// Cross-blockchain bridge
router.post(
  '/bridge',
  validateRequest(bridgeSchema),
  asyncHandler(async (req, res) => {
    const { userId, amount, sourceLedger, destinationLedger } = req.body;
    
    if (sourceLedger === destinationLedger) {
      return res.status(400).json({
        status: 'error',
        message: 'Source and destination blockchains must be different',
      });
    }
    
    const transaction = await crossBlockchainTransfer(
      {
        userId,
        amount: toTigerBeetleAmount(amount),
        sourceLedger,
        destinationLedger,
      },
      transactionsMap
    );
    
    res.status(201).json({
      status: 'success',
      data: { transaction: serializeTransaction(transaction) },
    });
  })
);

// Get all transactions
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const transactions = getAllTransactions({
      userId: req.query.userId as string,
      type: req.query.type as TransactionType,
      status: req.query.status as TransactionStatus,
      ledger: req.query.ledger ? parseInt(req.query.ledger as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 100,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
    });
    
    res.json({
      status: 'success',
      data: { 
        transactions: transactions.map(serializeTransaction),
        count: transactions.length,
      },
    });
  })
);

// Get transaction by ID
router.get(
  '/:id',
  validateRequest(transactionIdSchema),
  asyncHandler(async (req, res) => {
    const transaction = getTransaction(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaction not found',
      });
    }
    
    res.json({
      status: 'success',
      data: { transaction: serializeTransaction(transaction) },
    });
  })
);

// Helper to serialize transactions (convert BigInt to string)
function serializeTransaction(transaction: any) {
  return {
    ...transaction,
    amount: transaction.amount.toString(),
    transferIds: transaction.transferIds.map((id: bigint) => id.toString()),
  };
}

export default router;

