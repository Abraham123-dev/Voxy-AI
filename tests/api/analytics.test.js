import assert from 'node:assert';

/**
 * Unit test for business analytics aggregation logic
 */
function calculateAnalytics(orders, conversations, customersCount, topProductsRaw, productDetails) {
  let totalRevenueKobo = 0;
  const ordersByStatus = {
    draft: 0,
    confirmed: 0,
    paid: 0,
    cancelled: 0,
  };

  for (const order of orders) {
    if (order.status === 'paid') {
      totalRevenueKobo += order.totalKobo || 0;
    }
    if (order.status in ordersByStatus) {
      ordersByStatus[order.status]++;
    }
  }

  const conversationsByStatus = {
    active: 0,
    handed_off: 0,
    closed: 0,
  };

  for (const conv of conversations) {
    const s = conv.status || 'active';
    if (s === 'handed_off' || s === 'escalated' || s === 'needs_attention') {
      conversationsByStatus.handed_off++;
    } else if (s === 'closed') {
      conversationsByStatus.closed++;
    } else {
      conversationsByStatus.active++;
    }
  }

  const topProducts = topProductsRaw.map((item) => {
    const detail = productDetails.find((d) => d.id === item.productId);
    return {
      productId: item.productId,
      name: detail?.name || 'Unknown Product',
      priceKobo: detail?.priceKobo || 0,
      unitsSold: item.quantity || 0,
    };
  });

  return {
    totalRevenueKobo,
    formattedTotalRevenue: `₦${(totalRevenueKobo / 100).toLocaleString('en-NG')}`,
    totalOrders: orders.length,
    ordersByStatus,
    totalCustomers: customersCount,
    totalConversations: conversations.length,
    conversationsByStatus,
    topProducts,
  };
}

async function runTests() {
  console.log('🧪 Starting Business Analytics Logic Tests...\n');

  const mockOrders = [
    { id: 'ord_1', status: 'paid', totalKobo: 500000 },
    { id: 'ord_2', status: 'paid', totalKobo: 1200000 },
    { id: 'ord_3', status: 'confirmed', totalKobo: 350000 },
    { id: 'ord_4', status: 'draft', totalKobo: 200000 },
    { id: 'ord_5', status: 'cancelled', totalKobo: 100000 },
  ];

  const mockConversations = [
    { id: 'c1', status: 'active' },
    { id: 'c2', status: 'handed_off' },
    { id: 'c3', status: 'closed' },
    { id: 'c4', status: 'escalated' },
  ];

  const mockTopProducts = [
    { productId: 'prod_1', quantity: 15 },
    { productId: 'prod_2', quantity: 8 },
  ];

  const mockProductDetails = [
    { id: 'prod_1', name: 'MacBook Pro', priceKobo: 2500000 },
    { id: 'prod_2', name: 'iPhone 13', priceKobo: 650000 },
  ];

  const result = calculateAnalytics(mockOrders, mockConversations, 25, mockTopProducts, mockProductDetails);

  assert.strictEqual(result.totalRevenueKobo, 1700000);
  assert.strictEqual(result.totalOrders, 5);
  assert.strictEqual(result.ordersByStatus.paid, 2);
  assert.strictEqual(result.ordersByStatus.confirmed, 1);
  assert.strictEqual(result.ordersByStatus.draft, 1);
  assert.strictEqual(result.ordersByStatus.cancelled, 1);

  assert.strictEqual(result.totalConversations, 4);
  assert.strictEqual(result.conversationsByStatus.active, 1);
  assert.strictEqual(result.conversationsByStatus.handed_off, 2);
  assert.strictEqual(result.conversationsByStatus.closed, 1);

  assert.strictEqual(result.topProducts.length, 2);
  assert.strictEqual(result.topProducts[0].name, 'MacBook Pro');
  assert.strictEqual(result.topProducts[0].unitsSold, 15);

  console.log('✅ All business analytics aggregation tests passed successfully!\n');
}

runTests();
