import { Ledger } from '../constants/ledgers';

export interface Blockchain {
  id: string;
  name: string;
  ledger: Ledger;
  confirmationTime: number; // milliseconds
}

export interface DepositEvent {
  id: string;
  blockchainId: string;
  userId: string;
  amount: bigint;
  txHash: string;
  timestamp: Date;
}

export interface WithdrawalRecord {
  id: string;
  blockchainId: string;
  userId: string;
  amount: bigint;
  address: string;
  status: 'pending' | 'processing' | 'confirmed' | 'failed';
  txHash?: string;
  timestamp: Date;
}

export interface BlockchainBalance {
  omnibusAddress: string;
  balance: bigint;
  lastUpdated: Date;
}

