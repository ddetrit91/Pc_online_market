import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/auth';
import { sendOrderNotificationToTelegram } from '@/lib/telegram';

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
  }
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
  }
  try {
    const { id, status, resendTelegram } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID заказа обязателен' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
    }

    let telegramSent = order.receiptSent;

    if (resendTelegram) {
      const res = await sendOrderNotificationToTelegram({
        order: { ...order, status: status || order.status },
        isResend: true,
      });
      if (res.sent) telegramSent = true;
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: status || order.status,
        receiptSent: telegramSent,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Ошибка обновления заказа' },
      { status: 500 }
    );
  }
}
