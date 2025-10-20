import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a 128-bit ID for TigerBeetle accounts and transfers
 * Uses UUID v4 converted to bigint
 */
export function generateId(): bigint {
  const uuid = uuidv4();
  const hex = uuid.replace(/-/g, '');
  return BigInt('0x' + hex);
}

/**
 * Generates a sequential ID based on timestamp and counter
 * Ensures ordering while maintaining uniqueness
 */
let counter = 0n;
export function generateSequentialId(): bigint {
  const timestamp = BigInt(Date.now()) * 1000000n;
  counter = (counter + 1n) % 1000000n;
  return timestamp + counter;
}

/**
 * Converts a string UUID to bigint
 */
export function uuidToBigInt(uuid: string): bigint {
  const hex = uuid.replace(/-/g, '');
  return BigInt('0x' + hex);
}

/**
 * Converts a bigint to UUID string (for display)
 */
export function bigIntToUuid(id: bigint): string {
  const hex = id.toString(16).padStart(32, '0');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/**
 * Generates a unique user ID (regular UUID string)
 */
export function generateUserId(): string {
  return uuidv4();
}

/**
 * Generates a unique transaction ID (regular UUID string)
 */
export function generateTransactionId(): string {
  return uuidv4();
}

