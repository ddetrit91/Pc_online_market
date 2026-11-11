import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadReceiptToNeonStorage } from '@/lib/storage';
import { getUserFromRequest } from '@/lib/auth';
import { sendOrderNotificationToTelegram } from '@/lib/telegram';

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

    // Send order notification + optional receipt file to Telegram manager
    const { sent: telegramSent, error: telegramError } = await sendOrderNotificationToTelegram({
      order,
      fileBuffer,
      fileMimeType: receiptFile?.type || null,
    });

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
