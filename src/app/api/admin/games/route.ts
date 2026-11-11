import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/auth';

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
  }
  try {
    const games = await prisma.game.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(games);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
  }
  try {
    const data = await request.json();
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const newGame = await prisma.game.create({
      data: {
        name: data.name,
        slug,
        posterUrl: data.posterUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
        genre: data.genre || 'Action / RPG',
        cpuDemand: Number(data.cpuDemand) || 1.2,
        gpuDemand: Number(data.gpuDemand) || 1.5,
        baseFps1080p: Number(data.baseFps1080p) || 60,
        descriptionRu: data.descriptionRu || '',
        descriptionUz: data.descriptionUz || '',
      },
    });

    return NextResponse.json(newGame);
  } catch (error: any) {
    console.error('Error creating game:', error);
    return NextResponse.json({ error: error.message || 'Ошибка создания игры' }, { status: 500 });
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
      return NextResponse.json({ error: 'ID игры обязателен' }, { status: 400 });
    }

    if (updates.cpuDemand !== undefined) updates.cpuDemand = Number(updates.cpuDemand);
    if (updates.gpuDemand !== undefined) updates.gpuDemand = Number(updates.gpuDemand);
    if (updates.baseFps1080p !== undefined) updates.baseFps1080p = Number(updates.baseFps1080p);

    const updated = await prisma.game.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Ошибка обновления игры' }, { status: 500 });
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
      return NextResponse.json({ error: 'ID игры обязателен' }, { status: 400 });
    }

    await prisma.game.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Ошибка удаления игры' }, { status: 500 });
  }
}
