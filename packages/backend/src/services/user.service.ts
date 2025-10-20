import {
  User,
  UserAccount,
  UserBalance,
  CreateUserRequest,
  UserWithBalances,
  Ledger,
  LEDGER_NAMES,
} from '@blockchain-omnibus/shared';
import { generateUserId } from '../utils/id-generator';
import { fromTigerBeetleAmount } from '../utils/amount-converter';
import { createUserAccount, getBalance } from '../tigerbeetle/accounts';

// In-memory storage for users (in production, use a database)
const users: Map<string, User> = new Map();
const userAccounts: Map<string, UserAccount[]> = new Map();

/**
 * Create a new user with accounts on specified blockchains
 */
export async function createUser(request: CreateUserRequest): Promise<UserWithBalances> {
  const userId = generateUserId();
  
  const user: User = {
    id: userId,
    name: request.name,
    email: request.email,
    createdAt: new Date(),
    active: true,
    allowOverdraft: request.allowOverdraft || false,
  };

  // Create accounts on each requested blockchain
  const accounts: UserAccount[] = [];
  
  for (const ledger of request.initialBlockchains) {
    const accountId = await createUserAccount(userId, ledger, user.allowOverdraft);
    
    accounts.push({
      accountId,
      userId,
      ledger,
      balance: 0n,
      createdAt: new Date(),
    });
  }

  users.set(userId, user);
  userAccounts.set(userId, accounts);

  // Get balances
  const balances = await getUserBalances(userId);

  return {
    ...user,
    balances,
    totalBalance: 0n,
  };
}

/**
 * Get user by ID
 */
export async function getUser(userId: string): Promise<User | null> {
  return users.get(userId) || null;
}

/**
 * Get user with all balances
 */
export async function getUserWithBalances(userId: string): Promise<UserWithBalances | null> {
  const user = users.get(userId);
  if (!user) {
    return null;
  }

  const balances = await getUserBalances(userId);
  const totalBalance = balances.reduce((sum, b) => sum + b.balance, 0n);

  return {
    ...user,
    balances,
    totalBalance,
  };
}

/**
 * Get all users
 */
export async function getAllUsers(): Promise<User[]> {
  return Array.from(users.values());
}

/**
 * Get all users with balances
 */
export async function getAllUsersWithBalances(): Promise<UserWithBalances[]> {
  const allUsers = Array.from(users.values());
  const usersWithBalances: UserWithBalances[] = [];

  for (const user of allUsers) {
    const balances = await getUserBalances(user.id);
    const totalBalance = balances.reduce((sum, b) => sum + b.balance, 0n);
    
    usersWithBalances.push({
      ...user,
      balances,
      totalBalance,
    });
  }

  return usersWithBalances;
}

/**
 * Get user balances across all blockchains
 */
export async function getUserBalances(userId: string): Promise<UserBalance[]> {
  const accounts = userAccounts.get(userId);
  if (!accounts) {
    return [];
  }

  const balances: UserBalance[] = [];

  for (const account of accounts) {
    const balance = await getBalance(account.accountId);
    
    balances.push({
      userId,
      ledger: account.ledger,
      blockchainName: LEDGER_NAMES[account.ledger] || 'Unknown',
      balance,
      balanceFormatted: fromTigerBeetleAmount(balance),
    });
  }

  return balances;
}

/**
 * Get user's account ID for a specific ledger
 */
export function getUserAccountId(userId: string, ledger: Ledger): bigint | null {
  const accounts = userAccounts.get(userId);
  if (!accounts) {
    return null;
  }

  const account = accounts.find(acc => acc.ledger === ledger);
  return account ? account.accountId : null;
}

/**
 * Add account for user on a new blockchain
 */
export async function addUserAccountOnBlockchain(
  userId: string,
  ledger: Ledger
): Promise<UserAccount> {
  const user = users.get(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const accounts = userAccounts.get(userId) || [];
  
  // Check if account already exists
  const existingAccount = accounts.find(acc => acc.ledger === ledger);
  if (existingAccount) {
    throw new Error('User already has an account on this blockchain');
  }

  // Create new account with user's overdraft setting
  const accountId = await createUserAccount(userId, ledger, user.allowOverdraft || false);
  
  const newAccount: UserAccount = {
    accountId,
    userId,
    ledger,
    balance: 0n,
    createdAt: new Date(),
  };

  accounts.push(newAccount);
  userAccounts.set(userId, accounts);

  return newAccount;
}

/**
 * Deactivate user
 */
export async function deactivateUser(userId: string): Promise<void> {
  const user = users.get(userId);
  if (!user) {
    throw new Error('User not found');
  }

  user.active = false;
  users.set(userId, user);
}

/**
 * Get all user accounts (TigerBeetle account IDs)
 */
export function getAllUserAccountIds(): bigint[] {
  const allAccountIds: bigint[] = [];
  
  for (const accounts of userAccounts.values()) {
    allAccountIds.push(...accounts.map(acc => acc.accountId));
  }

  return allAccountIds;
}

/**
 * Clear all users (for testing)
 */
export function clearUsers(): void {
  users.clear();
  userAccounts.clear();
}

