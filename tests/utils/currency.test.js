import assert from 'node:assert';
import {
  koboToNaira,
  nairaToKobo,
  formatNaira,
  parseNairaString,
} from '../../src/lib/currency.js';

async function runTests() {
  console.log('🧪 Starting Currency & Kobo Calculation Tests...\n');

  // Test 1: koboToNaira
  assert.strictEqual(koboToNaira(100000), 1000);
  assert.strictEqual(koboToNaira(550), 5.5);
  assert.strictEqual(koboToNaira(0), 0);
  console.log('✅ Test 1: Converted Kobo to Naira decimal correctly');

  // Test 2: nairaToKobo
  assert.strictEqual(nairaToKobo(1000), 100000);
  assert.strictEqual(nairaToKobo(19.99), 1999);
  console.log('✅ Test 2: Converted Naira to integer Kobo without float drift');

  // Test 3: formatNaira
  assert.strictEqual(formatNaira(5000), '₦5,000');
  assert.strictEqual(formatNaira(500000, true), '₦5,000'); // isKobo=true
  console.log('✅ Test 3: Formatted Naira and Kobo amounts with ₦ symbol');

  // Test 4: parseNairaString
  assert.strictEqual(parseNairaString('₦45,000'), 45000);
  assert.strictEqual(parseNairaString('5000'), 5000);
  assert.strictEqual(parseNairaString('25k'), 25000);
  assert.strictEqual(parseNairaString('1.5m'), 1500000);
  assert.strictEqual(parseNairaString('invalid'), null);
  console.log('✅ Test 4: Parsed formatted strings, "k" thousands, and "m" millions\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
