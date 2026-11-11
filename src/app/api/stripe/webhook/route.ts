import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { getStripeClient, getStripeWebhookSecret } from '@/lib/stripe';
import { sendOrderNotificationToTelegram } from '@/lib/telegram';

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const webhookSecret = getStripeWebhookSecret();

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: 'Stripe webhook is not configured (STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET missing)' },
      { status: 503 }
    );
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error('Stripe Webhook Signature Verification Failed:', err?.message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err?.message || 'invalid'}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId || session.client_reference_id || undefined;

        const order = await prisma.order.findFirst({
          where: {
            OR: [
              { stripeSessionId: session.id },
              ...(orderId ? [{ id: orderId }] : []),
            ],
          },
        });

        if (order && session.payment_status === 'paid') {
          const paymentIntentId =
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent?.id || null;

          const updatedOrder =
            order.status === 'paid'
              ? order
              : await prisma.order.update({
                  where: { id: order.id },
                  data: {
                    status: 'paid',
                    stripeSessionId: order.stripeSessionId || session.id,
                    stripePaymentId: paymentIntentId,
                    paidAt: new Date(),
                  },
                });

          // Idempotently deliver paid order receipt to Telegram manager
          if (!updatedOrder.receiptSent) {
            await sendOrderNotificationToTelegram({ order: updatedOrder });
          }
        }
        break;
      }

      case 'checkout.session.expired':
      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const order = await prisma.order.findFirst({
          where: { stripeSessionId: session.id },
        });
        if (order && order.status === 'pending') {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: 'cancelled' },
          });
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Stripe Webhook Handler Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Webhook processing error' },
      { status: 500 }
    );
  }
}
