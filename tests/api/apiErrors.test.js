import assert from 'node:assert';
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from '../../src/lib/errors.ts';

async function runTests() {
  console.log('🧪 Starting Typed API Errors Tests...\n');

  // Test 1: ValidationError
  const valErr = new ValidationError('Invalid email format', { field: 'email' });
  assert.strictEqual(valErr.statusCode, 400);
  assert.strictEqual(valErr.code, 'VALIDATION_ERROR');
  assert.strictEqual(valErr.message, 'Invalid email format');
  assert.deepStrictEqual(valErr.details, { field: 'email' });
  console.log('✅ Test 1: Constructed ValidationError with 400 status');

  // Test 2: UnauthorizedError
  const unauthErr = new UnauthorizedError();
  assert.strictEqual(unauthErr.statusCode, 401);
  assert.strictEqual(unauthErr.code, 'UNAUTHORIZED');
  console.log('✅ Test 2: Constructed UnauthorizedError with 401 status');

  // Test 3: ForbiddenError
  const forbErr = new ForbiddenError('Business mismatch');
  assert.strictEqual(forbErr.statusCode, 403);
  assert.strictEqual(forbErr.code, 'FORBIDDEN');
  console.log('✅ Test 3: Constructed ForbiddenError with 403 status');

  // Test 4: NotFoundError
  const notFoundErr = new NotFoundError('Order');
  assert.strictEqual(notFoundErr.statusCode, 404);
  assert.strictEqual(notFoundErr.code, 'NOT_FOUND');
  assert.strictEqual(notFoundErr.message, 'Order not found');
  console.log('✅ Test 4: Constructed NotFoundError with 404 status and formatted message');

  // Test 5: ConflictError
  const confErr = new ConflictError('Order is already paid');
  assert.strictEqual(confErr.statusCode, 409);
  assert.strictEqual(confErr.code, 'CONFLICT');
  assert.ok(confErr instanceof AppError);
  console.log('✅ Test 5: Constructed ConflictError with 409 status and verified inheritance\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
