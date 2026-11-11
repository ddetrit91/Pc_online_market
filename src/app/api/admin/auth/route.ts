import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import {
  verifyPassword,
  createSessionToken,
  getUserFromRequest,
  getAdminSecretKey,
  isAdminRequest,
  AUTH_COOKIE_NAME,
  ensureDefaultAdmin,
} from '@/lib/auth';

export async function GET(request: Request) {
  try {
    await ensureDefaultAdmin();

    const sessionUser = getUserFromRequest(request);
    if (sessionUser && sessionUser.role === 'ADMIN') {
      return NextResponse.json({
        authenticated: true,
        user: {
          id: sessionUser.id,
          email: sessionUser.email,
          name: sessionUser.name,
          role: sessionUser.role,
        },
      });
    }

    const hasAdminCookie = isAdminRequest(request);
    return NextResponse.json({
      authenticated: hasAdminCookie,
      user: hasAdminCookie ? { email: 'admin', name: 'Администратор', role: 'ADMIN' } : null,
    });
  } catch {
    return NextResponse.json({ authenticated: false, user: null });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDefaultAdmin();

    const body = await request.json();
    const { key, email, password } = body;
    const validSecret = getAdminSecretKey();

    // Option A: Login with Admin Email & Password
    if (email && password) {
      const cleanEmail = String(email).trim().toLowerCase();
      const user = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (!user) {
        return NextResponse.json({ error: 'Пользователь не найден' }, { status: 401 });
      }

      if (user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'У вашей учетной записи нет прав администратора' },
          { status: 403 }
        );
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
        },
      });

      response.cookies.set(AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      if (validSecret) {
        response.cookies.set('admin_session', validSecret, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        });
      }

      return response;
    }

    // Option B: Login with Admin Secret Key from env
    if (
      key &&
      validSecret &&
      typeof key === 'string' &&
      key.length === validSecret.length &&
      crypto.timingSafeEqual(Buffer.from(key), Buffer.from(validSecret))
    ) {
      const response = NextResponse.json({ success: true });
      response.cookies.set('admin_session', validSecret, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }

    return NextResponse.json(
      { error: 'Неверные учетные данные или секретный ключ' },
      { status: 401 }
    );
  } catch (error: any) {
    console.error('Admin Auth Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Ошибка сервера при авторизации' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_session');
  response.cookies.delete(AUTH_COOKIE_NAME);
  return response;
}
