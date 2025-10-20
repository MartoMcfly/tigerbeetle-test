/**
 * Amount conversion utilities for TigerBeetle
 * TigerBeetle stores amounts as 128-bit integers (smallest unit)
 * We use cents for USD (100 cents = $1.00)
 */

export const DECIMAL_PLACES = 2; // For USD cents
export const MULTIPLIER = 10 ** DECIMAL_PLACES;

/**
 * Converts a decimal amount to TigerBeetle format (cents)
 * Example: 100.50 -> 10050n
 */
export function toTigerBeetleAmount(amount: number | string): bigint {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num) || num < 0) {
    throw new Error('Invalid amount: must be a positive number');
  }
  return BigInt(Math.floor(num * MULTIPLIER));
}

/**
 * Converts TigerBeetle amount (cents) to decimal string
 * Example: 10050n -> "100.50"
 */
export function fromTigerBeetleAmount(amount: bigint): string {
  const num = Number(amount) / MULTIPLIER;
  return num.toFixed(DECIMAL_PLACES);
}

/**
 * Formats an amount for display with currency symbol
 * Example: 10050n -> "$100.50"
 */
export function formatAmount(amount: bigint, currency: string = 'USD'): string {
  const num = Number(amount) / MULTIPLIER;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(num);
}

/**
 * Validates that an amount is positive and within valid range
 */
export function validateAmount(amount: bigint): boolean {
  return amount > 0n && amount < 2n ** 127n; // TigerBeetle uses 128-bit ints
}

/**
 * Calculates fee amount based on percentage
 */
export function calculateFee(amount: bigint, feePercentage: number): bigint {
  const fee = (amount * BigInt(Math.floor(feePercentage * 1000000))) / 1000000n;
  return fee > 0n ? fee : 1n; // Minimum 1 cent fee
}

