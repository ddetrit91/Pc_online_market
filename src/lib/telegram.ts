import fs from 'fs';
import path from 'path';
import { prisma } from './prisma';
import { readEnvVar } from './env';

export interface TelegramOrderItem {
  category: string;
  title: string;
  priceUzs: number;
  brand?: string;
  quantity?: number;
}

export interface SendOrderTelegramOptions {
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    telegramUsername?: string | null;
    totalAmount: number;
    status: string;
    buildData: string;
    paymentMethod?: string | null;
    stripePaymentId?: string | null;
    receiptFileUrl?: string | null;
    receiptFileName?: string | null;
    createdAt: Date;
  };
  fileBuffer?: Buffer | null;
  fileMimeType?: string | null;
  isResend?: boolean;
}

export async function sendOrderNotificationToTelegram(
  opts: SendOrderTelegramOptions
): Promise<{ sent: boolean; error: string | null }> {
  const botToken = readEnvVar('TELEGRAM_BOT_TOKEN');
  const chatId = readEnvVar('TELEGRAM_CHAT_ID');

  if (!botToken || !chatId) {
    return {
      sent: false,
      error: 'В .env.local не заполнены TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID',
    };
  }

  const { order, fileBuffer, fileMimeType, isResend } = opts;

  let itemsList: TelegramOrderItem[] = [];
  try {
    const parsed = JSON.parse(order.buildData);
    if (Array.isArray(parsed)) itemsList = parsed;
  } catch {}

  const formattedTotal = new Intl.NumberFormat('ru-RU').format(order.totalAmount);
  const dateStr = new Date(order.createdAt).toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' });

  const isStripePaid = order.paymentMethod === 'stripe' && order.status === 'paid';
  let headerTitle = '🧾 <b>ЭЛЕКТРОННЫЙ ЧЕК ЗАКАЗА</b>';
  if (isResend) {
    headerTitle = '🔄 <b>ПОВТОРНАЯ ОТПРАВКА ЧЕКА</b>';
  } else if (isStripePaid) {
    headerTitle = '💳 <b>ОПЛАТА ПОЛУЧЕНА ЧЕРЕЗ STRIPE</b>';
  }

  let receiptText = `${headerTitle}\n`;
  receiptText += `🏪 <b>Магазин:</b> PC ULTRA MARKET (Tashkent)\n`;
  receiptText += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  receiptText += `📋 <b>Номер заказа:</b> <code>#${order.orderNumber}</code>\n`;
  receiptText += `📅 <b>Дата и время:</b> ${dateStr}\n`;
  receiptText += `👤 <b>Покупатель:</b> ${order.customerName}\n`;
  receiptText += `📞 <b>Телефон:</b> <code>${order.customerPhone}</code>\n`;
  if (order.telegramUsername) {
    const cleanUser = order.telegramUsername.replace('@', '');
    receiptText += `💬 <b>Telegram:</b> <a href="https://t.me/${cleanUser}">@${cleanUser}</a>\n`;
  }
  receiptText += `💠 <b>Способ оплаты:</b> ${
    order.paymentMethod === 'stripe' ? 'Stripe (Онлайн-карта)' : 'Перевод на карту (Click / Payme)'
  }\n`;
  if (order.stripePaymentId) {
    receiptText += `🔑 <b>Stripe Payment ID:</b> <code>${order.stripePaymentId}</code>\n`;
  }
  if (order.receiptFileName) {
    receiptText += `📎 <b>Прикреплен чек оплаты:</b> <i>${order.receiptFileName}</i>\n`;
  }

  if (itemsList.length > 0) {
    receiptText += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    receiptText += `🛍️ <b>ПОЗИЦИИ ЗАКАЗА:</b>\n\n`;
    itemsList.forEach((it, idx) => {
      const itemPrice = new Intl.NumberFormat('ru-RU').format(it.priceUzs);
      const qtyText = it.quantity && it.quantity > 1 ? ` (x${it.quantity})` : '';
      receiptText += `${idx + 1}. <b>[${it.category}]</b> ${it.title}${qtyText}\n`;
      receiptText += `   └ <i>${itemPrice} сум</i>\n`;
    });
  }

  const statusText = isStripePaid
    ? '✅ ОПЛАЧЕН ОНЛАЙН (Stripe)'
    : order.status === 'paid'
    ? '✅ Оплачен'
    : 'В обработке (Ожидает подтверждения менеджера)';

  receiptText += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  receiptText += `💰 <b>ИТОГО:</b> <b>${formattedTotal} сум</b>\n`;
  receiptText += `📌 <b>Статус:</b> ${statusText}\n`;
  receiptText += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  receiptText += `<i>Уведомление сформировано автоматически.</i>`;

  try {
    let resolvedBuffer = fileBuffer || null;
    if (!resolvedBuffer && order.receiptFileUrl) {
      try {
        if (order.receiptFileUrl.startsWith('http')) {
          const fileRes = await fetch(order.receiptFileUrl);
          if (fileRes.ok) {
            resolvedBuffer = Buffer.from(await fileRes.arrayBuffer());
          }
        } else {
          const diskPath = path.join(process.cwd(), 'public', order.receiptFileUrl.replace(/^\//, ''));
          if (fs.existsSync(diskPath)) {
            resolvedBuffer = fs.readFileSync(diskPath);
          }
        }
      } catch (e) {
        console.warn('Could not load receipt file buffer for Telegram:', e);
      }
    }

    let telegramSent = false;
    let telegramError: string | null = null;

    if (resolvedBuffer) {
      const fileName = order.receiptFileName || 'receipt';
      const isPdf =
        fileMimeType === 'application/pdf' ||
        fileName.toLowerCase().endsWith('.pdf') ||
        Boolean(order.receiptFileUrl?.toLowerCase().endsWith('.pdf'));
      const isImage =
        Boolean(fileMimeType?.startsWith('image/')) ||
        /\.(jpg|jpeg|png|webp|gif)$/i.test(fileName) ||
        Boolean(order.receiptFileUrl && /\.(jpg|jpeg|png|webp|gif)$/i.test(order.receiptFileUrl));

      let caption = receiptText;
      let needSeparateMessage = false;
      if (caption.length > 1020) {
        needSeparateMessage = true;
        caption = `🧾 <b>Чек оплаты к заказу #${order.orderNumber}</b>\n👤 <b>Клиент:</b> ${order.customerName}\n📞 <b>Телефон:</b> ${order.customerPhone}\n💰 <b>Итого:</b> ${formattedTotal} сум\n📎 <b>Файл:</b> ${fileName}`;
      }

      const tgFormData = new FormData();
      tgFormData.append('chat_id', chatId);
      tgFormData.append('caption', caption);
      tgFormData.append('parse_mode', 'HTML');

      const blob = new Blob([new Uint8Array(resolvedBuffer)], {
        type: fileMimeType || (isPdf ? 'application/pdf' : 'image/jpeg'),
      });

      let sendEndpoint = `https://api.telegram.org/bot${botToken}/sendDocument`;
      if (isImage) {
        sendEndpoint = `https://api.telegram.org/bot${botToken}/sendPhoto`;
        tgFormData.append('photo', blob, fileName.endsWith('.jpg') || fileName.endsWith('.png') ? fileName : 'receipt.jpg');
      } else {
        tgFormData.append('document', blob, fileName.endsWith('.pdf') ? fileName : 'receipt.pdf');
      }

      const tgRes = await fetch(sendEndpoint, { method: 'POST', body: tgFormData });
      const tgData = await tgRes.json();

      if (tgData.ok) {
        telegramSent = true;
        if (needSeparateMessage) {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: receiptText,
              parse_mode: 'HTML',
              disable_web_page_preview: true,
            }),
          });
        }
      } else {
        const fallbackRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: receiptText + `\n\n⚠️ <i>(Файл чека сохранен в админке /admin: ${fileName})</i>`,
            parse_mode: 'HTML',
            disable_web_page_preview: true,
          }),
        });
        const fallbackData = await fallbackRes.json();
        if (fallbackData.ok) telegramSent = true;
        else telegramError = tgData.description || fallbackData.description || 'Ошибка Telegram API';
      }
    } else {
      const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: receiptText,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      });
      const tgData = await tgRes.json();
      if (tgData.ok) telegramSent = true;
      else telegramError = tgData.description || 'Ошибка Telegram API';
    }

    if (telegramSent) {
      await prisma.order.update({
        where: { id: order.id },
        data: { receiptSent: true },
      });
    }

    return { sent: telegramSent, error: telegramError };
  } catch (err: any) {
    console.error('Telegram send error:', err);
    return { sent: false, error: err?.message || 'Сетевая ошибка Telegram' };
  }
}
