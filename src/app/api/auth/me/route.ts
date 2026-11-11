import { NextResponse } from 'next/server';
import { getUserFromRequest, ensureDefaultAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    await ensureDefaultAdmin();

    const sessionUser = getUserFromRequest(request);
    if (!sessionUser) {
      return NextResponse.json({ user: null });
    }

    // Refresh user state from database to ensure up-to-date role/name
    const dbUser = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: dbUser });
  } catch (error: any) {
    console.error('Auth Me Error:', error);
    return NextResponse.json({ user: null });
  }
}
