/**
 * Ledger IDs for blockchain segmentation in TigerBeetle
 * Each blockchain has its own ledger to maintain separation
 */

export enum Ledger {
  SYSTEM = 0, // System accounts (fees, treasury)
  ETHEREUM = 1, // Ethereum blockchain
  POLYGON = 2, // Polygon blockchain
  ARBITRUM = 3, // Arbitrum blockchain
  BRIDGE = 999, // Bridge/Settlement layer for cross-blockchain transfers
}

export const LEDGER_NAMES: Record<Ledger, string> = {
  [Ledger.SYSTEM]: 'System',
  [Ledger.ETHEREUM]: 'Ethereum',
  [Ledger.POLYGON]: 'Polygon',
  [Ledger.ARBITRUM]: 'Arbitrum',
  [Ledger.BRIDGE]: 'Bridge',
};

export const BLOCKCHAIN_LEDGERS = [Ledger.ETHEREUM, Ledger.POLYGON, Ledger.ARBITRUM];

