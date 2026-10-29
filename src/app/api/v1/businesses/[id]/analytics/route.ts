import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/response';
import { logRequest } from '@/lib/logger';

// GET /api/v1/businesses/[id]/analytics
// Aggregated server-side metrics and summary performance
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const auth = getAuthUser(req);
  const { id: businessId } = await params;
  const path = `/api/v1/businesses/${businessId}/analytics`;

  if (!auth) {
    logRequest({ method: 'GET', path, status: 401, latencyMs: Date.now() - startTime, error: 'Unauthorized' });
    return errorResponse('UNAUTHORIZED', 'Invalid or missing access token', 401);
  }

  if (auth.businessId !== businessId) {
    logRequest({ method: 'GET', path, status: 403, latencyMs: Date.now() - startTime, userId: auth.businessId, error: 'Forbidden' });
    return errorResponse('FORBIDDEN', 'Access denied to analytics for this business', 403);
  }

  try {
    const [
      orders,
      customerCount,
      conversationCount,
      conversations,
      topProductsRaw,
    ] = await Promise.all([
      prisma.order.findMany({
        where: { businessId },
        select: {
          id: true,
          status: true,
          totalKobo: true,
          createdAt: true,
        },
      }),
      prisma.customer.count({ where: { businessId } }),
      prisma.conversation.count({ where: { businessId } }),
      prisma.conversation.findMany({
        where: { businessId },
        select: { status: true },
      }),
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        where: { order: { businessId, status: { in: ['paid', 'confirmed'] } } },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }).catch(() => []),
    ]);

    // Aggregate orders
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
        ordersByStatus[order.status as keyof typeof ordersByStatus]++;
      }
    }

    // Aggregate conversations
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

    // Fetch product details for top products
    const productIds = topProductsRaw.map((p) => p.productId).filter(Boolean) as string[];
    const productDetails = productIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true, priceKobo: true, imageUrl: true },
        })
      : [];

    const topProducts = topProductsRaw.map((item) => {
      const detail = productDetails.find((d) => d.id === item.productId);
      return {
        productId: item.productId,
        name: detail?.name || 'Unknown Product',
        priceKobo: detail?.priceKobo || 0,
        imageUrl: detail?.imageUrl || null,
        unitsSold: item._sum?.quantity || 0,
      };
    });

    const analytics = {
      businessId,
      totalRevenueKobo,
      formattedTotalRevenue: `₦${(totalRevenueKobo / 100).toLocaleString('en-NG')}`,
      totalOrders: orders.length,
      ordersByStatus,
      totalCustomers: customerCount,
      totalConversations: conversationCount,
      conversationsByStatus,
      topProducts,
    };

    logRequest({ method: 'GET', path, status: 200, latencyMs: Date.now() - startTime, userId: auth.businessId });
    return successResponse(analytics);
  } catch (err: any) {
    console.error('[AnalyticsRoute] Error generating analytics:', err);
    logRequest({ method: 'GET', path, status: 500, latencyMs: Date.now() - startTime, userId: auth.businessId, error: err.message });
    return errorResponse('SERVER_ERROR', 'Failed to retrieve analytics', 500);
  }
}
