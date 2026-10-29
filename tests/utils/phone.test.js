import assert from 'node:assert';
import {
  normalizeNigerianPhone,
  isValidNigerianPhone,
  formatDisplayPhone,
  getNigerianCarrier,
} from '../../src/lib/phone.js';

async function runTests() {
  console.log('🧪 Starting Nigerian Phone Utility Tests...\n');

  // Test 1: Normalize standard 080 format
  assert.strictEqual(normalizeNigerianPhone('08031234567'), '+2348031234567');
  console.log('✅ Test 1: Normalized 0803 local format to +234');

  // Test 2: Normalize formatted input with spaces and dashes
  assert.strictEqual(normalizeNigerianPhone('+234 (802) 123-4567'), '+2348021234567');
  console.log('✅ Test 2: Normalized spaced/punctuated phone format');

  // Test 3: Validate Nigerian carrier prefixes
  assert.strictEqual(isValidNigerianPhone('08031234567'), true); // MTN
  assert.strictEqual(isValidNigerianPhone('08021234567'), true); // Airtel
  assert.strictEqual(isValidNigerianPhone('08051234567'), true); // Glo
  assert.strictEqual(isValidNigerianPhone('08091234567'), true); // 9mobile
  assert.strictEqual(isValidNigerianPhone('01234567890'), false); // Invalid prefix
  assert.strictEqual(isValidNigerianPhone('12345'), false); // Too short
  console.log('✅ Test 3: Validated valid and invalid carrier prefixes');

  // Test 4: Format display phone
  assert.strictEqual(formatDisplayPhone('08031234567'), '+234 803 123 4567');
  console.log('✅ Test 4: Formatted phone into clean +234 XXX XXX XXXX structure');

  // Test 5: Carrier identification
  assert.strictEqual(getNigerianCarrier('08031234567'), 'MTN');
  assert.strictEqual(getNigerianCarrier('08021234567'), 'AIRTEL');
  assert.strictEqual(getNigerianCarrier('08051234567'), 'GLO');
  assert.strictEqual(getNigerianCarrier('08091234567'), '9MOBILE');
  console.log('✅ Test 5: Accurately identified Nigerian telco carriers\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
