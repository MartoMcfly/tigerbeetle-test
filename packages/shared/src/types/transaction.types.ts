import { TransferCode } from '../constants/codes';
import { Ledger } from '../constants/ledgers';

export enum TransactionType {
  SAME_BLOCKCHAIN = 'same_blockchain',
  CROSS_BLOCKCHAIN = 'cross_blockchain',
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
}

export enum TransactionStatus {
  PENDING = 'pending',
  POSTED = 'posted',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

/**
 * High-level transaction record
 */
export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  fromUserId?: string;
  toUserId?: string;
  amount: bigint;
  amountFormatted: string;
  sourceLedger: Ledger;
  destinationLedger: Ledger;
  transferIds: bigint[]; // TigerBeetle transfer IDs
  metadata?: Record<string, any>;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

/**
 * Simplified TigerBeetle Transfer type
 */
export interface Transfer {
  id: bigint;
  debitAccountId: bigint;
  creditAccountId: bigint;
  amount: bigint;
  pendingId?: bigint;
  userData128?: bigint;
  userData64?: bigint;
  userData32?: number;
  timeout?: number;
  ledger: Ledger;
  code: TransferCode;
  flags: number;
  timestamp: bigint;
}

export interface CreateTransferRequest {
  type: TransactionType;
  fromUserId?: string;
  toUserId?: string;
  amount: bigint;
  sourceLedger: Ledger;
  destinationLedger?: Ledger;
  metadata?: Record<string, any>;
}

export interface SameBlockchainTransferRequest {
  fromUserId: string;
  toUserId: string;
  amount: bigint;
  ledger: Ledger;
  includeFee?: boolean;
  forceOverdraft?: boolean; // Allow sender to go negative
}

export interface CrossBlockchainTransferRequest {
  userId: string;
  amount: bigint;
  sourceLedger: Ledger;
  destinationLedger: Ledger;
  includeFee?: boolean;
}

export interface DepositRequest {
  userId: string;
  amount: bigint;
  ledger: Ledger;
  txHash?: string;
}

export interface WithdrawalRequest {
  userId: string;
  amount: bigint;
  ledger: Ledger;
  address: string;
  forceOverdraft?: boolean; // Allow user to go negative
}

export interface TransactionFilter {
  userId?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  ledger?: Ledger;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

