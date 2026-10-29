/**
 * Nigerian Naira (NGN / Kobo) Currency Calculation and Parsing Utilities
 */

/**
 * Converts a Kobo integer into Naira decimal
 */
export function koboToNaira(kobo) {
  if (kobo == null || isNaN(kobo)) return 0;
  return Number(kobo) / 100;
}

/**
 * Converts a Naira amount into integer Kobo (rounding to prevent floating point issues)
 */
export function nairaToKobo(naira) {
  if (naira == null || isNaN(naira)) return 0;
  return Math.round(Number(naira) * 100);
}

/**
 * Formats a numeric Naira or Kobo value into Nigerian standard currency string
 * e.g. 50000 -> "₦50,000"
 */
export function formatNaira(amount, isKobo = false) {
  const value = isKobo ? koboToNaira(amount) : Number(amount || 0);
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Parses user input currency string into numeric Naira amount.
 * Handles abbreviations: "5k" -> 5000, "1.5m" -> 1500000, "₦45,000" -> 45000
 */
export function parseNairaString(input) {
  if (input == null) return null;
  if (typeof input === 'number') return isNaN(input) ? null : input;

  const clean = input
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[₦,\s]/g, '');

  if (!clean) return null;

  // Handle 'k' multiplier (thousands)
  if (clean.endsWith('k')) {
    const num = parseFloat(clean.slice(0, -1));
    return isNaN(num) ? null : num * 1000;
  }

  // Handle 'm' multiplier (millions)
  if (clean.endsWith('m')) {
    const num = parseFloat(clean.slice(0, -1));
    return isNaN(num) ? null : num * 1000000;
  }

  const parsed = parseFloat(clean);
  return isNaN(parsed) ? null : parsed;
}
