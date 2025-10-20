import { TransferCode } from '@blockchain-omnibus/shared';
import { generateId } from '../utils/id-generator';
import { createTransfers, lookupTransfers } from './client';
import {
  TransferFlags,
  CreateTransferParams,
  TBTransfer,
  CreateTransferError,
  CreateTransferErrorMessages,
} from './types';

export interface CreateTransferOptions {
  debitAccountId: bigint;
  creditAccountId: bigint;
  amount: bigint;
  ledger: number;
  code: TransferCode;
  flags?: number;
  pendingId?: bigint;
  timeout?: number;
  userData128?: bigint;
  userData64?: bigint;
  userData32?: number;
}

/**
 * Create a single transfer
 */
export async function createTransfer(options: CreateTransferOptions): Promise<bigint> {
  const transferId = generateId();
  
  const transfer: any = {
    id: transferId,
    debit_account_id: options.debitAccountId,
    credit_account_id: options.creditAccountId,
    amount: options.amount,
    pending_id: options.pendingId || 0n,
    user_data_128: options.userData128 || 0n,
    user_data_64: options.userData64 || 0n,
    user_data_32: options.userData32 || 0,
    timeout: options.timeout || 0,
    ledger: options.ledger,
    code: options.code,
    flags: options.flags || TransferFlags.NONE,
    timestamp: 0n,
  };

  const errors = await createTransfers([transfer]);
  
  if (errors.length > 0) {
    const error = errors[0];
    const errorMsg = CreateTransferErrorMessages[error.result as CreateTransferError] || 'Unknown error';
    throw new Error(`Transfer failed: ${errorMsg} (code: ${error.result})`);
  }

  return transferId;
}

/**
 * Create multiple linked transfers (atomic operation)
 */
export async function createLinkedTransfers(
  transferOptions: CreateTransferOptions[]
): Promise<bigint[]> {
  const transfers: any[] = transferOptions.map((options, index) => {
    const transferId = generateId();
    return {
      id: transferId,
      debit_account_id: options.debitAccountId,
      credit_account_id: options.creditAccountId,
      amount: options.amount,
      pending_id: options.pendingId || 0n,
      user_data_128: options.userData128 || 0n,
      user_data_64: options.userData64 || 0n,
      user_data_32: options.userData32 || 0,
      timeout: options.timeout || 0,
      ledger: options.ledger,
      code: options.code,
      flags: index < transferOptions.length - 1 
        ? (options.flags || TransferFlags.NONE) | TransferFlags.LINKED 
        : (options.flags || TransferFlags.NONE),
      timestamp: 0n,
    };
  });

  const errors = await createTransfers(transfers);
  
  if (errors.length > 0) {
    const error = errors[0];
    const errorMsg = CreateTransferErrorMessages[error.result as CreateTransferError] || 'Unknown error';
    throw new Error(`Linked transfers failed: ${errorMsg} (code: ${error.result})`);
  }

  return transfers.map(t => t.id);
}

/**
 * Create a pending transfer (two-phase commit)
 */
export async function createPendingTransfer(
  options: Omit<CreateTransferOptions, 'flags'> & { timeout: number }
): Promise<bigint> {
  return await createTransfer({
    ...options,
    flags: TransferFlags.PENDING,
  });
}

/**
 * Post (commit) a pending transfer
 */
export async function postPendingTransfer(
  pendingId: bigint,
  options: Omit<CreateTransferOptions, 'flags' | 'pendingId'>
): Promise<bigint> {
  return await createTransfer({
    ...options,
    pendingId,
    flags: TransferFlags.POST_PENDING_TRANSFER,
  });
}

/**
 * Void (rollback) a pending transfer
 */
export async function voidPendingTransfer(
  pendingId: bigint,
  options: Omit<CreateTransferOptions, 'flags' | 'pendingId'>
): Promise<bigint> {
  return await createTransfer({
    ...options,
    pendingId,
    flags: TransferFlags.VOID_PENDING_TRANSFER,
  });
}

/**
 * Get transfer details by ID
 */
export async function getTransfer(transferId: bigint): Promise<TBTransfer | null> {
  const transfers = await lookupTransfers([transferId]);
  return transfers.length > 0 ? transfers[0] : null;
}

/**
 * Get multiple transfers by IDs
 */
export async function getTransfers(transferIds: bigint[]): Promise<TBTransfer[]> {
  return await lookupTransfers(transferIds);
}

/**
 * Simple transfer between two accounts (same ledger)
 */
export async function simpleTransfer(
  fromAccountId: bigint,
  toAccountId: bigint,
  amount: bigint,
  ledger: number,
  code: TransferCode = TransferCode.USER_TRANSFER
): Promise<bigint> {
  return await createTransfer({
    debitAccountId: fromAccountId,
    creditAccountId: toAccountId,
    amount,
    ledger,
    code,
  });
}

