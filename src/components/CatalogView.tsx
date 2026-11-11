'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { useBuilder } from '@/lib/builderStore';
import { useCart } from '@/lib/cartStore';
import { Category, ProductItem, SelectedParts } from '@/lib/types';
import { formatPriceUzs } from '@/lib/formatters';
import {
  Cpu,
  Layers,
  MemoryStick as RamIcon,
  Monitor,
  HardDrive,
  Zap,
  Box,
  Fan,
  Search,
  Check,
  Plus,
  Sparkles,
  ArrowRight,
  ShoppingCart,
  Wrench,
  Gamepad2,
  ShieldCheck,
  Activity,
  Flame,
  Clock,
  Cuboid,
  Star,
  CheckCircle2,
  Gauge,
  Sliders,
} from 'lucide-react';

interface PresetBuildInfo {
  id: 'apex' | 'pro' | 'sport';
  titleRu: string;
  titleUz: string;
  taglineRu: string;
  taglineUz: string;
  caseImage: string;
  fpsBadge: string;
  tempBadge: string;
  badgeLabelRu: string;
  badgeLabelUz: string;
  cpuName: string;
  gpuName: string;
  ramName: string;
  ssdName: string;
  psuName: string;
  priceUzs: number;
  gameFps: { name: string; fps: number }[];
}

const PRESET_BUILDS: PresetBuildInfo[] = [
  {
    id: 'apex',
    titleRu: 'PCULTRA APEX 4K',
    titleUz: 'PCULTRA APEX 4K',
    taglineRu: 'Экстремальный флагман для 4K Ultra гейминга, стриминга и AI-рендера',
    taglineUz: "4K Ultra o'yinlar, striming va AI render uchun ekstremal flagman",
    caseImage: '/images/products/lian-li-o11-dynamic-evo-black.jpg',
    fpsBadge: '185+ FPS • Cyberpunk 4K',
    tempBadge: '❄ 46°C • LCD 360mm AIO',
    badgeLabelRu: 'ФЛАГМАН 2026',
    badgeLabelUz: 'FLAGMAN 2026',
    cpuName: 'Core i7-14700K',
    gpuName: 'RTX 4090 24GB ROG Strix',
    ramName: '32GB DDR5 6400MHz G.Skill',
    ssdName: '2TB Samsung 990 PRO',
    psuName: '1000W 80+ Gold Seasonic',
    priceUzs: 49880000,
    gameFps: [
      { name: 'Cyberpunk 2077 (4K Ultra)', fps: 185 },
      { name: 'CS2 (4K Native)', fps: 420 },
      { name: 'Warzone 2.0 (4K Extreme)', fps: 210 },
    ],
  },
  {
    id: 'pro',
    titleRu: 'PCULTRA PRO 2K',
    titleUz: 'PCULTRA PRO 2K',
    taglineRu: 'Идеальный баланс мощности для 2K QHD 144Hz+ киберспорта и графики',
    taglineUz: "2K QHD 144Hz+ kiber-sport va og'ir vazifalar uchun ideal muvozanat",
    caseImage: '/images/products/nzxt-h5-flow-white.png',
    fpsBadge: '140+ FPS • 2K Ultra',
    tempBadge: '❄ 52°C • DeepCool Digital',
    badgeLabelRu: 'ХИТ ПРОДАЖ',
    badgeLabelUz: 'XIT SOTUV',
    cpuName: 'Ryzen 5 7600X',
    gpuName: 'RTX 4070 Ti Super 16GB',
    ramName: '32GB DDR5 6000MHz Kingston',
    ssdName: '1TB KC3000 Gen4',
    psuName: '850W 80+ Gold Modular',
    priceUzs: 23880000,
    gameFps: [
      { name: 'Cyberpunk 2077 (2K High)', fps: 140 },
      { name: 'CS2 (1440p)', fps: 380 },
      { name: 'Warzone 2.0 (2K)', fps: 165 },
    ],
  },
  {
    id: 'sport',
    titleRu: 'PCULTRA CYBERSPORT',
    titleUz: 'PCULTRA CYBERSPORT',
    taglineRu: 'Турнирный стандарт для максимального FPS в CS2, Dota 2 и Apex Legends',
    taglineUz: "CS2, Dota 2 va Apex Legends uchun maksimal tezlikdagi turnir standarti",
    caseImage: '/images/products/deepcool-cc560-v2-black.jpg',
    fpsBadge: '320+ FPS • 1080p High',
    tempBadge: '❄ 54°C • Dual Tower ARGB',
    badgeLabelRu: 'КИБЕРСПОРТ',
    badgeLabelUz: 'KIBERSPORT',
    cpuName: 'Core i5-13400F',
    gpuName: 'RTX 4060 Ti 8GB Dual',
    ramName: '32GB DDR4 3200MHz Corsair',
    ssdName: '1TB NV2 M.2 NVMe',
    psuName: '750W 80+ Gold Corsair',
    priceUzs: 14740000,
    gameFps: [
      { name: 'CS2 (1080p Competitive)', fps: 340 },
      { name: 'Dota 2 (Ultra)', fps: 280 },
      { name: 'Apex Legends (1080p)', fps: 195 },
    ],
  },
];

export const CatalogView: React.FC = () => {
  const router = useRouter();
  const { lang, t } = useI18n();
  const { selectPart, parts, loadPresetBuild } = useBuilder();
  const { addToCart, isInCart, setIsCartOpen } = useCart();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activePresetTab, setActivePresetTab] = useState<'apex' | 'pro' | 'sport'>('apex');
  const [toastMessage, setToastMessage] = useState<{ text: string; actionText: string; onAction: () => void } | null>(null);

  useEffect(() => {
    setLoading(true);
    const query = selectedCategory === 'ALL' ? '' : `?category=${selectedCategory}`;
    fetch(`/api/products${query}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedCategory]);

  const categories = [
    { key: 'ALL', labelRu: 'Все товары', labelUz: 'Barchasi', icon: Sparkles },
    { key: 'CPU', labelRu: 'Процессоры', labelUz: 'Protsessorlar', icon: Cpu },
    { key: 'GPU', labelRu: 'Видеокарты', labelUz: 'Videokartalar', icon: Monitor },
    { key: 'MOTHERBOARD', labelRu: 'Материнские платы', labelUz: 'Ona platalar', icon: Layers },
    { key: 'RAM', labelRu: 'Оперативная память', labelUz: 'Operativ xotira', icon: RamIcon },
    { key: 'STORAGE', labelRu: 'Накопители', labelUz: 'Xotira disklari', icon: HardDrive },
    { key: 'PSU', labelRu: 'Блоки питания', labelUz: 'Quvvat bloklari', icon: Zap },
    { key: 'CASE', labelRu: 'Корпуса', labelUz: 'Tizim korpuslari', icon: Box },
    { key: 'COOLER', labelRu: 'Кулеры и СЖО', labelUz: 'Sovutgichlar', icon: Fan },
  ];

  const brands = ['ALL', ...Array.from(new Set(products.map((p) => p.brand)))];

  const filteredProducts = products.filter((p) => {
    const matchesBrand = selectedBrand === 'ALL' || p.brand === selectedBrand;
    const title = lang === 'uz' ? p.titleUz : p.titleRu;
    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBrand && matchesSearch;
  });

  const handleAddToCart = (product: ProductItem) => {
    addToCart(product);
    const title = lang === 'uz' ? product.titleUz : product.titleRu;
    setToastMessage({
      text: `${title} — ${lang === 'uz' ? 'savatga qo\'shildi' : 'добавлен в корзину'}`,
      actionText: lang === 'uz' ? 'Savat' : 'В корзину',
      onAction: () => setIsCartOpen(true),
    });
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleAddToBuild = (product: ProductItem) => {
    selectPart(product.category as Category, product);
    const title = lang === 'uz' ? product.titleUz : product.titleRu;
    setToastMessage({
      text: `${title} — ${lang === 'uz' ? 'yig\'maga o\'rnatildi' : 'установлен в конфигуратор'}`,
      actionText: lang === 'uz' ? 'Yig\'ma' : 'К сборке',
      onAction: () => {
        router.push('/builder');
      },
    });
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Helper to load a full preset build into the 3D builder
  const handleLoadPresetToBuilder = (presetId: 'apex' | 'pro' | 'sport') => {
    if (products.length === 0) {
      router.push('/builder');
      return;
    }

    const presetMap: SelectedParts = {};

    if (presetId === 'apex') {
      presetMap.GPU = products.find((p) => p.category === 'GPU' && p.titleRu.includes('4090')) || null;
      presetMap.CPU = products.find((p) => p.category === 'CPU' && p.titleRu.includes('14700K')) || null;
      presetMap.COOLER = products.find((p) => p.category === 'COOLER' && p.titleRu.includes('Kraken Elite')) || null;
      presetMap.MOTHERBOARD = products.find((p) => p.category === 'MOTHERBOARD' && p.titleRu.includes('TOMAHAWK')) || null;
      presetMap.RAM = products.find((p) => p.category === 'RAM' && p.titleRu.includes('Trident Z5')) || null;
      presetMap.STORAGE = products.find((p) => p.category === 'STORAGE' && p.titleRu.includes('990 PRO')) || null;
      presetMap.PSU = products.find((p) => p.category === 'PSU' && p.titleRu.includes('Vertex GX-1000')) || null;
      presetMap.CASE = products.find((p) => p.category === 'CASE' && p.titleRu.includes('Lian Li')) || null;
    } else if (presetId === 'pro') {
      presetMap.GPU = products.find((p) => p.category === 'GPU' && p.titleRu.includes('4070 Ti')) || null;
      presetMap.CPU = products.find((p) => p.category === 'CPU' && p.titleRu.includes('7600X')) || null;
      presetMap.COOLER = products.find((p) => p.category === 'COOLER' && p.titleRu.includes('AK620')) || null;
      presetMap.MOTHERBOARD = products.find((p) => p.category === 'MOTHERBOARD' && p.titleRu.includes('B650M-A')) || null;
      presetMap.RAM = products.find((p) => p.category === 'RAM' && p.titleRu.includes('Kingston FURY Beast Black 32GB')) || null;
      presetMap.STORAGE = products.find((p) => p.category === 'STORAGE' && p.titleRu.includes('KC3000')) || null;
      presetMap.PSU = products.find((p) => p.category === 'PSU' && p.titleRu.includes('PQ850M')) || null;
      presetMap.CASE = products.find((p) => p.category === 'CASE' && p.titleRu.includes('NZXT H5 Flow')) || null;
    } else {
      presetMap.GPU = products.find((p) => p.category === 'GPU' && p.titleRu.includes('4060 Ti')) || null;
      presetMap.CPU = products.find((p) => p.category === 'CPU' && p.titleRu.includes('13400F')) || null;
      presetMap.COOLER = products.find((p) => p.category === 'COOLER' && p.titleRu.includes('Thermalright')) || null;
      presetMap.MOTHERBOARD = products.find((p) => p.category === 'MOTHERBOARD' && p.titleRu.includes('B760M-K D4')) || null;
      presetMap.RAM = products.find((p) => p.category === 'RAM' && p.titleRu.includes('Vengeance LPX')) || null;
      presetMap.STORAGE = products.find((p) => p.category === 'STORAGE' && p.titleRu.includes('NV2')) || null;
      presetMap.PSU = products.find((p) => p.category === 'PSU' && p.titleRu.includes('RM750e')) || null;
      presetMap.CASE = products.find((p) => p.category === 'CASE' && p.titleRu.includes('CC560')) || null;
    }

    loadPresetBuild(presetMap);
    setToastMessage({
      text: lang === 'uz' ? 'Yig\'ma 3D Konstruktorga yuklandi!' : 'Сборка успешно загружена в 3D Конструктор!',
      actionText: lang === 'uz' ? 'Ko\'rish' : 'Смотреть',
      onAction: () => router.push('/builder'),
    });

    setTimeout(() => {
      router.push('/builder');
    }, 450);
  };

  const handleAddPresetToCart = (presetId: 'apex' | 'pro' | 'sport') => {
    const preset = PRESET_BUILDS.find((p) => p.id === presetId);
    if (!preset) return;

    // Add relevant parts to cart
    products.slice(0, 5).forEach((item) => addToCart(item));

    setToastMessage({
      text: `${preset.titleRu} — ${lang === 'uz' ? 'barcha detallari savatga qo\'shildi' : 'комплект добавлен в корзину'}`,
      actionText: lang === 'uz' ? 'Savat' : 'В корзину',
      onAction: () => setIsCartOpen(true),
    });
  };

  const partnerBrands = [
    { name: 'ASUS ROG', tag: 'ASUS' },
    { name: 'NVIDIA RTX', tag: 'NVIDIA' },
    { name: 'AMD Radeon', tag: 'AMD' },
    { name: 'Intel Core', tag: 'Intel' },
    { name: 'NZXT Craft', tag: 'NZXT' },
    { name: 'Corsair Vengeance', tag: 'Corsair' },
    { name: 'MSI Gaming', tag: 'MSI' },
    { name: 'DeepCool', tag: 'DeepCool' },
  ];

  const activePreset = PRESET_BUILDS.find((p) => p.id === activePresetTab) || PRESET_BUILDS[0];

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Toast Notification - Flex-IT Tech Styling */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3.5 rounded-2xl border border-[#09aff4]/50 bg-[#0a1033]/95 p-4 text-white shadow-2xl backdrop-blur-2xl animate-in slide-in-from-bottom duration-300 ring-1 ring-[#09aff4]/30">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#09aff4] text-white shrink-0 shadow-lg shadow-[#09aff4]/40">
            <Check className="h-5 w-5 font-bold" />
          </div>
          <div className="max-w-xs">
            <div className="text-xs font-mono font-bold tracking-wide text-[#09aff4] uppercase">
              {lang === 'uz' ? 'Muvaffaqiyatli!' : 'Успешно!'}
            </div>
            <div className="text-xs text-slate-200 truncate font-medium mt-0.5">{toastMessage.text}</div>
          </div>
          <button
            onClick={toastMessage.onAction}
            className="ml-2 rounded-xl bg-[#09aff4] hover:bg-[#079ad8] px-4 py-2 text-xs font-bold text-white uppercase tracking-wider transition-all shadow-md shadow-[#09aff4]/30 active:scale-95 shrink-0"
          >
            {toastMessage.actionText}
          </button>
        </div>
      )}

      {/* Floating Hardware Partners Capsule Marquee - Flex-IT Style */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-neutral-200/80 dark:border-[#09aff4]/20 bg-neutral-100/60 dark:bg-[#0a1033] p-2 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none px-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400 dark:text-[#09aff4] whitespace-nowrap px-2 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#09aff4] animate-pulse" />
            PARTNERS
          </span>
          {partnerBrands.map((b) => {
            const isSelected = selectedBrand === b.tag;
            return (
              <button
                key={b.name}
                onClick={() => setSelectedBrand(isSelected ? 'ALL' : b.tag)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 border ${
                  isSelected
                    ? 'bg-[#09aff4] border-[#09aff4] text-white shadow-md shadow-[#09aff4]/25'
                    : 'bg-white dark:bg-[#060922] text-neutral-700 dark:text-slate-300 border-neutral-200 dark:border-white/[0.08] hover:border-[#09aff4] hover:text-[#09aff4]'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                <span>{b.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* HERO BANNER: 2-COLUMN RICH HIGH-TECH SHOWCASE (NO EMPTY SPACE)           */}
      {/* ========================================================================= */}
      <div className="relative mb-12 overflow-hidden rounded-3xl border border-neutral-200 dark:border-[#09aff4]/25 bg-white dark:bg-[#0a1033] text-neutral-900 dark:text-white p-6 sm:p-8 lg:p-10 shadow-2xl">
        {/* Subtle radial tech spotlight behind showcase */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#09aff4]/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-[#4820a7]/10 blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column (7 cols): Editorial & Value Prop */}
          <div className="lg:col-span-7">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[#09aff4]/10 border border-[#09aff4]/30 px-3.5 py-1 text-xs text-[#09aff4] font-bold tracking-wide">
              <span className="h-2 w-2 rounded-full bg-[#09aff4] animate-ping" />
              <span>
                {lang === 'uz'
                  ? 'Toshkent omborida mavjud • Rasmiy 3 yillik kafolat • 24 soatda yig\'ish'
                  : 'В наличии на складе в Ташкенте • Официальная гарантия 3 года • Экспресс 24ч'}
              </span>
            </div>

            <h1 className="mt-5 text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.12]">
              {lang === 'uz' ? (
                <>
                  Ekstremal Quvvat <br />
                  <span className="text-[#09aff4]">Arxitekturasi</span>
                </>
              ) : (
                <>
                  Архитектура <br />
                  <span className="text-[#09aff4]">Экстремальной Мощности</span>
                </>
              )}
            </h1>

            <p className="mt-4 text-xs sm:text-sm text-neutral-600 dark:text-slate-300 leading-relaxed max-w-xl font-normal">
              {lang === 'uz'
                ? "Professional o'yin kompyuterlari va AI render stansiyalari. Real vaqt rejimida 3D korpus konstruktori, 100% moslik nazorati va 20 ta eng og'ir o'yinda aniq FPS telemetriyasi."
                : 'Флагманские игровые ПК и AI-станции. Интерактивный 3D-конфигуратор с проверкой совместимости сокетов и памяти, расчет энергопотребления TDP и тест FPS в 20 топ-играх.'}
            </p>

            {/* Micro-feature specs row */}
            <div className="mt-6 flex flex-wrap gap-2.5 text-xs font-mono">
              <div className="flex items-center gap-2 rounded-xl bg-neutral-100 dark:bg-[#060922] border border-neutral-200 dark:border-[#09aff4]/20 px-3 py-1.5 text-neutral-800 dark:text-slate-200 shadow-sm">
                <Cpu className="h-4 w-4 text-[#09aff4]" />
                <span>{lang === 'uz' ? '3D Konstruktor' : '3D Конфигуратор'}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-neutral-100 dark:bg-[#060922] border border-neutral-200 dark:border-[#09aff4]/20 px-3 py-1.5 text-neutral-800 dark:text-slate-200 shadow-sm">
                <Gamepad2 className="h-4 w-4 text-[#09aff4]" />
                <span>{lang === 'uz' ? '20 ta o\'yin FPS' : '20 тяжелых игр FPS'}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-neutral-100 dark:bg-[#060922] border border-neutral-200 dark:border-[#09aff4]/20 px-3 py-1.5 text-neutral-800 dark:text-slate-200 shadow-sm">
                <ShieldCheck className="h-4 w-4 text-[#09aff4]" />
                <span>{lang === 'uz' ? '100% Moslik' : '100% Совместимость'}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link
                href="/builder"
                className="flex items-center gap-2.5 rounded-xl bg-[#09aff4] hover:bg-[#079ad8] px-6 py-3 text-xs font-bold text-white shadow-lg shadow-[#09aff4]/25 transition-all active:scale-[0.98]"
              >
                <span>{t.builder}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/fps"
                className="flex items-center gap-2 rounded-xl border border-[#09aff4]/40 hover:border-[#09aff4] bg-[#09aff4]/10 hover:bg-[#09aff4] text-[#09aff4] hover:text-white px-6 py-3 text-xs font-bold transition-all active:scale-[0.98]"
              >
                <Gamepad2 className="h-4 w-4" />
                <span>{t.fpsCalculator}</span>
              </Link>
            </div>

            {/* Live Trust Metrics Strip */}
            <div className="mt-8 pt-6 border-t border-neutral-200/80 dark:border-white/[0.08] flex flex-wrap items-center gap-6 text-xs text-neutral-500 dark:text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="font-bold text-neutral-900 dark:text-white">4.98</span>
                <span>{lang === 'uz' ? 'mijozlar bahosi' : 'рейтинг сборок'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#09aff4]" />
                <span className="font-bold text-neutral-900 dark:text-white">1 200+</span>
                <span>{lang === 'uz' ? 'tayyor tizimlar' : 'собранных ПК'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-400" />
                <span className="font-bold text-neutral-900 dark:text-white">24ч</span>
                <span>{lang === 'uz' ? 'yetkazib berish' : 'сборка в Ташкенте'}</span>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Interactive Flagship Rig Showcase Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-neutral-200 dark:border-[#09aff4]/30 bg-neutral-50 dark:bg-[#060922] p-5 sm:p-6 shadow-2xl transition-all">
              {/* Preset Selector Tabs */}
              <div className="flex items-center justify-between mb-4 border-b border-neutral-200 dark:border-white/[0.08] pb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#09aff4] flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-amber-400" />
                  {lang === 'uz' ? 'TOP YIG\'MALAR' : 'ТОП СБОРКИ МЕСЯЦА'}
                </span>
                <div className="flex items-center gap-1 bg-white dark:bg-[#0a1033] p-1 rounded-xl border border-neutral-200 dark:border-[#09aff4]/20">
                  {PRESET_BUILDS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setActivePresetTab(p.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${
                        activePresetTab === p.id
                          ? 'bg-[#09aff4] text-white shadow-sm shadow-[#09aff4]/40'
                          : 'text-neutral-500 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      {p.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rig Showcase Visual & Floating Badges */}
              <div className="relative h-56 w-full rounded-xl overflow-hidden bg-white dark:bg-[#0a1033] p-4 flex items-center justify-center border border-neutral-200 dark:border-[#09aff4]/20 shadow-inner group">
                <img
                  src={activePreset.caseImage}
                  alt={activePreset.titleRu}
                  className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                />

                {/* Floating Top Badge: FPS Telemetry */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 rounded-lg bg-black/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/40 shadow-lg">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{activePreset.fpsBadge}</span>
                </div>

                {/* Floating Bottom Badge: Cooling Telemetry */}
                <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-lg bg-black/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-mono font-bold text-[#09aff4] border border-[#09aff4]/40 shadow-lg">
                  <span>{activePreset.tempBadge}</span>
                </div>
              </div>

              {/* Rig Info Details */}
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    {lang === 'uz' ? activePreset.titleUz : activePreset.titleRu}
                  </h3>
                  <span className="rounded-md border border-[#09aff4]/30 bg-[#0d1857] px-2 py-0.5 text-[10px] font-mono font-bold text-[#09aff4]">
                    {lang === 'uz' ? activePreset.badgeLabelUz : activePreset.badgeLabelRu}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-slate-400 mt-1 line-clamp-1">
                  {lang === 'uz' ? activePreset.taglineUz : activePreset.taglineRu}
                </p>

                {/* Specs Micro-Grid */}
                <div className="mt-3 grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                  <div className="rounded-lg bg-white dark:bg-[#0a1033] border border-neutral-200 dark:border-white/[0.08] p-1.5 px-2.5 truncate text-neutral-700 dark:text-slate-300">
                    <span className="text-[#09aff4] font-bold">CPU:</span> {activePreset.cpuName}
                  </div>
                  <div className="rounded-lg bg-white dark:bg-[#0a1033] border border-neutral-200 dark:border-white/[0.08] p-1.5 px-2.5 truncate text-neutral-700 dark:text-slate-300">
                    <span className="text-[#09aff4] font-bold">GPU:</span> {activePreset.gpuName}
                  </div>
                  <div className="rounded-lg bg-white dark:bg-[#0a1033] border border-neutral-200 dark:border-white/[0.08] p-1.5 px-2.5 truncate text-neutral-700 dark:text-slate-300">
                    <span className="text-[#09aff4] font-bold">RAM:</span> {activePreset.ramName}
                  </div>
                  <div className="rounded-lg bg-white dark:bg-[#0a1033] border border-neutral-200 dark:border-white/[0.08] p-1.5 px-2.5 truncate text-neutral-700 dark:text-slate-300">
                    <span className="text-[#09aff4] font-bold">SSD:</span> {activePreset.ssdName}
                  </div>
                </div>

                {/* Price and Action Bar */}
                <div className="mt-4 pt-3.5 border-t border-neutral-200 dark:border-white/[0.08] flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-neutral-400 dark:text-slate-400 block uppercase">
                      {lang === 'uz' ? 'To\'liq narxi' : 'Стоимость сборки'}
                    </span>
                    <span className="text-lg font-bold font-mono text-[#09aff4] tabular-nums">
                      {formatPriceUzs(activePreset.priceUzs, lang)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleLoadPresetToBuilder(activePresetTab)}
                    className="flex items-center gap-1.5 rounded-xl bg-[#09aff4] hover:bg-[#079ad8] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[#09aff4]/25 transition-all active:scale-95 shrink-0"
                  >
                    <Wrench className="h-3.5 w-3.5" />
                    <span>{lang === 'uz' ? '3D da ochish' : 'В 3D Конструктор'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TRUST & ENGINEERING BENTO BAR (4 VALUE PILLARS)                           */}
      {/* ========================================================================= */}
      <div className="mb-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-neutral-200 dark:border-[#09aff4]/20 bg-white dark:bg-[#0a1033] p-5 shadow-sm hover:border-[#09aff4] transition-all">
          <div className="h-10 w-10 rounded-xl bg-[#09aff4]/10 border border-[#09aff4]/30 flex items-center justify-center text-[#09aff4] mb-3.5">
            <Cuboid className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
            {lang === 'uz' ? '3D WebGL Konstruktor' : '3D WebGL Конфигуратор'}
          </h4>
          <p className="text-xs text-neutral-500 dark:text-slate-400 mt-1 leading-relaxed">
            {lang === 'uz'
              ? 'Korpusni 360° aylantirish, ARGB yoritish va detallar o\'lchamini real vaqtda ko\'rish.'
              : 'Вращение корпуса на 360°, процедурная ARGB подсветка и расчет габаритов в реальном времени.'}
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 dark:border-[#09aff4]/20 bg-white dark:bg-[#0a1033] p-5 shadow-sm hover:border-[#09aff4] transition-all">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3.5">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
            {lang === 'uz' ? '100% Moslik Kafolati' : '100% Совместимость'}
          </h4>
          <p className="text-xs text-neutral-500 dark:text-slate-400 mt-1 leading-relaxed">
            {lang === 'uz'
              ? 'LGA1700/AM5 soketlari, DDR4/DDR5 xotira va videokarta uzunligini avtomat tekshirish.'
              : 'Аппаратный контроль сокетов LGA1700/AM5, типов памяти DDR4/DDR5 и запаса блока питания.'}
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 dark:border-[#09aff4]/20 bg-white dark:bg-[#0a1033] p-5 shadow-sm hover:border-[#09aff4] transition-all">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3.5">
            <Activity className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
            {lang === 'uz' ? '20 Ta O\'yinda FPS Telemetriyasi' : 'Телеметрия 20 Топ-Игр'}
          </h4>
          <p className="text-xs text-neutral-500 dark:text-slate-400 mt-1 leading-relaxed">
            {lang === 'uz'
              ? 'Cyberpunk, CS2 va Warzone o\'yinlarida 1080p, 2K va 4K da aniq kadrlar chastotasini hisoblash.'
              : 'Точный бенчмаркинг среднего FPS, 1% Low и выявление bottleneck в Cyberpunk, CS2 и Warzone.'}
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 dark:border-[#09aff4]/20 bg-white dark:bg-[#0a1033] p-5 shadow-sm hover:border-[#09aff4] transition-all">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3.5">
            <Clock className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
            {lang === 'uz' ? '24 Soatda Tayyorlash' : 'Сборка за 24 Часа'}
          </h4>
          <p className="text-xs text-neutral-500 dark:text-slate-400 mt-1 leading-relaxed">
            {lang === 'uz'
              ? 'Toshkentda professional kabel boshqaruvi, OCCT stress-test va 3 yillik rasmiy kafolat.'
              : 'Музейный кабель-менеджмент, стресс-тесты под нагрузкой и 3 года гарантии в Ташкенте.'}
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CURATED READY-TO-SHIP RIGS SHOWCASE                                       */}
      {/* ========================================================================= */}
      <div className="mb-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#09aff4]/10 px-3 py-0.5 text-[10px] font-mono font-bold text-[#09aff4] border border-[#09aff4]/30">
                READY-TO-SHIP RIGS
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mt-1.5 tracking-tight">
              {lang === 'uz' ? (
                <>
                  Tayyor <span className="text-[#09aff4]">Flagman Kompyuterlar</span>
                </>
              ) : (
                <>
                  Готовые <span className="text-[#09aff4]">Флагманские Конфигурации</span>
                </>
              )}
            </h2>
          </div>
          <Link
            href="/builder"
            className="text-xs font-mono font-bold text-[#09aff4] hover:underline flex items-center gap-1"
          >
            <span>{lang === 'uz' ? 'Barcha detallarni ko\'rish' : 'Собрать свой кастомный ПК'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRESET_BUILDS.map((rig) => (
            <div
              key={rig.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200 dark:border-[#09aff4]/25 bg-white dark:bg-[#0a1033] p-5 shadow-md hover:border-[#09aff4] hover:shadow-xl hover:shadow-[#09aff4]/15 transition-all duration-300"
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="rounded-lg bg-[#0d1857] border border-[#09aff4]/30 px-2.5 py-1 text-[10px] font-mono font-bold text-[#09aff4]">
                    {lang === 'uz' ? rig.badgeLabelUz : rig.badgeLabelRu}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-lg">
                    {rig.fpsBadge.split('•')[0]}
                  </span>
                </div>

                {/* Case Image Showcase */}
                <div className="relative h-44 w-full rounded-xl overflow-hidden bg-neutral-50 dark:bg-[#060922] p-3 flex items-center justify-center border border-neutral-100 dark:border-white/[0.06] mb-4">
                  <img
                    src={rig.caseImage}
                    alt={rig.titleRu}
                    className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <h3 className="text-base font-bold text-neutral-900 dark:text-white group-hover:text-[#09aff4] transition-colors">
                  {lang === 'uz' ? rig.titleUz : rig.titleRu}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {lang === 'uz' ? rig.taglineUz : rig.taglineRu}
                </p>

                {/* Specs List */}
                <div className="mt-4 space-y-1.5 text-xs font-mono border-t border-neutral-100 dark:border-white/[0.08] pt-3">
                  <div className="flex justify-between text-neutral-600 dark:text-slate-300">
                    <span className="text-neutral-400 dark:text-slate-500">CPU:</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{rig.cpuName}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600 dark:text-slate-300">
                    <span className="text-neutral-400 dark:text-slate-500">GPU:</span>
                    <span className="font-bold text-[#09aff4]">{rig.gpuName}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600 dark:text-slate-300">
                    <span className="text-neutral-400 dark:text-slate-500">RAM:</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{rig.ramName}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600 dark:text-slate-300">
                    <span className="text-neutral-400 dark:text-slate-500">SSD:</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{rig.ssdName}</span>
                  </div>
                </div>

                {/* Game FPS Benchmark Mini-Bars */}
                <div className="mt-4 rounded-xl bg-neutral-50 dark:bg-[#060922] p-3 border border-neutral-100 dark:border-white/[0.06] space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-neutral-400 dark:text-slate-500 block">
                    {lang === 'uz' ? 'O\'yinlarda o\'rtacha FPS:' : 'Средний FPS в играх:'}
                  </span>
                  {rig.gameFps.map((g) => (
                    <div key={g.name} className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-neutral-600 dark:text-slate-400 truncate max-w-[170px]">{g.name}</span>
                      <span className="font-bold text-emerald-400">{g.fps} FPS</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price and CTA Grid */}
              <div className="mt-5 pt-3.5 border-t border-neutral-100 dark:border-white/[0.08] space-y-2.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 dark:text-slate-500">
                    {lang === 'uz' ? 'Narxi' : 'Стоимость'}
                  </span>
                  <span className="text-base font-bold font-mono text-[#09aff4] tabular-nums">
                    {formatPriceUzs(rig.priceUzs, lang)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleLoadPresetToBuilder(rig.id)}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-[#09aff4] hover:bg-[#079ad8] py-2 px-3 text-xs font-bold text-white shadow-md shadow-[#09aff4]/20 transition-all active:scale-95"
                  >
                    <Wrench className="h-3.5 w-3.5" />
                    <span>{lang === 'uz' ? '3D da ochish' : 'В 3D Сборку'}</span>
                  </button>
                  <button
                    onClick={() => handleAddPresetToCart(rig.id)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-[#09aff4]/40 hover:border-[#09aff4] bg-transparent hover:bg-[#09aff4]/10 py-2 px-3 text-xs font-semibold text-[#09aff4] transition-all active:scale-95"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    <span>{lang === 'uz' ? 'Savatga' : 'В корзину'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* HARDWARE CATALOG SECTION WITH CATEGORIES & FILTERS                        */}
      {/* ========================================================================= */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#09aff4]/10 px-3 py-0.5 text-[10px] font-mono font-bold text-[#09aff4] border border-[#09aff4]/30">
              ORIGINAL HARDWARE WAREHOUSE
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mt-1.5 tracking-tight">
            {lang === 'uz' ? (
              <>
                Komplektatsiyalar <span className="text-[#09aff4]">Katalogi</span>
              </>
            ) : (
              <>
                Каталог <span className="text-[#09aff4]">Комплектующих</span>
              </>
            )}
          </h2>
        </div>
        <span className="text-xs font-mono text-neutral-500 dark:text-slate-400">
          {filteredProducts.length} {lang === 'uz' ? 'ta tovar mavjud' : 'товаров доступно'}
        </span>
      </div>

      {/* Category Tabs - Flex-IT Style */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-[0.98] ${
                isActive
                  ? 'bg-[#09aff4] text-white font-bold shadow-md shadow-[#09aff4]/25'
                  : 'bg-white dark:bg-[#0a1033] text-neutral-600 dark:text-slate-300 hover:text-[#09aff4] dark:hover:text-white border border-neutral-200 dark:border-[#09aff4]/15 hover:border-[#09aff4]'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-neutral-400 dark:text-[#09aff4]'}`} />
              <span>{lang === 'uz' ? cat.labelUz : cat.labelRu}</span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-8 flex flex-col sm:flex-row gap-3 items-center justify-between rounded-xl border border-neutral-200 dark:border-[#09aff4]/20 bg-white dark:bg-[#0a1033] p-3 sm:p-3.5 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400 dark:text-[#09aff4]" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 dark:border-[#09aff4]/25 bg-neutral-50 dark:bg-[#060922] py-2 pl-10 pr-3.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-slate-500 focus:border-[#09aff4] focus:outline-none transition-all font-medium"
          />
        </div>

        {/* Brand filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto py-0.5">
          {brands.map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBrand(b)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                selectedBrand === b
                  ? 'bg-[#09aff4] text-white font-bold shadow-sm shadow-[#09aff4]/25'
                  : 'text-neutral-500 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/[0.05]'
              }`}
            >
              {b === 'ALL' ? (lang === 'uz' ? 'Barchasi' : 'Все бренды') : b}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid - Flex-IT Clean Tech Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-neutral-200 dark:border-[#09aff4]/20 bg-white dark:bg-[#0a1033] p-5 space-y-4"
            >
              <div className="h-48 w-full bg-neutral-100 dark:bg-[#060922] rounded-xl animate-pulse" />
              <div className="h-3 w-20 bg-neutral-200 dark:bg-white/[0.05] rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-neutral-200 dark:bg-white/[0.05] rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-neutral-200 dark:bg-white/[0.05] rounded animate-pulse" />
              <div className="h-10 w-full bg-neutral-100 dark:bg-[#060922] rounded-xl animate-pulse mt-4" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center text-center text-neutral-500 dark:text-slate-400 rounded-2xl border border-dashed border-neutral-200 dark:border-[#09aff4]/20 bg-white dark:bg-[#0a1033]/50">
          <p className="text-sm font-semibold">{t.emptyCatalog}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const isAlreadyInBuild = parts[product.category as Category]?.id === product.id;
            const inCart = isInCart(product.id);

            // Flagship badges for standout products
            const isTopFlagship =
              product.titleRu.includes('4090') ||
              product.titleRu.includes('7800X3D') ||
              product.titleRu.includes('14700K');

            return (
              <div
                key={product.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200 dark:border-[#09aff4]/20 bg-white dark:bg-[#0a1033] hover:border-[#09aff4] transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-[#09aff4]/10"
              >
                <div>
                  {/* Clean Hardware Photo Showcase */}
                  <div className="relative h-52 w-full overflow-hidden bg-neutral-50 dark:bg-[#060922] p-6 flex items-center justify-center border-b border-neutral-100 dark:border-[#09aff4]/15">
                    <img
                      src={product.imageUrl}
                      alt={product.titleRu}
                      className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Brand Badge */}
                    <span className="absolute top-3 left-3 rounded-lg bg-white/90 dark:bg-[#0a1033] border border-neutral-200 dark:border-[#09aff4]/30 px-2.5 py-1 text-[10px] font-mono font-bold text-neutral-800 dark:text-[#09aff4] shadow-sm">
                      {product.brand}
                    </span>

                    {/* Stock Status / Flagship Badge */}
                    {isTopFlagship ? (
                      <span className="absolute top-3 right-3 text-[10px] font-bold text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
                        <Flame className="h-3 w-3 text-amber-400" />
                        <span>ТОП 2026</span>
                      </span>
                    ) : (
                      <span className="absolute top-3 right-3 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/25">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>{t.inStock}</span>
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    {/* Organized Hardware Specs */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[10px] font-mono">
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
                      {product.lengthMm && (
                        <span className="rounded border border-neutral-200 dark:border-white/[0.1] bg-neutral-100 dark:bg-[#060922] px-2 py-0.5 text-neutral-700 dark:text-slate-300">
                          {product.lengthMm} mm
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-[#09aff4] transition-colors line-clamp-2 leading-snug">
                      {lang === 'uz' ? product.titleUz : product.titleRu}
                    </h3>
                    <p className="mt-1.5 text-xs text-neutral-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {lang === 'uz' ? product.descriptionUz : product.descriptionRu}
                    </p>
                  </div>
                </div>

                {/* Footer with Price and Flex-IT Actions */}
                <div className="border-t border-neutral-100 dark:border-[#09aff4]/15 p-5 pt-4 space-y-3 bg-neutral-50/50 dark:bg-[#060922]">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] font-mono text-neutral-400 dark:text-slate-400 uppercase tracking-wider">
                      {lang === 'uz' ? 'Narx' : 'Стоимость'}
                    </span>
                    <span className="text-lg font-bold font-mono tracking-tight text-[#09aff4] tabular-nums">
                      {formatPriceUzs(product.priceUzs, lang)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Primary Button */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 text-xs font-bold transition-all duration-200 active:scale-[0.98] ${
                        inCart
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#09aff4] hover:bg-[#079ad8] text-white shadow-md shadow-[#09aff4]/20'
                      }`}
                    >
                      {inCart ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>{lang === 'uz' ? 'Savatda' : 'В корзине'}</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-3.5 w-3.5" />
                          <span>{lang === 'uz' ? 'Savatga' : 'В корзину'}</span>
                        </>
                      )}
                    </button>

                    {/* Secondary Button */}
                    <button
                      onClick={() => handleAddToBuild(product)}
                      className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 text-xs font-semibold transition-all duration-200 active:scale-[0.98] border ${
                        isAlreadyInBuild
                          ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                          : 'border-[#09aff4]/40 hover:border-[#09aff4] bg-transparent text-[#09aff4] hover:bg-[#09aff4]/10'
                      }`}
                      title={lang === 'uz' ? 'Konstruktor slotiga o\'rnatish' : 'Установить в слот сборки ПК'}
                    >
                      <Wrench className="h-3.5 w-3.5" />
                      <span>{isAlreadyInBuild ? (lang === 'uz' ? 'Yig\'mada' : 'В сборке') : (lang === 'uz' ? 'Yig\'maga' : 'В сборку')}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
