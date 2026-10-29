import assert from 'node:assert';

/**
 * Validates and formats conversation message payload
 */
function prepareMessagePayload(body) {
  if (!body.role || typeof body.role !== 'string' || body.role.trim().length === 0) {
    return { ok: false, error: 'role is required' };
  }
  if (!body.content || typeof body.content !== 'string' || body.content.trim().length === 0) {
    return { ok: false, error: 'content is required' };
  }

  const isAgentRole = body.role === 'agent' || body.role === 'business';
  const isBusinessSender = body.sender === 'business' || body.sender === 'agent' || isAgentRole;

  return {
    ok: true,
    message: {
      role: body.role,
      content: body.content,
      sender: isBusinessSender ? 'business' : (body.sender || (body.role === 'user' ? 'customer' : 'assistant')),
      senderName: body.senderName || (isBusinessSender ? 'Business Owner' : undefined),
      createdAt: new Date().toISOString(),
    },
  };
}

async function runTests() {
  console.log('🧪 Starting Message Payload Parsing & Validation Tests...\n');

  // Test 1: Missing role
  const noRole = prepareMessagePayload({ content: 'Hello' });
  assert.strictEqual(noRole.ok, false);
  assert.strictEqual(noRole.error, 'role is required');
  console.log('✅ Test 1: Rejected message without role');

  // Test 2: Missing content
  const noContent = prepareMessagePayload({ role: 'user' });
  assert.strictEqual(noContent.ok, false);
  assert.strictEqual(noContent.error, 'content is required');
  console.log('✅ Test 2: Rejected message without content');

  // Test 3: Customer message defaults to customer sender
  const custRes = prepareMessagePayload({ role: 'user', content: 'How much is iPhone 13?' });
  assert.strictEqual(custRes.ok, true);
  assert.strictEqual(custRes.message.sender, 'customer');
  assert.strictEqual(custRes.message.senderName, undefined);
  console.log('✅ Test 3: Standard customer message parsed correctly');

  // Test 4: Merchant takeover message with role: agent
  const agentRes = prepareMessagePayload({ role: 'agent', content: 'We can deliver today!' });
  assert.strictEqual(agentRes.ok, true);
  assert.strictEqual(agentRes.message.sender, 'business');
  assert.strictEqual(agentRes.message.senderName, 'Business Owner');
  console.log('✅ Test 4: Human agent takeover defaulted senderName to Business Owner');

  // Test 5: Custom senderName preserved
  const namedRes = prepareMessagePayload({ role: 'agent', content: 'Checking stock now', senderName: 'Sarah from Support' });
  assert.strictEqual(namedRes.ok, true);
  assert.strictEqual(namedRes.message.senderName, 'Sarah from Support');
  console.log('✅ Test 5: Explicit senderName preserved on agent message\n');
}

runTests();
