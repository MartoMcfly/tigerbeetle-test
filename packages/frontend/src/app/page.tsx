'use client';

import { useState, useEffect } from 'react';
import UserManager from '@/components/UserManager';
import TransactionForm from '@/components/TransactionForm';
import BalanceViewer from '@/components/BalanceViewer';
import TransactionHistory from '@/components/TransactionHistory';
import OmnibusOverview from '@/components/OmnibusOverview';
import { getUsers, getTransactions } from '@/services/api';
import type { UserWithBalances, Transaction } from '@blockchain-omnibus/shared';

export default function Home() {
  const [users, setUsers] = useState<UserWithBalances[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'transactions' | 'omnibus'>('users');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [usersData, transactionsData] = await Promise.all([
        getUsers(),
        getTransactions({ limit: 50 }),
      ]);
      setUsers(usersData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          TigerBeetle Omnibus Account Demo
        </h2>
        <p className="text-gray-600">
          Demonstrating blockchain transaction patterns with distributed ledger technology
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'users'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Users & Balances
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'transactions'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => setActiveTab('omnibus')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'omnibus'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Omnibus Overview
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'users' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <UserManager users={users} onUpdate={loadData} />
              </div>
              <div>
                <BalanceViewer users={users} />
                <div className="mt-6">
                  <TransactionForm users={users} onSuccess={loadData} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <TransactionHistory transactions={transactions} users={users} />
          )}

          {activeTab === 'omnibus' && <OmnibusOverview />}
        </div>
      </div>
    </div>
  );
}

