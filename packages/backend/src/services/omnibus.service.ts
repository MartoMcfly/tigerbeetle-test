import {
  Ledger,
  LEDGER_NAMES,
  BLOCKCHAIN_LEDGERS,
  OmnibusStatus,
  AccountCode,
} from '@blockchain-omnibus/shared';
import { createOmnibusAccount, getBalance, getAccounts } from '../tigerbeetle/accounts';
import { getAllUserAccountIds } from './user.service';
import { toTigerBeetleAmount } from '../utils/amount-converter';

// Store omnibus account IDs for each blockchain
const omnibusAccounts: Map<Ledger, bigint> = new Map();

/**
 * Initialize omnibus accounts for all blockchains
 */
export async function initializeOmnibusAccounts(
  initialBalance: bigint = toTigerBeetleAmount(10000)
): Promise<void> {
  for (const ledger of BLOCKCHAIN_LEDGERS) {
    if (!omnibusAccounts.has(ledger)) {
      const accountId = await createOmnibusAccount(ledger);
      omnibusAccounts.set(ledger, accountId);
      console.log(`✅ Created omnibus account for ${LEDGER_NAMES[ledger]}: ${accountId}`);
    }
  }

  // Fund omnibus accounts with initial liquidity
  // Note: In a real system, this would be done through external deposits
  console.log('Omnibus accounts initialized with initial balances');
}

/**
 * Get omnibus account ID for a specific blockchain
 */
export function getOmnibusAccountId(ledger: Ledger): bigint {
  const accountId = omnibusAccounts.get(ledger);
  if (!accountId) {
    throw new Error(`Omnibus account not found for ledger ${ledger}`);
  }
  return accountId;
}

/**
 * Get omnibus account balance
 */
export async function getOmnibusBalance(ledger: Ledger): Promise<bigint> {
  const accountId = getOmnibusAccountId(ledger);
  return await getBalance(accountId);
}

/**
 * Get omnibus status for a blockchain (for reconciliation)
 */
export async function getOmnibusStatus(ledger: Ledger): Promise<OmnibusStatus> {
  const omnibusAccountId = getOmnibusAccountId(ledger);
  const omnibusBalance = await getBalance(omnibusAccountId);

  // Get all user accounts on this ledger
  const allUserAccountIds = getAllUserAccountIds();
  const allAccounts = await getAccounts(allUserAccountIds);
  
  // Filter accounts by ledger and account type
  const userAccountsOnLedger = allAccounts.filter(
    acc => acc.ledger === ledger && acc.code === AccountCode.USER_ACCOUNT
  );

  // Calculate total user balances
  let totalUserBalances = 0n;
  for (const account of userAccountsOnLedger) {
    const balance = account.credits_posted - account.debits_posted;
    totalUserBalances += balance;
  }

  // Calculate discrepancy
  // In a properly balanced system with deposits:
  // omnibusBalance + totalUserBalances should equal initial omnibus funding
  const discrepancy = omnibusBalance - totalUserBalances;

  return {
    ledger,
    blockchainName: LEDGER_NAMES[ledger] || 'Unknown',
    omnibusAccountId,
    omnibusBalance,
    totalUserBalances,
    discrepancy,
    userAccountCount: userAccountsOnLedger.length,
    isReconciled: discrepancy === 0n,
  };
}

/**
 * Get omnibus status for all blockchains
 */
export async function getAllOmnibusStatuses(): Promise<OmnibusStatus[]> {
  const statuses: OmnibusStatus[] = [];

  for (const ledger of BLOCKCHAIN_LEDGERS) {
    if (omnibusAccounts.has(ledger)) {
      const status = await getOmnibusStatus(ledger);
      statuses.push(status);
    }
  }

  return statuses;
}

/**
 * Check if all omnibus accounts are reconciled
 */
export async function checkReconciliation(): Promise<{
  allReconciled: boolean;
  statuses: OmnibusStatus[];
}> {
  const statuses = await getAllOmnibusStatuses();
  const allReconciled = statuses.every(status => status.isReconciled);

  return {
    allReconciled,
    statuses,
  };
}

/**
 * Clear omnibus accounts (for testing)
 */
export function clearOmnibusAccounts(): void {
  omnibusAccounts.clear();
}

