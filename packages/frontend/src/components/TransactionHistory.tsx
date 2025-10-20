'use client';

import { LEDGER_NAMES } from '@blockchain-omnibus/shared';
import type { Transaction, UserWithBalances } from '@blockchain-omnibus/shared';

interface Props {
  transactions: Transaction[];
  users: UserWithBalances[];
}

export default function TransactionHistory({ transactions, users }: Props) {
  function getUserName(userId?: string): string {
    if (!userId) return 'N/A';
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown';
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'posted':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function getTypeLabel(type: string): string {
    switch (type) {
      case 'same_blockchain':
        return 'Transfer';
      case 'cross_blockchain':
        return 'Bridge';
      case 'deposit':
        return 'Deposit';
      case 'withdrawal':
        return 'Withdrawal';
      default:
        return type;
    }
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">
        Transaction History ({transactions.length})
      </h3>

      {transactions.length === 0 ? (
        <p className="text-sm text-gray-500">No transactions yet</p>
      ) : (
        <div className="space-y-3">
          {transactions.map(tx => (
            <div key={tx.id} className="border rounded-lg p-4 bg-white hover:shadow-md transition">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-medium text-gray-900">
                    {getTypeLabel(tx.type)}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(tx.createdAt).toLocaleString()}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(
                    tx.status
                  )}`}
                >
                  {tx.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {tx.fromUserId && (
                  <div>
                    <span className="text-gray-500">From:</span>
                    <div className="font-medium">{getUserName(tx.fromUserId)}</div>
                  </div>
                )}
                {tx.toUserId && (
                  <div>
                    <span className="text-gray-500">To:</span>
                    <div className="font-medium">{getUserName(tx.toUserId)}</div>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Amount:</span>
                  <div className="font-mono font-semibold text-blue-600">
                    ${tx.amountFormatted}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Blockchain:</span>
                  <div className="font-medium">
                    {LEDGER_NAMES[tx.sourceLedger]}
                    {tx.type === 'cross_blockchain' &&
                      ` → ${LEDGER_NAMES[tx.destinationLedger]}`}
                  </div>
                </div>
              </div>

              {tx.error && (
                <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                  Error: {tx.error}
                </div>
              )}

              <div className="mt-2 text-xs text-gray-400">
                ID: {tx.id}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

