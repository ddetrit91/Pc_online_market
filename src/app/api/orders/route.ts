import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadReceiptToNeonStorage } from '@/lib/storage';
import { getUserFromRequest } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

// Helper to get Telegram credentials dynamically from .env.local without needing server restarts
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
  } catch (e) {
    console.error('Error reading .env.local dynamically:', e);
  }

  return {
    botToken: token.trim().replace(/^["']|["']$/g, ''),
    chatId: chatId.trim().replace(/^["']|["']$/g, ''),
  };
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let customerName = '';
    let customerPhone = '';
    let telegramUsername = '';
    let totalPrice = 0;
    let lang = 'ru';
    let rawPartsOrItems: any = null;
    let receiptFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      customerName = (formData.get('customerName') as string) || '';
      customerPhone = (formData.get('customerPhone') as string) || '';
      telegramUsername = (formData.get('telegramUsername') as string) || '';
      lang = (formData.get('lang') as string) || 'ru';
      totalPrice = Number(formData.get('totalPrice') || 0);

      const partsStr = formData.get('parts') as string;
      const itemsStr = formData.get('items') as string;
      if (partsStr) {
        try { rawPartsOrItems = JSON.parse(partsStr); } catch {}
      } else if (itemsStr) {
        try { rawPartsOrItems = JSON.parse(itemsStr); } catch {}
      }

      const file = formData.get('receiptFile');
      if (file && typeof file === 'object' && 'name' in file && (file as File).size > 0) {
        receiptFile = file as File;
      }
    } else {
      const body = await request.json();
      customerName = body.customerName || '';
      customerPhone = body.customerPhone || '';
      telegramUsername = body.telegramUsername || '';
      totalPrice = Number(body.totalPrice || 0);
      lang = body.lang || 'ru';
      rawPartsOrItems = body.parts || body.items;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      return NextResponse.json(
        { error: 'Заполните обязательные поля: имя и номер телефона' },
        { status: 400 }
      );
    }

    // Generate unique order number (e.g. PC-UZ-7841)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `PC-UZ-${randomSuffix}`;

    // Format item details
    const itemsList: { category: string; title: string; priceUzs: number; brand?: string; quantity?: number }[] = [];

    if (Array.isArray(rawPartsOrItems)) {
      // Array of items (e.g. from Cart)
      for (const item of rawPartsOrItems) {
        if (item) {
          itemsList.push({
            category: item.category || 'ITEM',
            title: lang === 'uz' ? (item.titleUz || item.titleRu || item.title) : (item.titleRu || item.title || item.titleUz),
            priceUzs: Number(item.priceUzs || 0),
            brand: item.brand,
            quantity: item.quantity || 1,
          });
        }
      }
    } else if (rawPartsOrItems && typeof rawPartsOrItems === 'object') {
      // Object by category (e.g. from Builder)
      for (const [cat, item] of Object.entries(rawPartsOrItems)) {
        if (item && typeof item === 'object') {
          const prod = item as any;
          itemsList.push({
            category: cat,
            title: lang === 'uz' ? (prod.titleUz || prod.titleRu) : prod.titleRu,
            priceUzs: Number(prod.priceUzs || 0),
            brand: prod.brand,
            quantity: 1,
          });
        }
      }
    }

    // Save attached receipt file if provided
    let receiptFileUrl: string | null = null;
    let receiptFileName: string | null = null;
    let fileBuffer: Buffer | null = null;

    if (receiptFile) {
      const bytes = await receiptFile.arrayBuffer();
      fileBuffer = Buffer.from(bytes);
      receiptFileName = receiptFile.name;

      const uploadResult = await uploadReceiptToNeonStorage(
        fileBuffer,
        receiptFile.name,
        receiptFile.type || 'application/octet-stream',
        orderNumber
      );
      receiptFileUrl = uploadResult.url;
    }

    // Check if user is authenticated
    const sessionUser = getUserFromRequest(request);

    // Create Order in Neon PostgreSQL
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerPhone,
        telegramUsername: telegramUsername || '',
        totalAmount: totalPrice,
        status: 'pending',
        buildData: JSON.stringify(itemsList),
        receiptFileUrl,
        receiptFileName,
        userId: sessionUser?.id || null,
      },
    });

    // Get Telegram Bot credentials (ONLY sending to the ONE user in .env.local)
    const { botToken, chatId } = getTelegramEnv();
    let telegramSent = false;
    let telegramError: string | null = null;

    if (botToken && chatId) {
      try {
        const formattedTotal = new Intl.NumberFormat('ru-RU').format(totalPrice);
        const dateStr = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' });

        // Beautiful formatted Telegram receipt text
        let receiptText = `🧾 <b>ЭЛЕКТРОННЫЙ ЧЕК ЗАКАЗА</b>\n`;
        receiptText += `🏪 <b>Магазин:</b> PC ULTRA MARKET (Tashkent)\n`;
        receiptText += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        receiptText += `📋 <b>Номер заказа:</b> <code>#${orderNumber}</code>\n`;
        receiptText += `📅 <b>Дата и время:</b> ${dateStr}\n`;
        receiptText += `👤 <b>Покупатель:</b> ${customerName}\n`;
        receiptText += `📞 <b>Телефон:</b> <code>${customerPhone}</code>\n`;
        if (telegramUsername) {
          const cleanUser = telegramUsername.replace('@', '');
          receiptText += `💬 <b>Telegram:</b> <a href="https://t.me/${cleanUser}">@${cleanUser}</a>\n`;
        }
        if (receiptFileName) {
          receiptText += `📎 <b>Прикреплен чек оплаты:</b> <i>${receiptFileName}</i>\n`;
        }
        receiptText += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        receiptText += `🛍️ <b>ПОЗИЦИИ ЗАКАЗА:</b>\n\n`;

        itemsList.forEach((it, idx) => {
          const itemPrice = new Intl.NumberFormat('ru-RU').format(it.priceUzs);
          const qtyText = it.quantity && it.quantity > 1 ? ` (x${it.quantity})` : '';
          receiptText += `${idx + 1}. <b>[${it.category}]</b> ${it.title}${qtyText}\n`;
          receiptText += `   └ <i>${itemPrice} сум</i>\n`;
        });

        receiptText += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        receiptText += `💰 <b>ИТОГО К ОПЛАТЕ:</b> <b>${formattedTotal} сум</b>\n`;
        receiptText += `📌 <b>Статус:</b> В обработке (Ожидает подтверждения менеджера)\n`;
        receiptText += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        receiptText += `<i>Чек и квитанция оплаты сформированы автоматически.</i>`;

        // Check if there is a file to send
        if (receiptFile && fileBuffer) {
          const isPdf =
            receiptFile.type === 'application/pdf' ||
            receiptFile.name.toLowerCase().endsWith('.pdf');
          const isImage =
            receiptFile.type.startsWith('image/') ||
            /\.(jpg|jpeg|png|webp|gif)$/i.test(receiptFile.name);

          // Telegram caption max length is 1024 chars
          let caption = receiptText;
          let needSeparateMessage = false;
          if (caption.length > 1020) {
            needSeparateMessage = true;
            caption = `🧾 <b>Чек оплаты к заказу #${orderNumber}</b>\n👤 <b>Клиент:</b> ${customerName}\n📞 <b>Телефон:</b> ${customerPhone}\n💰 <b>Итого:</b> ${formattedTotal} сум\n📎 <b>Файл:</b> ${receiptFileName}`;
          }

          const tgFormData = new FormData();
          tgFormData.append('chat_id', chatId);
          tgFormData.append('caption', caption);
          tgFormData.append('parse_mode', 'HTML');

          const fileBlob = new Blob([new Uint8Array(fileBuffer)], {
            type: receiptFile.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
          });

          let sendEndpoint = `https://api.telegram.org/bot${botToken}/sendDocument`;
          if (isImage) {
            sendEndpoint = `https://api.telegram.org/bot${botToken}/sendPhoto`;
            tgFormData.append('photo', fileBlob, receiptFileName || 'receipt.jpg');
          } else {
            tgFormData.append('document', fileBlob, receiptFileName || 'receipt.pdf');
          }

          const tgRes = await fetch(sendEndpoint, {
            method: 'POST',
            body: tgFormData,
          });

          const tgData = await tgRes.json();
          if (tgData.ok) {
            telegramSent = true;

            // If we truncated the caption, send the full detailed receipt as a follow-up message
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
            console.error('Telegram file send error:', tgData);
            // Fallback to sendMessage
            const fallbackRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: receiptText + `\n\n⚠️ <i>(Файл чека сохранен в админке /admin: ${receiptFileName})</i>`,
                parse_mode: 'HTML',
                disable_web_page_preview: true,
              }),
            });
            const fallbackData = await fallbackRes.json();
            if (fallbackData.ok) {
              telegramSent = true;
            } else {
              telegramError = tgData.description || fallbackData.description || 'Ошибка Telegram API';
            }
          }
        } else {
          // No file attached: send standard text receipt
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
          if (tgData.ok) {
            telegramSent = true;
          } else {
            telegramError = tgData.description || 'Ошибка Telegram API';
            console.error('Telegram API error response:', tgData);
          }
        }

        if (telegramSent) {
          await prisma.order.update({
            where: { id: order.id },
            data: { receiptSent: true },
          });
        }
      } catch (err: any) {
        console.error('Telegram request error:', err);
        telegramError = err?.message || 'Сетевая ошибка Telegram';
      }
    } else {
      telegramError = 'В .env.local не заполнены TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID';
    }

    return NextResponse.json({
      success: true,
      orderNumber,
      orderId: order.id,
      totalAmount: totalPrice,
      receiptFileUrl,
      receiptFileName,
      telegramSent,
      telegramError,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Ошибка при сохранении заказа' }, { status: 500 });
  }
}
