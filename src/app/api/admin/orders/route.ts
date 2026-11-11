import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

function getTelegramEnv() {
  let token = process.env.TELEGRAM_BOT_TOKEN || '';
  let chatId = process.env.TELEGRAM_CHAT_ID || '';

  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const tokenMatch = content.match(/TELEGRAM_BOT_TOKEN=["']?([^"'\r\n]+)["']?/);
      const chatMatch = content.match(/TELEGRAM_CHAT_ID=["']?([^"'\r\n]+)["']?/);
      if (tokenMatch && tokenMatch[1]) token = tokenMatch[1].trim();
      if (chatMatch && chatMatch[1]) chatId = chatMatch[1].trim();
    }
  } catch (e) {}

  return {
    botToken: token.trim().replace(/^["']|["']$/g, ''),
    chatId: chatId.trim().replace(/^["']|["']$/g, ''),
  };
}

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
  }
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
  } catch (error) {
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

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
    }

    let telegramSent = order.receiptSent;

    // Optional resend receipt to Telegram
    if (resendTelegram) {
      const { botToken, chatId } = getTelegramEnv();
      if (botToken && chatId) {
        const formattedTotal = new Intl.NumberFormat('ru-RU').format(order.totalAmount);
        const dateStr = new Date(order.createdAt).toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' });

        let msg = `🔄 <b>ПОВТОРНАЯ ОТПРАВКА ЧЕКА</b>\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        msg += `📋 <b>Заказ:</b> <code>#${order.orderNumber}</code>\n`;
        msg += `👤 <b>Клиент:</b> ${order.customerName}\n`;
        msg += `📞 <b>Телефон:</b> <code>${order.customerPhone}</code>\n`;
        if (order.telegramUsername) {
          msg += `💬 <b>Telegram:</b> @${order.telegramUsername.replace('@', '')}\n`;
        }
        msg += `📅 <b>Дата:</b> ${dateStr}\n`;
        if (order.receiptFileName) {
          msg += `📎 <b>Прикреплен чек:</b> ${order.receiptFileName}\n`;
        }
        msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        msg += `💰 <b>ИТОГО:</b> <b>${formattedTotal} сум</b>\n`;
        msg += `📌 <b>Текущий статус:</b> ${status || order.status}\n`;

        // Check if there is a saved receipt file
        let fileSent = false;
        if (order.receiptFileUrl) {
          try {
            let fileBuffer: Buffer | null = null;
            if (order.receiptFileUrl.startsWith('http')) {
              const fileRes = await fetch(order.receiptFileUrl);
              if (fileRes.ok) {
                fileBuffer = Buffer.from(await fileRes.arrayBuffer());
              }
            } else {
              const diskPath = path.join(process.cwd(), 'public', order.receiptFileUrl.replace(/^\//, ''));
              if (fs.existsSync(diskPath)) {
                fileBuffer = fs.readFileSync(diskPath);
              }
            }

            if (fileBuffer) {
              const isPdf =
                order.receiptFileUrl.toLowerCase().endsWith('.pdf') ||
                order.receiptFileName?.toLowerCase().endsWith('.pdf');
              const isImage =
                /\.(jpg|jpeg|png|webp|gif)$/i.test(order.receiptFileUrl) ||
                (order.receiptFileName && /\.(jpg|jpeg|png|webp|gif)$/i.test(order.receiptFileName));

              const tgFormData = new FormData();
              tgFormData.append('chat_id', chatId);
              tgFormData.append('caption', msg.length <= 1020 ? msg : `🔄 <b>Повторная отправка чека #${order.orderNumber}</b>\n${formattedTotal} сум`);
              tgFormData.append('parse_mode', 'HTML');

              const blob = new Blob([new Uint8Array(fileBuffer)], {
                type: isPdf ? 'application/pdf' : 'image/jpeg',
              });

              let sendEndpoint = `https://api.telegram.org/bot${botToken}/sendDocument`;
              if (isImage) {
                sendEndpoint = `https://api.telegram.org/bot${botToken}/sendPhoto`;
                tgFormData.append('photo', blob, order.receiptFileName || 'receipt.jpg');
              } else {
                tgFormData.append('document', blob, order.receiptFileName || 'receipt.pdf');
              }

              const res = await fetch(sendEndpoint, {
                method: 'POST',
                body: tgFormData,
              });
              const data = await res.json();
              if (data.ok) {
                fileSent = true;
                telegramSent = true;
              }
            }
          } catch (fileErr) {
            console.error('Resending file error:', fileErr);
          }
        }

        if (!fileSent) {
          const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: msg,
              parse_mode: 'HTML',
            }),
          });
          const tgData = await tgRes.json();
          if (tgData.ok) telegramSent = true;
        }
      }
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
    return NextResponse.json({ error: error.message || 'Ошибка обновления заказа' }, { status: 500 });
  }
}
