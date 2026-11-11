import Link from 'next/link';
import { Cpu, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="relative mb-6">
        <div className="h-20 w-20 rounded-3xl bg-blue-600/10 dark:bg-indigo-600/20 border border-blue-500/30 dark:border-indigo-500/40 flex items-center justify-center glow-indigo">
          <Cpu className="h-10 w-10 text-blue-600 dark:text-indigo-400" />
        </div>
      </div>
      <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 tracking-widest uppercase">
        404 — Ошибка 404
      </span>
      <h1 className="mt-2 text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
        Страница не найдена
      </h1>
      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 max-w-md">
        Запрашиваемый компонент или страница отсутствует или была перемещена в другой слот конфигуратора.
      </p>
      <Link
        href="/"
        className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 active:scale-95"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Вернуться на главную</span>
      </Link>
    </div>
  );
}
