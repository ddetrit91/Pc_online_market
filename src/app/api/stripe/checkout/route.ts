import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import {
  getStripeClient,
  getStripeCurrencyConfig,
  convertUzsToStripeUnitAmount,
  getAppBaseUrl,
} from '@/lib/stripe';

interface IncomingLineItem {
  id?: string;
  category?: string;
  title?: string;
  titleRu?: string;
  titleUz?: string;
  priceUzs?: number;
  brand?: string;
  quantity?: number;
}

export async function POST(request: Request) {
  try {
    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json(
        {
          error:
            'Stripe не настроен: добавьте STRIPE_SECRET_KEY в переменные окружения (.env.local и Vercel)',
          code: 'STRIPE_NOT_CONFIGURED',
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const {
      customerName = '',
      customerPhone = '',
      telegramUsername = '',
      parts,
      items,
      lang = 'ru',
      source = 'cart',
    } = body;

    if (!String(customerName).trim() || String(customerPhone).trim().length < 7) {
      return NextResponse.json(
        { error: 'Заполните корректные имя и номер телефона для заказа' },
        { status: 400 }
      );
    }

    // Normalize input items from Cart array or Builder parts map
    const rawItems: IncomingLineItem[] = [];
    if (Array.isArray(items)) {
      for (const it of items) {
        if (it && typeof it === 'object') rawItems.push(it);
      }
    } else if (parts && typeof parts === 'object') {
      for (const [cat, prod] of Object.entries(parts)) {
        if (prod && typeof prod === 'object') {
          rawItems.push({ ...(prod as IncomingLineItem), category: cat, quantity: 1 });
        }
      }
    }

    if (rawItems.length === 0) {
      return NextResponse.json(
        { error: 'Корзина или сборка пуста — добавьте товары перед оплатой' },
        { status: 400 }
      );
    }

    // Verify prices against Neon DB when product IDs are present
    const productIds = rawItems.map((i) => i.id).filter((id): id is string => Boolean(id));
    const dbProducts =
      productIds.length > 0
        ? await prisma.product.findMany({ where: { id: { in: productIds } } })
        : [];
    const dbById = new Map(dbProducts.map((p) => [p.id, p]));

    const resolvedItems = rawItems
      .map((raw) => {
        const dbMatch = raw.id ? dbById.get(raw.id) : undefined;
        const priceUzs = dbMatch ? dbMatch.priceUzs : Math.max(0, Math.round(Number(raw.priceUzs) || 0));
        const quantity = Math.max(1, Math.min(99, Math.round(Number(raw.quantity) || 1)));
        const title = dbMatch
          ? lang === 'uz'
            ? dbMatch.titleUz || dbMatch.titleRu
            : dbMatch.titleRu
          : lang === 'uz'
          ? raw.titleUz || raw.titleRu || raw.title || 'Товар'
          : raw.titleRu || raw.title || raw.titleUz || 'Товар';

        return {
          category: dbMatch?.category || raw.category || 'ITEM',
          title,
          priceUzs,
          brand: dbMatch?.brand || raw.brand,
          quantity,
        };
      })
      .filter((it) => it.priceUzs > 0);

    if (resolvedItems.length === 0) {
      return NextResponse.json({ error: 'Неверная сумма заказа' }, { status: 400 });
    }

    const totalAmount = resolvedItems.reduce((sum, it) => sum + it.priceUzs * it.quantity, 0);
    const sessionUser = getUserFromRequest(request);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `PC-UZ-${randomSuffix}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: String(customerName).trim(),
        customerPhone: String(customerPhone).trim(),
        telegramUsername: String(telegramUsername || '').trim(),
        totalAmount,
        status: 'pending',
        paymentMethod: 'stripe',
        buildData: JSON.stringify(resolvedItems),
        userId: sessionUser?.id || null,
      },
    });

    const baseUrl = getAppBaseUrl(request);
    const { currency, uzsPerUsd } = getStripeCurrencyConfig();

    const buildLineItems = (
      targetCurrency: 'usd' | 'uzs'
    ): Stripe.Checkout.SessionCreateParams.LineItem[] =>
      resolvedItems.map((it) => {
        const formattedUzs = new Intl.NumberFormat('ru-RU').format(it.priceUzs);
        return {
          price_data: {
            currency: targetCurrency,
            product_data: {
              name: `[${it.category}] ${it.title}`.slice(0, 120),
              description:
                targetCurrency === 'usd'
                  ? `Цена: ${formattedUzs} UZS (курс ${uzsPerUsd} UZS/$)`
                  : `PC ULTRA MARKET • ${formattedUzs} сум`,
            },
            unit_amount: convertUzsToStripeUnitAmount(it.priceUzs, targetCurrency, uzsPerUsd),
          },
          quantity: it.quantity,
        };
      });

    const sessionParams = (
      targetCurrency: 'usd' | 'uzs'
    ): Stripe.Checkout.SessionCreateParams => ({
      mode: 'payment',
      line_items: buildLineItems(targetCurrency),
      customer_email: sessionUser?.email || undefined,
      client_reference_id: order.id,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        totalUzs: String(totalAmount),
      },
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&order=${encodeURIComponent(
        order.orderNumber
      )}&source=${encodeURIComponent(source)}`,
      cancel_url: `${baseUrl}/payment/cancel?order=${encodeURIComponent(
        order.orderNumber
      )}&source=${encodeURIComponent(source)}`,
    });

    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create(sessionParams(currency));
    } catch (stripeErr: any) {
      // Fallback to USD if merchant account rejects UZS or integer bounds
      if (currency === 'uzs' && stripeErr?.type === 'StripeInvalidRequestError') {
        session = await stripe.checkout.sessions.create(sessionParams('usd'));
      } else {
        await prisma.order.delete({ where: { id: order.id } }).catch(() => {});
        throw stripeErr;
      }
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
      orderNumber: order.orderNumber,
    });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Ошибка создания платежной сессии Stripe' },
      { status: 500 }
    );
  }
}
