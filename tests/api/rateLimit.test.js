import assert from 'node:assert';
import { createRateLimiter } from '../../src/lib/rateLimit.js';

async function runTests() {
  console.log('🧪 Starting Rate Limiter Logic Tests...\n');

  // Test 1: Allow requests within limit and decrement remaining
  const limiter = createRateLimiter({ windowMs: 1000, maxRequests: 3 });
  const ip1 = '192.168.1.100';

  const res1 = limiter.check(ip1);
  assert.strictEqual(res1.success, true);
  assert.strictEqual(res1.remaining, 2);

  const res2 = limiter.check(ip1);
  assert.strictEqual(res2.success, true);
  assert.strictEqual(res2.remaining, 1);

  const res3 = limiter.check(ip1);
  assert.strictEqual(res3.success, true);
  assert.strictEqual(res3.remaining, 0);
  console.log('✅ Test 1: Allowed requests within threshold and properly decremented remaining balance');

  // Test 2: Reject request when threshold exceeded
  const res4 = limiter.check(ip1);
  assert.strictEqual(res4.success, false);
  assert.strictEqual(res4.remaining, 0);
  assert.ok(res4.resetMs > 0);
  console.log('✅ Test 2: Blocked excess request and returned valid resetMs countdown');

  // Test 3: Key isolation
  const ip2 = '10.0.0.5';
  const resIp2 = limiter.check(ip2);
  assert.strictEqual(resIp2.success, true);
  assert.strictEqual(resIp2.remaining, 2);
  console.log('✅ Test 3: Keys throttled independently without cross-tenant interference');

  // Test 4: Reset functionality
  limiter.reset(ip1);
  const resAfterReset = limiter.check(ip1);
  assert.strictEqual(resAfterReset.success, true);
  assert.strictEqual(resAfterReset.remaining, 2);
  console.log('✅ Test 4: Successfully cleared rate limit state on reset()');

  // Test 5: Empty/null key handling
  const resNull = limiter.check(null);
  assert.strictEqual(resNull.success, true);
  console.log('✅ Test 5: Gracefully handled null/missing client key');

  limiter.clearAll();
  assert.strictEqual(limiter.size(), 0);
  console.log('\n🎉 All Rate Limiter tests passed successfully!');
}

runTests().catch((err) => {
  console.error('❌ Rate limiter test suite failed:', err);
  process.exit(1);
});

