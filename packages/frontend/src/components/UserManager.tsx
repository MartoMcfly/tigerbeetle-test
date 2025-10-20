'use client';

import { useState } from 'react';
import { createUser, seedTestData } from '@/services/api';
import { Ledger, LEDGER_NAMES, BLOCKCHAIN_LEDGERS } from '@blockchain-omnibus/shared';
import type { UserWithBalances } from '@blockchain-omnibus/shared';

interface Props {
  users: UserWithBalances[];
  onUpdate: () => void;
}

export default function UserManager({ users, onUpdate }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedBlockchains, setSelectedBlockchains] = useState<Ledger[]>([Ledger.ETHEREUM]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await createUser({
        name,
        email: email || undefined,
        initialBlockchains: selectedBlockchains,
      });

      setName('');
      setEmail('');
      setSelectedBlockchains([Ledger.ETHEREUM]);
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  }

  async function handleSeedData() {
    setLoading(true);
    try {
      await seedTestData();
      onUpdate();
    } catch (err) {
      setError('Failed to seed test data');
    } finally {
      setLoading(false);
    }
  }

  function toggleBlockchain(ledger: Ledger) {
    if (selectedBlockchains.includes(ledger)) {
      setSelectedBlockchains(selectedBlockchains.filter(l => l !== ledger));
    } else {
      setSelectedBlockchains([...selectedBlockchains, ledger]);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Create New User</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              placeholder="Enter name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              placeholder="Enter email (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initial Blockchains *
            </label>
            <div className="space-y-2">
              {BLOCKCHAIN_LEDGERS.map(ledger => (
                <label key={ledger} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedBlockchains.includes(ledger)}
                    onChange={() => toggleBlockchain(ledger)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {LEDGER_NAMES[ledger]}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !name || selectedBlockchains.length === 0}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
            <button
              type="button"
              onClick={handleSeedData}
              disabled={loading}
              className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:bg-gray-400"
            >
              Seed Test Data
            </button>
          </div>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Users ({users.length})</h3>
        <div className="space-y-2">
          {users.length === 0 ? (
            <p className="text-sm text-gray-500">No users yet. Create one above!</p>
          ) : (
            users.map(user => (
              <div key={user.id} className="p-3 bg-gray-50 rounded-md border">
                <div className="font-medium">{user.name}</div>
                {user.email && (
                  <div className="text-sm text-gray-600">{user.email}</div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  {user.balances.length} blockchain(s)
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

