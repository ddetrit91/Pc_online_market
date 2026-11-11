'use client';

import React from 'react';
import { useBuilder } from '@/lib/builderStore';
import { useI18n } from '@/lib/i18n';
import { Category } from '@/lib/types';
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
  Wind,
  Plus,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  onSelectSlot: (category: Category) => void;
}

export const PcBlueprint2D: React.FC<Props> = ({ onSelectSlot }) => {
  const { parts } = useBuilder();
  const { lang } = useI18n();

  return (
    <div className="relative rounded-3xl border border-gray-800 bg-gray-950 p-6 shadow-2xl overflow-hidden">
      {/* Blueprint Grid Background */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #3b82f6 1px, transparent 1px), linear-gradient(to bottom, #3b82f6 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Header bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-4 mb-6">
        <div>
          <span className="rounded-md bg-blue-500/10 px-2.5 py-1 text-[11px] font-bold text-blue-400 border border-blue-500/20">
            2D SCHEMATIC / ЧЕРТЕЖ КОРПУСА
          </span>
          <h3 className="text-lg font-bold text-white mt-1">
            {lang === 'uz' ? 'Korpusning 2D texnik sxemasi' : 'Интерактивная 2D-схема сборки'}
          </h3>
          <p className="text-xs text-gray-400">
            {lang === 'uz'
              ? 'Slot ustiga bosib qismni tanlang yoki xususiyatlarini ko\'ring'
              : 'Кликните по любому узлу на схеме для быстрого выбора детали'}
          </p>
        </div>

        {/* Airflow Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-blue-400">
            <Wind className="h-4 w-4" />
            <span>{lang === 'uz' ? 'Sovuq havo kirishi' : 'Впуск холодного воздуха'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400">
            <Wind className="h-4 w-4 rotate-180" />
            <span>{lang === 'uz' ? 'Issiq havo chiqishi' : 'Выдув горячего воздуха'}</span>
          </div>
        </div>
      </div>

      {/* 2D Cutaway Chassis Blueprint Container */}
      <div className="relative z-10 mx-auto max-w-4xl border-2 border-dashed border-blue-500/40 rounded-2xl bg-gray-900/60 p-6 sm:p-8 backdrop-blur-sm">
        {/* Chassis Dimensions Overlay */}
        <div className="absolute top-2 left-4 text-[10px] font-mono text-blue-400/80">
          DIMENSIONS: 460mm (L) × 210mm (W) × 485mm (H)
        </div>

        {/* Top Fan / Radiator Exhaust Area */}
        <div className="mb-4 flex items-center justify-between rounded-xl border border-gray-800 bg-gray-950/70 p-3">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
            <Fan className="h-4 w-4 text-rose-400" />
            <span>TOP EXHAUST (240mm / 360mm)</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-rose-400 font-mono">
            <span>▲ ▲ ▲ {lang === 'uz' ? 'Issiqlik chiqishi' : 'Выход тепла'}</span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Main Internal Compartment (cols 1-9) */}
          <div className="col-span-12 md:col-span-9 space-y-4">
            {/* Motherboard & CPU Area */}
            <div className="relative rounded-2xl border-2 border-blue-500/30 bg-blue-950/20 p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-blue-400 flex items-center gap-1.5">
                  <Layers className="h-4 w-4" />
                  <span>MOTHERBOARD TRAY (ATX / mATX)</span>
                </span>
                <button
                  onClick={() => onSelectSlot('MOTHERBOARD')}
                  className="rounded-lg bg-blue-600/20 hover:bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-blue-300 hover:text-white transition-all border border-blue-500/40"
                >
                  {parts.MOTHERBOARD ? parts.MOTHERBOARD.brand : `+ ${lang === 'uz' ? 'Plata' : 'Плата'}`}
                </button>
              </div>

              {/* Inside Motherboard: CPU + Cooler + RAM in 2D */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* CPU & Cooler Socket */}
                <div
                  onClick={() => onSelectSlot('CPU')}
                  className={`cursor-pointer rounded-xl border p-4 transition-all hover:scale-[1.02] ${
                    parts.CPU
                      ? 'border-emerald-500/50 bg-emerald-950/30'
                      : 'border-dashed border-gray-700 bg-gray-900/60 hover:border-blue-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1">
                      <Cpu className="h-3.5 w-3.5 text-blue-400" />
                      <span>CPU SOCKET</span>
                    </span>
                    {parts.CPU?.socket && (
                      <span className="text-[10px] font-mono bg-blue-600/30 px-1.5 py-0.5 rounded text-blue-300">
                        {parts.CPU.socket}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-xs font-bold text-white truncate">
                    {parts.CPU ? (lang === 'uz' ? parts.CPU.titleUz : parts.CPU.titleRu) : `+ ${lang === 'uz' ? 'Protsessor qo\'shish' : 'Выбрать CPU'}`}
                  </div>

                  {/* Cooler Attachment */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSlot('COOLER');
                    }}
                    className="mt-3 pt-2 border-t border-gray-800 flex items-center justify-between text-[11px]"
                  >
                    <span className="text-gray-400 flex items-center gap-1">
                      <Fan className="h-3 w-3 text-cyan-400" />
                      <span>COOLER:</span>
                    </span>
                    <span className="font-semibold text-cyan-300 truncate max-w-[120px]">
                      {parts.COOLER ? parts.COOLER.brand : '+ Кулер'}
                    </span>
                  </div>
                </div>

                {/* RAM Slots */}
                <div
                  onClick={() => onSelectSlot('RAM')}
                  className={`cursor-pointer rounded-xl border p-4 transition-all hover:scale-[1.02] ${
                    parts.RAM
                      ? 'border-purple-500/50 bg-purple-950/30'
                      : 'border-dashed border-gray-700 bg-gray-900/60 hover:border-purple-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1">
                      <RamIcon className="h-3.5 w-3.5 text-purple-400" />
                      <span>DIMM SLOTS</span>
                    </span>
                    {parts.RAM?.memoryType && (
                      <span className="text-[10px] font-mono bg-purple-600/30 px-1.5 py-0.5 rounded text-purple-300">
                        {parts.RAM.memoryType}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-xs font-bold text-white truncate">
                    {parts.RAM ? (lang === 'uz' ? parts.RAM.titleUz : parts.RAM.titleRu) : `+ ${lang === 'uz' ? 'RAM tanlash' : 'Выбрать ОЗУ'}`}
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-800 text-[11px] text-gray-400 flex justify-between">
                    <span>{lang === 'uz' ? 'Kanallar:' : 'Каналы:'}</span>
                    <span className="text-purple-300 font-semibold">Dual Channel (2/4)</span>
                  </div>
                </div>
              </div>

              {/* M.2 SSD Slot */}
              <div
                onClick={() => onSelectSlot('STORAGE')}
                className={`mt-4 cursor-pointer rounded-xl border p-3 flex items-center justify-between transition-all hover:scale-[1.01] ${
                  parts.STORAGE
                    ? 'border-blue-500/50 bg-blue-950/30'
                    : 'border-dashed border-gray-700 bg-gray-900/40 hover:border-blue-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold text-gray-300">
                    {parts.STORAGE ? (lang === 'uz' ? parts.STORAGE.titleUz : parts.STORAGE.titleRu) : 'M.2 NVMe PCIe 4.0 SSD Slot'}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-emerald-400">
                  {parts.STORAGE ? formatPriceUzs(parts.STORAGE.priceUzs, lang) : `+ ${lang === 'uz' ? 'SSD qo\'shish' : 'Выбрать SSD'}`}
                </span>
              </div>
            </div>

            {/* GPU PCIe x16 Slot */}
            <div
              onClick={() => onSelectSlot('GPU')}
              className={`cursor-pointer rounded-2xl border-2 p-5 transition-all hover:scale-[1.01] ${
                parts.GPU
                  ? 'border-indigo-500/60 bg-indigo-950/30'
                  : 'border-dashed border-gray-700 bg-gray-900/60 hover:border-indigo-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1.5">
                  <Monitor className="h-4 w-4" />
                  <span>PCIe 4.0/5.0 x16 GRAPHICS CARD SLOT</span>
                </span>
                {parts.GPU?.lengthMm && (
                  <span className="text-[10px] font-mono bg-indigo-600/30 px-2 py-0.5 rounded text-indigo-300">
                    {lang === 'uz' ? 'Uzunlik:' : 'Длина:'} {parts.GPU.lengthMm} mm
                  </span>
                )}
              </div>
              <div className="mt-2 text-sm font-bold text-white">
                {parts.GPU ? (lang === 'uz' ? parts.GPU.titleUz : parts.GPU.titleRu) : `+ ${lang === 'uz' ? 'Videokarta o\'rnatish' : 'Выбрать видеокарту'}`}
              </div>
              {parts.GPU && (
                <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                  <span>TDP: <strong className="text-yellow-400">{parts.GPU.tdp}W</strong></span>
                  <span>•</span>
                  <span>{formatPriceUzs(parts.GPU.priceUzs, lang)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Front Intake Fans & Storage Bays (cols 10-12) */}
          <div className="col-span-12 md:col-span-3 flex flex-col justify-between gap-3 rounded-2xl border-2 border-blue-500/20 bg-blue-950/10 p-4">
            <div className="text-center">
              <span className="text-[10px] font-mono font-bold text-blue-400 block">
                FRONT INTAKE
              </span>
              <span className="text-[10px] text-gray-400">3x 120mm / 2x 140mm</span>
            </div>

            {/* 3 Front Intake Fans */}
            <div className="space-y-3 my-2">
              {[1, 2, 3].map((f) => (
                <div
                  key={f}
                  className="flex items-center justify-between rounded-xl border border-blue-500/30 bg-gray-950 p-2.5 text-xs text-blue-300"
                >
                  <Fan className="h-4 w-4 animate-spin text-blue-400" style={{ animationDuration: '6s' }} />
                  <span className="font-mono text-[11px]">FAN #{f} ARGB</span>
                  <Wind className="h-3.5 w-3.5 text-blue-400" />
                </div>
              ))}
            </div>

            {/* Case Selection button */}
            <button
              onClick={() => onSelectSlot('CASE')}
              className="w-full rounded-xl border border-gray-700 bg-gray-900/90 py-2.5 text-xs font-bold text-gray-200 hover:border-blue-500 hover:text-white transition-all flex items-center justify-center gap-1.5"
            >
              <Box className="h-3.5 w-3.5 text-blue-400" />
              <span className="truncate">{parts.CASE ? parts.CASE.brand : (lang === 'uz' ? 'Korpus' : 'Корпус')}</span>
            </button>
          </div>
        </div>

        {/* Bottom Isolated PSU Shroud Compartment */}
        <div
          onClick={() => onSelectSlot('PSU')}
          className={`mt-4 cursor-pointer rounded-2xl border-2 p-4 transition-all hover:scale-[1.01] ${
            parts.PSU
              ? 'border-emerald-500/50 bg-emerald-950/30'
              : 'border-dashed border-gray-700 bg-gray-950 hover:border-emerald-500'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              <div>
                <span className="text-xs font-mono font-bold text-gray-400 block">
                  BOTTOM PSU SHROUD (ATX POWER CHAMBER)
                </span>
                <span className="text-sm font-bold text-white">
                  {parts.PSU ? (lang === 'uz' ? parts.PSU.titleUz : parts.PSU.titleRu) : `+ ${lang === 'uz' ? 'Quvvat blokini tanlash' : 'Выбрать блок питания'}`}
                </span>
              </div>
            </div>
            {parts.PSU?.wattage && (
              <span className="rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30 self-start sm:self-auto">
                {parts.PSU.wattage} W ({parts.PSU.efficiencyRating || 'Gold'})
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
