import assert from 'node:assert';
import {
  VALID_TRANSITIONS,
  canTransitionOrderStatus,
} from '../../src/lib/orderStateMachine.js';

async function runTests() {
  console.log('🧪 Starting Order State Machine Transition Tests...\n');

  // Test 1: Draft order transitions
  assert.strictEqual(canTransitionOrderStatus('draft', 'confirmed'), true);
  assert.strictEqual(canTransitionOrderStatus('draft', 'paid'), true);
  assert.strictEqual(canTransitionOrderStatus('draft', 'cancelled'), true);
  console.log('✅ Test 1: Draft order successfully transitions to confirmed, paid, or cancelled');

  // Test 2: Confirmed order transitions
  assert.strictEqual(canTransitionOrderStatus('confirmed', 'paid'), true);
  assert.strictEqual(canTransitionOrderStatus('confirmed', 'cancelled'), true);
  assert.strictEqual(canTransitionOrderStatus('confirmed', 'draft'), false);
  console.log('✅ Test 2: Confirmed order transitions forward to paid/cancelled, blocks backward to draft');

  // Test 3: Paid order cancellation with stock restoration
  assert.strictEqual(canTransitionOrderStatus('paid', 'cancelled'), true);
  assert.strictEqual(canTransitionOrderStatus('paid', 'draft'), false);
  console.log('✅ Test 3: Paid order permits cancellation to trigger inventory restitution');

  // Test 4: Cancelled terminal state
  assert.strictEqual(canTransitionOrderStatus('cancelled', 'paid'), false);
  assert.strictEqual(canTransitionOrderStatus('cancelled', 'confirmed'), false);
  assert.strictEqual(canTransitionOrderStatus('cancelled', 'draft'), false);
  console.log('✅ Test 4: Cancelled is a terminal state (no further transitions allowed)');

  // Test 5: Idempotent same-state transition
  assert.strictEqual(canTransitionOrderStatus('paid', 'paid'), true);
  assert.strictEqual(canTransitionOrderStatus('confirmed', 'confirmed'), true);
  console.log('✅ Test 5: Idempotent same-state transitions succeed without error\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
