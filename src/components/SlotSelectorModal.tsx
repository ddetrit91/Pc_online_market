'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { Category, ProductItem, SelectedParts } from '@/lib/types';
import { formatPriceUzs } from '@/lib/formatters';
import { X, Check, Search, AlertCircle, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  category: Category;
  currentParts: SelectedParts;
  onSelect: (product: ProductItem) => void;
}

export const SlotSelectorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  category,
  currentParts,
  onSelect,
}) => {
  const { lang, t } = useI18n();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    fetch(`/api/products?category=${category}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [isOpen, category]);

  if (!isOpen) return null;

  const brands = ['ALL', ...Array.from(new Set(products.map((p) => p.brand)))];

  const filteredProducts = products.filter((p) => {
    const matchesBrand = selectedBrand === 'ALL' || p.brand === selectedBrand;
    const title = lang === 'uz' ? p.titleUz : p.titleRu;
    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBrand && matchesSearch;
  });

  // Helper to check item compatibility with already selected parts in the build
  const checkItemConflict = (item: ProductItem): string | null => {
    if (category === 'MOTHERBOARD' && currentParts.CPU?.socket && item.socket) {
      if (item.socket.toLowerCase() !== currentParts.CPU.socket.toLowerCase()) {
        return lang === 'uz'
          ? `Soket mos emas (Protsessorda ${currentParts.CPU.socket}, ushbu platada esa ${item.socket})`
          : `Несовместимый сокет (у процессора ${currentParts.CPU.socket}, у этой платы ${item.socket})`;
      }
    }
    if (category === 'CPU' && currentParts.MOTHERBOARD?.socket && item.socket) {
      if (item.socket.toLowerCase() !== currentParts.MOTHERBOARD.socket.toLowerCase()) {
        return lang === 'uz'
          ? `Soket mos emas (Ona platada ${currentParts.MOTHERBOARD.socket}, ushbu protsessorda ${item.socket})`
          : `Несовместимый сокет (у платы ${currentParts.MOTHERBOARD.socket}, у процессора ${item.socket})`;
      }
    }
    if (category === 'RAM' && currentParts.MOTHERBOARD?.memoryType && item.memoryType) {
      if (item.memoryType.toUpperCase() !== currentParts.MOTHERBOARD.memoryType.toUpperCase()) {
        return lang === 'uz'
          ? `Xotira turi mos emas (Platada ${currentParts.MOTHERBOARD.memoryType}, xotirada ${item.memoryType})`
          : `Несовпадение стандарта (плата требует ${currentParts.MOTHERBOARD.memoryType}, память ${item.memoryType})`;
      }
    }
    if (category === 'GPU' && currentParts.CASE?.maxGpuLength && item.lengthMm) {
      if (item.lengthMm > currentParts.CASE.maxGpuLength) {
        return lang === 'uz'
          ? `Videokarta korpusga sig'maydi (${item.lengthMm} mm > ${currentParts.CASE.maxGpuLength} mm)`
          : `Видеокарта длиннее лимита корпуса (${item.lengthMm} мм > ${currentParts.CASE.maxGpuLength} мм)`;
      }
    }
    if (category === 'COOLER' && currentParts.CASE?.maxCoolerHeight && item.coolerHeight) {
      if (item.coolerHeight > currentParts.CASE.maxCoolerHeight) {
        return lang === 'uz'
          ? `Kuler korpus balandligidan katta (${item.coolerHeight} mm > ${currentParts.CASE.maxCoolerHeight} mm)`
          : `Кулер выше предельной высоты корпуса (${item.coolerHeight} мм > ${currentParts.CASE.maxCoolerHeight} мм)`;
      }
    }
    return null;
  };

  const getCategoryName = (cat: Category) => {
    switch (cat) {
      case 'CPU':
        return t.cpu;
      case 'MOTHERBOARD':
        return t.motherboard;
      case 'RAM':
        return t.ram;
      case 'GPU':
        return t.gpu;
      case 'STORAGE':
        return t.storage;
      case 'PSU':
        return t.psu;
      case 'CASE':
        return t.case;
      case 'COOLER':
        return t.cooler;
      default:
        return cat;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="flex h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-neutral-200 dark:border-[#09aff4]/25 bg-white dark:bg-[#0a1033] shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-[#09aff4]/20 px-6 py-4 bg-neutral-50/80 dark:bg-[#060922]">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#09aff4] bg-[#09aff4]/10 px-3 py-0.5 rounded-full border border-[#09aff4]/30">
                <Sparkles className="h-3 w-3 text-[#09aff4]" />
                {lang === 'uz' ? 'Slot' : 'Слот'}: {category}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white mt-1">
              {t.selectComponentForSlot}: <span className="text-[#09aff4]">{getCategoryName(category)}</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/[0.05] hover:text-[#09aff4] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Brand Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-neutral-200 dark:border-[#09aff4]/20 bg-neutral-50/50 dark:bg-[#0d1857]/30 p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400 dark:text-[#09aff4]" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 dark:border-[#09aff4]/25 bg-white dark:bg-[#060922] py-2.5 pl-10 pr-4 text-xs font-medium text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-slate-500 focus:border-[#09aff4] focus:outline-none transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBrand(b)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedBrand === b
                    ? 'bg-[#09aff4] text-white font-bold shadow-md shadow-[#09aff4]/30'
                    : 'bg-white dark:bg-[#060922] border border-neutral-200 dark:border-[#09aff4]/20 text-neutral-600 dark:text-slate-300 hover:text-[#09aff4] hover:border-[#09aff4] shadow-sm'
                }`}
              >
                {b === 'ALL' ? (lang === 'uz' ? 'Barchasi' : 'Все бренды') : b}
              </button>
            ))}
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#09aff4] border-t-transparent" />
              <span className="text-xs font-bold text-slate-400">Загрузка каталога...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center text-slate-400">
              <AlertCircle className="h-10 w-10 text-slate-500 mb-2" />
              <p className="text-sm font-semibold">{t.emptyCatalog}</p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const conflict = checkItemConflict(product);
              const isCurrent = currentParts[category]?.id === product.id;

              return (
                <div
                  key={product.id}
                  className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border p-4 sm:p-5 transition-all shadow-sm ${
                    isCurrent
                      ? 'border-[#09aff4] bg-[#09aff4]/10'
                      : conflict
                      ? 'border-rose-500/40 bg-rose-500/5 hover:border-rose-400'
                      : 'border-neutral-200 dark:border-[#09aff4]/20 bg-white dark:bg-[#0a1033] hover:border-[#09aff4]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-neutral-200 dark:border-[#09aff4]/25 bg-neutral-100 dark:bg-[#060922] p-1.5 flex items-center justify-center">
                      <img
                        src={product.imageUrl}
                        alt={product.titleRu}
                        className="h-full w-full object-contain transition-transform group-hover:scale-105 duration-300"
                      />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                        <span className="font-bold text-[#09aff4]">
                          {product.brand}
                        </span>
                        {product.socket && (
                          <span className="rounded-md border border-[#09aff4]/30 bg-[#0d1857] px-2 py-0.5 text-[#09aff4] font-bold">
                            {product.socket}
                          </span>
                        )}
                        {product.memoryType && (
                          <span className="rounded-md border border-[#09aff4]/30 bg-[#0d1857] px-2 py-0.5 text-[#09aff4] font-bold">
                            {product.memoryType}
                          </span>
                        )}
                        {product.tdp && (
                          <span className="rounded border border-neutral-200 dark:border-white/[0.1] bg-neutral-100 dark:bg-[#060922] px-2 py-0.5 text-neutral-700 dark:text-slate-300">
                            {product.tdp}W TDP
                          </span>
                        )}
                        {product.wattage && (
                          <span className="rounded border border-neutral-200 dark:border-white/[0.1] bg-neutral-100 dark:bg-[#060922] px-2 py-0.5 text-neutral-700 dark:text-slate-300">
                            {product.wattage}W
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white mt-1 group-hover:text-[#09aff4] transition-colors">
                        {lang === 'uz' ? product.titleUz : product.titleRu}
                      </h4>
                      <p className="text-xs text-neutral-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {lang === 'uz' ? product.descriptionUz : product.descriptionRu}
                      </p>

                      {/* Conflict notification if incompatible */}
                      {conflict && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/30">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>{conflict}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-[#09aff4]/15">
                    <span className="text-sm sm:text-base font-bold font-mono tracking-tight text-[#09aff4] tabular-nums">
                      {formatPriceUzs(product.priceUzs, lang)}
                    </span>
                    <button
                      onClick={() => {
                        onSelect(product);
                        onClose();
                      }}
                      className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all active:scale-95 ${
                        isCurrent
                          ? 'bg-[#09aff4]/20 text-[#09aff4] border border-[#09aff4]/50'
                          : 'bg-[#09aff4] hover:bg-[#079ad8] text-white shadow-md shadow-[#09aff4]/20'
                      }`}
                    >
                      {isCurrent ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-[#09aff4]" />
                          <span>{lang === 'uz' ? 'Tanlangan' : 'Выбран'}</span>
                        </>
                      ) : (
                        <span>{t.choosePart}</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
