'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/lib/cartStore';
import { useBuilder } from '@/lib/builderStore';
import { useI18n } from '@/lib/i18n';
import { formatPriceUzs } from '@/lib/formatters';
import {
  CheckCircle2,
  AlertCircle,
  CreditCard,
  ArrowLeft,
  Wrench,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

interface VerifyResult {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  customerName: string;
  paymentMethod: string;
  telegramSent: boolean;
  paidAt?: string | null;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const orderParam = searchParams.get('order');
  const source = searchParams.get('source');

  const { clearCart } = useCart();
  const { clearBuild } = useBuilder();
  const { lang } = useI18n();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('Отсутствует идентификатор платежа (session_id)');
      setLoading(false);
      return;
    }

    fetch(`/api/stripe/verify-session?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Не удалось проверить статус оплаты');
        return data as VerifyResult;
      })
      .then((data) => {
        setResult(data);
        if (data.status === 'paid' || data.paymentStatus === 'paid') {
          if (source === 'builder') {
            clearBuild();
          } else if (source === 'cart') {
            clearCart();
          }
        }
      })
      .catch((err) => {
        setError(err.message || 'Ошибка проверки платежа');
      })
      .finally(() => setLoading(false));
  }, [sessionId, source]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#09aff4]" />
        <p className="text-sm font-medium text-neutral-600 dark:text-slate-300">
          {lang === 'uz'
            ? "Stripe to'lovini tasdiqlayapmiz..."
            : 'Подтверждаем оплату через Stripe...'}
        </p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-rose-500/30 bg-white dark:bg-[#0a1033] p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-black text-neutral-900 dark:text-white">
            Не удалось проверить платеж
          </h1>
          <p className="mt-2 text-xs text-neutral-500 dark:text-slate-400">
            {error || 'Заказ не найден'}
          </p>
          {orderParam && (
            <p className="mt-2 font-mono text-xs text-[#09aff4]">Заказ #{orderParam}</p>
          )}
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#09aff4] px-6 py-3 text-xs font-bold text-white hover:bg-[#079ad8] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Вернуться в каталог</span>
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = result.status === 'paid' || result.paymentStatus === 'paid';

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-neutral-200 dark:border-[#09aff4]/25 bg-white dark:bg-[#0a1033] p-8 shadow-2xl text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 shadow-[0_0_25px_rgba(16,185,129,0.25)]">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#09aff4]/10 border border-[#09aff4]/30 px-3.5 py-1 text-xs font-mono font-bold text-[#09aff4]">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>{result.orderNumber}</span>
        </span>

        <h1 className="mt-4 text-2xl font-black text-neutral-900 dark:text-white">
          {isPaid
            ? lang === 'uz'
              ? "To'lov muvaffaqiyatli amalga oshirildi!"
              : 'Оплата через Stripe прошла успешно!'
            : lang === 'uz'
            ? 'Buyurtma qayta ishlanmoqda'
            : 'Платеж обрабатывается'}
        </h1>

        <p className="mt-2 text-xs text-neutral-500 dark:text-slate-400 max-w-sm mx-auto">
          {lang === 'uz'
            ? "Rahmat! Buyurtmangiz tasdiqlandi va menejerga yuborildi."
            : 'Спасибо за покупку! Данные заказа зафиксированы в системе и переданы менеджеру.'}
        </p>

        <div className="mt-6 rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#060922] p-5 text-left space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-neutral-500 dark:text-slate-400">Покупатель:</span>
            <span className="font-bold text-neutral-900 dark:text-white">{result.customerName}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-white/10">
            <span className="text-neutral-500 dark:text-slate-400">Сумма заказа:</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
              {formatPriceUzs(result.totalAmount, lang)}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-white/10">
            <span className="text-neutral-500 dark:text-slate-400">Способ оплаты:</span>
            <span className="inline-flex items-center gap-1.5 font-bold text-[#09aff4]">
              <CreditCard className="h-3.5 w-3.5" />
              <span>Stripe (Онлайн-карта)</span>
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-white/10">
            <span className="text-neutral-500 dark:text-slate-400">Статус:</span>
            <span className="font-bold text-emerald-500">
              {isPaid ? 'Оплачен' : 'Ожидание подтверждения'}
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#09aff4] hover:bg-[#079ad8] px-6 py-3 text-xs font-bold text-white shadow-md shadow-[#09aff4]/25 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{lang === 'uz' ? 'Katalogga qaytish' : 'Вернуться в каталог'}</span>
          </Link>
          <Link
            href="/builder"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 dark:border-[#09aff4]/30 bg-white dark:bg-[#060922] px-6 py-3 text-xs font-bold text-neutral-800 dark:text-white hover:border-[#09aff4] transition-all"
          >
            <Wrench className="h-4 w-4 text-[#09aff4]" />
            <span>{lang === 'uz' ? '3D Konstruktor' : 'В 3D Конструктор'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#09aff4]" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
