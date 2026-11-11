import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import { I18nProvider } from '@/lib/i18n';
import { BuilderProvider } from '@/lib/builderStore';
import { CartProvider } from '@/lib/cartStore';
import { ThemeProvider } from '@/lib/theme';
import { AuthProvider } from '@/lib/authStore';
import { Header } from '@/components/Header';
import { CartDrawer } from '@/components/CartDrawer';
import { AuthModal } from '@/components/AuthModal';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PC ULTRA | Премиальные комплектующие и Конструктор ПК',
  description: 'Флагманский магазин комплектующих в Ташкенте. Интерактивный 3D-конфигуратор ПК с анализом совместимости и калькулятор производительности в играх.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-[#f8fafc] dark:bg-[#060922] text-neutral-900 dark:text-white font-sans antialiased flex flex-col justify-between selection:bg-[#09aff4] selection:text-white transition-colors duration-200">
        <ThemeProvider>
          <I18nProvider>
            <AuthProvider>
              <BuilderProvider>
                <CartProvider>
                  <Header />
                  <main className="flex-1">{children}</main>
                  <CartDrawer />
                  <AuthModal />
                  <footer className="mt-20 border-t border-neutral-200 dark:border-[#09aff4]/15 bg-white/80 dark:bg-[#000531] py-10 text-xs text-neutral-500 transition-colors">
                    <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <span className="font-bold text-neutral-900 dark:text-white tracking-wider text-sm flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[#09aff4] shadow-[0_0_8px_#09aff4]" />
                          PC<span className="text-[#09aff4]">ULTRA</span>
                        </span>
                        <span className="hidden sm:inline text-neutral-400 dark:text-slate-600">•</span>
                        <span className="text-neutral-500 dark:text-slate-400">
                          © 2026 PCULTRA Technologies. Официальная гарантия и сборка рабочих станций.
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-neutral-500 dark:text-slate-400">
                        <span>Валюта: UZS</span>
                        <span>•</span>
                        <span>RU / UZ</span>
                        <span>•</span>
                        <Link href="/admin" className="hover:text-cyan-400 transition-colors">
                          Админ-панель
                        </Link>
                      </div>
                    </div>
                  </footer>
                </CartProvider>
              </BuilderProvider>
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
