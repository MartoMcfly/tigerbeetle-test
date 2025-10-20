import axios from 'axios';
import type {
  User,
  UserWithBalances,
  CreateUserRequest,
  Transaction,
  SameBlockchainTransferRequest,
  DepositRequest,
  WithdrawalRequest,
  CrossBlockchainTransferRequest,
  OmnibusStatus,
} from '@blockchain-omnibus/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Users
export async function createUser(data: CreateUserRequest): Promise<UserWithBalances> {
  const response = await api.post('/users', data);
  return response.data.data.user;
}

export async function getUsers(): Promise<UserWithBalances[]> {
  const response = await api.get('/users');
  return response.data.data.users;
}

export async function getUser(userId: string): Promise<UserWithBalances> {
  const response = await api.get(`/users/${userId}`);
  return response.data.data.user;
}

// Transactions
export async function createTransfer(
  data: Omit<SameBlockchainTransferRequest, 'amount'> & { amount: number }
): Promise<Transaction> {
  const response = await api.post('/transactions/transfer', data);
  return response.data.data.transaction;
}

export async function createDeposit(
  data: Omit<DepositRequest, 'amount'> & { amount: number }
): Promise<Transaction> {
  const response = await api.post('/transactions/deposit', data);
  return response.data.data.transaction;
}

export async function createWithdrawal(
  data: Omit<WithdrawalRequest, 'amount'> & { amount: number }
): Promise<Transaction> {
  const response = await api.post('/transactions/withdraw', data);
  return response.data.data.transaction;
}

export async function createBridge(
  data: Omit<CrossBlockchainTransferRequest, 'amount'> & { amount: number }
): Promise<Transaction> {
  const response = await api.post('/transactions/bridge', data);
  return response.data.data.transaction;
}

export async function getTransactions(params?: {
  userId?: string;
  limit?: number;
}): Promise<Transaction[]> {
  const response = await api.get('/transactions', { params });
  return response.data.data.transactions;
}

export async function getTransaction(transactionId: string): Promise<Transaction> {
  const response = await api.get(`/transactions/${transactionId}`);
  return response.data.data.transaction;
}

// Accounts
export async function getOmnibusAccounts(): Promise<any[]> {
  const response = await api.get('/accounts/omnibus');
  return response.data.data.omnibusAccounts;
}

// Admin
export async function seedTestData(): Promise<any> {
  const response = await api.post('/admin/seed');
  return response.data;
}

export async function checkReconciliation(): Promise<any> {
  const response = await api.get('/admin/reconcile');
  return response.data.data;
}

export async function getHealth(): Promise<any> {
  const response = await api.get('/admin/health');
  return response.data.data;
}

