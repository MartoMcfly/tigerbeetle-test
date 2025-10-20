import { createClient, Client } from 'tigerbeetle-node';
import { TBAccount, TBTransfer } from './types';

let client: Client | null = null;

export interface TigerBeetleConfig {
  clusterID: bigint;
  replicaAddresses: string[];
}

/**
 * Initialize TigerBeetle client connection
 */
export async function initTigerBeetleClient(config: TigerBeetleConfig): Promise<Client> {
  if (client) {
    return client;
  }

  try {
    client = createClient({
      cluster_id: config.clusterID,
      replica_addresses: config.replicaAddresses,
    });

    console.log('✅ TigerBeetle client connected');
    return client;
  } catch (error) {
    console.error('❌ Failed to connect to TigerBeetle:', error);
    throw new Error(`TigerBeetle connection failed: ${error}`);
  }
}

/**
 * Get the current TigerBeetle client instance
 */
export function getClient(): Client {
  if (!client) {
    throw new Error('TigerBeetle client not initialized. Call initTigerBeetleClient first.');
  }
  return client;
}

/**
 * Close TigerBeetle client connection
 */
export async function closeTigerBeetleClient(): Promise<void> {
  if (client) {
    client.destroy();
    client = null;
    console.log('TigerBeetle client disconnected');
  }
}

/**
 * Create accounts in TigerBeetle
 */
export async function createAccounts(accounts: any[]): Promise<any[]> {
  const tbClient = getClient();
  const errors = await tbClient.createAccounts(accounts);
  return errors;
}

/**
 * Create transfers in TigerBeetle
 */
export async function createTransfers(transfers: any[]): Promise<any[]> {
  const tbClient = getClient();
  const errors = await tbClient.createTransfers(transfers);
  return errors;
}

/**
 * Lookup accounts by ID
 */
export async function lookupAccounts(accountIds: bigint[]): Promise<TBAccount[]> {
  const tbClient = getClient();
  const accounts = await tbClient.lookupAccounts(accountIds);
  return accounts as TBAccount[];
}

/**
 * Lookup transfers by ID
 */
export async function lookupTransfers(transferIds: bigint[]): Promise<TBTransfer[]> {
  const tbClient = getClient();
  const transfers = await tbClient.lookupTransfers(transferIds);
  return transfers as TBTransfer[];
}

/**
 * Get account history (transfers involving an account)
 */
export async function getAccountTransfers(
  accountId: bigint,
  flags: {
    debits?: boolean;
    credits?: boolean;
    reversed?: boolean;
  } = {}
): Promise<TBTransfer[]> {
  const tbClient = getClient();
  
  let filter = 0;
  if (flags.debits) filter |= (1 << 0);
  if (flags.credits) filter |= (1 << 1);
  if (flags.reversed) filter |= (1 << 2);

  const transfers = await tbClient.getAccountTransfers(accountId, BigInt(filter), 8190n);
  return transfers as TBTransfer[];
}

/**
 * Get account balance (helper function)
 */
export async function getAccountBalance(accountId: bigint): Promise<bigint> {
  const accounts = await lookupAccounts([accountId]);
  if (accounts.length === 0) {
    throw new Error(`Account ${accountId} not found`);
  }
  const account = accounts[0];
  return account.credits_posted - account.debits_posted;
}

