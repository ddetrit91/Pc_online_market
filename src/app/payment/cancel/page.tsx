'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { XCircle, ArrowLeft, Wrench } from 'lucide-react';

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const source = searchParams.get('source');

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-neutral-200 dark:border-amber-500/30 bg-white dark:bg-[#0a1033] p-8 shadow-2xl text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/25">
          <XCircle className="h-10 w-10" />
        </div>

        {orderNumber && (
          <span className="inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-mono font-bold text-amber-500 border border-amber-500/25 mb-3">
            {orderNumber}
          </span>
        )}

        <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
          Оплата через Stripe отменена
        </h1>
        <p className="mt-2 text-xs text-neutral-500 dark:text-slate-400">
          Средства не были списаны. Ваша сборка и товары в корзине сохранены — вы можете повторить оплату или выбрать перевод Click / Payme.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={source === 'builder' ? '/builder' : '/'}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#09aff4] hover:bg-[#079ad8] px-6 py-3 text-xs font-bold text-white shadow-md shadow-[#09aff4]/25 transition-all"
          >
            {source === 'builder' ? (
              <>
                <Wrench className="h-4 w-4" />
                <span>Вернуться в конструктор</span>
              </>
            ) : (
              <>
                <ArrowLeft className="h-4 w-4" />
                <span>Вернуться в каталог</span>
              </>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <PaymentCancelContent />
    </Suspense>
  );
}
