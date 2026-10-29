import assert from 'node:assert';

/**
 * Validation logic for order checkout initialization
 */
function validateOrderForCheckout(order, authBusinessId) {
  if (!order) {
    return { ok: false, status: 404, code: 'ORDER_NOT_FOUND', message: 'Order not found' };
  }

  if (authBusinessId && authBusinessId !== order.businessId) {
    return { ok: false, status: 403, code: 'FORBIDDEN', message: 'Access denied to this order' };
  }

  if (order.status === 'paid') {
    return { ok: false, status: 409, code: 'ALREADY_PAID', message: 'Order has already been paid' };
  }

  if (order.status === 'cancelled') {
    return { ok: false, status: 400, code: 'ORDER_CANCELLED', message: 'Cannot pay for a cancelled order' };
  }

  if (!order.totalKobo || order.totalKobo <= 0) {
    return { ok: false, status: 400, code: 'INVALID_AMOUNT', message: 'Order total must be greater than zero' };
  }

  return { ok: true };
}

function generateCheckoutReference(orderId) {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  return `PAY_${ts}_${rand}`.toUpperCase();
}

async function runTests() {
  console.log('🧪 Starting Order Checkout Validation Tests...\n');

  // Test 1: Order not found
  const notFound = validateOrderForCheckout(null, 'biz_1');
  assert.strictEqual(notFound.ok, false);
  assert.strictEqual(notFound.status, 404);
  assert.strictEqual(notFound.code, 'ORDER_NOT_FOUND');
  console.log('✅ Test 1: Handled non-existent order gracefully');

  // Test 2: Forbidden cross-tenant access
  const forbidden = validateOrderForCheckout({ id: 'ord_1', businessId: 'biz_2' }, 'biz_1');
  assert.strictEqual(forbidden.ok, false);
  assert.strictEqual(forbidden.status, 403);
  assert.strictEqual(forbidden.code, 'FORBIDDEN');
  console.log('✅ Test 2: Enforced business ownership check');

  // Test 3: Already paid order rejected
  const alreadyPaid = validateOrderForCheckout({ id: 'ord_1', businessId: 'biz_1', status: 'paid', totalKobo: 5000 }, 'biz_1');
  assert.strictEqual(alreadyPaid.ok, false);
  assert.strictEqual(alreadyPaid.status, 409);
  assert.strictEqual(alreadyPaid.code, 'ALREADY_PAID');
  console.log('✅ Test 3: Prevented duplicate payment on already-paid order');

  // Test 4: Cancelled order rejected
  const cancelled = validateOrderForCheckout({ id: 'ord_1', businessId: 'biz_1', status: 'cancelled', totalKobo: 5000 }, 'biz_1');
  assert.strictEqual(cancelled.ok, false);
  assert.strictEqual(cancelled.status, 400);
  assert.strictEqual(cancelled.code, 'ORDER_CANCELLED');
  console.log('✅ Test 4: Prevented payment on cancelled order');

  // Test 5: Valid draft/confirmed order passes
  const valid = validateOrderForCheckout({ id: 'ord_1', businessId: 'biz_1', status: 'confirmed', totalKobo: 250000 }, 'biz_1');
  assert.strictEqual(valid.ok, true);

  const ref = generateCheckoutReference('ord_1');
  assert.ok(ref.startsWith('PAY_'));
  console.log('✅ Test 5: Valid order approved and checkout reference generated successfully\n');
}

runTests();
