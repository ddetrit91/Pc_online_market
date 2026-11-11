'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n';
import { CompatibilityReport } from '@/lib/types';
import { CheckCircle2, AlertTriangle, XCircle, Info, Zap } from 'lucide-react';
import { formatWattage } from '@/lib/formatters';

interface Props {
  report: CompatibilityReport;
  partsCount: number;
}

export const CompatibilityAlerts: React.FC<Props> = ({ report, partsCount }) => {
  const { lang, t } = useI18n();

  if (partsCount === 0) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-center">
        <p className="text-sm text-gray-400">
          {lang === 'uz'
            ? "Konstruktorga qismlarni qo'shing — tizim avtomatik ravishda moslikni tekshiradi."
            : 'Добавьте комплектующие в конфигуратор — алгоритм автоматически проверит совместимость.'}
        </p>
      </div>
    );
  }

  const errors = report.issues.filter((i) => i.type === 'error');
  const warnings = report.issues.filter((i) => i.type === 'warning');

  return (
    <div className="space-y-3">
      {/* Overall compatibility badge */}
      {report.isCompatible && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-4 text-emerald-400">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-400" />
          <div className="flex-1">
            <h4 className="text-sm font-bold">{t.allCompatible}</h4>
            <p className="text-xs text-emerald-300/80 mt-0.5">
              {lang === 'uz'
                ? "Barcha tanlangan detallar bir-biri bilan to'liq uyg'un va standartlarga javob beradi."
                : 'Все выбранные компоненты физически и технически согласованы между собой.'}
            </p>
          </div>
        </div>
      )}

      {/* Critical Errors */}
      {errors.map((issue, idx) => (
        <div
          key={`err-${idx}`}
          className="flex items-start gap-3 rounded-xl border border-rose-500/50 bg-rose-950/30 p-4 text-rose-300 shadow-lg shadow-rose-950/20"
        >
          <XCircle className="h-6 w-6 shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-400 border border-rose-500/30">
                {lang === 'uz' ? 'XATOLIK' : 'ОШИБКА'}
              </span>
              <h4 className="text-sm font-bold text-rose-200">
                {lang === 'uz' ? issue.titleUz : issue.titleRu}
              </h4>
            </div>
            <p className="text-xs text-rose-300/90 mt-1 leading-relaxed">
              {lang === 'uz' ? issue.messageUz : issue.messageRu}
            </p>
          </div>
        </div>
      ))}

      {/* Warnings */}
      {warnings.map((issue, idx) => (
        <div
          key={`warn-${idx}`}
          className="flex items-start gap-3 rounded-xl border border-amber-500/50 bg-amber-950/30 p-4 text-amber-300 shadow-md shadow-amber-950/10"
        >
          <AlertTriangle className="h-6 w-6 shrink-0 text-amber-400 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 border border-amber-500/30">
                {lang === 'uz' ? 'DIQQAT' : 'ВНИМАНИЕ'}
              </span>
              <h4 className="text-sm font-bold text-amber-200">
                {lang === 'uz' ? issue.titleUz : issue.titleRu}
              </h4>
            </div>
            <p className="text-xs text-amber-300/90 mt-1 leading-relaxed">
              {lang === 'uz' ? issue.messageUz : issue.messageRu}
            </p>
          </div>
        </div>
      ))}

      {/* Power and Wattage bar */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-3.5 text-xs text-gray-300">
        <div className="flex items-center justify-between font-medium">
          <span className="flex items-center gap-1.5 text-gray-400">
            <Zap className="h-4 w-4 text-yellow-400" />
            {lang === 'uz' ? 'Taxminiy quvvat sarfi (TDP):' : 'Расчетное пиковое потребление (TDP):'}
          </span>
          <span className="font-bold text-yellow-400 text-sm">
            ~{formatWattage(report.totalTdp)}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
          <span>{lang === 'uz' ? 'Tavsiya etilgan quvvat bloki:' : 'Рекомендуемый БП с запасом:'}</span>
          <span className="font-semibold text-emerald-400">
            {formatWattage(report.recommendedPsuWattage)}+
          </span>
        </div>
      </div>
    </div>
  );
};
