/**
 * Formats an integer cents/paise value into INR currency string.
 * @param cents - The amount in cents/paise (e.g., 1999 for ₹19.99)
 * @returns Formatted currency string with ₹ symbol (e.g., "₹19.99")
 */
export function formatINR(cents: number | bigint): string {
  const amount = Number(cents) / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
