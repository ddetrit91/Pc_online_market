'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useI18n } from '@/lib/i18n';
import { useBuilder } from '@/lib/builderStore';
import { Category, ProductItem, SelectedParts } from '@/lib/types';
import { formatPriceUzs, formatWattage } from '@/lib/formatters';
import { SlotSelectorModal } from './SlotSelectorModal';
import { CompatibilityAlerts } from './CompatibilityAlerts';
import { PcBlueprint2D } from './PcBlueprint2D';
import { CheckoutModal } from './CheckoutModal';

const PcViewer3D = dynamic(
  () => import('./PcViewer3D').then((m) => m.PcViewer3D),
  {
    ssr: false,
    loading: () => (
      <div className="relative overflow-hidden h-[500px] sm:h-[620px] w-full rounded-3xl border border-blue-500/20 dark:border-indigo-500/20 bg-slate-100 dark:bg-gray-950 flex flex-col items-center justify-center gap-4 shadow-xl">
        <div className="absolute inset-0 bg-cyber-grid opacity-40 dark:opacity-20 pointer-events-none" />
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 rounded-2xl bg-blue-500/10 dark:bg-indigo-600/20 border border-blue-500/30 dark:border-indigo-500/40 flex items-center justify-center glow-indigo animate-pulse">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 z-10 text-center px-4">
          <span className="text-sm font-bold text-gray-900 dark:text-white tracking-wide">3D WebGL Configurator</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Инициализация сцены и аппаратных шейдеров корпуса...</span>
        </div>
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent pointer-events-none" />
      </div>
    ),
  }
);
import {
  Cpu,
  Layers,
  MemoryStick as RamIcon,
  Monitor,
  HardDrive,
  Zap,
  Box,
  Fan,
  Plus,
  Trash2,
  RefreshCw,
  Gamepad2,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Cuboid,
  LayoutGrid,
  FileSpreadsheet,
  Sparkles,
  Flame,
} from 'lucide-react';

interface SlotDefinition {
  category: Category;
  labelRu: string;
  labelUz: string;
  icon: React.ElementType;
  hintRu: string;
  hintUz: string;
}

const SLOTS: SlotDefinition[] = [
  {
    category: 'CPU',
    labelRu: 'Процессор',
    labelUz: 'Protsessor',
    icon: Cpu,
    hintRu: 'Сердце сборки, задает сокет и базовую частоту',
    hintUz: "Tizim yuragi, soket va asosiy chastotani belgilaydi",
  },
  {
    category: 'MOTHERBOARD',
    labelRu: 'Материнская плата',
    labelUz: 'Ona plata',
    icon: Layers,
    hintRu: 'Связывает все узлы: проверьте сокет и тип ОЗУ',
    hintUz: "Barcha qismlarni birlashtiradi: soket va xotira turini tekshiring",
  },
  {
    category: 'RAM',
    labelRu: 'Оперативная память',
    labelUz: 'Operativ xotira (RAM)',
    icon: RamIcon,
    hintRu: 'DDR4 или DDR5 в двухканальном режиме',
    hintUz: "Ikki kanalli rejimdagi DDR4 yoki DDR5 xotirasi",
  },
  {
    category: 'GPU',
    labelRu: 'Видеокарта',
    labelUz: 'Videokarta',
    icon: Monitor,
    hintRu: 'Главный компонент для высокого FPS в играх',
    hintUz: "O'yinlarda yuqori FPS olish uchun asosiy komponent",
  },
  {
    category: 'STORAGE',
    labelRu: 'Накопитель (SSD)',
    labelUz: 'SSD xotira',
    icon: HardDrive,
    hintRu: 'Сверхбыстрый NVMe M.2 для моментальных загрузок',
    hintUz: "Tezkor yuklashlar uchun NVMe M.2 diski",
  },
  {
    category: 'COOLER',
    labelRu: 'Кулер для процессора',
    labelUz: 'Protsessor kuleri',
    icon: Fan,
    hintRu: 'Воздушный кулер или водяное охлаждение СЖО',
    hintUz: "Havo yoki suv sovutish tizimi",
  },
  {
    category: 'PSU',
    labelRu: 'Блок питания',
    labelUz: 'Quvvat bloki (BP)',
    icon: Zap,
    hintRu: 'Надежное питание с запасом от 25%',
    hintUz: "Kamida 25% quvvat zaxirasiga ega ishonchli blok",
  },
  {
    category: 'CASE',
    labelRu: 'Корпус',
    labelUz: 'Tizim korpusi',
    icon: Box,
    hintRu: 'Вместимость под видеокарту и продуваемость',
    hintUz: "Videokarta sig'imi va yaxshi shamollatish",
  },
];

export const BuilderView: React.FC = () => {
  const { lang, t } = useI18n();
  const { parts, selectPart, removePart, clearBuild, loadPresetBuild, totalPrice, report, partsCount } = useBuilder();
  const [activeSlot, setActiveSlot] = useState<Category | null>(null);
  const [visualMode, setVisualMode] = useState<'3d' | '2d' | 'off'>('3d');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [loadingPreset, setLoadingPreset] = useState<string | null>(null);

  const handleLoadPreset = async (preset: 'apex' | 'pro' | 'sport') => {
    setLoadingPreset(preset);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      const prods: ProductItem[] = Array.isArray(data) ? data : [];
      const presetMap: SelectedParts = {};

      if (preset === 'apex') {
        presetMap.GPU = prods.find((p) => p.category === 'GPU' && p.titleRu.includes('4090')) || null;
        presetMap.CPU = prods.find((p) => p.category === 'CPU' && p.titleRu.includes('14700K')) || null;
        presetMap.COOLER = prods.find((p) => p.category === 'COOLER' && p.titleRu.includes('Kraken Elite')) || null;
        presetMap.MOTHERBOARD = prods.find((p) => p.category === 'MOTHERBOARD' && p.titleRu.includes('TOMAHAWK')) || null;
        presetMap.RAM = prods.find((p) => p.category === 'RAM' && p.titleRu.includes('Trident Z5')) || null;
        presetMap.STORAGE = prods.find((p) => p.category === 'STORAGE' && p.titleRu.includes('990 PRO')) || null;
        presetMap.PSU = prods.find((p) => p.category === 'PSU' && p.titleRu.includes('Vertex GX-1000')) || null;
        presetMap.CASE = prods.find((p) => p.category === 'CASE' && p.titleRu.includes('Lian Li')) || null;
      } else if (preset === 'pro') {
        presetMap.GPU = prods.find((p) => p.category === 'GPU' && p.titleRu.includes('4070 Ti')) || null;
        presetMap.CPU = prods.find((p) => p.category === 'CPU' && p.titleRu.includes('7600X')) || null;
        presetMap.COOLER = prods.find((p) => p.category === 'COOLER' && p.titleRu.includes('AK620')) || null;
        presetMap.MOTHERBOARD = prods.find((p) => p.category === 'MOTHERBOARD' && p.titleRu.includes('B650M-A')) || null;
        presetMap.RAM = prods.find((p) => p.category === 'RAM' && p.titleRu.includes('Kingston FURY Beast Black 32GB')) || null;
        presetMap.STORAGE = prods.find((p) => p.category === 'STORAGE' && p.titleRu.includes('KC3000')) || null;
        presetMap.PSU = prods.find((p) => p.category === 'PSU' && p.titleRu.includes('PQ850M')) || null;
        presetMap.CASE = prods.find((p) => p.category === 'CASE' && p.titleRu.includes('NZXT H5 Flow')) || null;
      } else {
        presetMap.GPU = prods.find((p) => p.category === 'GPU' && p.titleRu.includes('4060 Ti')) || null;
        presetMap.CPU = prods.find((p) => p.category === 'CPU' && p.titleRu.includes('13400F')) || null;
        presetMap.COOLER = prods.find((p) => p.category === 'COOLER' && p.titleRu.includes('Thermalright')) || null;
        presetMap.MOTHERBOARD = prods.find((p) => p.category === 'MOTHERBOARD' && p.titleRu.includes('B760M-K D4')) || null;
        presetMap.RAM = prods.find((p) => p.category === 'RAM' && p.titleRu.includes('Vengeance LPX')) || null;
        presetMap.STORAGE = prods.find((p) => p.category === 'STORAGE' && p.titleRu.includes('NV2')) || null;
        presetMap.PSU = prods.find((p) => p.category === 'PSU' && p.titleRu.includes('RM750e')) || null;
        presetMap.CASE = prods.find((p) => p.category === 'CASE' && p.titleRu.includes('CC560')) || null;
      }

      loadPresetBuild(presetMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPreset(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Top Title Banner - Flex-IT Tech Solutions Header */}
      <div className="relative mb-8 overflow-hidden rounded-2xl border border-neutral-200 dark:border-[#09aff4]/20 bg-white dark:bg-[#0a1033] p-7 sm:p-10 shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="rounded-full bg-[#09aff4]/10 px-3.5 py-1 text-xs font-mono font-bold text-[#09aff4] border border-[#09aff4]/30 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#09aff4] animate-pulse" />
                PC BUILDER • FLEX-IT ARCHITECTURE
              </span>
              <span className="text-xs font-mono font-medium text-slate-400">
                {partsCount} / 8 {lang === 'uz' ? 'detal tanlandi' : 'деталей выбрано'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold text-neutral-900 dark:text-white mt-3 tracking-tight">
              {lang === 'uz' ? (
                <>
                  3D Kompyuter <span className="text-[#09aff4]">Konstruktori</span>
                </>
              ) : (
                <>
                  Интерактивный <span className="text-[#09aff4]">3D Конфигуратор</span>
                </>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-neutral-500 dark:text-slate-300 mt-2 max-w-xl leading-relaxed">
              {lang === 'uz'
                ? "Har bir qismni o'zingiz tanlang, 3D yoki 2D sxemada ko'ring va avtomatik moslikni tekshiring."
                : 'Собирайте компьютер компонент за компонентом, настраивайте комплектацию в 3D и проверяйте сокеты и энергопотребление.'}
            </p>
          </div>

          {/* View Mode Switcher: 3D Model / 2D Schematic / List */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center bg-neutral-100 dark:bg-[#060922] border border-neutral-200 dark:border-[#09aff4]/25 rounded-xl p-1 text-xs font-semibold shadow-inner">
              <button
                onClick={() => setVisualMode('3d')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all duration-200 active:scale-95 ${
                  visualMode === '3d'
                    ? 'bg-[#09aff4] text-white font-bold shadow-md shadow-[#09aff4]/30'
                    : 'text-neutral-600 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Cuboid className="h-4 w-4" />
                <span>{lang === 'uz' ? '3D Ko\'rinish' : '3D Модель'}</span>
              </button>
              <button
                onClick={() => setVisualMode('2d')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all duration-200 active:scale-95 ${
                  visualMode === '2d'
                    ? 'bg-[#09aff4] text-white font-bold shadow-md shadow-[#09aff4]/30'
                    : 'text-neutral-600 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                <span>{lang === 'uz' ? '2D Sxema' : '2D Чертеж'}</span>
              </button>
              <button
                onClick={() => setVisualMode('off')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all duration-200 active:scale-95 ${
                  visualMode === 'off'
                    ? 'bg-[#09aff4] text-white font-bold shadow-md shadow-[#09aff4]/30'
                    : 'text-neutral-600 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>{lang === 'uz' ? 'Ro\'yxat' : 'Список'}</span>
              </button>
            </div>

            {partsCount > 0 && (
              <button
                onClick={clearBuild}
                className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 px-4 py-2 text-xs font-semibold transition-all shadow-sm active:scale-95"
              >
                <Trash2 className="h-4 w-4" />
                <span>{t.resetBuild}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Start with Flagship Presets when builder is empty */}
      {partsCount === 0 && (
        <div className="mb-8 rounded-2xl border border-neutral-200 dark:border-[#09aff4]/30 bg-neutral-100/80 dark:bg-gradient-to-r dark:from-[#0a1033] dark:via-[#0d1857] dark:to-[#0a1033] p-5 sm:p-6 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-[#09aff4]/20 border border-[#09aff4]/40 flex items-center justify-center text-[#09aff4] shrink-0">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <span>{lang === 'uz' ? 'Tayyor yig\'madan tez boshlash' : 'Быстрый старт с готовой конфигурации'}</span>
                <span className="rounded bg-[#09aff4]/20 border border-[#09aff4]/40 px-1.5 py-0.5 text-[10px] font-mono text-[#09aff4]">1-CLICK</span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-slate-300 mt-0.5">
                {lang === 'uz'
                  ? 'Qulay boshlash uchun sozlangan tizimni tanlang va har bir detalni almashtiring'
                  : 'Загрузите проверенную сбалансированную сборку и свободно заменяйте любые детали'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => handleLoadPreset('apex')}
              disabled={loadingPreset !== null}
              className="flex items-center gap-1.5 rounded-xl bg-[#09aff4] hover:bg-[#079ad8] px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-[#09aff4]/25 transition-all active:scale-95"
            >
              <Flame className="h-3.5 w-3.5 text-amber-300" />
              <span>Apex 4K (4090)</span>
            </button>
            <button
              onClick={() => handleLoadPreset('pro')}
              disabled={loadingPreset !== null}
              className="flex items-center gap-1.5 rounded-xl border border-[#09aff4]/40 hover:border-[#09aff4] bg-white dark:bg-[#060922] text-[#09aff4] px-3.5 py-2 text-xs font-bold transition-all active:scale-95 shadow-sm"
            >
              <span>Pro 2K (4070 Ti)</span>
            </button>
            <button
              onClick={() => handleLoadPreset('sport')}
              disabled={loadingPreset !== null}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-300 dark:border-white/[0.15] bg-white dark:bg-[#060922] text-neutral-700 dark:text-slate-200 px-3.5 py-2 text-xs font-bold transition-all active:scale-95 shadow-sm"
            >
              <span>CyberSport (4060 Ti)</span>
            </button>
          </div>
        </div>
      )}

      {/* Visual Workspace: 3D Model or 2D Blueprint */}
      {visualMode === '3d' && (
        <div className="mb-8">
          <PcViewer3D onSelectSlot={(category) => setActiveSlot(category as Category)} />
        </div>
      )}

      {visualMode === '2d' && (
        <div className="mb-8">
          <PcBlueprint2D onSelectSlot={(category) => setActiveSlot(category)} />
        </div>
      )}

      {/* Main Builder Grid: Slots & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 8 Slots List */}
        <div className="lg:col-span-8 space-y-4">
          {SLOTS.map((slot) => {
            const Icon = slot.icon;
            const item = parts[slot.category];

            return (
              <div
                key={slot.category}
                className={`relative rounded-xl border transition-all duration-200 ${
                  item
                    ? 'border-neutral-200 dark:border-[#09aff4]/25 bg-white dark:bg-[#0a1033] shadow-md hover:border-[#09aff4]/50'
                    : 'border-dashed border-neutral-300 dark:border-[#09aff4]/20 hover:border-[#09aff4]/50 bg-neutral-50/50 dark:bg-[#000531]/40'
                }`}
              >
                {item ? (
                  // Slot with selected item - Solid Dark Navy, Crisp Legible Text
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5">
                    <div className="flex items-start gap-4">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-neutral-200 dark:border-[#09aff4]/25 bg-white dark:bg-[#060922] p-1.5 flex items-center justify-center shadow-inner">
                        <img
                          src={item.imageUrl}
                          alt={item.titleRu}
                          className="h-full w-full object-contain"
                        />
                        <div className="absolute top-1 left-1 rounded bg-[#09aff4]/20 p-0.5 border border-[#09aff4]/40">
                          <Icon className="h-3 w-3 text-[#09aff4]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                          <span className="font-bold uppercase tracking-wider text-[#09aff4]">
                            {lang === 'uz' ? slot.labelUz : slot.labelRu}
                          </span>
                          <span className="text-neutral-400 dark:text-slate-600">•</span>
                          <span className="text-neutral-700 dark:text-slate-300 font-bold">
                            {item.brand}
                          </span>
                          {item.socket && (
                            <span className="rounded-md border border-[#09aff4]/30 bg-[#0d1857] px-2 py-0.5 text-[#09aff4] font-bold">
                              {item.socket}
                            </span>
                          )}
                          {item.memoryType && (
                            <span className="rounded-md border border-[#09aff4]/30 bg-[#0d1857] px-2 py-0.5 text-[#09aff4] font-bold">
                              {item.memoryType}
                            </span>
                          )}
                          {item.tdp && (
                            <span className="rounded-md border border-neutral-200 dark:border-white/[0.1] bg-neutral-100 dark:bg-[#060922] px-2 py-0.5 text-neutral-700 dark:text-slate-300">
                              {item.tdp}W
                            </span>
                          )}
                          {item.wattage && (
                            <span className="rounded-md border border-neutral-200 dark:border-white/[0.1] bg-neutral-100 dark:bg-[#060922] px-2 py-0.5 text-neutral-700 dark:text-slate-300">
                              {item.wattage}W
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-neutral-900 dark:text-white mt-1.5 leading-snug">
                          {lang === 'uz' ? item.titleUz : item.titleRu}
                        </h3>

                        <div className="text-xs font-bold font-mono text-[#09aff4] mt-1 sm:hidden">
                          {formatPriceUzs(item.priceUzs, lang)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2.5 shrink-0 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-[#09aff4]/15">
                      <span className="hidden sm:block text-base font-bold font-mono text-[#09aff4] tabular-nums">
                        {formatPriceUzs(item.priceUzs, lang)}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveSlot(slot.category)}
                          className="flex items-center gap-1.5 rounded-xl border border-[#09aff4]/40 hover:border-[#09aff4] bg-transparent hover:bg-[#09aff4]/10 px-3.5 py-1.5 text-xs font-semibold text-[#09aff4] transition-all shadow-sm active:scale-95"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span>{t.changePart}</span>
                        </button>
                        <button
                          onClick={() => removePart(slot.category)}
                          className="rounded-xl border border-neutral-200 dark:border-rose-500/30 bg-transparent hover:bg-rose-500/10 p-2 text-neutral-400 hover:text-rose-400 transition-all shadow-sm active:scale-95"
                          title={t.removeFromBuild}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Empty slot placeholder
                  <div
                    onClick={() => setActiveSlot(slot.category)}
                    className="group flex cursor-pointer items-center justify-between p-4 sm:p-5 hover:bg-neutral-100/50 dark:hover:bg-[#0d1857]/30 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-200 dark:border-[#09aff4]/25 bg-neutral-100 dark:bg-[#060922] group-hover:border-[#09aff4] transition-all">
                        <Icon className="h-5 w-5 text-neutral-400 dark:text-[#09aff4]/70 group-hover:text-[#09aff4] transition-colors" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-neutral-800 dark:text-white group-hover:text-[#09aff4] transition-colors">
                          {lang === 'uz' ? slot.labelUz : slot.labelRu}
                        </h4>
                        <p className="text-xs text-neutral-500 dark:text-slate-400 mt-0.5">
                          {lang === 'uz' ? slot.hintUz : slot.hintRu}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSlot(slot.category);
                      }}
                      className="flex items-center gap-1.5 rounded-xl bg-[#09aff4] hover:bg-[#079ad8] text-white px-4 py-2 text-xs font-bold transition-all active:scale-95 shadow-md shadow-[#09aff4]/20"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>{t.choosePart}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Sticky Summary & Compatibility - Solid Flex-IT Card */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          {/* Main Price Card */}
          <div className="rounded-2xl border border-neutral-200 dark:border-[#09aff4]/25 bg-white dark:bg-[#0a1033] p-6 shadow-xl">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-slate-400">
              {t.totalPrice}
            </h3>
            <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#09aff4] tabular-nums">
              {formatPriceUzs(totalPrice, lang)}
            </div>

            <div className="mt-5 space-y-2.5 border-t border-neutral-100 dark:border-[#09aff4]/15 pt-4 text-xs font-mono">
              <div className="flex justify-between text-neutral-500 dark:text-slate-400">
                <span>{lang === 'uz' ? 'Tanlangan qismlar:' : 'Выбрано компонентов:'}</span>
                <span className="font-bold text-neutral-900 dark:text-white">{partsCount} / 8</span>
              </div>
              <div className="flex justify-between text-neutral-500 dark:text-slate-400">
                <span>{lang === 'uz' ? 'Umumiy TDP:' : 'Расчетное энергопотребление:'}</span>
                <span className="font-bold text-[#09aff4]">~{formatWattage(report.totalTdp)}</span>
              </div>
            </div>

            {/* Quick FPS preview CTA - Flex-IT Unified Colors */}
            <div className="mt-6 rounded-xl border border-[#09aff4]/25 bg-[#0d1857]/50 p-4 text-xs text-slate-200">
              <div className="flex items-center gap-2 font-bold text-[#09aff4] mb-1">
                <Gamepad2 className="h-4 w-4" />
                <span>{lang === 'uz' ? 'FPS hisoblash tayyor' : 'Тест FPS в 20 играх'}</span>
              </div>
              <p className="text-[11px] text-slate-300">
                {lang === 'uz'
                  ? "Ushbu yig'mada og'ir o'yinlar qanday ishlashini tekshiring."
                  : 'Посмотрите расчетный FPS вашей сборки в самых тяжелых играх.'}
              </p>
              <Link
                href="/fps"
                className="mt-3.5 flex items-center justify-between rounded-xl border border-[#09aff4]/40 hover:border-[#09aff4] bg-[#09aff4]/10 hover:bg-[#09aff4] text-[#09aff4] hover:text-white px-4 py-2.5 text-xs font-bold transition-all duration-200"
              >
                <span>{lang === 'uz' ? "O'yinlar testiga o'tish" : 'Смотреть FPS в играх'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Order action button - Flex-IT Primary Solid Button */}
            <button
              onClick={() => setIsCheckoutOpen(true)}
              disabled={partsCount === 0 || !report.isCompatible}
              className={`mt-5 w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 ${
                partsCount === 0 || !report.isCompatible
                  ? 'bg-neutral-200 dark:bg-[#060922] text-neutral-400 dark:text-slate-600 border border-neutral-300 dark:border-white/[0.08] cursor-not-allowed'
                  : 'bg-[#09aff4] hover:bg-[#079ad8] text-white shadow-lg shadow-[#09aff4]/30 cursor-pointer'
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>{t.orderNow}</span>
            </button>
            {!report.isCompatible && partsCount > 0 && (
              <p className="text-center text-[11px] text-rose-500 dark:text-rose-400 mt-2 font-medium">
                {lang === 'uz'
                  ? 'Buyurtma uchun avval mos kelmasliklarni to\'g\'irlang'
                  : 'Для оформления устраните несовместимости компонентов'}
              </p>
            )}
          </div>

          {/* Compatibility Details Box */}
          <div className="rounded-2xl border border-neutral-200 dark:border-[#09aff4]/25 bg-white dark:bg-[#0a1033] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="h-5 w-5 text-[#09aff4]" />
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                {t.compatibilityStatus}
              </h4>
            </div>
            <CompatibilityAlerts report={report} partsCount={partsCount} />
          </div>
        </div>
      </div>

      {/* Modal for Slot Selection */}
      {activeSlot && (
        <SlotSelectorModal
          isOpen={!!activeSlot}
          onClose={() => setActiveSlot(null)}
          category={activeSlot}
          currentParts={parts}
          onSelect={(product) => selectPart(activeSlot, product)}
        />
      )}

      {/* Modal for Order Checkout & Telegram receipt */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </div>
  );
};
