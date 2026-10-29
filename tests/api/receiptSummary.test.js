import assert from 'node:assert';

function formatKoboToNGN(kobo) {
  const naira = (kobo || 0) / 100;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(naira);
}

function formatReceiptTimestamp(date) {
  const d = new Date(date);
  return d.toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatReceiptSummary(receipt) {
  const store = receipt.business?.name || 'Store';
  const amount = formatKoboToNGN(receipt.amountKobo);
  const dateStr = receipt.paymentDate ? formatReceiptTimestamp(receipt.paymentDate) : 'Recently';
  const channel = receipt.payment?.channel ? ` via ${receipt.payment.channel}` : '';

  return [
    `🧾 *Receipt: ${receipt.receiptNumber}*`,
    `Store: ${store}`,
    `Total: ${amount}${channel}`,
    `Date: ${dateStr}`,
    `Status: Paid ✅`,
  ].join('\n');
}

async function runTests() {
  console.log('🧪 Starting Receipt Formatting & Summary Tests...\n');

  const mockReceipt = {
    receiptNumber: 'REC-20261029-ABCD',
    business: { name: 'Mama Put Kitchen' },
    amountKobo: 750000,
    paymentDate: new Date('2026-10-29T14:30:00Z'),
    payment: { channel: 'card', reference: 'PAY_12345' },
  };

  // Test 1: Generate summary string
  const summary = formatReceiptSummary(mockReceipt);
  assert.ok(summary.includes('REC-20261029-ABCD'));
  assert.ok(summary.includes('Mama Put Kitchen'));
  assert.ok(summary.includes('₦7,500'));
  assert.ok(summary.includes('via card'));
  assert.ok(summary.includes('Status: Paid ✅'));
  console.log('✅ Test 1: Generated formatted conversational receipt summary');

  // Test 2: Handles missing optional business name and channel gracefully
  const minimalReceipt = {
    receiptNumber: 'REC-20261029-0001',
    amountKobo: 120000,
  };
  const minSummary = formatReceiptSummary(minimalReceipt);
  assert.ok(minSummary.includes('REC-20261029-0001'));
  assert.ok(minSummary.includes('₦1,200'));
  assert.ok(minSummary.includes('Store: Store'));
  console.log('✅ Test 2: Handled minimal receipt fields with sensible defaults\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
