import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  verifyPassword,
  createSessionToken,
  getAdminSecretKey,
  AUTH_COOKIE_NAME,
  ensureDefaultAdmin,
} from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await ensureDefaultAdmin();

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Введите email и пароль' }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'Пользователь с таким email не найден' }, { status: 401 });
    }

    const isValid = verifyPassword(String(password), user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Неверный пароль' }, { status: 401 });
    }

    const token = createSessionToken(user);
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    const adminKey = getAdminSecretKey();
    if (user.role === 'ADMIN' && adminKey) {
      response.cookies.set('admin_session', adminKey, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  } catch (error: any) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: error?.message || 'Ошибка сервера при входе' }, { status: 500 });
  }
}
