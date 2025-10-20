import { AccountCode } from '@blockchain-omnibus/shared';
import { generateId, uuidToBigInt } from '../utils/id-generator';
import { createAccounts, lookupAccounts } from './client';
import {
  AccountFlags,
  CreateAccountParams,
  TBAccount,
  CreateAccountError,
  CreateAccountErrorMessages,
} from './types';

export interface CreateAccountOptions {
  userId?: string;
  ledger: number;
  code: AccountCode;
  flags?: number;
}

/**
 * Create a new account in TigerBeetle
 */
export async function createAccount(options: CreateAccountOptions): Promise<bigint> {
  const accountId = generateId();
  
  const account: any = {
    id: accountId,
    debits_pending: 0n,
    debits_posted: 0n,
    credits_pending: 0n,
    credits_posted: 0n,
    user_data_128: options.userId ? uuidToBigInt(options.userId) : 0n,
    user_data_64: 0n,
    user_data_32: 0,
    reserved: 0,
    ledger: options.ledger,
    code: options.code,
    flags: options.flags || AccountFlags.NONE,
    timestamp: 0n,
  };

  const errors = await createAccounts([account]);
  
  if (errors.length > 0) {
    const error = errors[0];
    const errorMsg = CreateAccountErrorMessages[error.result as CreateAccountError] || 'Unknown error';
    throw new Error(`Failed to create account: ${errorMsg} (code: ${error.result})`);
  }

  return accountId;
}

/**
 * Create multiple accounts atomically using linked flag
 */
export async function createLinkedAccounts(
  accountOptions: CreateAccountOptions[]
): Promise<bigint[]> {
  const accounts: any[] = accountOptions.map((options, index) => {
    const accountId = generateId();
    return {
      id: accountId,
      debits_pending: 0n,
      debits_posted: 0n,
      credits_pending: 0n,
      credits_posted: 0n,
      user_data_128: options.userId ? uuidToBigInt(options.userId) : 0n,
      user_data_64: 0n,
      user_data_32: 0,
      reserved: 0,
      ledger: options.ledger,
      code: options.code,
      flags: index < accountOptions.length - 1 
        ? (options.flags || AccountFlags.NONE) | AccountFlags.LINKED 
        : (options.flags || AccountFlags.NONE),
      timestamp: 0n,
    };
  });

  const errors = await createAccounts(accounts);
  
  if (errors.length > 0) {
    const error = errors[0];
    const errorMsg = CreateAccountErrorMessages[error.result as CreateAccountError] || 'Unknown error';
    throw new Error(`Failed to create linked accounts: ${errorMsg} (code: ${error.result})`);
  }

  return accounts.map(acc => acc.id);
}

/**
 * Get account details by ID
 */
export async function getAccount(accountId: bigint): Promise<TBAccount | null> {
  const accounts = await lookupAccounts([accountId]);
  return accounts.length > 0 ? accounts[0] : null;
}

/**
 * Get multiple accounts by IDs
 */
export async function getAccounts(accountIds: bigint[]): Promise<TBAccount[]> {
  return await lookupAccounts(accountIds);
}

/**
 * Create user account on a specific blockchain ledger
 */
export async function createUserAccount(
  userId: string, 
  ledger: number, 
  allowOverdraft: boolean = false
): Promise<bigint> {
  return await createAccount({
    userId,
    ledger,
    code: AccountCode.USER_ACCOUNT,
    flags: allowOverdraft 
      ? AccountFlags.NONE // Allow negative balances (credit line)
      : AccountFlags.DEBITS_MUST_NOT_EXCEED_CREDITS, // Users cannot go negative
  });
}

/**
 * Create omnibus account for a blockchain ledger
 */
export async function createOmnibusAccount(ledger: number): Promise<bigint> {
  return await createAccount({
    ledger,
    code: AccountCode.OMNIBUS_ACCOUNT,
    flags: AccountFlags.NONE, // Omnibus can have flexible balances
  });
}

/**
 * Create fee collection account
 */
export async function createFeeAccount(): Promise<bigint> {
  return await createAccount({
    ledger: 0, // System ledger
    code: AccountCode.FEE_ACCOUNT,
    flags: AccountFlags.CREDITS_MUST_NOT_EXCEED_DEBITS, // Fees only accumulate
  });
}

/**
 * Create bridge account for cross-blockchain transfers
 */
export async function createBridgeAccount(bridgeLedger: number = 999): Promise<bigint> {
  return await createAccount({
    ledger: bridgeLedger,
    code: AccountCode.BRIDGE_ACCOUNT,
    flags: AccountFlags.NONE,
  });
}

/**
 * Get account balance (credits - debits)
 */
export async function getBalance(accountId: bigint): Promise<bigint> {
  const account = await getAccount(accountId);
  if (!account) {
    throw new Error(`Account ${accountId} not found`);
  }
  return account.credits_posted - account.debits_posted;
}

