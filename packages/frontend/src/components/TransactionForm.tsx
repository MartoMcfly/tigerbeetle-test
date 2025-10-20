'use client';

import { useState } from 'react';
import {
  createTransfer,
  createDeposit,
  createWithdrawal,
  createBridge,
} from '@/services/api';
import {
  Ledger,
  LEDGER_NAMES,
  BLOCKCHAIN_LEDGERS,
  TransactionType,
} from '@blockchain-omnibus/shared';
import type { UserWithBalances } from '@blockchain-omnibus/shared';

interface Props {
  users: UserWithBalances[];
  onSuccess: () => void;
}

export default function TransactionForm({ users, onSuccess }: Props) {
  const [transactionType, setTransactionType] = useState<string>('transfer');
  const [fromUserId, setFromUserId] = useState('');
  const [toUserId, setToUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [ledger, setLedger] = useState<Ledger>(Ledger.ETHEREUM);
  const [destLedger, setDestLedger] = useState<Ledger>(Ledger.POLYGON);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Invalid amount');
      }

      let result;

      switch (transactionType) {
        case 'transfer':
          if (!fromUserId || !toUserId) {
            throw new Error('Select both users');
          }
          result = await createTransfer({
            fromUserId,
            toUserId,
            amount: amountNum,
            ledger,
          });
          setSuccess(`Transfer successful! Transaction: ${result.id}`);
          break;

        case 'deposit':
          if (!toUserId) {
            throw new Error('Select a user');
          }
          result = await createDeposit({
            userId: toUserId,
            amount: amountNum,
            ledger,
          });
          setSuccess(`Deposit successful! Transaction: ${result.id}`);
          break;

        case 'withdrawal':
          if (!fromUserId || !address) {
            throw new Error('Select user and provide address');
          }
          result = await createWithdrawal({
            userId: fromUserId,
            amount: amountNum,
            ledger,
            address,
          });
          setSuccess(`Withdrawal successful! Transaction: ${result.id}`);
          break;

        case 'bridge':
          if (!fromUserId) {
            throw new Error('Select a user');
          }
          result = await createBridge({
            userId: fromUserId,
            amount: amountNum,
            sourceLedger: ledger,
            destinationLedger: destLedger,
          });
          setSuccess(`Bridge transfer successful! Transaction: ${result.id}`);
          break;
      }

      // Reset form
      setAmount('');
      setAddress('');
      
      // Refresh data
      setTimeout(() => {
        onSuccess();
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border rounded-lg p-4 bg-white">
      <h3 className="text-lg font-semibold mb-4">New Transaction</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transaction Type
          </label>
          <select
            value={transactionType}
            onChange={e => setTransactionType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
          >
            <option value="transfer">User Transfer (Same Blockchain)</option>
            <option value="deposit">Deposit (Blockchain → User)</option>
            <option value="withdrawal">Withdrawal (User → Blockchain)</option>
            <option value="bridge">Bridge (Cross-Blockchain)</option>
          </select>
        </div>

        {(transactionType === 'transfer' || transactionType === 'withdrawal') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From User
            </label>
            <select
              value={fromUserId}
              onChange={e => setFromUserId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            >
              <option value="">Select user...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {(transactionType === 'transfer' || transactionType === 'deposit') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {transactionType === 'transfer' ? 'To User' : 'User'}
            </label>
            <select
              value={toUserId}
              onChange={e => setToUserId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            >
              <option value="">Select user...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {transactionType === 'bridge' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User
            </label>
            <select
              value={fromUserId}
              onChange={e => setFromUserId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            >
              <option value="">Select user...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (USD)
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {transactionType === 'bridge' ? 'Source Blockchain' : 'Blockchain'}
          </label>
          <select
            value={ledger}
            onChange={e => setLedger(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
          >
            {BLOCKCHAIN_LEDGERS.map(l => (
              <option key={l} value={l}>
                {LEDGER_NAMES[l]}
              </option>
            ))}
          </select>
        </div>

        {transactionType === 'bridge' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destination Blockchain
            </label>
            <select
              value={destLedger}
              onChange={e => setDestLedger(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            >
              {BLOCKCHAIN_LEDGERS.filter(l => l !== ledger).map(l => (
                <option key={l} value={l}>
                  {LEDGER_NAMES[l]}
                </option>
              ))}
            </select>
          </div>
        )}

        {transactionType === 'withdrawal' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Withdrawal Address
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              placeholder="0x..."
            />
          </div>
        )}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="text-sm text-green-600 bg-green-50 p-3 rounded">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Execute Transaction'}
        </button>
      </form>
    </div>
  );
}

