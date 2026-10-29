import assert from 'node:assert';
import crypto from 'node:crypto';
import { verifyPaystackSignature } from '../../src/lib/services/paystack.ts';

async function runTests() {
  console.log('🧪 Starting Paystack Webhook Signature Verification Tests...\n');

  const secret = 'sk_test_mock_secret_for_webhook_tests_12345';
  const payload = JSON.stringify({
    event: 'charge.success',
    data: {
      id: 301298,
      reference: 'PAY_TEST_REF_100',
      amount: 500000,
      status: 'success',
    },
  });

  // Generate valid HMAC SHA-512
  const validSignature = crypto.createHmac('sha512', secret).update(payload).digest('hex');

  // Test 1: Valid signature passes verification
  const validResult = verifyPaystackSignature(payload, validSignature, secret);
  assert.strictEqual(validResult, true);
  console.log('✅ Test 1: Verified authentic Paystack webhook HMAC-SHA512 signature');

  // Test 2: Tampered payload fails verification
  const tamperedPayload = JSON.stringify({
    event: 'charge.success',
    data: { id: 301298, reference: 'PAY_TEST_REF_100', amount: 100 },
  });
  const tamperedResult = verifyPaystackSignature(tamperedPayload, validSignature, secret);
  assert.strictEqual(tamperedResult, false);
  console.log('✅ Test 2: Rejected signature when payload was modified in transit');

  // Test 3: Invalid secret key fails
  const wrongSecretResult = verifyPaystackSignature(payload, validSignature, 'wrong_secret_key');
  assert.strictEqual(wrongSecretResult, false);
  console.log('✅ Test 3: Rejected signature computed with an incorrect secret key');

  // Test 4: Missing or empty signature handled safely
  assert.strictEqual(verifyPaystackSignature(payload, null, secret), false);
  assert.strictEqual(verifyPaystackSignature(payload, '', secret), false);
  assert.strictEqual(verifyPaystackSignature('', validSignature, secret), false);
  console.log('✅ Test 4: Handled null and empty arguments safely without throwing');

  // Test 5: Length mismatch fails in constant time
  const shortSignature = 'deadbeef';
  assert.strictEqual(verifyPaystackSignature(payload, shortSignature, secret), false);
  console.log('✅ Test 5: Handled mismatched signature lengths safely\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
