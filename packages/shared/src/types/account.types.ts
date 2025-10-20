import { AccountCode } from '../constants/codes';
import { Ledger } from '../constants/ledgers';

/**
 * Simplified TigerBeetle Account type for application use
 */
export interface Account {
  id: bigint;
  userData128?: bigint; // User ID reference
  userData64?: bigint; // Additional metadata
  userData32?: number; // Additional metadata
  ledger: Ledger;
  code: AccountCode;
  flags: number;
  debitsPosted: bigint;
  creditPosted: bigint;
  debitsPending: bigint;
  creditsPending: bigint;
  timestamp: bigint;
}

export interface AccountBalance {
  accountId: bigint;
  ledger: Ledger;
  code: AccountCode;
  balance: bigint; // creditPosted - debitsPosted
  balanceFormatted: string;
  debitsPending: bigint;
  creditsPending: bigint;
}

export interface OmnibusStatus {
  ledger: Ledger;
  blockchainName: string;
  omnibusAccountId: bigint;
  omnibusBalance: bigint;
  totalUserBalances: bigint;
  discrepancy: bigint;
  userAccountCount: number;
  isReconciled: boolean;
}

export interface CreateAccountRequest {
  userId?: string;
  ledger: Ledger;
  code: AccountCode;
  flags?: number;
  initialBalance?: bigint;
}

