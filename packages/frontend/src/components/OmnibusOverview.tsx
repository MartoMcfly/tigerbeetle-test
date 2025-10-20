'use client';

import { useState, useEffect } from 'react';
import { getOmnibusAccounts, checkReconciliation } from '@/services/api';

export default function OmnibusOverview() {
  const [omnibusAccounts, setOmnibusAccounts] = useState<any[]>([]);
  const [reconciliation, setReconciliation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [accounts, recon] = await Promise.all([
        getOmnibusAccounts(),
        checkReconciliation(),
      ]);
      setOmnibusAccounts(accounts);
      setReconciliation(recon);
    } catch (error) {
      console.error('Failed to load omnibus data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Omnibus Accounts Status</h3>
        
        {reconciliation && (
          <div
            className={`p-4 rounded-lg mb-4 ${
              reconciliation.allReconciled
                ? 'bg-green-50 border border-green-200'
                : 'bg-yellow-50 border border-yellow-200'
            }`}
          >
            <div className="font-semibold mb-1">
              {reconciliation.allReconciled ? '✅ All Reconciled' : '⚠️ Discrepancies Found'}
            </div>
            <div className="text-sm text-gray-600">
              {reconciliation.allReconciled
                ? 'All omnibus accounts are properly balanced with user accounts.'
                : 'Some omnibus accounts have discrepancies. This is normal during active deposits/withdrawals.'}
            </div>
          </div>
        )}

        <div className="grid gap-4">
          {omnibusAccounts.map(account => (
            <div key={account.ledger} className="border rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {account.blockchainName}
                  </h4>
                  <div className="text-xs text-gray-500 mt-1">
                    Ledger {account.ledger}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded ${
                    account.isReconciled
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {account.isReconciled ? 'Reconciled' : 'Discrepancy'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 mb-1">Omnibus Balance</div>
                  <div className="font-mono font-semibold text-blue-600">
                    ${account.omnibusBalanceFormatted}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Total User Balances</div>
                  <div className="font-mono font-semibold text-green-600">
                    ${account.totalUserBalancesFormatted}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Discrepancy</div>
                  <div className={`font-mono font-semibold ${
                    account.discrepancy === '0' ? 'text-gray-600' : 'text-orange-600'
                  }`}>
                    ${account.discrepancyFormatted}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">User Accounts</div>
                  <div className="font-semibold">
                    {account.userAccountCount}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t text-xs text-gray-400">
                Account ID: {account.omnibusAccountId}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={loadData}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
      >
        Refresh Data
      </button>

      <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
        <h4 className="font-semibold mb-2">About Omnibus Accounts</h4>
        <p className="mb-2">
          Omnibus accounts pool blockchain assets for all users on each blockchain.
          They serve as the bridge between on-chain balances and TigerBeetle&apos;s internal ledger.
        </p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Omnibus Balance: Total assets held on the blockchain</li>
          <li>Total User Balances: Sum of all user internal balances</li>
          <li>Reconciliation: Ensures balances match (accounting for pending operations)</li>
        </ul>
      </div>
    </div>
  );
}

