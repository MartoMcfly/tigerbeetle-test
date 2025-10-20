import {
  Transaction,
  TransactionType,
  TransactionStatus,
  CrossBlockchainTransferRequest,
  TransferCode,
  Ledger,
  AccountCode,
} from '@blockchain-omnibus/shared';
import { generateTransactionId, uuidToBigInt } from '../utils/id-generator';
import { fromTigerBeetleAmount } from '../utils/amount-converter';
import { getUserAccountId } from './user.service';
import { getOmnibusAccountId } from './omnibus.service';
import { createLinkedTransfers } from '../tigerbeetle/transfers';
import { createBridgeAccount } from '../tigerbeetle/accounts';

// Bridge account IDs
let bridgeAccountCache: bigint | null = null;

/**
 * Get or create bridge account
 */
async function getBridgeAccount(): Promise<bigint> {
  if (!bridgeAccountCache) {
    bridgeAccountCache = await createBridgeAccount(Ledger.BRIDGE);
  }
  return bridgeAccountCache;
}

/**
 * Cross-blockchain transfer using bridge pattern
 * 
 * Flow:
 * 1. Debit user account on source blockchain
 * 2. Credit omnibus on source blockchain
 * 3. Debit omnibus on destination blockchain
 * 4. Credit user account on destination blockchain
 */
export async function crossBlockchainTransfer(
  request: CrossBlockchainTransferRequest,
  transactionsMap: Map<string, Transaction>
): Promise<Transaction> {
  const transactionId = generateTransactionId();

  // Get user accounts on both blockchains
  const sourceAccountId = getUserAccountId(request.userId, request.sourceLedger);
  const destAccountId = getUserAccountId(request.userId, request.destinationLedger);

  if (!sourceAccountId || !destAccountId) {
    throw new Error('User accounts not found on specified blockchains');
  }

  // Get omnibus accounts
  const sourceOmnibusId = getOmnibusAccountId(request.sourceLedger);
  const destOmnibusId = getOmnibusAccountId(request.destinationLedger);

  const transaction: Transaction = {
    id: transactionId,
    type: TransactionType.CROSS_BLOCKCHAIN,
    status: TransactionStatus.PENDING,
    fromUserId: request.userId,
    toUserId: request.userId,
    amount: request.amount,
    amountFormatted: fromTigerBeetleAmount(request.amount),
    sourceLedger: request.sourceLedger,
    destinationLedger: request.destinationLedger,
    transferIds: [],
    createdAt: new Date(),
  };

  transactionsMap.set(transactionId, transaction);

  try {
    // Atomic cross-blockchain transfer using linked transfers
    // All transfers must succeed or all fail
    
    const transferIds = await createLinkedTransfers([
      // Transfer 1: Debit user on source blockchain
      {
        debitAccountId: sourceAccountId,
        creditAccountId: sourceOmnibusId,
        amount: request.amount,
        ledger: request.sourceLedger,
        code: TransferCode.BRIDGE_OUTBOUND,
        userData128: uuidToBigInt(transactionId),
      },
      // Transfer 2: Debit omnibus on destination, credit user
      {
        debitAccountId: destOmnibusId,
        creditAccountId: destAccountId,
        amount: request.amount,
        ledger: request.destinationLedger,
        code: TransferCode.BRIDGE_INBOUND,
        userData128: uuidToBigInt(transactionId),
      },
    ]);

    transaction.transferIds = transferIds;
    transaction.status = TransactionStatus.POSTED;
    transaction.completedAt = new Date();
  } catch (error) {
    transaction.status = TransactionStatus.FAILED;
    transaction.error = error instanceof Error ? error.message : 'Unknown error';
  }

  transactionsMap.set(transactionId, transaction);
  return transaction;
}

/**
 * Clear bridge cache (for testing)
 */
export function clearBridgeCache(): void {
  bridgeAccountCache = null;
}

