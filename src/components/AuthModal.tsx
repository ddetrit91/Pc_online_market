'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/authStore';
import { useI18n } from '@/lib/i18n';
import {
  X,
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { lang } = useI18n();
  const { isAuthModalOpen, setIsAuthModalOpen, authModalTab, setAuthModalTab, login, register } =
    useAuth();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [showAdminKeyInput, setShowAdminKeyInput] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Ошибка входа');
    } else {
      setSuccessMsg(lang === 'uz' ? 'Muvaffaqiyatli kirdingiz!' : 'Вы успешно вошли в систему!');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg(lang === 'uz' ? 'Parollar bir-biriga mos kelmadi' : 'Пароли не совпадают');
      return;
    }

    setLoading(true);
    const res = await register({
      name,
      email,
      password,
      phone: phone || undefined,
      adminSecret: showAdminKeyInput ? adminSecret : undefined,
    });
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Ошибка регистрации');
    } else {
      setSuccessMsg(
        lang === 'uz'
          ? "Ro'yxatdan o'tish muvaffaqiyatli yakunlandi!"
          : 'Регистрация успешно завершена!'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 sm:p-8 shadow-2xl transition-colors">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 rounded-xl p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 mb-3 border border-blue-500/20 shadow-sm">
            <User className="h-6 w-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
            {authModalTab === 'login'
              ? lang === 'uz'
                ? 'Tizimga kirish'
                : 'Вход в аккаунт'
              : lang === 'uz'
              ? "Ro'yxatdan o'tish"
              : 'Создание аккаунта'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {authModalTab === 'login'
              ? lang === 'uz'
                ? 'Buyurtmalarni boshqarish va xarid qilish uchun kiring'
                : 'Войдите для управления заказами и конфигурациями'
              : lang === 'uz'
              ? "Yangi hisob yarating va shaxsiy imtiyozlarga ega bo'ling"
              : 'Зарегистрируйтесь для сохранения сборок и быстрого заказа'}
          </p>
        </div>

        {/* Tabs: Login / Register */}
        <div className="mb-6 flex rounded-xl bg-gray-100 dark:bg-gray-900 p-1 border border-gray-200 dark:border-gray-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthModalTab('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              authModalTab === 'login'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {lang === 'uz' ? 'Kirish' : 'Вход'}
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthModalTab('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              authModalTab === 'register'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {lang === 'uz' ? "Ro'yxatdan o'tish" : 'Регистрация'}
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3 text-xs font-semibold text-rose-600 dark:text-rose-400 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {authModalTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                {lang === 'uz' ? 'Parol' : 'Пароль'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 py-2.5 pl-10 pr-10 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <span>{lang === 'uz' ? 'Kirish' : 'Войти в аккаунт'}</span>
              )}
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {authModalTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {lang === 'uz' ? 'Ism / Familiya' : 'Имя и фамилия'}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Иван Иванов"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {lang === 'uz' ? 'Telefon raqami' : 'Номер телефона'}
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {lang === 'uz' ? 'Parol' : 'Пароль'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 py-2.5 pl-10 pr-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {lang === 'uz' ? 'Tasdiqlash' : 'Повтор пароля'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 py-2.5 pl-10 pr-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Optional Admin Registration Key */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdminKeyInput(!showAdminKeyInput)}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-500 transition-colors"
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>
                  {showAdminKeyInput
                    ? 'Скрыть ключ администратора'
                    : 'Зарегистрироваться как Администратор?'}
                </span>
              </button>

              {showAdminKeyInput && (
                <div className="mt-2 animate-in fade-in">
                  <input
                    type="password"
                    value={adminSecret}
                    onChange={(e) => setAdminSecret(e.target.value)}
                    placeholder="Введите секретный ключ администратора"
                    className="w-full rounded-xl border border-amber-500/40 bg-amber-500/5 py-2 px-3 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[10px] text-amber-500 mt-1">
                    При вводе верного ключа аккаунту сразу присвоится роль ADMIN.
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <span>{lang === 'uz' ? "Ro'yxatdan o'tish" : 'Создать аккаунт'}</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
