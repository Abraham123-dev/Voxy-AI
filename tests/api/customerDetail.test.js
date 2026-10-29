import assert from 'node:assert';

function validateCustomerAccess(customer, authBusinessId) {
  if (!customer) {
    return { ok: false, status: 404, code: 'NOT_FOUND', message: 'Customer not found' };
  }
  if (customer.businessId !== authBusinessId) {
    return { ok: false, status: 403, code: 'FORBIDDEN', message: 'Access denied to this customer record' };
  }
  return { ok: true };
}

function validateCustomerPatch(payload) {
  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return { ok: false, status: 400, code: 'VALIDATION_ERROR', message: 'Invalid email address' };
  }
  if (payload.channel && !['web_chat', 'voice'].includes(payload.channel)) {
    return { ok: false, status: 400, code: 'VALIDATION_ERROR', message: 'Invalid channel' };
  }
  return {
    ok: true,
    data: {
      ...(payload.name !== undefined && { name: payload.name }),
      ...(payload.phone !== undefined && { phone: payload.phone }),
      ...(payload.email !== undefined && { email: payload.email ? payload.email.toLowerCase() : null }),
      ...(payload.channel !== undefined && { channel: payload.channel }),
    },
  };
}

async function runTests() {
  console.log('🧪 Starting Customer Detail & Access Control Tests...\n');

  // Test 1: Customer not found
  const notFound = validateCustomerAccess(null, 'biz_123');
  assert.strictEqual(notFound.ok, false);
  assert.strictEqual(notFound.status, 404);
  console.log('✅ Test 1: Gracefully returned 404 for unknown customer');

  // Test 2: Access denied for different business
  const forbidden = validateCustomerAccess({ id: 'cust_1', businessId: 'biz_other' }, 'biz_123');
  assert.strictEqual(forbidden.ok, false);
  assert.strictEqual(forbidden.status, 403);
  console.log('✅ Test 2: Blocked cross-tenant access to customer data');

  // Test 3: Authorized access granted
  const allowed = validateCustomerAccess({ id: 'cust_1', businessId: 'biz_123' }, 'biz_123');
  assert.strictEqual(allowed.ok, true);
  console.log('✅ Test 3: Allowed valid business owner access');

  // Test 4: Invalid email format rejected
  const invalidEmail = validateCustomerPatch({ email: 'not-an-email' });
  assert.strictEqual(invalidEmail.ok, false);
  assert.strictEqual(invalidEmail.status, 400);
  console.log('✅ Test 4: Rejected invalid email format');

  // Test 5: Valid patch normalized email to lowercase
  const validPatch = validateCustomerPatch({ name: 'Chidi Obi', email: 'CHIDI@EXAMPLE.COM', channel: 'voice' });
  assert.strictEqual(validPatch.ok, true);
  assert.strictEqual(validPatch.data.email, 'chidi@example.com');
  assert.strictEqual(validPatch.data.channel, 'voice');
  console.log('✅ Test 5: Normalized email and applied customer patch payload\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
