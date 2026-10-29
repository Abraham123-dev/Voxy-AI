import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

function formatKoboToNGN(kobo: number): string {
  const naira = (kobo || 0) / 100;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(naira);
}

function formatReceiptTimestamp(date: Date | string): string {
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

export class ReceiptService {
  /**
   * Generates a receipt for a successfully verified payment and order.
   * Guaranteed idempotent — returns existing receipt if already generated.
   */
  static async generateReceipt(params: {
    paymentId: string;
    orderId: string;
    businessId: string;
    customerId: string;
  }) {
    const { paymentId, orderId, businessId, customerId } = params;

    // Check if receipt already exists for this payment or order
    const existing = await prisma.receipt.findFirst({
      where: {
        OR: [{ paymentId }, { orderId }],
      },
      include: {
        business: { select: { id: true, name: true, slug: true, contactPhone: true } },
        customer: { select: { id: true, name: true, email: true, phone: true } },
        order: { select: { id: true, totalKobo: true, currency: true, status: true } },
        payment: { select: { id: true, reference: true, amountKobo: true, status: true, paidAt: true } },
      },
    });

    if (existing) {
      return existing;
    }

    // Fetch full data for receipt snapshot
    const [business, customer, order, payment] = await Promise.all([
      prisma.business.findUnique({ where: { id: businessId } }),
      prisma.customer.findUnique({ where: { id: customerId } }),
      prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, priceKobo: true } },
            },
          },
        },
      }),
      prisma.payment.findUnique({ where: { id: paymentId } }),
    ]);

    if (!business || !customer || !order || !payment) {
      throw new Error('Cannot generate receipt: associated resources not found');
    }

    // Generate unique receipt number: REC-YYYYMMDD-HEX
    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
    const receiptNumber = `REC-${datePrefix}-${randomHex}`;

    // Format receipt data snapshot
    const receiptData = {
      receiptNumber,
      issuedAt: new Date().toISOString(),
      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
        contactPhone: business.contactPhone,
      },
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
      order: {
        id: order.id,
        currency: order.currency,
        totalKobo: order.totalKobo,
        formattedTotal: formatKoboToNGN(order.totalKobo),
        items: order.items.map((item) => ({
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          unitPriceKobo: item.unitPriceKobo,
          formattedUnitPrice: formatKoboToNGN(item.unitPriceKobo),
          subtotalKobo: item.quantity * item.unitPriceKobo,
          formattedSubtotal: formatKoboToNGN(item.quantity * item.unitPriceKobo),
        })),
      },
      payment: {
        id: payment.id,
        reference: payment.reference,
        providerReference: payment.providerReference,
        channel: payment.channel,
        amountKobo: payment.amountKobo,
        formattedAmount: formatKoboToNGN(payment.amountKobo),
        paidAt: payment.paidAt ? payment.paidAt.toISOString() : new Date().toISOString(),
        formattedPaidAt: formatReceiptTimestamp(payment.paidAt || new Date()),
      },
    };

    return prisma.receipt.create({
      data: {
        receiptNumber,
        businessId,
        customerId,
        orderId,
        paymentId,
        amountKobo: payment.amountKobo,
        currency: payment.currency,
        paymentDate: payment.paidAt || new Date(),
        receiptData,
      },
      include: {
        business: { select: { id: true, name: true, slug: true, contactPhone: true } },
        customer: { select: { id: true, name: true, email: true, phone: true } },
        order: { select: { id: true, totalKobo: true, currency: true, status: true } },
        payment: { select: { id: true, reference: true, amountKobo: true, status: true, paidAt: true } },
      },
    });
  }

  static async getReceiptById(receiptId: string, authBusinessId?: string) {
    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId },
      include: {
        business: { select: { id: true, name: true, slug: true } },
        customer: { select: { id: true, name: true, email: true, phone: true } },
        order: { select: { id: true, totalKobo: true, currency: true } },
        payment: { select: { id: true, reference: true, amountKobo: true, paidAt: true } },
      },
    });

    if (!receipt) return null;
    if (authBusinessId && receipt.businessId !== authBusinessId) {
      throw new Error('FORBIDDEN');
    }

    return receipt;
  }

  static async getReceiptByOrder(orderId: string, authBusinessId?: string, customerId?: string) {
    const receipt = await prisma.receipt.findUnique({
      where: { orderId },
      include: {
        business: { select: { id: true, name: true, slug: true } },
        customer: { select: { id: true, name: true, email: true, phone: true } },
        order: { select: { id: true, totalKobo: true, currency: true } },
        payment: { select: { id: true, reference: true, amountKobo: true, paidAt: true } },
      },
    });

    if (!receipt) return null;
    if (authBusinessId && receipt.businessId !== authBusinessId) {
      throw new Error('FORBIDDEN');
    }
    if (customerId && receipt.customerId !== customerId && receipt.businessId !== authBusinessId) {
      throw new Error('FORBIDDEN');
    }

    return receipt;
  }

  static async getReceiptByPayment(paymentId: string, authBusinessId?: string) {
    const receipt = await prisma.receipt.findUnique({
      where: { paymentId },
      include: {
        business: { select: { id: true, name: true, slug: true } },
        customer: { select: { id: true, name: true, email: true, phone: true } },
        order: { select: { id: true, totalKobo: true, currency: true } },
        payment: { select: { id: true, reference: true, amountKobo: true, paidAt: true } },
      },
    });

    if (!receipt) return null;
    if (authBusinessId && receipt.businessId !== authBusinessId) {
      throw new Error('FORBIDDEN');
    }

    return receipt;
  }

  /**
   * Formats a clean conversational receipt summary text for chat, SMS, or WhatsApp
   */
  static formatReceiptSummary(receipt: {
    receiptNumber: string;
    business?: { name?: string | null };
    amountKobo: number;
    currency?: string;
    paymentDate?: Date | string | null;
    payment?: { channel?: string | null; reference?: string | null };
  }): string {
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
}
