#!/usr/bin/env node

/**
 * TigerBeetle Inspector - Interactive CLI tool to inspect ledger data
 * 
 * Usage: node inspect-tigerbeetle.js [command]
 * 
 * Commands:
 *   accounts - List all accounts
 *   users    - List user accounts with balances
 *   omnibus  - List omnibus accounts
 *   health   - Check backend health
 */

const { createClient } = require('tigerbeetle-node');

const CLUSTER_ID = 0n;
const REPLICA_ADDRESSES = ['3000'];

// Account codes (from shared package)
const AccountCode = {
  USER_ACCOUNT: 1001,
  OMNIBUS_ACCOUNT: 2001,
  FEE_ACCOUNT: 3001,
  BRIDGE_ACCOUNT: 4001,
};

// Ledger names
const LEDGER_NAMES = {
  1: 'Ethereum',
  2: 'Polygon',
  3: 'Arbitrum',
};

let client;

async function initClient() {
  try {
    client = createClient({
      cluster_id: CLUSTER_ID,
      replica_addresses: REPLICA_ADDRESSES,
    });
    console.log('✅ Connected to TigerBeetle\n');
    return client;
  } catch (error) {
    console.error('❌ Failed to connect to TigerBeetle:', error.message);
    console.error('Make sure TigerBeetle is running on port 3000');
    process.exit(1);
  }
}

function formatAmount(cents) {
  return `$${(Number(cents) / 100).toFixed(2)}`;
}

function formatBalance(account) {
  const balance = account.credits_posted - account.debits_posted;
  return formatAmount(balance);
}

function getAccountTypeName(code) {
  switch (code) {
    case AccountCode.USER_ACCOUNT: return 'User Account';
    case AccountCode.OMNIBUS_ACCOUNT: return 'Omnibus Account';
    case AccountCode.FEE_ACCOUNT: return 'Fee Account';
    case AccountCode.BRIDGE_ACCOUNT: return 'Bridge Account';
    default: return `Unknown (${code})`;
  }
}

async function getAllAccounts() {
  console.log('🔍 Fetching all accounts from TigerBeetle...\n');
  
  // TigerBeetle doesn't have a "get all" API, so we need to use the backend API
  
  try {
    const response = await fetch('http://localhost:3001/api/users');
    const result = await response.json();
    
    const users = result.data?.users || [];
    
    if (users.length === 0) {
      console.log('No users found. Create some users first!');
      return;
    }
    
    console.log(`Found ${users.length} users:\n`);
    
    for (const user of users) {
      console.log(`👤 ${user.name} (ID: ${user.id})`);
      if (user.email) console.log(`   Email: ${user.email}`);
      
      console.log(`   Balances:`);
      for (const balance of user.balances) {
        const ledgerName = balance.blockchainName || LEDGER_NAMES[balance.ledger] || `Ledger ${balance.ledger}`;
        console.log(`   - ${ledgerName}: $${balance.balanceFormatted}`);
      }
      console.log('');
    }
  } catch (error) {
    console.error('❌ Error fetching accounts:', error.message);
    console.log('\nTip: Make sure the backend is running on port 3001');
  }
}

async function getOmnibusAccounts() {
  console.log('🏦 Fetching Omnibus accounts...\n');
  
  try {
    const response = await fetch('http://localhost:3001/api/accounts/omnibus');
    const result = await response.json();
    
    const omnibusAccounts = result.data?.omnibusAccounts || [];
    
    if (omnibusAccounts.length === 0) {
      console.log('No omnibus accounts found.');
      return;
    }
    
    console.log('Omnibus Account Balances:\n');
    
    for (const omnibus of omnibusAccounts) {
      const ledgerName = omnibus.blockchainName || LEDGER_NAMES[omnibus.ledger] || `Ledger ${omnibus.ledger}`;
      console.log(`🔗 ${ledgerName}`);
      console.log(`   Account ID: ${omnibus.omnibusAccountId}`);
      console.log(`   User Balances: $${omnibus.totalUserBalancesFormatted}`);
      console.log(`   Omnibus Balance: $${omnibus.omnibusBalanceFormatted}`);
      console.log(`   User Accounts: ${omnibus.userAccountCount}`);
      console.log(`   Reconciled: ${omnibus.isReconciled ? '✅ Yes' : '❌ No'}`);
      if (!omnibus.isReconciled) {
        console.log(`   Discrepancy: $${omnibus.discrepancyFormatted}`);
      }
      console.log('');
    }
  } catch (error) {
    console.error('❌ Error fetching omnibus accounts:', error.message);
  }
}

async function checkHealth() {
  console.log('🏥 Checking backend health...\n');
  
  try {
    const response = await fetch('http://localhost:3001/api/admin/health');
    const data = await response.json();
    
    if (data.status === 'success') {
      console.log('✅ Backend is healthy');
      console.log(`   Service: ${data.data.service}`);
      console.log(`   Uptime: ${data.data.uptime.toFixed(2)}s`);
      console.log(`   Timestamp: ${data.data.timestamp}`);
    }
  } catch (error) {
    console.error('❌ Backend is not responding');
    console.error('   Make sure the backend is running on port 3001');
  }
}

async function inspectAccount(accountId) {
  try {
    const accounts = await client.lookupAccounts([BigInt(accountId)]);
    
    if (accounts.length === 0) {
      console.log(`❌ Account ${accountId} not found`);
      return;
    }
    
    const account = accounts[0];
    const ledgerName = LEDGER_NAMES[account.ledger] || `Ledger ${account.ledger}`;
    const balance = account.credits_posted - account.debits_posted;
    
    console.log(`\n📊 Account Details:\n`);
    console.log(`   ID: ${account.id}`);
    console.log(`   Type: ${getAccountTypeName(account.code)}`);
    console.log(`   Ledger: ${ledgerName} (${account.ledger})`);
    console.log(`   Balance: ${formatAmount(balance)}`);
    console.log(`   \n   Breakdown:`);
    console.log(`   - Credits Posted: ${formatAmount(account.credits_posted)}`);
    console.log(`   - Debits Posted: ${formatAmount(account.debits_posted)}`);
    console.log(`   - Credits Pending: ${formatAmount(account.credits_pending)}`);
    console.log(`   - Debits Pending: ${formatAmount(account.debits_pending)}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function showMenu() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   🐯 TigerBeetle Ledger Inspector           ║');
  console.log('╚══════════════════════════════════════════════╝\n');
  
  console.log('Available commands:');
  console.log('  users    - List all users and their balances');
  console.log('  omnibus  - Show omnibus account status');
  console.log('  health   - Check backend health');
  console.log('  account <id> - Inspect specific account by ID');
  console.log('  help     - Show this menu');
  console.log('  exit     - Exit the inspector\n');
}

async function runInteractive() {
  const readline = require('readline');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'tigerbeetle> '
  });
  
  await showMenu();
  rl.prompt();
  
  rl.on('line', async (line) => {
    const [command, ...args] = line.trim().split(/\s+/);
    
    switch (command) {
      case 'users':
        await getAllAccounts();
        break;
      case 'omnibus':
        await getOmnibusAccounts();
        break;
      case 'health':
        await checkHealth();
        break;
      case 'account':
        if (args[0]) {
          await inspectAccount(args[0]);
        } else {
          console.log('Usage: account <id>');
        }
        break;
      case 'help':
        await showMenu();
        break;
      case 'exit':
      case 'quit':
        console.log('Goodbye! 👋');
        client?.destroy();
        process.exit(0);
        break;
      case '':
        break;
      default:
        console.log(`Unknown command: ${command}`);
        console.log('Type "help" for available commands');
    }
    
    rl.prompt();
  });
  
  rl.on('close', () => {
    console.log('\nGoodbye! 👋');
    client?.destroy();
    process.exit(0);
  });
}

async function main() {
  const command = process.argv[2];
  
  await initClient();
  
  if (!command) {
    // Interactive mode
    await runInteractive();
  } else {
    // Single command mode
    switch (command) {
      case 'users':
      case 'accounts':
        await getAllAccounts();
        break;
      case 'omnibus':
        await getOmnibusAccounts();
        break;
      case 'health':
        await checkHealth();
        break;
      case 'account':
        if (process.argv[3]) {
          await inspectAccount(process.argv[3]);
        } else {
          console.log('Usage: node inspect-tigerbeetle.js account <id>');
        }
        break;
      default:
        console.log(`Unknown command: ${command}`);
        console.log('\nAvailable commands: users, omnibus, health, account <id>');
    }
    
    client?.destroy();
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  client?.destroy();
  process.exit(1);
});

