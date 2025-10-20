import { Ledger } from '../constants/ledgers';

export interface User {
  id: string;
  name: string;
  email?: string;
  createdAt: Date;
  active: boolean;
  allowOverdraft?: boolean; // Allow negative balances (credit line)
}

export interface UserAccount {
  accountId: bigint; // TigerBeetle account ID
  userId: string;
  ledger: Ledger;
  balance: bigint;
  createdAt: Date;
}

export interface UserBalance {
  userId: string;
  ledger: Ledger;
  blockchainName: string;
  balance: bigint;
  balanceFormatted: string; // For display (e.g., "100.50")
}

export interface CreateUserRequest {
  name: string;
  email?: string;
  initialBlockchains: Ledger[]; // Blockchains to create accounts on
  allowOverdraft?: boolean; // Allow negative balances (credit line)
}

export interface UserWithBalances extends User {
  balances: UserBalance[];
  totalBalance: bigint;
}

