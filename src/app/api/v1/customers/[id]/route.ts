import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/response';
import { logRequest } from '@/lib/logger';

const customerPatchSchema = z.object({
  name: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  channel: z.enum(['web_chat', 'voice']).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const { id: customerId } = await params;
  const path = `/api/v1/customers/${customerId}`;

  const auth = getAuthUser(req);
  if (!auth) {
    logRequest({ method: 'GET', path, status: 401, latencyMs: Date.now() - startTime, error: 'Unauthorized' });
    return errorResponse('UNAUTHORIZED', 'Invalid or missing access token', 401);
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        conversations: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!customer) {
      logRequest({ method: 'GET', path, status: 404, latencyMs: Date.now() - startTime, error: 'Customer not found' });
      return errorResponse('NOT_FOUND', 'Customer not found', 404);
    }

    if (customer.businessId !== auth.businessId) {
      logRequest({ method: 'GET', path, status: 403, latencyMs: Date.now() - startTime, error: 'Forbidden' });
      return errorResponse('FORBIDDEN', 'Access denied to this customer record', 403);
    }

    logRequest({ method: 'GET', path, status: 200, latencyMs: Date.now() - startTime, userId: auth.businessId });
    return successResponse(customer);
  } catch (err: any) {
    logRequest({ method: 'GET', path, status: 500, latencyMs: Date.now() - startTime, error: err.message });
    return errorResponse('SERVER_ERROR', 'Internal server error', 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const { id: customerId } = await params;
  const path = `/api/v1/customers/${customerId}`;

  const auth = getAuthUser(req);
  if (!auth) {
    logRequest({ method: 'PATCH', path, status: 401, latencyMs: Date.now() - startTime, error: 'Unauthorized' });
    return errorResponse('UNAUTHORIZED', 'Invalid or missing access token', 401);
  }

  try {
    const existing = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!existing) {
      return errorResponse('NOT_FOUND', 'Customer not found', 404);
    }

    if (existing.businessId !== auth.businessId) {
      return errorResponse('FORBIDDEN', 'Access denied to this customer record', 403);
    }

    const body = await req.json().catch(() => ({}));
    const parseResult = customerPatchSchema.safeParse(body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return errorResponse('VALIDATION_ERROR', issue.message, 400);
    }

    const { name, phone, email, channel } = parseResult.data;
    const updated = await prisma.customer.update({
      where: { id: customerId },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email: email ? email.toLowerCase() : null }),
        ...(channel !== undefined && { channel }),
      },
    });

    logRequest({ method: 'PATCH', path, status: 200, latencyMs: Date.now() - startTime, userId: auth.businessId });
    return successResponse(updated);
  } catch (err: any) {
    logRequest({ method: 'PATCH', path, status: 500, latencyMs: Date.now() - startTime, error: err.message });
    return errorResponse('SERVER_ERROR', 'Internal server error', 500);
  }
}
