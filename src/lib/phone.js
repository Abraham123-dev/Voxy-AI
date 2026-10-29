/**
 * Nigerian Phone Number Normalization and Validation Utilities
 * Handles standard Nigerian telco network prefixes (MTN, Airtel, Glo, 9mobile)
 */

const TELCO_PREFIXES = {
  mtn: ['0803', '0806', '0703', '0706', '0813', '0816', '0810', '0814', '0903', '0906', '0913', '0916'],
  airtel: ['0802', '0808', '0708', '0812', '0701', '0902', '0901', '0904', '0907', '0912'],
  glo: ['0805', '0807', '0705', '0815', '0811', '0905', '0915'],
  '9mobile': ['0809', '0817', '0818', '0909', '0908'],
};

/**
 * Normalizes an input phone number into E.164 format (+234...)
 * Accepts formats: 0803..., 803..., 234803..., +234803...
 */
export function normalizeNigerianPhone(phone) {
  if (!phone || typeof phone !== 'string') return null;

  // Strip spaces, dashes, parentheses
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');

  if (cleaned.startsWith('+234')) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith('0')) {
    cleaned = '234' + cleaned.substring(1);
  } else if (cleaned.length === 10 && !cleaned.startsWith('234')) {
    cleaned = '234' + cleaned;
  }

  // Must be 234 + 10 digits = 13 characters
  if (!/^234\d{10}$/.test(cleaned)) {
    return null;
  }

  return `+${cleaned}`;
}

/**
 * Checks whether a phone number is a valid Nigerian mobile phone
 */
export function isValidNigerianPhone(phone) {
  const normalized = normalizeNigerianPhone(phone);
  if (!normalized) return false;

  const localFormat = '0' + normalized.substring(4); // e.g. 08031234567
  const prefix = localFormat.substring(0, 4);

  return Object.values(TELCO_PREFIXES).some((list) => list.includes(prefix));
}

/**
 * Formats a normalized phone for display: "+234 803 123 4567"
 */
export function formatDisplayPhone(phone) {
  const normalized = normalizeNigerianPhone(phone);
  if (!normalized) return phone || '';

  // +234 803 123 4567
  return `${normalized.substring(0, 4)} ${normalized.substring(4, 7)} ${normalized.substring(7, 10)} ${normalized.substring(10)}`;
}

/**
 * Identifies the Nigerian mobile carrier network
 */
export function getNigerianCarrier(phone) {
  const normalized = normalizeNigerianPhone(phone);
  if (!normalized) return 'Unknown';

  const localFormat = '0' + normalized.substring(4);
  const prefix = localFormat.substring(0, 4);

  for (const [carrier, prefixes] of Object.entries(TELCO_PREFIXES)) {
    if (prefixes.includes(prefix)) {
      return carrier.toUpperCase();
    }
  }

  return 'Other';
}
