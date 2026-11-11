'use client';

import React, { useState, useRef } from 'react';
import { useCart } from '@/lib/cartStore';
import { useI18n } from '@/lib/i18n';
import { formatPriceUzs } from '@/lib/formatters';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Send,
  User,
  Phone,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  UploadCloud,
  FileText,
  CreditCard,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalCartPrice,
    totalCartCount,
  } = useCart();
  const { lang, t } = useI18n();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+998 ');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isCartOpen) return null;

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
          : 'Поддерживаются только фото (JPG, PNG) или PDF файлы'
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

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMsg(lang === 'uz' ? 'Ismingizni kiriting' : 'Укажите ваше имя');
      return;
    }
    if (customerPhone.trim().length < 9) {
      setErrorMsg(lang === 'uz' ? 'Telefon raqamingizni to\'liq kiriting' : 'Укажите номер телефона');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    // Format parts map for API
    const itemsList = items.map((it) => ({
      category: it.product.category,
      titleRu: it.product.titleRu,
      titleUz: it.product.titleUz,
      priceUzs: it.product.priceUzs,
      brand: it.product.brand,
      quantity: it.quantity,
    }));

    try {
      const formData = new FormData();
      formData.append('customerName', customerName.trim());
      formData.append('customerPhone', customerPhone.trim());
      formData.append('telegramUsername', telegramUsername.trim());
      formData.append('items', JSON.stringify(itemsList));
      formData.append('totalPrice', String(totalCartPrice));
      formData.append('lang', lang);

      if (receiptFile) {
        formData.append('receiptFile', receiptFile);
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка при оформлении');

      setOrderSuccess(data.orderNumber);
      clearCart();
    } catch (err: any) {
      setErrorMsg(err.message || 'Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-[#0a1033] border-l border-neutral-200 dark:border-[#09aff4]/25 shadow-2xl flex flex-col justify-between transition-colors">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-[#09aff4]/20 bg-neutral-50/50 dark:bg-[#060922]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#09aff4]/10 text-[#09aff4] border border-[#09aff4]/30 shadow-sm">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white uppercase tracking-tight">
                  {lang === 'uz' ? 'Savat' : 'Корзина'}
                </h3>
                <span className="text-xs font-mono font-bold text-neutral-500 dark:text-[#09aff4]">
                  {totalCartCount} {lang === 'uz' ? 'ta tovar' : 'товаров'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckingOut(false);
                setOrderSuccess(null);
              }}
              className="rounded-xl p-2 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/[0.05] hover:text-[#09aff4] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5">
            {orderSuccess ? (
              // Order Success inside cart
              <div className="text-center py-10 space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <span className="rounded-full bg-[#09aff4]/10 px-3 py-1 text-xs font-mono font-bold text-[#09aff4] border border-[#09aff4]/30">
                    {orderSuccess}
                  </span>
                  <h4 className="text-lg font-bold text-neutral-900 dark:text-white mt-2">
                    {lang === 'uz' ? 'Buyurtma rasmiylashtirildi!' : 'Заказ успешно оформлен!'}
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                    {lang === 'uz'
                      ? 'Chek saqlandi va Telegram orqali yuborildi. Tez orada siz bilan bog\'lanamiz.'
                      : 'Чек и квитанция сохранены в админке и отправлены в Telegram. Наш менеджер скоро свяжется с вами.'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setOrderSuccess(null);
                  }}
                  className="rounded-xl bg-[#09aff4] hover:bg-[#079ad8] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all shadow-md shadow-[#09aff4]/25"
                >
                  {lang === 'uz' ? 'Yopish' : 'Закрыть'}
                </button>
              </div>
            ) : isCheckingOut ? (
              // Direct Checkout Form
              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-[#09aff4]/15">
                  <span className="text-xs font-bold text-neutral-500 dark:text-[#09aff4] uppercase font-mono">
                    {lang === 'uz' ? 'Buyurtmachi ma\'lumotlari' : 'Контактные данные'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCheckingOut(false)}
                    className="text-xs text-[#09aff4] hover:underline font-bold"
                  >
                    ← {lang === 'uz' ? 'Savatga qaytish' : 'Назад к товарам'}
                  </button>
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-50 dark:bg-rose-950/30 p-3 text-xs text-rose-600 dark:text-rose-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-[#09aff4]" />
                    <span>{lang === 'uz' ? 'Ismingiz' : 'Ваше имя'} *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={lang === 'uz' ? 'Masalan: Sardor' : 'Например: Сардор'}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 dark:border-[#09aff4]/25 bg-neutral-50 dark:bg-[#060922] px-3.5 py-2 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-[#09aff4] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-[#09aff4]" />
                    <span>{lang === 'uz' ? 'Telefon raqam' : 'Телефон'} *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+998 90 123 45 67"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 dark:border-[#09aff4]/25 bg-neutral-50 dark:bg-[#060922] px-3.5 py-2 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-[#09aff4] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-[#09aff4]" />
                    <span>Telegram username</span>
                  </label>
                  <input
                    type="text"
                    placeholder="@username"
                    value={telegramUsername}
                    onChange={(e) => setTelegramUsername(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 dark:border-[#09aff4]/25 bg-neutral-50 dark:bg-[#060922] px-3.5 py-2 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-[#09aff4] focus:outline-none font-mono"
                  />
                </div>

                {/* Card Payment Info */}
                <div className="rounded-xl border border-[#09aff4]/30 bg-[#0d1857]/50 p-3.5 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#09aff4]">
                    <CreditCard className="h-3.5 w-3.5" />
                    <span>Оплата на карту Click / Payme:</span>
                  </div>
                  <p className="font-mono text-neutral-900 dark:text-white font-bold tracking-wider">8600 5304 9821 7740</p>
                  <p className="text-[10px] text-neutral-500 dark:text-slate-400">ООО &quot;PC ULTRA MARKET&quot;</p>
                </div>

                {/* Receipt File Upload */}
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-slate-300 block mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-[#09aff4]" />
                      <span>{lang === 'uz' ? 'To\'lov cheki / kvitansiya' : 'Чек оплаты / квитанция'}</span>
                    </span>
                    <span className="text-[10px] text-neutral-400 font-normal">JPG, PNG, PDF</span>
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
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-neutral-300 dark:border-[#09aff4]/30 rounded-xl p-3 text-center hover:border-[#09aff4] transition-colors flex items-center justify-center gap-2 text-xs text-neutral-600 dark:text-slate-300 bg-neutral-50 dark:bg-[#060922]"
                    >
                      <UploadCloud className="h-4 w-4 text-[#09aff4]" />
                      <span>{lang === 'uz' ? 'Chek faylini tanlang' : 'Прикрепить скриншот или PDF'}</span>
                    </button>
                  ) : (
                    <div className="flex items-center justify-between p-2 rounded-xl border border-neutral-200 dark:border-[#09aff4]/30 bg-neutral-50 dark:bg-[#060922] text-xs">
                      <div className="flex items-center gap-2 overflow-hidden">
                        {previewUrl ? (
                          <img src={previewUrl} alt="" className="h-8 w-8 rounded-lg object-cover shrink-0" />
                        ) : (
                          <FileText className="h-5 w-5 text-red-500 shrink-0" />
                        )}
                        <span className="font-semibold text-neutral-900 dark:text-white truncate max-w-[180px]">
                          {receiptFile.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleFileChange(null)}
                        className="text-neutral-400 hover:text-rose-500 p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#09aff4] hover:bg-[#079ad8] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#09aff4]/25 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>{lang === 'uz' ? 'Telegram chekini olish' : 'Подтвердить и отправить чек'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : items.length === 0 ? (
              // Empty State
              <div className="flex h-full flex-col items-center justify-center text-center py-16">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-[#060922] text-neutral-400 dark:text-[#09aff4]/50 mb-4 border border-neutral-200 dark:border-[#09aff4]/20">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h4 className="text-base font-bold text-neutral-900 dark:text-white">
                  {lang === 'uz' ? 'Savatingiz bo\'sh' : 'Ваша корзина пуста'}
                </h4>
                <p className="text-xs text-neutral-500 dark:text-slate-400 mt-1 max-w-xs">
                  {lang === 'uz'
                    ? 'Katalogdan kerakli detallarni tanlang va ularni savatga qo\'shing'
                    : 'Выберите комплектующие в каталоге и добавьте их в корзину'}
                </p>
              </div>
            ) : (
              // Items List
              <div className="space-y-3">
                {items.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-3 rounded-2xl border border-neutral-200 dark:border-[#09aff4]/20 bg-neutral-50/50 dark:bg-[#060922] hover:border-[#09aff4] transition-all"
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.titleRu}
                      className="h-14 w-14 rounded-xl object-contain bg-white dark:bg-[#0a1033] p-1 border border-neutral-200 dark:border-[#09aff4]/20 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-mono font-bold text-[#09aff4]">
                        {product.category}
                      </span>
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                        {lang === 'uz' ? product.titleUz : product.titleRu}
                      </h4>
                      <div className="text-xs font-bold font-mono text-[#09aff4] mt-0.5">
                        {formatPriceUzs(product.priceUzs, lang)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-white dark:bg-[#0a1033] border border-neutral-200 dark:border-[#09aff4]/20 rounded-lg p-0.5 shrink-0">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="p-1 rounded text-neutral-500 hover:text-[#09aff4] hover:bg-neutral-100 dark:hover:bg-white/[0.05] transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-bold font-mono text-neutral-900 dark:text-white">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="p-1 rounded text-neutral-500 hover:text-[#09aff4] hover:bg-neutral-100 dark:hover:bg-white/[0.05] transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-400 rounded-lg transition-colors shrink-0"
                      title="Удалить"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={clearCart}
                    className="text-[11px] text-rose-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>{lang === 'uz' ? 'Savatni tozalash' : 'Очистить корзину'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer inside Drawer */}
          {items.length > 0 && !orderSuccess && !isCheckingOut && (
            <div className="p-5 border-t border-neutral-100 dark:border-[#09aff4]/20 bg-neutral-50/50 dark:bg-[#060922] space-y-4">
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-neutral-500 dark:text-slate-400">
                  <span>{lang === 'uz' ? 'Tovarlar soni:' : 'Всего товаров:'}</span>
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {totalCartCount} {lang === 'uz' ? 'dona' : 'шт.'}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-neutral-200 dark:border-[#09aff4]/15">
                  <span className="text-sm font-bold text-neutral-900 dark:text-white uppercase">
                    {lang === 'uz' ? 'Jami to\'lov:' : 'Итого:'}
                  </span>
                  <span className="text-lg font-bold text-[#09aff4]">
                    {formatPriceUzs(totalCartPrice, lang)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsCheckingOut(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#09aff4] hover:bg-[#079ad8] py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#09aff4]/25 transition-all active:scale-[0.98]"
              >
                <span>{lang === 'uz' ? 'Buyurtmani rasmiylashtirish' : 'Оформить заказ'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
