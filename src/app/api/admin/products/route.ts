import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/auth';

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
  }
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
  }
  try {
    const data = await request.json();
    const slug = data.slug || `${data.brand.toLowerCase()}-${Date.now()}`;

    const newProduct = await prisma.product.create({
      data: {
        slug,
        titleRu: data.titleRu,
        titleUz: data.titleUz || data.titleRu,
        descriptionRu: data.descriptionRu || '',
        descriptionUz: data.descriptionUz || '',
        category: data.category.toUpperCase(),
        brand: data.brand,
        priceUzs: Number(data.priceUzs) || 0,
        imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80',
        inStock: data.inStock ?? true,
        tdp: data.tdp ? Number(data.tdp) : null,
        socket: data.socket || null,
        chipset: data.chipset || null,
        formFactor: data.formFactor || null,
        memoryType: data.memoryType || null,
        ramSlots: data.ramSlots ? Number(data.ramSlots) : null,
        capacityGb: data.capacityGb ? Number(data.capacityGb) : null,
        modulesCount: data.modulesCount ? Number(data.modulesCount) : null,
        speedMhz: data.speedMhz ? Number(data.speedMhz) : null,
        lengthMm: data.lengthMm ? Number(data.lengthMm) : null,
        maxGpuLength: data.maxGpuLength ? Number(data.maxGpuLength) : null,
        coolerHeight: data.coolerHeight ? Number(data.coolerHeight) : null,
        maxCoolerHeight: data.maxCoolerHeight ? Number(data.maxCoolerHeight) : null,
        wattage: data.wattage ? Number(data.wattage) : null,
        efficiencyRating: data.efficiencyRating || null,
        supportedSockets: data.supportedSockets || null,
        supportedMotherboards: data.supportedMotherboards || null,
        benchmarkScore: data.benchmarkScore ? Number(data.benchmarkScore) : null,
      },
    });

    return NextResponse.json(newProduct);
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: error.message || 'Ошибка создания товара' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
  }
  try {
    const data = await request.json();
    const { id, ...updates } = data;

    if (!id) {
      return NextResponse.json({ error: 'ID товара обязателен' }, { status: 400 });
    }

    if (updates.priceUzs !== undefined) updates.priceUzs = Number(updates.priceUzs);
    if (updates.tdp !== undefined) updates.tdp = updates.tdp ? Number(updates.tdp) : null;
    if (updates.lengthMm !== undefined) updates.lengthMm = updates.lengthMm ? Number(updates.lengthMm) : null;
    if (updates.wattage !== undefined) updates.wattage = updates.wattage ? Number(updates.wattage) : null;
    if (updates.benchmarkScore !== undefined) updates.benchmarkScore = updates.benchmarkScore ? Number(updates.benchmarkScore) : null;

    const updated = await prisma.product.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: error.message || 'Ошибка обновления' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID товара обязателен' }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Ошибка удаления' }, { status: 500 });
  }
}
