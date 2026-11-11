'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { useBuilder } from '@/lib/builderStore';
import { useCart } from '@/lib/cartStore';
import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/authStore';
import { formatPriceUzs } from '@/lib/formatters';
import {
  Cpu,
  Gamepad2,
  ShoppingBag,
  ShoppingCart,
  Wrench,
  Sun,
  Moon,
  User,
  LogOut,
  Shield,
  ChevronDown,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { lang, setLang, t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { totalPrice, partsCount, report } = useBuilder();
  const { totalCartCount, setIsCartOpen } = useCart();
  const { user, isAdmin, openAuthModal, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { href: '/', label: t.catalog, icon: ShoppingBag },
    { href: '/builder', label: t.builder, icon: Wrench, badge: partsCount > 0 ? partsCount : undefined },
    { href: '/fps', label: t.fpsCalculator, icon: Gamepad2 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 dark:border-[#09aff4]/15 bg-white/90 dark:bg-[#060922]/95 backdrop-blur-xl transition-all duration-200">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo - Flex-IT Tech Brand */}
        <Link href="/" className="flex items-center gap-3 group active:scale-[0.98] transition-transform duration-200">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#0a1033] border border-[#09aff4]/30 shadow-md group-hover:border-[#09aff4] group-hover:shadow-[0_0_15px_rgba(9,175,244,0.35)] transition-all duration-200">
            <Cpu className="h-5 w-5 text-[#09aff4] transition-transform duration-200 group-hover:scale-105" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-neutral-900 dark:text-white uppercase leading-none">
                PC<span className="text-[#09aff4]">ULTRA</span>
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#09aff4]/10 border border-[#09aff4]/30 text-[#09aff4]">
                UZ
              </span>
            </div>
            <span className="text-[10px] text-neutral-500 dark:text-slate-400 mt-1 font-mono tracking-tight">
              {lang === 'uz' ? 'Toshkent Hardware & 3D Builder' : 'Ташкент • Премиум ПК & 3D Сборка'}
            </span>
          </div>
        </Link>

        {/* Navigation Tabs - Flex-IT Segmented Pills */}
        <nav className="hidden md:flex items-center gap-1 bg-neutral-100 dark:bg-[#000531] p-1.5 rounded-xl border border-neutral-200 dark:border-[#09aff4]/20 shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
                  isActive
                    ? 'bg-[#09aff4] text-white shadow-md shadow-[#09aff4]/30'
                    : 'text-neutral-600 dark:text-slate-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-white/[0.05]'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-neutral-400 dark:text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`ml-1 flex h-4 min-w-4 px-1.5 items-center justify-center rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white text-[#060922]' : 'bg-[#09aff4] text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Shopping Cart, Theme Toggle, Language Toggle, User Auth & Build Status */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* User Auth Profile / Login Button */}
          <div className="relative" ref={dropdownRef}>
            {user ? (
              <div>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 rounded-xl border border-neutral-200 dark:border-[#09aff4]/25 bg-white dark:bg-[#0a1033] px-3 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:border-[#09aff4] transition-all shadow-sm"
                >
                  <div className={`h-5 w-5 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${
                    user.role === 'ADMIN' ? 'bg-amber-500' : 'bg-[#09aff4]'
                  }`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[85px] truncate text-xs">{user.name}</span>
                  <ChevronDown className="h-3 w-3 text-neutral-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-neutral-200 dark:border-[#09aff4]/25 bg-white dark:bg-[#0a1033] p-2 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95">
                    <div className="p-2.5 border-b border-neutral-100 dark:border-white/[0.08]">
                      <div className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                        {user.name}
                      </div>
                      <div className="text-[11px] text-neutral-500 dark:text-slate-400 truncate">
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="text-[10px] text-[#09aff4] font-mono mt-0.5">
                          {user.phone}
                        </div>
                      )}
                    </div>

                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-amber-500 hover:bg-amber-500/10 transition-colors mt-1"
                      >
                        <Shield className="h-4 w-4" />
                        <span>Панель админа (/admin)</span>
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors mt-1"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{lang === 'uz' ? 'Chiqish' : 'Выйти из аккаунта'}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1.5 rounded-xl border border-neutral-300 dark:border-[#09aff4]/30 bg-neutral-900 dark:bg-[#09aff4] text-white dark:text-[#060922] hover:dark:bg-[#079ad8] px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
              >
                <User className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{lang === 'uz' ? 'Kirish' : 'Войти'}</span>
              </button>
            )}
          </div>

          {/* Shopping Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 dark:border-[#09aff4]/25 bg-white dark:bg-[#0a1033] text-neutral-700 dark:text-slate-200 hover:text-[#09aff4] hover:border-[#09aff4] transition-all active:scale-[0.98] shadow-sm"
            title={lang === 'uz' ? 'Savatni ko\'rish' : 'Открыть корзину'}
          >
            <ShoppingCart className="h-4 w-4" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#09aff4] text-[10px] font-bold text-white shadow-sm">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* Theme Toggle Button (Light / Dark) */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 dark:border-[#09aff4]/25 bg-white dark:bg-[#0a1033] text-neutral-600 dark:text-slate-300 hover:text-neutral-950 dark:hover:text-white hover:border-[#09aff4] transition-all active:scale-[0.98] shadow-sm"
            title={theme === 'dark' ? 'Включить светлую тему' : 'Включить темную тему'}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400 hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon className="h-4 w-4 text-neutral-700 hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          {/* Language Switcher */}
          <div className="flex items-center bg-neutral-100/90 dark:bg-[#000531] border border-neutral-200/80 dark:border-[#09aff4]/20 rounded-xl p-0.5 text-xs font-semibold">
            <button
              onClick={() => setLang('ru')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide transition-all ${
                lang === 'ru'
                  ? 'bg-white dark:bg-[#09aff4] text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              RU
            </button>
            <button
              onClick={() => setLang('uz')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide transition-all ${
                lang === 'uz'
                  ? 'bg-white dark:bg-[#09aff4] text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              UZ
            </button>
          </div>

          {/* Quick Build Badge Link */}
          <Link
            href="/builder"
            className="hidden sm:flex items-center gap-2.5 bg-neutral-100/80 dark:bg-[#0a1033] hover:bg-neutral-200/60 dark:hover:bg-[#0d1645] border border-neutral-200/80 dark:border-[#09aff4]/25 hover:dark:border-[#09aff4] active:scale-[0.98] rounded-xl px-3 py-1.5 transition-all shadow-sm"
          >
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-neutral-500 dark:text-slate-400 font-mono">
                {partsCount} {lang === 'uz' ? 'detal' : 'дет.'}
              </span>
              <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatPriceUzs(totalPrice, lang)}
              </span>
            </div>
            <div
              className={`h-2.5 w-2.5 rounded-full ${
                partsCount === 0
                  ? 'bg-neutral-400 dark:bg-slate-600'
                  : report.isCompatible
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
              }`}
              title={
                report.isCompatible
                  ? 'Совместимость OK'
                  : 'Есть несовместимости'
              }
            />
          </Link>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="flex md:hidden border-t border-neutral-200 dark:border-[#09aff4]/15 bg-white/95 dark:bg-[#060922]/95 backdrop-blur-xl px-4 py-2 justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 text-xs py-1 px-3 rounded-xl transition-colors ${
                isActive ? 'text-[#09aff4] font-bold' : 'text-neutral-500 dark:text-slate-400'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
};
