import { Blockchain, DepositEvent, Ledger, LEDGER_NAMES } from '@blockchain-omnibus/shared';
import { generateTransactionId } from '../utils/id-generator';

// Mock blockchain configurations
const mockBlockchains: Map<Ledger, Blockchain> = new Map([
  [
    Ledger.ETHEREUM,
    {
      id: 'ethereum',
      name: 'Ethereum',
      ledger: Ledger.ETHEREUM,
      confirmationTime: 2000, // 2 seconds
    },
  ],
  [
    Ledger.POLYGON,
    {
      id: 'polygon',
      name: 'Polygon',
      ledger: Ledger.POLYGON,
      confirmationTime: 1000, // 1 second
    },
  ],
  [
    Ledger.ARBITRUM,
    {
      id: 'arbitrum',
      name: 'Arbitrum',
      ledger: Ledger.ARBITRUM,
      confirmationTime: 500, // 0.5 seconds
    },
  ],
]);

// Pending withdrawals tracker
interface PendingWithdrawal {
  id: string;
  blockchainId: string;
  userId: string;
  amount: bigint;
  address: string;
  status: 'pending' | 'processing' | 'confirmed' | 'failed';
  txHash?: string;
  createdAt: Date;
  confirmedAt?: Date;
}

const pendingWithdrawals: Map<string, PendingWithdrawal> = new Map();

/**
 * Get blockchain configuration
 */
export function getBlockchain(ledger: Ledger): Blockchain | undefined {
  return mockBlockchains.get(ledger);
}

/**
 * Get all blockchains
 */
export function getAllBlockchains(): Blockchain[] {
  return Array.from(mockBlockchains.values());
}

/**
 * Generate a mock blockchain transaction hash
 */
export function generateTxHash(): string {
  return '0x' + generateTransactionId().replace(/-/g, '').substring(0, 64);
}

/**
 * Simulate a blockchain deposit event
 */
export async function simulateDeposit(
  userId: string,
  ledger: Ledger,
  amount: bigint
): Promise<DepositEvent> {
  const blockchain = getBlockchain(ledger);
  if (!blockchain) {
    throw new Error(`Blockchain not found for ledger ${ledger}`);
  }

  const depositEvent: DepositEvent = {
    id: generateTransactionId(),
    blockchainId: blockchain.id,
    userId,
    amount,
    txHash: generateTxHash(),
    timestamp: new Date(),
  };

  // Simulate confirmation delay
  await new Promise(resolve => setTimeout(resolve, blockchain.confirmationTime));

  console.log(
    `🔗 Mock ${blockchain.name} deposit confirmed: ${depositEvent.txHash} (${amount} cents)`
  );

  return depositEvent;
}

/**
 * Process a withdrawal request (simulate blockchain transaction)
 */
export async function processWithdrawal(
  userId: string,
  ledger: Ledger,
  amount: bigint,
  address: string
): Promise<PendingWithdrawal> {
  const blockchain = getBlockchain(ledger);
  if (!blockchain) {
    throw new Error(`Blockchain not found for ledger ${ledger}`);
  }

  const withdrawalId = generateTransactionId();
  
  const withdrawal: PendingWithdrawal = {
    id: withdrawalId,
    blockchainId: blockchain.id,
    userId,
    amount,
    address,
    status: 'pending',
    createdAt: new Date(),
  };

  pendingWithdrawals.set(withdrawalId, withdrawal);

  // Simulate async blockchain processing
  setTimeout(async () => {
    await confirmWithdrawal(withdrawalId);
  }, blockchain.confirmationTime);

  return withdrawal;
}

/**
 * Confirm a pending withdrawal
 */
async function confirmWithdrawal(withdrawalId: string): Promise<void> {
  const withdrawal = pendingWithdrawals.get(withdrawalId);
  if (!withdrawal) {
    return;
  }

  withdrawal.status = 'confirmed';
  withdrawal.txHash = generateTxHash();
  withdrawal.confirmedAt = new Date();

  pendingWithdrawals.set(withdrawalId, withdrawal);

  console.log(
    `🔗 Mock ${withdrawal.blockchainId} withdrawal confirmed: ${withdrawal.txHash} (${withdrawal.amount} cents)`
  );
}

/**
 * Get withdrawal status
 */
export function getWithdrawalStatus(withdrawalId: string): PendingWithdrawal | undefined {
  return pendingWithdrawals.get(withdrawalId);
}

/**
 * Get all pending withdrawals for a user
 */
export function getUserWithdrawals(userId: string): PendingWithdrawal[] {
  return Array.from(pendingWithdrawals.values()).filter(w => w.userId === userId);
}

/**
 * Get omnibus address for a blockchain (mock)
 */
export function getOmnibusAddress(ledger: Ledger): string {
  const blockchain = getBlockchain(ledger);
  if (!blockchain) {
    throw new Error(`Blockchain not found for ledger ${ledger}`);
  }
  // Generate mock address
  return `${blockchain.id}_omnibus_0x` + generateTransactionId().replace(/-/g, '').substring(0, 40);
}

/**
 * Get mock blockchain balance (always returns a high value)
 */
export async function getBlockchainBalance(ledger: Ledger): Promise<bigint> {
  const blockchain = getBlockchain(ledger);
  if (!blockchain) {
    throw new Error(`Blockchain not found for ledger ${ledger}`);
  }
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Mock balance (10,000 USD worth)
  return 1000000n; // 10,000.00 in cents
}

/**
 * Clear all pending withdrawals (for testing)
 */
export function clearWithdrawals(): void {
  pendingWithdrawals.clear();
}

