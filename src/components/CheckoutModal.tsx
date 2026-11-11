'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useBuilder } from '@/lib/builderStore';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/authStore';
import { formatPriceUzs } from '@/lib/formatters';
import {
  X,
  CheckCircle2,
  Send,
  ShoppingBag,
  ShieldCheck,
  AlertCircle,
  Phone,
  User,
  MessageSquare,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CreditCard,
  Trash2,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { parts, totalPrice, report, clearBuild } = useBuilder();
  const { lang, t } = useI18n();
  const { user } = useAuth();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+998 ');

  useEffect(() => {
    if (user) {
      if (user.name) setCustomerName(user.name);
      if (user.phone) setCustomerPhone(user.phone);
    }
  }, [user]);
  const [telegramUsername, setTelegramUsername] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'card_receipt'>('stripe');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<{
    orderNumber: string;
    totalAmount: number;
    telegramSent: boolean;
    hasReceiptFile?: boolean;
  } | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setReceiptFile(null);
      setPreviewUrl(null);
      return;
    }

    const isValidType =
      file.type.startsWith('image/') ||
      file.type === 'application/pdf' ||
      /\.(jpg|jpeg|png|webp|pdf)$/i.test(file.name);

    if (!isValidType) {
      setErrorMsg(
        lang === 'uz'
          ? 'Faqat rasm (JPG, PNG) yoki PDF fayllar qabul qilinadi'
          : 'Поддерживаются только изображения (JPG, PNG) или PDF документы'
      );
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg(
        lang === 'uz'
          ? 'Fayl hajmi 15MB dan oshmasligi kerak'
          : 'Размер файла не должен превышать 15 МБ'
      );
      return;
    }

    setErrorMsg(null);
    setReceiptFile(file);

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMsg(lang === 'uz' ? 'Iltimos, ismingizni kiriting' : 'Пожалуйста, укажите ваше имя');
      return;
    }
    if (customerPhone.trim().length < 9) {
      setErrorMsg(
        lang === 'uz'
          ? 'Iltimos, to\'liq telefon raqamingizni kiriting'
          : 'Пожалуйста, укажите полный номер телефона'
      );
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      if (paymentMethod === 'stripe') {
        const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            telegramUsername: telegramUsername.trim(),
            parts,
            lang,
            source: 'builder',
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Ошибка создания платежной сессии Stripe');
        }
        if (data.url) {
          window.location.href = data.url;
          return;
        }
        throw new Error('Stripe не вернул ссылку для оплаты');
      }

      const formData = new FormData();
      formData.append('customerName', customerName.trim());
      formData.append('customerPhone', customerPhone.trim());
      formData.append('telegramUsername', telegramUsername.trim());
      formData.append('parts', JSON.stringify(parts));
      formData.append('totalPrice', String(totalPrice));
      formData.append('lang', lang);

      if (receiptFile) {
        formData.append('receiptFile', receiptFile);
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Ошибка при отправке заказа');
      }

      setOrderResult({
        orderNumber: data.orderNumber,
        totalAmount: data.totalAmount,
        telegramSent: data.telegramSent,
        hasReceiptFile: Boolean(data.receiptFileUrl),
      });
      clearBuild();
    } catch (err: any) {
      setErrorMsg(err.message || 'Произошла непредвиденная ошибка');
    } finally {
      setLoading(false);
    }
  };

  const selectedList = Object.entries(parts)
    .filter(([_, item]) => Boolean(item))
    .map(([cat, item]) => ({
      category: cat,
      item: item!,
    }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {orderResult
                  ? (lang === 'uz' ? 'Buyurtma qabul qilindi!' : 'Заказ успешно оформлен!')
                  : (lang === 'uz' ? 'Buyurtmani rasmiylashtirish' : 'Оформление заказа')}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {orderResult
                  ? (lang === 'uz' ? 'Chek ma\'lumotlari va to\'lov' : 'Электронный чек и статус заказа')
                  : (lang === 'uz' ? 'To\'lov chekini biriktirish va Telegram orqali yuborish' : 'Прикрепите чек оплаты и отправьте заказ менеджеру')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {orderResult ? (
            // Success Screen
            <div className="space-y-6 text-center py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <CheckCircle2 className="h-10 w-10" />
              </div>

              <div>
                <span className="rounded-full bg-blue-500/10 px-3.5 py-1 text-xs font-mono font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {orderResult.orderNumber}
                </span>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mt-3">
                  {lang === 'uz' ? 'Rahmat! Sizning buyurtmangiz qabul qilindi' : 'Спасибо! Ваш заказ принят в обработку'}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
                  {lang === 'uz'
                    ? "Menejerimiz tez orada siz bilan bog'lanadi va yig'mani tasdiqlaydi."
                    : 'Менеджер свяжется с вами в течение 10 минут для подтверждения адреса доставки и деталей сборки.'}
                </p>
              </div>

              {/* Order Amount card */}
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-5 text-left space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{lang === 'uz' ? 'Umumiy to\'lov summasi:' : 'Итоговая сумма к оплате:'}</span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    {formatPriceUzs(orderResult.totalAmount, lang)}
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    {lang === 'uz' ? 'To\'lov cheki / fayl:' : 'Прикрепленный чек оплаты:'}
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {orderResult.hasReceiptFile
                      ? (lang === 'uz' ? 'Muvaffaqiyatli saqlandi' : 'Сохранен в админке /admin')
                      : (lang === 'uz' ? 'Biriktirilmadi' : 'Не прикреплен')}
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    {lang === 'uz' ? 'Telegram bildirishnoma:' : 'Уведомление менеджеру в Telegram:'}
                  </span>
                  <span
                    className={`font-semibold ${
                      orderResult.telegramSent ? 'text-emerald-500' : 'text-amber-500'
                    }`}
                  >
                    {orderResult.telegramSent
                      ? (lang === 'uz' ? 'Yuborildi' : 'Чек и файл успешно доставлены в Telegram')
                      : (lang === 'uz' ? 'Menejer qabul qildi' : 'Передано менеджеру')}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white hover:bg-blue-500 transition-all shadow-md"
                >
                  {lang === 'uz' ? 'Katalogga qaytish' : 'Вернуться в каталог'}
                </button>
              </div>
            </div>
          ) : (
            // Form Screen
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-50 dark:bg-rose-950/30 p-3.5 text-xs text-rose-600 dark:text-rose-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Client Info Inputs */}
              <div className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1.5 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-blue-500" />
                    <span>{lang === 'uz' ? 'Ismingiz va familiyangiz' : 'Ваше имя и фамилия'} *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={lang === 'uz' ? 'Masalan: Alisher Usmonov' : 'Например: Алишер Усмонов'}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1.5 flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-blue-500" />
                      <span>{lang === 'uz' ? 'Telefon raqamingiz' : 'Номер телефона'} *</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+998 90 123 45 67"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1.5 flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                      <span>Telegram username ({lang === 'uz' ? 'ixtiyoriy' : 'необязательно'})</span>
                    </label>
                    <input
                      type="text"
                      placeholder="@username"
                      value={telegramUsername}
                      onChange={(e) => setTelegramUsername(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                  {lang === 'uz' ? "To'lov usulini tanlang" : 'Способ оплаты'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('stripe')}
                    className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all ${
                      paymentMethod === 'stripe'
                        ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500 shadow-sm'
                        : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 hover:border-gray-400 dark:hover:border-gray-700'
                    }`}
                  >
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${
                      paymentMethod === 'stripe'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900 dark:text-white">
                        Stripe (Онлайн-карта)
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400">
                        Visa / Mastercard / Apple Pay
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card_receipt')}
                    className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all ${
                      paymentMethod === 'card_receipt'
                        ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500 shadow-sm'
                        : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 hover:border-gray-400 dark:hover:border-gray-700'
                    }`}
                  >
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${
                      paymentMethod === 'card_receipt'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900 dark:text-white">
                        Click / Payme + чек
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400">
                        Перевод и загрузка квитанции
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {paymentMethod === 'stripe' ? (
                <div className="rounded-2xl border border-blue-500/25 bg-blue-500/5 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Защищённая оплата Stripe Checkout</span>
                    </span>
                    <span className="font-mono text-[11px]">
                      ≈ ${(totalPrice / 12800).toFixed(2)} USD
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">
                    Вы будете перенаправлены на официальную страницу оплаты Stripe. После успешной оплаты статус заказа обновится автоматически, а уведомление придёт в Telegram.
                  </p>
                </div>
              ) : (
                <>
                  {/* Payment Details info box */}
                  <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                      <CreditCard className="h-4 w-4" />
                      <span>{lang === 'uz' ? 'To\'lov rekvizitlari (Click / Payme / Karta)' : 'Реквизиты для оплаты (Click / Payme)'}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-600 dark:text-gray-300 gap-1">
                      <span>Номер карты: <strong className="font-mono text-gray-900 dark:text-white">8600 5304 9821 7740</strong></span>
                      <span className="text-[11px] text-gray-500">Получатель: ООО &quot;PC ULTRA MARKET&quot;</span>
                    </div>
                  </div>

                  {/* Receipt File Upload Field */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-blue-500" />
                        <span>
                          {lang === 'uz'
                            ? 'To\'lov cheki yoki skrinshotini biriktiring'
                            : 'Прикрепите фото чека или PDF квитанцию'}
                        </span>
                      </span>
                      <span className="text-[10px] text-gray-400 font-normal">
                        JPG, PNG, PDF (до 15 МБ)
                      </span>
                    </label>

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/png,image/jpeg,image/webp,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileChange(e.target.files[0]);
                        }
                      }}
                    />

                    {!receiptFile ? (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                          isDragging
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-gray-300 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 hover:border-blue-500/60 hover:bg-gray-100/50 dark:hover:bg-gray-900/80'
                        }`}
                      >
                        <UploadCloud className="mx-auto h-8 w-8 text-blue-500 mb-2" />
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                          {lang === 'uz'
                            ? 'Faylni tanlash uchun bosing yoki shu yerga tashlang'
                            : 'Нажмите для выбора файла или перетащите сюда'}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1">
                          {lang === 'uz'
                            ? 'Skrinshot yoki to\'lov kvitansiyasi PDF / rasm formatida'
                            : 'Скриншот из Click/Payme или квитанция банка (JPG, PNG, PDF)'}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                        <div className="flex items-center gap-3 overflow-hidden">
                          {previewUrl ? (
                            <img
                              src={previewUrl}
                              alt="Чек"
                              className="h-12 w-12 rounded-xl object-cover border border-gray-200 dark:border-gray-700 shrink-0"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 shrink-0">
                              <FileText className="h-6 w-6" />
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                              {receiptFile.name}
                            </p>
                            <p className="text-[11px] text-gray-400 font-mono">
                              {(receiptFile.size / (1024 * 1024)).toFixed(2)} MB • {receiptFile.type || 'Документ'}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleFileChange(null)}
                          className="rounded-xl p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0"
                          title="Удалить файл"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Order Breakdown / Receipt */}
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-4">
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {lang === 'uz' ? 'Yig\'ma tarkibi' : 'Состав конфигурации'} ({selectedList.length})
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>{t.allCompatible}</span>
                  </span>
                </div>

                <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                  {selectedList.map(({ category, item }) => (
                    <div
                      key={category}
                      className="flex items-center justify-between text-xs py-1 border-b border-gray-100 dark:border-gray-800/40 last:border-none"
                    >
                      <div className="truncate max-w-[280px] sm:max-w-md">
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mr-2">
                          [{category}]
                        </span>
                        <span className="text-gray-800 dark:text-gray-300">
                          {lang === 'uz' ? item.titleUz : item.titleRu}
                        </span>
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white shrink-0 ml-2">
                        {formatPriceUzs(item.priceUzs, lang)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                    {lang === 'uz' ? 'Jami to\'lov:' : 'Итоговая стоимость:'}
                  </span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    {formatPriceUzs(totalPrice, lang)}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.01] disabled:opacity-50 ${
                  paymentMethod === 'stripe'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/25'
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25'
                }`}
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : paymentMethod === 'stripe' ? (
                  <>
                    <CreditCard className="h-4 w-4" />
                    <span>
                      {lang === 'uz'
                        ? "Stripe orqali karta bilan to'lash"
                        : 'Оплатить картой через Stripe'}
                    </span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>
                      {lang === 'uz'
                        ? 'Buyurtmani tasdiqlash va Telegram chekini olish'
                        : 'Подтвердить заказ и получить чек в Telegram'}
                    </span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
