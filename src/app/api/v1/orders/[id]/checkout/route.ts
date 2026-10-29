import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/response';
import { logRequest } from '@/lib/logger';
import { PaymentService } from '@/lib/services/payment-service';

// POST /api/v1/orders/[id]/checkout
// Generates a Paystack checkout authorization link for an order
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const auth = getAuthUser(req);
  const { id: orderId } = await params;
  const path = `/api/v1/orders/${orderId}/checkout`;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { business: true, customer: true },
    });

    if (!order) {
      logRequest({ method: 'POST', path, status: 404, latencyMs: Date.now() - startTime, error: 'Order not found' });
      return errorResponse('ORDER_NOT_FOUND', 'Order not found', 404);
    }

    if (auth && auth.businessId && auth.businessId !== order.businessId) {
      logRequest({ method: 'POST', path, status: 403, latencyMs: Date.now() - startTime, userId: auth.businessId, error: 'Forbidden' });
      return errorResponse('FORBIDDEN', 'Access denied to this order', 403);
    }

    const body = await req.json().catch(() => ({}));
    const customerEmail = body.customerEmail || order.customer?.email || undefined;
    const callbackUrl = body.callbackUrl || undefined;

    const result = await PaymentService.initializePayment({
      orderId: order.id,
      businessId: order.businessId,
      customerEmail,
      callbackUrl,
    });

    logRequest({ method: 'POST', path, status: 200, latencyMs: Date.now() - startTime });
    return successResponse(result, 200);
  } catch (err: any) {
    console.error('[OrderCheckoutRoute] Error:', err);
    const message = err.message || 'Internal server error';
    const status = message.includes('ALREADY_PAID') ? 409 : 400;
    logRequest({ method: 'POST', path, status, latencyMs: Date.now() - startTime, error: message });
    return errorResponse('CHECKOUT_FAILED', message, status);
  }
}
