'use client';

import React, { useState, useEffect } from 'react';
import { formatPriceUzs } from '@/lib/formatters';
import {
  Lock,
  Unlock,
  Package,
  Gamepad2,
  ClipboardList,
  BarChart3,
  Users,
  UserCheck,
  ShieldAlert,
  Shield,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  LogOut,
  RefreshCw,
  Search,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Eye,
  Download,
} from 'lucide-react';

export default function AdminPortalPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [authMethod, setAuthMethod] = useState<'credentials' | 'secret'>('credentials');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [secretKeyInput, setSecretKeyInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<'products' | 'games' | 'orders' | 'analytics' | 'users'>('orders');
  const [products, setProducts] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [loadingData, setLoadingData] = useState(false);

  // Receipt preview modal
  const [previewReceipt, setPreviewReceipt] = useState<{
    url: string;
    name?: string;
    orderNumber: string;
    isPdf: boolean;
  } | null>(null);

  // Modals state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddGameOpen, setIsAddGameOpen] = useState(false);

  // New product form
  const [newProduct, setNewProduct] = useState({
    titleRu: '',
    titleUz: '',
    category: 'GPU',
    brand: '',
    priceUzs: '',
    imageUrl: '',
    socket: '',
    memoryType: 'DDR5',
    tdp: '',
    lengthMm: '',
    wattage: '',
  });

  // New game form
  const [newGame, setNewGame] = useState({
    name: '',
    posterUrl: '',
    genre: 'Action / RPG',
    cpuDemand: '1.4',
    gpuDemand: '1.8',
    baseFps1080p: '60',
    descriptionRu: '',
    descriptionUz: '',
  });

  const [notification, setNotification] = useState<string | null>(null);

  // Check auth status on load
  useEffect(() => {
    fetch('/api/admin/auth')
      .then((res) => res.json())
      .then((data) => {
        setIsAuthenticated(data.authenticated);
        if (data.user) setAdminUser(data.user);
      })
      .catch(() => setIsAuthenticated(false));
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  const loadAllData = async () => {
    setLoadingData(true);
    try {
      const [prodRes, gamesRes, ordersRes, usersRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/games'),
        fetch('/api/admin/orders'),
        fetch('/api/admin/users'),
      ]);
      const prods = await prodRes.json();
      const gms = await gamesRes.json();
      const ords = await ordersRes.json();
      const usrs = await usersRes.json();

      setProducts(Array.isArray(prods) ? prods : []);
      setGames(Array.isArray(gms) ? gms : []);
      setOrders(Array.isArray(ords) ? ords : []);
      setUsers(Array.isArray(usrs) ? usrs : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const payload = authMethod === 'credentials'
        ? { email: adminEmail, password: adminPassword }
        : { key: secretKeyInput };

      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setIsAuthenticated(true);
        if (data.user) setAdminUser(data.user);
      } else {
        setAuthError(data.error || 'Ошибка авторизации');
      }
    } catch (err: any) {
      setAuthError('Ошибка соединения с сервером');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    const confirmMsg = nextRole === 'ADMIN'
      ? 'Назначить этого пользователя Администратором?'
      : 'Отозвать права Администратора у этого пользователя?';
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: nextRole }),
      });
      if (res.ok) {
        showToast(`Роль пользователя изменена на ${nextRole}`);
        loadAllData();
      } else {
        const data = await res.json();
        alert(data.error || 'Ошибка изменения роли');
      }
    } catch {
      alert('Ошибка соединения');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    setIsAuthenticated(false);
    setSecretKeyInput('');
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Add Product handler
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      if (res.ok) {
        setIsAddProductOpen(false);
        showToast('Товар успешно добавлен!');
        loadAllData();
        setNewProduct({
          titleRu: '',
          titleUz: '',
          category: 'GPU',
          brand: '',
          priceUzs: '',
          imageUrl: '',
          socket: '',
          memoryType: 'DDR5',
          tdp: '',
          lengthMm: '',
          wattage: '',
        });
      }
    } catch (e) {
      alert('Ошибка при создании товара');
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Точно удалить этот товар?')) return;
    await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
    showToast('Товар удален');
    loadAllData();
  };

  // Add Game handler
  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGame),
      });
      if (res.ok) {
        setIsAddGameOpen(false);
        showToast('Игра успешно добавлена в калькулятор FPS!');
        loadAllData();
        setNewGame({
          name: '',
          posterUrl: '',
          genre: 'Action / RPG',
          cpuDemand: '1.4',
          gpuDemand: '1.8',
          baseFps1080p: '60',
          descriptionRu: '',
          descriptionUz: '',
        });
      }
    } catch (e) {
      alert('Ошибка при создании игры');
    }
  };

  // Delete game
  const handleDeleteGame = async (id: string) => {
    if (!confirm('Точно удалить эту игру?')) return;
    await fetch(`/api/admin/games?id=${id}`, { method: 'DELETE' });
    showToast('Игра удалена');
    loadAllData();
  };

  // Update order status or resend Telegram
  const handleUpdateOrderStatus = async (id: string, status: string, resendTelegram = false) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, resendTelegram }),
      });
      if (res.ok) {
        showToast(resendTelegram ? 'Чек отправлен в Telegram!' : 'Статус заказа обновлен');
        loadAllData();
      }
    } catch (e) {
      alert('Ошибка обновления');
    }
  };

  // 1. Loading screen
  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  // 2. Lock screen (Authentication)
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-8 shadow-2xl transition-colors">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40 mb-4 shadow-sm">
            <Lock className="h-7 w-7" />
          </div>

          <div className="text-center mb-6">
            <span className="rounded-md bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-bold text-rose-500 border border-rose-500/20 uppercase tracking-wider">
              Панель Администратора
            </span>
            <h2 className="text-xl font-black text-gray-900 dark:text-white mt-2">
              Вход в /admin
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Войдите с учетной записью администратора или по секретному ключу
            </p>
          </div>

          {/* Switch auth method */}
          <div className="mb-5 flex rounded-xl bg-gray-100 dark:bg-gray-900 p-1 border border-gray-200 dark:border-gray-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('credentials');
                setAuthError('');
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                authMethod === 'credentials'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Email и пароль
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('secret');
                setAuthError('');
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                authMethod === 'secret'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Секретный ключ
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {authError && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-500">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {authMethod === 'credentials' ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Email Администратора
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin@example.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Пароль
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Введите пароль..."
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  ADMIN_SECRET_KEY
                </label>
                <input
                  type="password"
                  required
                  placeholder="Секретный ключ..."
                  value={secretKeyInput}
                  onChange={(e) => setSecretKeyInput(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
            >
              {authLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Unlock className="h-4 w-4" />
                  <span>Войти в панель</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 3. Authenticated Dashboard
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const paidOrdersCount = orders.filter((o) => o.status === 'paid' || o.status === 'completed').length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-950/90 text-emerald-400 px-4 py-3 text-xs shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-4 w-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-500 border border-emerald-500/20">
              LIVE / ADMIN
            </span>
            <span className="text-xs text-gray-500 font-mono">/admin</span>
            {adminUser && (
              <span className="rounded-lg bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500 border border-amber-500/20 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span>{adminUser.email}</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            Панель управления PC ULTRA MARKET
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAllData}
            disabled={loadingData}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:border-blue-500 transition-colors shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingData ? 'animate-spin' : ''}`} />
            <span>Обновить</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white px-3.5 py-2 text-xs font-semibold transition-all shadow-sm"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Выйти</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'orders'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          <span>Заказы и чеки</span>
          <span className="rounded-full bg-black/20 dark:bg-white/20 px-2 py-0.5 text-[10px]">
            {orders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Пользователи и роли</span>
          <span className="rounded-full bg-black/20 dark:bg-white/20 px-2 py-0.5 text-[10px]">
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'products'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Package className="h-4 w-4" />
          <span>Комплектующие</span>
          <span className="rounded-full bg-black/20 dark:bg-white/20 px-2 py-0.5 text-[10px]">
            {products.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('games')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'games'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Gamepad2 className="h-4 w-4" />
          <span>Игры FPS</span>
          <span className="rounded-full bg-black/20 dark:bg-white/20 px-2 py-0.5 text-[10px]">
            {games.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'analytics'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Статистика</span>
        </button>
      </div>

      {/* TAB 1: ORDERS & RECEIPTS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Поступившие заказы и прикрепленные чеки ({orders.length})
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Здесь отображаются все оформленные заказы, статус их отправки в Telegram и прикрепленные квитанции/скриншоты оплаты (JPG/PNG/PDF).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/60 text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Номер</th>
                  <th className="p-3.5">Клиент</th>
                  <th className="p-3.5">Телефон</th>
                  <th className="p-3.5">Telegram</th>
                  <th className="p-3.5">Сумма (UZS)</th>
                  <th className="p-3.5">Чек оплаты</th>
                  <th className="p-3.5">Статус</th>
                  <th className="p-3.5 text-right">Telegram бот</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-400">
                      Заказов пока нет
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => {
                    const isPdf = o.receiptFileUrl?.toLowerCase().includes('.pdf') || o.receiptFileName?.toLowerCase().endsWith('.pdf');
                    return (
                      <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                          {o.orderNumber}
                        </td>
                        <td className="p-3.5 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                          {o.customerName}
                        </td>
                        <td className="p-3.5 font-mono text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {o.customerPhone}
                        </td>
                        <td className="p-3.5 text-blue-500 whitespace-nowrap">
                          {o.telegramUsername ? `@${o.telegramUsername.replace('@', '')}` : '—'}
                        </td>
                        <td className="p-3.5 font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          {formatPriceUzs(o.totalAmount, 'ru')}
                        </td>

                        {/* Payment Receipt / Attached file */}
                        <td className="p-3.5 whitespace-nowrap">
                          {o.receiptFileUrl ? (
                            <div className="flex items-center gap-2">
                              {isPdf ? (
                                <button
                                  onClick={() =>
                                    setPreviewReceipt({
                                      url: o.receiptFileUrl,
                                      name: o.receiptFileName || 'Квитанция.pdf',
                                      orderNumber: o.orderNumber,
                                      isPdf: true,
                                    })
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                  title="Открыть PDF файл оплаты"
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                  <span>PDF Чек</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    setPreviewReceipt({
                                      url: o.receiptFileUrl,
                                      name: o.receiptFileName || 'Скриншот оплаты',
                                      orderNumber: o.orderNumber,
                                      isPdf: false,
                                    })
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm group"
                                  title="Посмотреть фото чека"
                                >
                                  <ImageIcon className="h-3.5 w-3.5" />
                                  <span>Фото чека</span>
                                  <Eye className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                                </button>
                              )}
                              <a
                                href={o.receiptFileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                title="Открыть в новой вкладке"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </div>
                          ) : o.paymentMethod === 'stripe' ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="inline-flex items-center gap-1 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 w-fit">
                                Stripe Онлайн
                              </span>
                              {o.stripePaymentId && (
                                <span className="text-[10px] font-mono text-gray-400 truncate max-w-[140px]" title={o.stripePaymentId}>
                                  {o.stripePaymentId}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-[11px]">Не прикреплен</span>
                          )}
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-1 px-2 text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none"
                          >
                            <option value="pending">Ожидает</option>
                            <option value="confirmed">Подтвержден</option>
                            <option value="paid">Оплачен</option>
                            <option value="completed">Выполнен</option>
                            <option value="cancelled">Отменен</option>
                          </select>
                        </td>

                        <td className="p-3.5 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleUpdateOrderStatus(o.id, o.status, true)}
                            className="rounded-xl border border-blue-500/30 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1.5 text-xs font-bold transition-all shadow-sm"
                            title="Отправить чек с файлом в Telegram бот повторно"
                          >
                            <Send className="h-3.5 w-3.5 inline mr-1" />
                            <span>{o.receiptSent ? 'Переслать' : 'Отправить'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Список комплектующих ({products.length})
            </h3>
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-3.5 py-2 text-xs font-bold text-white shadow-md transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Добавить товар</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-4 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded-lg bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      {p.category}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">{p.brand}</span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2">
                    {p.titleRu}
                  </h4>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-black mt-2">
                    {formatPriceUzs(p.priceUzs, 'ru')}
                  </p>
                  <div className="mt-2 text-[11px] text-gray-500 dark:text-gray-400 space-y-0.5">
                    {p.socket && <div>Сокет: <strong>{p.socket}</strong></div>}
                    {p.tdp && <div>TDP: <strong>{p.tdp}W</strong></div>}
                    {p.wattage && <div>Мощность: <strong>{p.wattage}W</strong></div>}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end">
                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    className="rounded-lg p-1.5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all"
                    title="Удалить"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: GAMES MANAGEMENT */}
      {activeTab === 'games' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Игры в калькуляторе FPS ({games.length})
            </h3>
            <button
              onClick={() => setIsAddGameOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 px-3.5 py-2 text-xs font-bold text-white shadow-md transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Добавить игру</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {games.map((g) => (
              <div
                key={g.id}
                className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-4 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <img
                    src={g.posterUrl}
                    alt=""
                    className="h-32 w-full object-cover rounded-xl mb-3"
                  />
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                    {g.genre}
                  </span>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 line-clamp-1">
                    {g.name}
                  </h4>
                  <div className="mt-2 space-y-1 text-[11px] text-gray-500 dark:text-gray-400">
                    <div>Нагрузка на CPU: <strong>x{g.cpuDemand}</strong></div>
                    <div>Нагрузка на GPU: <strong>x{g.gpuDemand}</strong></div>
                    <div>Базовый FPS (1080p High): <strong className="text-emerald-500">{g.baseFps1080p} FPS</strong></div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end">
                  <button
                    onClick={() => handleDeleteGame(g.id)}
                    className="rounded-lg p-1.5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all"
                    title="Удалить"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-5 shadow-sm">
              <span className="text-xs text-gray-500">Общая выручка</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {formatPriceUzs(totalRevenue, 'ru')}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Сумма всех оформленных заказов</p>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-5 shadow-sm">
              <span className="text-xs text-gray-500">Оплаченные заказы</span>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {paidOrdersCount}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Заказы со статусом Оплачен / Выполнен</p>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-5 shadow-sm">
              <span className="text-xs text-gray-500">Ожидают обработки</span>
              <div className="text-2xl font-black text-amber-500 mt-1">
                {pendingOrdersCount}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Требуют подтверждения менеджера</p>
            </div>
          </div>
        </div>
      )}

      


      {/* TAB 5: USERS & ROLES */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Зарегистрированные пользователи и роли ({users.length})
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Управление учетными записями, роли доступа (ADMIN / USER) и история активности.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск по имени, email..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-2 pl-9 pr-4 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/60 text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Пользователь</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Телефон</th>
                  <th className="p-3.5">Роль</th>
                  <th className="p-3.5">Заказов</th>
                  <th className="p-3.5">Дата регистрации</th>
                  <th className="p-3.5 text-right">Управление ролью</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400">
                      Пользователей пока нет
                    </td>
                  </tr>
                ) : (
                  users
                    .filter(
                      (u) =>
                        !userSearchTerm ||
                        u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                        u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                        (u.phone && u.phone.includes(userSearchTerm))
                    )
                    .map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="p-3.5 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-black text-white ${
                                u.role === 'ADMIN'
                                  ? 'bg-amber-500 shadow-sm shadow-amber-500/30'
                                  : 'bg-blue-600'
                              }`}
                            >
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <span>{u.name}</span>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {u.email}
                        </td>
                        <td className="p-3.5 font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {u.phone || '—'}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              u.role === 'ADMIN'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                            }`}
                          >
                            {u.role === 'ADMIN' ? (
                              <Shield className="h-3 w-3" />
                            ) : (
                              <UserCheck className="h-3 w-3" />
                            )}
                            <span>{u.role}</span>
                          </span>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="font-bold text-gray-700 dark:text-gray-300">
                            {u._count?.orders ?? 0}
                          </span>
                        </td>
                        <td className="p-3.5 text-gray-500 whitespace-nowrap">
                          {new Date(u.createdAt).toLocaleDateString('ru-RU')}
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleToggleRole(u.id, u.role)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                              u.role === 'ADMIN'
                                ? 'border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                                : 'border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white'
                            }`}
                          >
                            {u.role === 'ADMIN' ? 'Сделать USER' : 'Сделать ADMIN'}
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RECEIPT PREVIEW MODAL */}
      {previewReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-center gap-2.5">
                {previewReceipt.isPdf ? (
                  <FileText className="h-5 w-5 text-red-500" />
                ) : (
                  <ImageIcon className="h-5 w-5 text-blue-500" />
                )}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Чек заказа #{previewReceipt.orderNumber}
                  </h3>
                  <span className="text-[11px] text-gray-400">{previewReceipt.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewReceipt.url}
                  download
                  className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 p-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors"
                  title="Скачать файл"
                >
                  <Download className="h-4 w-4" />
                </a>
                <button
                  onClick={() => setPreviewReceipt(null)}
                  className="rounded-xl p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 min-h-[400px]">
              {previewReceipt.isPdf ? (
                <iframe
                  src={previewReceipt.url}
                  className="w-full h-[65vh] rounded-xl border border-gray-200 dark:border-gray-800"
                  title="PDF Чек"
                />
              ) : (
                <img
                  src={previewReceipt.url}
                  alt="Чек оплаты"
                  className="max-h-[70vh] max-w-full rounded-xl object-contain shadow-md"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD PRODUCT */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4 mb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Добавить новый товар</h3>
              <button onClick={() => setIsAddProductOpen(false)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Название (RU)</label>
                <input
                  type="text"
                  required
                  placeholder="GeForce RTX 5080 16GB"
                  value={newProduct.titleRu}
                  onChange={(e) => setNewProduct({ ...newProduct, titleRu: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Категория</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-2.5"
                  >
                    <option value="CPU">Процессор (CPU)</option>
                    <option value="GPU">Видеокарта (GPU)</option>
                    <option value="MOTHERBOARD">Материнская плата</option>
                    <option value="RAM">Оперативная память</option>
                    <option value="STORAGE">Накопитель</option>
                    <option value="PSU">Блок питания</option>
                    <option value="CASE">Корпус</option>
                    <option value="COOLER">Кулер</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Бренд</label>
                  <input
                    type="text"
                    required
                    placeholder="ASUS, AMD, MSI"
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Цена в сумах (UZS)</label>
                <input
                  type="number"
                  required
                  placeholder="12500000"
                  value={newProduct.priceUzs}
                  onChange={(e) => setNewProduct({ ...newProduct, priceUzs: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-2.5 font-bold text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Сокет (если CPU/MB)</label>
                  <input
                    type="text"
                    placeholder="AM5, LGA1700"
                    value={newProduct.socket}
                    onChange={(e) => setNewProduct({ ...newProduct, socket: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">TDP / Мощность (Вт)</label>
                  <input
                    type="number"
                    placeholder="120"
                    value={newProduct.tdp}
                    onChange={(e) => setNewProduct({ ...newProduct, tdp: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-2.5"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-xs font-bold text-white shadow-md transition-all"
                >
                  Создать товар
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD GAME */}
      {isAddGameOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4 mb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Добавить игру в калькулятор FPS</h3>
              <button onClick={() => setIsAddGameOpen(false)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGame} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Название игры</label>
                <input
                  type="text"
                  required
                  placeholder="Grand Theft Auto VI"
                  value={newGame.name}
                  onChange={(e) => setNewGame({ ...newGame, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Жанр</label>
                  <input
                    type="text"
                    placeholder="Open-World Action"
                    value={newGame.genre}
                    onChange={(e) => setNewGame({ ...newGame, genre: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Базовый FPS (1080p High)</label>
                  <input
                    type="number"
                    required
                    placeholder="60"
                    value={newGame.baseFps1080p}
                    onChange={(e) => setNewGame({ ...newGame, baseFps1080p: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Нагрузка на CPU (1.0 - 2.5)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="1.5"
                    value={newGame.cpuDemand}
                    onChange={(e) => setNewGame({ ...newGame, cpuDemand: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Нагрузка на GPU (1.0 - 2.5)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="2.0"
                    value={newGame.gpuDemand}
                    onChange={(e) => setNewGame({ ...newGame, gpuDemand: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-2.5"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-purple-600 hover:bg-purple-500 py-3 text-xs font-bold text-white shadow-md transition-all"
                >
                  Добавить игру
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
