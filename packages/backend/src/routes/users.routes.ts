import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/error-handler';
import { validateRequest } from '../middleware/validation';
import {
  createUser,
  getAllUsersWithBalances,
  getUserWithBalances,
  addUserAccountOnBlockchain,
  deactivateUser,
} from '../services/user.service';
import { Ledger } from '@blockchain-omnibus/shared';

const router = Router();

// Validation schemas
const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    email: z.string().email().optional(),
    initialBlockchains: z.array(z.nativeEnum(Ledger)).min(1),
  }),
});

const addBlockchainSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    ledger: z.nativeEnum(Ledger),
  }),
});

const userIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

// Create user
router.post(
  '/',
  validateRequest(createUserSchema),
  asyncHandler(async (req, res) => {
    const user = await createUser(req.body);
    res.status(201).json({
      status: 'success',
      data: { user },
    });
  })
);

// Get all users
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const users = await getAllUsersWithBalances();
    res.json({
      status: 'success',
      data: { users },
    });
  })
);

// Get user by ID
router.get(
  '/:id',
  validateRequest(userIdSchema),
  asyncHandler(async (req, res) => {
    const user = await getUserWithBalances(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }
    res.json({
      status: 'success',
      data: { user },
    });
  })
);

// Add blockchain account to user
router.post(
  '/:id/blockchains',
  validateRequest(addBlockchainSchema),
  asyncHandler(async (req, res) => {
    const account = await addUserAccountOnBlockchain(req.params.id, req.body.ledger);
    res.status(201).json({
      status: 'success',
      data: { account },
    });
  })
);

// Deactivate user
router.delete(
  '/:id',
  validateRequest(userIdSchema),
  asyncHandler(async (req, res) => {
    await deactivateUser(req.params.id);
    res.json({
      status: 'success',
      message: 'User deactivated',
    });
  })
);

export default router;

