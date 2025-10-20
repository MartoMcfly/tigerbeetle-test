import {
  Transaction,
  TransactionType,
  TransactionStatus,
  SameBlockchainTransferRequest,
  DepositRequest,
  WithdrawalRequest as WithdrawalReq,
  TransactionFilter,
  TransferCode,
  Ledger,
} from '@blockchain-omnibus/shared';
import { generateTransactionId, uuidToBigInt } from '../utils/id-generator';
import { fromTigerBeetleAmount } from '../utils/amount-converter';
import { getUserAccountId, getUser } from './user.service';
import { getOmnibusAccountId } from './omnibus.service';
import { simulateDeposit, processWithdrawal } from './blockchain-mock.service';
import { createTransfer, createLinkedTransfers } from '../tigerbeetle/transfers';

// In-memory storage for transactions
const transactions: Map<string, Transaction> = new Map();

/**
 * User-to-user transfer on same blockchain
 */
export async function sameBlockchainTransfer(
  request: SameBlockchainTransferRequest
): Promise<Transaction> {
  const transactionId = generateTransactionId();

  // Validate overdraft permissions
  if (request.forceOverdraft) {
    const fromUser = await getUser(request.fromUserId);
    if (!fromUser?.allowOverdraft) {
      throw new Error('User does not have overdraft permissions. Cannot force negative balance.');
    }
  }

  // Get account IDs
  const fromAccountId = getUserAccountId(request.fromUserId, request.ledger);
  const toAccountId = getUserAccountId(request.toUserId, request.ledger);

  if (!fromAccountId || !toAccountId) {
    throw new Error('User accounts not found on specified blockchain');
  }

  const transaction: Transaction = {
    id: transactionId,
    type: TransactionType.SAME_BLOCKCHAIN,
    status: TransactionStatus.PENDING,
    fromUserId: request.fromUserId,
    toUserId: request.toUserId,
    amount: request.amount,
    amountFormatted: fromTigerBeetleAmount(request.amount),
    sourceLedger: request.ledger,
    destinationLedger: request.ledger,
    transferIds: [],
    metadata: request.forceOverdraft ? { overdraft: true } : undefined,
    createdAt: new Date(),
  };

  try {
    // Create the transfer in TigerBeetle
    // Note: If forceOverdraft is true and user has allowOverdraft, their account 
    // was created with NONE flags, allowing negative balances
    const transferId = await createTransfer({
      debitAccountId: fromAccountId,
      creditAccountId: toAccountId,
      amount: request.amount,
      ledger: request.ledger,
      code: TransferCode.USER_TRANSFER,
      userData128: uuidToBigInt(transactionId),
    });

    transaction.transferIds = [transferId];
    transaction.status = TransactionStatus.POSTED;
    transaction.completedAt = new Date();
  } catch (error) {
    transaction.status = TransactionStatus.FAILED;
    transaction.error = error instanceof Error ? error.message : 'Unknown error';
  }

  transactions.set(transactionId, transaction);
  return transaction;
}

/**
 * Deposit from blockchain to user account
 */
export async function depositToUser(request: DepositRequest): Promise<Transaction> {
  const transactionId = generateTransactionId();

  // Get user account and omnibus account
  const userAccountId = getUserAccountId(request.userId, request.ledger);
  const omnibusAccountId = getOmnibusAccountId(request.ledger);

  if (!userAccountId) {
    throw new Error('User account not found on specified blockchain');
  }

  const transaction: Transaction = {
    id: transactionId,
    type: TransactionType.DEPOSIT,
    status: TransactionStatus.PENDING,
    toUserId: request.userId,
    amount: request.amount,
    amountFormatted: fromTigerBeetleAmount(request.amount),
    sourceLedger: request.ledger,
    destinationLedger: request.ledger,
    transferIds: [],
    metadata: {
      txHash: request.txHash,
    },
    createdAt: new Date(),
  };

  transactions.set(transactionId, transaction);

  try {
    // Simulate blockchain deposit confirmation
    const depositEvent = await simulateDeposit(request.userId, request.ledger, request.amount);
    
    transaction.metadata = {
      ...transaction.metadata,
      txHash: depositEvent.txHash,
    };

    // Create the transfer: debit omnibus, credit user
    const transferId = await createTransfer({
      debitAccountId: omnibusAccountId,
      creditAccountId: userAccountId,
      amount: request.amount,
      ledger: request.ledger,
      code: TransferCode.DEPOSIT,
      userData128: uuidToBigInt(transactionId),
    });

    transaction.transferIds = [transferId];
    transaction.status = TransactionStatus.POSTED;
    transaction.completedAt = new Date();
  } catch (error) {
    transaction.status = TransactionStatus.FAILED;
    transaction.error = error instanceof Error ? error.message : 'Unknown error';
  }

  transactions.set(transactionId, transaction);
  return transaction;
}

/**
 * Withdrawal from user account to blockchain
 */
export async function withdrawFromUser(request: WithdrawalReq): Promise<Transaction> {
  const transactionId = generateTransactionId();

  // Validate overdraft permissions
  if (request.forceOverdraft) {
    const user = await getUser(request.userId);
    if (!user?.allowOverdraft) {
      throw new Error('User does not have overdraft permissions. Cannot force negative balance.');
    }
  }

  // Get user account and omnibus account
  const userAccountId = getUserAccountId(request.userId, request.ledger);
  const omnibusAccountId = getOmnibusAccountId(request.ledger);

  if (!userAccountId) {
    throw new Error('User account not found on specified blockchain');
  }

  const transaction: Transaction = {
    id: transactionId,
    type: TransactionType.WITHDRAWAL,
    status: TransactionStatus.PENDING,
    fromUserId: request.userId,
    amount: request.amount,
    amountFormatted: fromTigerBeetleAmount(request.amount),
    sourceLedger: request.ledger,
    destinationLedger: request.ledger,
    transferIds: [],
    metadata: {
      address: request.address,
      ...(request.forceOverdraft ? { overdraft: true } : {}),
    },
    createdAt: new Date(),
  };

  transactions.set(transactionId, transaction);

  try {
    // Create the transfer: debit user, credit omnibus
    const transferId = await createTransfer({
      debitAccountId: userAccountId,
      creditAccountId: omnibusAccountId,
      amount: request.amount,
      ledger: request.ledger,
      code: TransferCode.WITHDRAWAL,
      userData128: uuidToBigInt(transactionId),
    });

    transaction.transferIds = [transferId];

    // Process blockchain withdrawal
    const withdrawal = await processWithdrawal(
      request.userId,
      request.ledger,
      request.amount,
      request.address
    );

    transaction.metadata = {
      ...transaction.metadata,
      withdrawalId: withdrawal.id,
      txHash: withdrawal.txHash,
    };

    transaction.status = TransactionStatus.POSTED;
    transaction.completedAt = new Date();
  } catch (error) {
    transaction.status = TransactionStatus.FAILED;
    transaction.error = error instanceof Error ? error.message : 'Unknown error';
  }

  transactions.set(transactionId, transaction);
  return transaction;
}

/**
 * Get transaction by ID
 */
export function getTransaction(transactionId: string): Transaction | null {
  return transactions.get(transactionId) || null;
}

/**
 * Get all transactions
 */
export function getAllTransactions(filter?: TransactionFilter): Transaction[] {
  let results = Array.from(transactions.values());

  if (filter) {
    if (filter.userId) {
      results = results.filter(
        t => t.fromUserId === filter.userId || t.toUserId === filter.userId
      );
    }
    if (filter.type) {
      results = results.filter(t => t.type === filter.type);
    }
    if (filter.status) {
      results = results.filter(t => t.status === filter.status);
    }
    if (filter.ledger) {
      results = results.filter(
        t => t.sourceLedger === filter.ledger || t.destinationLedger === filter.ledger
      );
    }
    if (filter.startDate) {
      results = results.filter(t => t.createdAt >= filter.startDate!);
    }
    if (filter.endDate) {
      results = results.filter(t => t.createdAt <= filter.endDate!);
    }
  }

  // Sort by created date (newest first)
  results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  // Apply pagination
  if (filter?.offset) {
    results = results.slice(filter.offset);
  }
  if (filter?.limit) {
    results = results.slice(0, filter.limit);
  }

  return results;
}

/**
 * Get user transaction history
 */
export function getUserTransactions(userId: string): Transaction[] {
  return getAllTransactions({ userId });
}

/**
 * Clear all transactions (for testing)
 */
export function clearTransactions(): void {
  transactions.clear();
}

