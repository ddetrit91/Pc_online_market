import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStripeClient } from '@/lib/stripe';
import { sendOrderNotificationToTelegram } from '@/lib/telegram';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const orderId = session.metadata?.orderId || session.client_reference_id || undefined;

    let order = await prisma.order.findFirst({
      where: {
        OR: [
          { stripeSessionId: session.id },
          ...(orderId ? [{ id: orderId }] : []),
        ],
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
    }

    if (session.payment_status === 'paid' && order.status !== 'paid') {
      const paymentIntentId =
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id || null;

      order = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'paid',
          stripeSessionId: order.stripeSessionId || session.id,
          stripePaymentId: paymentIntentId,
          paidAt: new Date(),
        },
      });
    }

    if (order.status === 'paid' && !order.receiptSent) {
      const tg = await sendOrderNotificationToTelegram({ order });
      if (tg.sent) {
        order = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
      }
    }

    return NextResponse.json({
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: session.payment_status,
      totalAmount: order.totalAmount,
      customerName: order.customerName,
      paymentMethod: order.paymentMethod,
      telegramSent: order.receiptSent,
      paidAt: order.paidAt,
    });
  } catch (error: any) {
    console.error('Stripe Verify Session Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Ошибка проверки платежа Stripe' },
      { status: 500 }
    );
  }
}
