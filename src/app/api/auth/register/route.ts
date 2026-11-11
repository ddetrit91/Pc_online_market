import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import {
  hashPassword,
  createSessionToken,
  getAdminSecretKey,
  AUTH_COOKIE_NAME,
  ensureDefaultAdmin,
} from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await ensureDefaultAdmin();

    const body = await request.json();
    const { email, password, name, phone, adminSecret } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Укажите корректный адрес электронной почты' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен содержать не менее 6 символов' },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Пожалуйста, введите ваше имя' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже зарегистрирован' },
        { status: 409 }
      );
    }

    // Grant ADMIN only if valid ADMIN_SECRET_KEY from environment matches
    const adminKey = getAdminSecretKey();
    const hasValidAdminSecret =
      Boolean(adminSecret && adminKey) &&
      typeof adminSecret === 'string' &&
      adminSecret.length === adminKey!.length &&
      crypto.timingSafeEqual(Buffer.from(adminSecret), Buffer.from(adminKey!));

    const role = hasValidAdminSecret ? 'ADMIN' : 'USER';

    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash: hashPassword(password),
        name: name.trim(),
        phone: phone ? String(phone).trim() : null,
        role,
      },
    });

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
    console.error('Registration Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Ошибка сервера при регистрации' },
      { status: 500 }
    );
  }
}
