/**
 * Account type codes for TigerBeetle account classification
 * Used in the 'code' field of account objects
 */

export enum AccountCode {
  USER_ACCOUNT = 1, // Individual user balance accounts
  OMNIBUS_ACCOUNT = 2, // Pooled accounts per blockchain
  FEE_ACCOUNT = 3, // Transaction fee collection
  BRIDGE_ACCOUNT = 4, // Cross-blockchain transit accounts
  TREASURY_ACCOUNT = 5, // System treasury
}

/**
 * Transfer type codes for classification
 * Used in the 'code' field of transfer objects
 */

export enum TransferCode {
  USER_TRANSFER = 1, // User-to-user transfer on same blockchain
  DEPOSIT = 2, // Blockchain deposit (off-chain to on-chain)
  WITHDRAWAL = 3, // Blockchain withdrawal (on-chain to off-chain)
  BRIDGE_OUTBOUND = 4, // First leg of cross-blockchain transfer (debit source)
  BRIDGE_INBOUND = 5, // Second leg of cross-blockchain transfer (credit destination)
  FEE = 6, // Fee collection
  OMNIBUS_REBALANCE = 7, // Omnibus account rebalancing
}

export const ACCOUNT_CODE_NAMES: Record<AccountCode, string> = {
  [AccountCode.USER_ACCOUNT]: 'User Account',
  [AccountCode.OMNIBUS_ACCOUNT]: 'Omnibus Account',
  [AccountCode.FEE_ACCOUNT]: 'Fee Account',
  [AccountCode.BRIDGE_ACCOUNT]: 'Bridge Account',
  [AccountCode.TREASURY_ACCOUNT]: 'Treasury Account',
};

export const TRANSFER_CODE_NAMES: Record<TransferCode, string> = {
  [TransferCode.USER_TRANSFER]: 'User Transfer',
  [TransferCode.DEPOSIT]: 'Deposit',
  [TransferCode.WITHDRAWAL]: 'Withdrawal',
  [TransferCode.BRIDGE_OUTBOUND]: 'Bridge Outbound',
  [TransferCode.BRIDGE_INBOUND]: 'Bridge Inbound',
  [TransferCode.FEE]: 'Fee',
  [TransferCode.OMNIBUS_REBALANCE]: 'Omnibus Rebalance',
};

