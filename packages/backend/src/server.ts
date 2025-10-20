import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initTigerBeetleClient } from './tigerbeetle/client';
import { initializeOmnibusAccounts } from './services/omnibus.service';
import { errorHandler } from './middleware/error-handler';
import usersRoutes from './routes/users.routes';
import accountsRoutes from './routes/accounts.routes';
import transactionsRoutes from './routes/transactions.routes';
import adminRoutes from './routes/admin.routes';

// Load environment variables
dotenv.config();

// Enable BigInt serialization in JSON
// @ts-ignore
BigInt.prototype.toJSON = function() { return this.toString(); };

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', usersRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/admin', adminRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Blockchain Omnibus Demo API',
    version: '1.0.0',
    description: 'Backend API for TigerBeetle blockchain omnibus demo',
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

/**
 * Initialize TigerBeetle and start server
 */
async function startServer() {
  try {
    console.log('🚀 Starting Blockchain Omnibus Demo Backend...');

    // Initialize TigerBeetle client
    const clusterID = BigInt(process.env.TIGERBEETLE_CLUSTER_ID || '0');
    const replicaAddresses = (process.env.TIGERBEETLE_REPLICA_ADDRESSES || '3000')
      .split(',')
      .map(addr => addr.trim());

    await initTigerBeetleClient({
      clusterID,
      replicaAddresses,
    });

    // Initialize omnibus accounts
    await initializeOmnibusAccounts();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/admin/health`);
      console.log('\n🎯 Ready to accept requests!');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Start the server
if (require.main === module) {
  startServer();
}

export default app;

