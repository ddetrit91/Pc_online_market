import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const search = searchParams.get('search');

    const where: any = {};

    if (category && category !== 'ALL') {
      where.category = category.toUpperCase();
    }

    if (brand && brand !== 'ALL') {
      where.brand = brand;
    }

    if (search) {
      where.OR = [
        { titleRu: { contains: search } },
        { titleUz: { contains: search } },
        { brand: { contains: search } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { priceUzs: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('API products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
