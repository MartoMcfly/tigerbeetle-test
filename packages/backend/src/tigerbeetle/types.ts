/**
 * TigerBeetle type definitions and enums
 */

export enum AccountFlags {
  NONE = 0,
  LINKED = 1 << 0,
  DEBITS_MUST_NOT_EXCEED_CREDITS = 1 << 1,
  CREDITS_MUST_NOT_EXCEED_DEBITS = 1 << 2,
}

export enum TransferFlags {
  NONE = 0,
  LINKED = 1 << 0,
  PENDING = 1 << 1,
  POST_PENDING_TRANSFER = 1 << 2,
  VOID_PENDING_TRANSFER = 1 << 3,
  BALANCING_DEBIT = 1 << 4,
  BALANCING_CREDIT = 1 << 5,
}

export interface TBAccount {
  id: bigint;
  debits_pending: bigint;
  debits_posted: bigint;
  credits_pending: bigint;
  credits_posted: bigint;
  user_data_128: bigint;
  user_data_64: bigint;
  user_data_32: number;
  reserved: number;
  ledger: number;
  code: number;
  flags: number;
  timestamp: bigint;
}

export interface TBTransfer {
  id: bigint;
  debit_account_id: bigint;
  credit_account_id: bigint;
  amount: bigint;
  pending_id: bigint;
  user_data_128: bigint;
  user_data_64: bigint;
  user_data_32: number;
  timeout: number;
  ledger: number;
  code: number;
  flags: number;
  timestamp: bigint;
}

export interface CreateAccountParams {
  id: bigint;
  user_data_128?: bigint;
  user_data_64?: bigint;
  user_data_32?: number;
  ledger: number;
  code: number;
  flags?: number;
}

export interface CreateTransferParams {
  id: bigint;
  debit_account_id: bigint;
  credit_account_id: bigint;
  amount: bigint;
  pending_id?: bigint;
  user_data_128?: bigint;
  user_data_64?: bigint;
  user_data_32?: number;
  timeout?: number;
  ledger: number;
  code: number;
  flags?: number;
}

export enum CreateAccountError {
  OK = 0,
  LINKED_EVENT_FAILED = 1,
  LINKED_EVENT_CHAIN_OPEN = 2,
  TIMESTAMP_MUST_BE_ZERO = 3,
  RESERVED_FIELD = 4,
  RESERVED_FLAG = 5,
  ID_MUST_NOT_BE_ZERO = 6,
  ID_MUST_NOT_BE_INT_MAX = 7,
  FLAGS_ARE_MUTUALLY_EXCLUSIVE = 8,
  DEBITS_PENDING_MUST_BE_ZERO = 9,
  DEBITS_POSTED_MUST_BE_ZERO = 10,
  CREDITS_PENDING_MUST_BE_ZERO = 11,
  CREDITS_POSTED_MUST_BE_ZERO = 12,
  LEDGER_MUST_NOT_BE_ZERO = 13,
  CODE_MUST_NOT_BE_ZERO = 14,
  EXISTS_WITH_DIFFERENT_FLAGS = 15,
  EXISTS_WITH_DIFFERENT_USER_DATA_128 = 16,
  EXISTS_WITH_DIFFERENT_USER_DATA_64 = 17,
  EXISTS_WITH_DIFFERENT_USER_DATA_32 = 18,
  EXISTS_WITH_DIFFERENT_LEDGER = 19,
  EXISTS_WITH_DIFFERENT_CODE = 20,
  EXISTS = 21,
}

export enum CreateTransferError {
  OK = 0,
  LINKED_EVENT_FAILED = 1,
  LINKED_EVENT_CHAIN_OPEN = 2,
  TIMESTAMP_MUST_BE_ZERO = 3,
  RESERVED_FIELD = 4,
  RESERVED_FLAG = 5,
  ID_MUST_NOT_BE_ZERO = 6,
  ID_MUST_NOT_BE_INT_MAX = 7,
  FLAGS_ARE_MUTUALLY_EXCLUSIVE = 8,
  DEBIT_ACCOUNT_ID_MUST_NOT_BE_ZERO = 9,
  DEBIT_ACCOUNT_ID_MUST_NOT_BE_INT_MAX = 10,
  CREDIT_ACCOUNT_ID_MUST_NOT_BE_ZERO = 11,
  CREDIT_ACCOUNT_ID_MUST_NOT_BE_INT_MAX = 12,
  ACCOUNTS_MUST_BE_DIFFERENT = 13,
  PENDING_ID_MUST_BE_ZERO = 14,
  PENDING_ID_MUST_NOT_BE_ZERO = 15,
  PENDING_ID_MUST_NOT_BE_INT_MAX = 16,
  PENDING_ID_MUST_BE_DIFFERENT = 17,
  TIMEOUT_RESERVED_FOR_PENDING_TRANSFER = 18,
  LEDGER_MUST_NOT_BE_ZERO = 19,
  CODE_MUST_NOT_BE_ZERO = 20,
  AMOUNT_MUST_NOT_BE_ZERO = 21,
  DEBIT_ACCOUNT_NOT_FOUND = 22,
  CREDIT_ACCOUNT_NOT_FOUND = 23,
  ACCOUNTS_MUST_HAVE_THE_SAME_LEDGER = 24,
  TRANSFER_MUST_HAVE_THE_SAME_LEDGER_AS_ACCOUNTS = 25,
  PENDING_TRANSFER_NOT_FOUND = 26,
  PENDING_TRANSFER_NOT_PENDING = 27,
  PENDING_TRANSFER_HAS_DIFFERENT_DEBIT_ACCOUNT_ID = 28,
  PENDING_TRANSFER_HAS_DIFFERENT_CREDIT_ACCOUNT_ID = 29,
  PENDING_TRANSFER_HAS_DIFFERENT_LEDGER = 30,
  PENDING_TRANSFER_HAS_DIFFERENT_CODE = 31,
  EXCEEDS_PENDING_TRANSFER_AMOUNT = 32,
  PENDING_TRANSFER_HAS_DIFFERENT_AMOUNT = 33,
  PENDING_TRANSFER_ALREADY_POSTED = 34,
  PENDING_TRANSFER_ALREADY_VOIDED = 35,
  PENDING_TRANSFER_EXPIRED = 36,
  EXISTS_WITH_DIFFERENT_FLAGS = 37,
  EXISTS_WITH_DIFFERENT_DEBIT_ACCOUNT_ID = 38,
  EXISTS_WITH_DIFFERENT_CREDIT_ACCOUNT_ID = 39,
  EXISTS_WITH_DIFFERENT_AMOUNT = 40,
  EXISTS_WITH_DIFFERENT_PENDING_ID = 41,
  EXISTS_WITH_DIFFERENT_USER_DATA_128 = 42,
  EXISTS_WITH_DIFFERENT_USER_DATA_64 = 43,
  EXISTS_WITH_DIFFERENT_USER_DATA_32 = 44,
  EXISTS_WITH_DIFFERENT_TIMEOUT = 45,
  EXISTS_WITH_DIFFERENT_CODE = 46,
  EXISTS = 47,
  OVERFLOWS_DEBITS_PENDING = 48,
  OVERFLOWS_CREDITS_PENDING = 49,
  OVERFLOWS_DEBITS_POSTED = 50,
  OVERFLOWS_CREDITS_POSTED = 51,
  OVERFLOWS_DEBITS = 52,
  OVERFLOWS_CREDITS = 53,
  OVERFLOWS_TIMEOUT = 54,
  EXCEEDS_CREDITS = 55,
  EXCEEDS_DEBITS = 56,
}

export const CreateAccountErrorMessages: Record<CreateAccountError, string> = {
  [CreateAccountError.OK]: 'Success',
  [CreateAccountError.LINKED_EVENT_FAILED]: 'Linked event failed',
  [CreateAccountError.LINKED_EVENT_CHAIN_OPEN]: 'Linked event chain open',
  [CreateAccountError.TIMESTAMP_MUST_BE_ZERO]: 'Timestamp must be zero',
  [CreateAccountError.RESERVED_FIELD]: 'Reserved field must be zero',
  [CreateAccountError.RESERVED_FLAG]: 'Reserved flag set',
  [CreateAccountError.ID_MUST_NOT_BE_ZERO]: 'Account ID must not be zero',
  [CreateAccountError.ID_MUST_NOT_BE_INT_MAX]: 'Account ID must not be int max',
  [CreateAccountError.FLAGS_ARE_MUTUALLY_EXCLUSIVE]: 'Flags are mutually exclusive',
  [CreateAccountError.DEBITS_PENDING_MUST_BE_ZERO]: 'Debits pending must be zero',
  [CreateAccountError.DEBITS_POSTED_MUST_BE_ZERO]: 'Debits posted must be zero',
  [CreateAccountError.CREDITS_PENDING_MUST_BE_ZERO]: 'Credits pending must be zero',
  [CreateAccountError.CREDITS_POSTED_MUST_BE_ZERO]: 'Credits posted must be zero',
  [CreateAccountError.LEDGER_MUST_NOT_BE_ZERO]: 'Ledger must not be zero',
  [CreateAccountError.CODE_MUST_NOT_BE_ZERO]: 'Code must not be zero',
  [CreateAccountError.EXISTS_WITH_DIFFERENT_FLAGS]: 'Account exists with different flags',
  [CreateAccountError.EXISTS_WITH_DIFFERENT_USER_DATA_128]: 'Account exists with different user_data_128',
  [CreateAccountError.EXISTS_WITH_DIFFERENT_USER_DATA_64]: 'Account exists with different user_data_64',
  [CreateAccountError.EXISTS_WITH_DIFFERENT_USER_DATA_32]: 'Account exists with different user_data_32',
  [CreateAccountError.EXISTS_WITH_DIFFERENT_LEDGER]: 'Account exists with different ledger',
  [CreateAccountError.EXISTS_WITH_DIFFERENT_CODE]: 'Account exists with different code',
  [CreateAccountError.EXISTS]: 'Account already exists',
};

export const CreateTransferErrorMessages: Record<CreateTransferError, string> = {
  [CreateTransferError.OK]: 'Success',
  [CreateTransferError.LINKED_EVENT_FAILED]: 'Linked event failed',
  [CreateTransferError.LINKED_EVENT_CHAIN_OPEN]: 'Linked event chain open',
  [CreateTransferError.TIMESTAMP_MUST_BE_ZERO]: 'Timestamp must be zero',
  [CreateTransferError.RESERVED_FIELD]: 'Reserved field must be zero',
  [CreateTransferError.RESERVED_FLAG]: 'Reserved flag set',
  [CreateTransferError.ID_MUST_NOT_BE_ZERO]: 'Transfer ID must not be zero',
  [CreateTransferError.ID_MUST_NOT_BE_INT_MAX]: 'Transfer ID must not be int max',
  [CreateTransferError.FLAGS_ARE_MUTUALLY_EXCLUSIVE]: 'Flags are mutually exclusive',
  [CreateTransferError.DEBIT_ACCOUNT_ID_MUST_NOT_BE_ZERO]: 'Debit account ID must not be zero',
  [CreateTransferError.DEBIT_ACCOUNT_ID_MUST_NOT_BE_INT_MAX]: 'Debit account ID must not be int max',
  [CreateTransferError.CREDIT_ACCOUNT_ID_MUST_NOT_BE_ZERO]: 'Credit account ID must not be zero',
  [CreateTransferError.CREDIT_ACCOUNT_ID_MUST_NOT_BE_INT_MAX]: 'Credit account ID must not be int max',
  [CreateTransferError.ACCOUNTS_MUST_BE_DIFFERENT]: 'Debit and credit accounts must be different',
  [CreateTransferError.PENDING_ID_MUST_BE_ZERO]: 'Pending ID must be zero',
  [CreateTransferError.PENDING_ID_MUST_NOT_BE_ZERO]: 'Pending ID must not be zero',
  [CreateTransferError.PENDING_ID_MUST_NOT_BE_INT_MAX]: 'Pending ID must not be int max',
  [CreateTransferError.PENDING_ID_MUST_BE_DIFFERENT]: 'Pending ID must be different from transfer ID',
  [CreateTransferError.TIMEOUT_RESERVED_FOR_PENDING_TRANSFER]: 'Timeout reserved for pending transfer',
  [CreateTransferError.LEDGER_MUST_NOT_BE_ZERO]: 'Ledger must not be zero',
  [CreateTransferError.CODE_MUST_NOT_BE_ZERO]: 'Code must not be zero',
  [CreateTransferError.AMOUNT_MUST_NOT_BE_ZERO]: 'Amount must not be zero',
  [CreateTransferError.DEBIT_ACCOUNT_NOT_FOUND]: 'Debit account not found',
  [CreateTransferError.CREDIT_ACCOUNT_NOT_FOUND]: 'Credit account not found',
  [CreateTransferError.ACCOUNTS_MUST_HAVE_THE_SAME_LEDGER]: 'Accounts must have the same ledger',
  [CreateTransferError.TRANSFER_MUST_HAVE_THE_SAME_LEDGER_AS_ACCOUNTS]: 'Transfer must have the same ledger as accounts',
  [CreateTransferError.PENDING_TRANSFER_NOT_FOUND]: 'Pending transfer not found',
  [CreateTransferError.PENDING_TRANSFER_NOT_PENDING]: 'Pending transfer not pending',
  [CreateTransferError.PENDING_TRANSFER_HAS_DIFFERENT_DEBIT_ACCOUNT_ID]: 'Pending transfer has different debit account ID',
  [CreateTransferError.PENDING_TRANSFER_HAS_DIFFERENT_CREDIT_ACCOUNT_ID]: 'Pending transfer has different credit account ID',
  [CreateTransferError.PENDING_TRANSFER_HAS_DIFFERENT_LEDGER]: 'Pending transfer has different ledger',
  [CreateTransferError.PENDING_TRANSFER_HAS_DIFFERENT_CODE]: 'Pending transfer has different code',
  [CreateTransferError.EXCEEDS_PENDING_TRANSFER_AMOUNT]: 'Exceeds pending transfer amount',
  [CreateTransferError.PENDING_TRANSFER_HAS_DIFFERENT_AMOUNT]: 'Pending transfer has different amount',
  [CreateTransferError.PENDING_TRANSFER_ALREADY_POSTED]: 'Pending transfer already posted',
  [CreateTransferError.PENDING_TRANSFER_ALREADY_VOIDED]: 'Pending transfer already voided',
  [CreateTransferError.PENDING_TRANSFER_EXPIRED]: 'Pending transfer expired',
  [CreateTransferError.EXISTS_WITH_DIFFERENT_FLAGS]: 'Transfer exists with different flags',
  [CreateTransferError.EXISTS_WITH_DIFFERENT_DEBIT_ACCOUNT_ID]: 'Transfer exists with different debit account ID',
  [CreateTransferError.EXISTS_WITH_DIFFERENT_CREDIT_ACCOUNT_ID]: 'Transfer exists with different credit account ID',
  [CreateTransferError.EXISTS_WITH_DIFFERENT_AMOUNT]: 'Transfer exists with different amount',
  [CreateTransferError.EXISTS_WITH_DIFFERENT_PENDING_ID]: 'Transfer exists with different pending ID',
  [CreateTransferError.EXISTS_WITH_DIFFERENT_USER_DATA_128]: 'Transfer exists with different user_data_128',
  [CreateTransferError.EXISTS_WITH_DIFFERENT_USER_DATA_64]: 'Transfer exists with different user_data_64',
  [CreateTransferError.EXISTS_WITH_DIFFERENT_USER_DATA_32]: 'Transfer exists with different user_data_32',
  [CreateTransferError.EXISTS_WITH_DIFFERENT_TIMEOUT]: 'Transfer exists with different timeout',
  [CreateTransferError.EXISTS_WITH_DIFFERENT_CODE]: 'Transfer exists with different code',
  [CreateTransferError.EXISTS]: 'Transfer already exists',
  [CreateTransferError.OVERFLOWS_DEBITS_PENDING]: 'Overflows debits pending',
  [CreateTransferError.OVERFLOWS_CREDITS_PENDING]: 'Overflows credits pending',
  [CreateTransferError.OVERFLOWS_DEBITS_POSTED]: 'Overflows debits posted',
  [CreateTransferError.OVERFLOWS_CREDITS_POSTED]: 'Overflows credits posted',
  [CreateTransferError.OVERFLOWS_DEBITS]: 'Overflows debits',
  [CreateTransferError.OVERFLOWS_CREDITS]: 'Overflows credits',
  [CreateTransferError.OVERFLOWS_TIMEOUT]: 'Overflows timeout',
  [CreateTransferError.EXCEEDS_CREDITS]: 'Exceeds credits (insufficient balance)',
  [CreateTransferError.EXCEEDS_DEBITS]: 'Exceeds debits',
};

