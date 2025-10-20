'use client';

import { LEDGER_NAMES } from '@blockchain-omnibus/shared';
import type { UserWithBalances } from '@blockchain-omnibus/shared';

interface Props {
  users: UserWithBalances[];
}

export default function BalanceViewer({ users }: Props) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">User Balances</h3>
      <div className="space-y-4">
        {users.length === 0 ? (
          <p className="text-sm text-gray-500">No users to display</p>
        ) : (
          users.map(user => (
            <div key={user.id} className="border rounded-lg p-4 bg-white">
              <div className="font-medium text-gray-900 mb-3">{user.name}</div>
              <div className="space-y-2">
                {user.balances.map(balance => (
                  <div
                    key={`${user.id}-${balance.ledger}`}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-gray-600">{balance.blockchainName}:</span>
                    <span className="font-mono font-semibold text-gray-900">
                      ${balance.balanceFormatted}
                    </span>
                  </div>
                ))}
                <div className="pt-2 mt-2 border-t flex justify-between items-center text-sm font-semibold">
                  <span>Total:</span>
                  <span className="font-mono text-blue-600">
                    $
                    {(
                      Number(user.totalBalance) / 100
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

