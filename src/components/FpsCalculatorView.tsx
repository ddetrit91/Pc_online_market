'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { useBuilder } from '@/lib/builderStore';
import { GameItem, GraphicPreset, Resolution } from '@/lib/types';
import { calculateAllGamesFps } from '@/lib/fpsCalculator';
import {
  Gamepad2,
  Tv,
  Sliders,
  Cpu,
  Monitor,
  Flame,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

export const FpsCalculatorView: React.FC = () => {
  const { lang, t } = useI18n();
  const { parts } = useBuilder();
  const [games, setGames] = useState<GameItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState<GraphicPreset>('high');
  const [resolution, setResolution] = useState<Resolution>('1080p');

  useEffect(() => {
    fetch('/api/games')
      .then((res) => res.json())
      .then((data) => {
        setGames(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const fpsResults = calculateAllGamesFps(games, parts, preset, resolution);

  const cpuSelected = parts.CPU;
  const gpuSelected = parts.GPU;

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Top Banner - Flex-IT Telemetry Header */}
      <div className="relative mb-10 overflow-hidden rounded-2xl border border-neutral-200 dark:border-[#09aff4]/25 bg-white dark:bg-[#0a1033] text-neutral-900 dark:text-white p-7 sm:p-10 shadow-xl">
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#09aff4]/10 px-3.5 py-1 text-xs font-mono font-bold text-[#09aff4] border border-[#09aff4]/30 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#09aff4] animate-pulse" />
              {lang === 'uz' ? "20 TA OG'IR O'YINLAR TELEMETRIYASI" : 'ТЕЛЕМЕТРИЯ 20 ТЯЖЕЛЫХ ИГР'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold text-neutral-900 dark:text-white mt-3 tracking-tight">
            {lang === 'uz' ? (
              <>
                FPS va <span className="text-[#09aff4]">Ishlash Tezligi</span>
              </>
            ) : (
              <>
                Калькулятор <span className="text-[#09aff4]">FPS и Нагрузки</span>
              </>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-slate-300 mt-2 max-w-2xl leading-relaxed">
            {t.heavyGamesNote}
          </p>

          {/* Current Active Hardware Status Bar - Flex-IT Modules */}
          <div className="mt-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl border border-neutral-200 dark:border-[#09aff4]/20 bg-neutral-50 dark:bg-[#060922] p-4 sm:p-5 shadow-inner">
            <div className="flex flex-wrap items-center gap-6 sm:gap-10 text-xs font-mono">
              {/* CPU Module */}
              <div className="flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-[#09aff4]/10 border border-[#09aff4]/30 flex items-center justify-center">
                  <Cpu className="h-5 w-5 text-[#09aff4]" />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 dark:text-[#09aff4] uppercase tracking-wider font-bold block">
                    {lang === 'uz' ? 'Protsessor' : 'Процессор'}
                  </span>
                  <span className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm">
                    {cpuSelected ? (lang === 'uz' ? cpuSelected.titleUz : cpuSelected.titleRu) : (
                      <span className="text-neutral-400 dark:text-slate-400 italic">
                        {lang === 'uz' ? 'Standart (Ryzen 5 / Core i5)' : 'По умолчанию (Ryzen 5 / Core i5)'}
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* GPU Module */}
              <div className="flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-[#09aff4]/10 border border-[#09aff4]/30 flex items-center justify-center">
                  <Monitor className="h-5 w-5 text-[#09aff4]" />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 dark:text-[#09aff4] uppercase tracking-wider font-bold block">
                    {lang === 'uz' ? 'Videokarta' : 'Видеокарта'}
                  </span>
                  <span className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm">
                    {gpuSelected ? (lang === 'uz' ? gpuSelected.titleUz : gpuSelected.titleRu) : (
                      <span className="text-neutral-400 dark:text-slate-400 italic">
                        {lang === 'uz' ? 'Standart (RTX 4060 Ti)' : 'По умолчанию (RTX 4060 Ti)'}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/builder"
              className="flex items-center gap-2 rounded-xl bg-[#09aff4] hover:bg-[#079ad8] text-white font-bold px-4 py-2.5 text-xs transition-all shadow-md shadow-[#09aff4]/25 active:scale-95 self-start lg:self-auto shrink-0"
            >
              <Wrench className="h-4 w-4" />
              <span>{lang === 'uz' ? "Yig'mani o'zgartirish" : 'Изменить сборку в конструкторе'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Control Switchers: Presets & Resolutions */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-neutral-200 dark:border-[#09aff4]/20 bg-white dark:bg-[#0a1033] p-3.5 sm:p-4 shadow-sm">
        {/* Preset Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-[#09aff4] mr-2 flex items-center gap-1.5">
            <Sliders className="h-4 w-4 text-[#09aff4]" />
            {t.preset}:
          </span>
          <div className="grid grid-cols-4 gap-1.5 bg-neutral-100 dark:bg-[#060922] p-1.5 rounded-xl border border-neutral-200 dark:border-[#09aff4]/20">
            {(['low', 'medium', 'high', 'ultra'] as GraphicPreset[]).map((p) => (
              <button
                key={p}
                onClick={() => setPreset(p)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all active:scale-[0.98] ${
                  preset === p
                    ? 'bg-[#09aff4] text-white font-bold shadow-sm shadow-[#09aff4]/30'
                    : 'text-neutral-600 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {t[p]}
              </button>
            ))}
          </div>
        </div>

        {/* Resolution Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-[#09aff4] mr-2 flex items-center gap-1.5">
            <Tv className="h-4 w-4 text-[#09aff4]" />
            {t.resolution}:
          </span>
          <div className="grid grid-cols-3 gap-1.5 bg-neutral-100 dark:bg-[#060922] p-1.5 rounded-xl border border-neutral-200 dark:border-[#09aff4]/20">
            {(['1080p', '1440p', '4k'] as Resolution[]).map((r) => (
              <button
                key={r}
                onClick={() => setResolution(r)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all active:scale-[0.98] ${
                  resolution === r
                    ? 'bg-[#09aff4] text-white font-bold shadow-sm shadow-[#09aff4]/30'
                    : 'text-neutral-600 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {r === '1080p' ? 'Full HD' : r === '1440p' ? '2K QHD' : '4K UHD'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 20 Games Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-neutral-200 dark:border-[#09aff4]/20 bg-white dark:bg-[#0a1033] p-4 space-y-3"
            >
              <div className="aspect-[16/9] w-full bg-neutral-100 dark:bg-[#060922] rounded-xl animate-pulse" />
              <div className="h-4 w-3/4 bg-neutral-200 dark:bg-white/[0.05] rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-neutral-200 dark:bg-white/[0.05] rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {fpsResults.map((result) => {
            const { game, fps, fps1PercentLow, bottleneck } = result;

            let fpsSmoothClass = 'text-rose-400 border-rose-500/30 bg-rose-500/10';
            let fpsLabelRu = 'Тяжело (<45 FPS)';
            let fpsLabelUz = "Og'ir (<45 FPS)";

            if (fps >= 100) {
              fpsSmoothClass = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
              fpsLabelRu = 'Ультра-плавно (100+ FPS)';
              fpsLabelUz = 'O\'ta silliq (100+ FPS)';
            } else if (fps >= 60) {
              fpsSmoothClass = 'text-[#09aff4] border-[#09aff4]/30 bg-[#09aff4]/10';
              fpsLabelRu = 'Комфортно (60+ FPS)';
              fpsLabelUz = 'Qulay (60+ FPS)';
            } else if (fps >= 45) {
              fpsSmoothClass = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
              fpsLabelRu = 'Играбельно (45+ FPS)';
              fpsLabelUz = 'O\'ynasa bo\'ladi (45+ FPS)';
            }

            return (
              <div
                key={game.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200 dark:border-[#09aff4]/20 bg-white dark:bg-[#0a1033] hover:border-[#09aff4] transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-[#09aff4]/10"
              >
                <div>
                  {/* Poster Image with Steam Key Art */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-950">
                    <img
                      src={game.posterUrl}
                      alt={game.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#060922] via-black/25 to-transparent" />

                    {/* Genre pill */}
                    <span className="absolute top-3 left-3 rounded-lg bg-black/80 px-2.5 py-1 text-[10px] font-mono font-bold text-[#09aff4] border border-[#09aff4]/30 shadow-sm">
                      {game.genre}
                    </span>

                    {/* Telemetry FPS Badge - Flex-IT Clean Cyan */}
                    <div className="absolute bottom-3 right-3 flex items-baseline gap-1 rounded-xl bg-[#09aff4] text-white px-3 py-1 font-mono font-bold shadow-md shadow-[#09aff4]/30">
                      <span className="text-xl sm:text-2xl tracking-tight leading-none">{fps}</span>
                      <span className="text-[10px] tracking-widest opacity-90">FPS</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-[#09aff4] transition-colors line-clamp-1 leading-snug">
                      {game.name}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {lang === 'uz' ? game.descriptionUz : game.descriptionRu}
                    </p>
                  </div>
                </div>

                {/* Footer Telemetry */}
                <div className="p-5 pt-0 space-y-2.5 font-mono text-xs">
                  <div className="flex items-center justify-between border-t border-neutral-100 dark:border-[#09aff4]/15 pt-3 text-neutral-500 dark:text-slate-400">
                    <span>{t.low1Percent}:</span>
                    <span className="font-bold text-neutral-900 dark:text-[#09aff4] tabular-nums">{fps1PercentLow} FPS</span>
                  </div>

                  <div className="flex items-center justify-between text-neutral-500 dark:text-slate-400">
                    <span>{t.bottleneck}:</span>
                    <span
                      className={`text-[11px] font-bold ${
                        bottleneck === 'balanced'
                          ? 'text-emerald-400'
                          : bottleneck === 'cpu'
                          ? 'text-amber-400'
                          : 'text-[#09aff4]'
                      }`}
                    >
                      {bottleneck === 'balanced'
                        ? t.balanced
                        : bottleneck === 'cpu'
                        ? t.cpuBottleneck
                        : t.gpuBottleneck}
                    </span>
                  </div>

                  {/* Smoothness badge with clean border */}
                  <div className={`mt-2 rounded-xl border py-1.5 px-3 text-center text-[11px] font-bold uppercase tracking-wider ${fpsSmoothClass}`}>
                    {lang === 'uz' ? fpsLabelUz : fpsLabelRu}
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
