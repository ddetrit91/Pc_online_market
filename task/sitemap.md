# Project Sitemap & Route Catalog

> **Project:** `pc-online-market` (PCULTRA.UZ)  
> **Framework:** Next.js 15 (App Router) + React 19 + TypeScript  
> **Last Updated:** 2026-11-08

---

## 1. Client Pages (Frontend Routes)

| URL Route | File Path | Access Level | Description | Key Components |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `src/app/page.tsx` | Public | **Главная страница / Каталог комплектующих**. Фильтрация по 8 категориям (CPU, GPU, RAM, Motherboard, Storage, PSU, Case, Cooler), поиск по названию/бренду, добавление в корзину и конфигуратор. | `CatalogView.tsx`, `Header.tsx`, `CartDrawer.tsx` |
| `/builder` | `src/app/builder/page.tsx` | Public | **Конфигуратор ПК (PC Builder)**. Интерактивная 3D-модель корпуса, 2D-чертеж, проверка совместимости в реальном времени, подсчет суммарного TDP и стоимости сборки. | `BuilderView.tsx`, `PcViewer3D.tsx`, `PcBlueprint2D.tsx`, `SlotSelectorModal.tsx`, `CheckoutModal.tsx` |
| `/fps` | `src/app/fps/page.tsx` | Public | **FPS Калькулятор в играх**. Оценка производительности сборки (CPU + GPU) в 20+ актуальных играх при разрешениях 1080p, 1440p, 4K на Ultra/Medium настройках. | `FpsCalculatorView.tsx` |
| `/admin` | `src/app/admin/page.tsx` | Admin | **Панель управления (Admin Dashboard)**. CRUD комплектующих, управление заказами клиентов, аналитика, база игр и пользователи. | `AdminView`, `ProductTable`, `OrderTable` |
| `/secret-admin-portal` | `src/app/secret-admin-portal/page.tsx` | Hidden / Admin | **Скрытый портал авторизации администратора**. Авторизация по PIN-коду и мастер-паролю для экстренного доступа. | `SecretAdminView` |
| `/_not-found` | `src/app/not-found.tsx` | Public | **Страница 404 (Не найдено)**. Стилизованная кибер-страница отсутствующего маршрута с кнопкой возврата в каталог. | `NotFound` |

---

## 2. API Endpoints (Backend Server Routes)

### 2.1 Public & Store APIs

| Method | Endpoint Route | File Path | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | `src/app/api/products/route.ts` | Список всех товаров с поддержкой фильтрации по категории (`?category=GPU`) |
| `POST` | `/api/products` | `src/app/api/products/route.ts` | Создание новой единицы товара |
| `GET` | `/api/games` | `src/app/api/games/route.ts` | Список игр с коэффициентами требовательности CPU/GPU для FPS-калькулятора |
| `POST` | `/api/orders` | `src/app/api/orders/route.ts` | Оформление заказа корзины или собранного ПК с контактными данными клиента |
| `GET` | `/api/orders` | `src/app/api/orders/route.ts` | Получение истории заказов |
| `POST` | `/api/verify-compatibility` | `src/app/api/verify-compatibility/route.ts` | Серверная валидация совместимости сокета, типа памяти, мощности БП и длины видеокарты |
| `GET` | `/api/neon-status` | `src/app/api/neon-status/route.ts` | Проверка статуса соединения с базой данных Neon PostgreSQL |

### 2.2 Authentication APIs

| Method | Endpoint Route | File Path | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | `src/app/api/auth/login/route.ts` | Вход пользователя по email и паролю с выдачей JWT/cookie |
| `POST` | `/api/auth/register` | `src/app/api/auth/register/route.ts` | Регистрация нового покупателя |
| `GET` | `/api/auth/me` | `src/app/api/auth/me/route.ts` | Получение текущей пользовательской сессии |
| `POST` | `/api/auth/logout` | `src/app/api/auth/logout/route.ts` | Завершение сессии и удаление cookie |

### 2.3 Administrative APIs (`/api/admin/*`)

| Method | Endpoint Route | File Path | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/admin/auth` | `src/app/api/admin/auth/route.ts` | Авторизация с правами администратора |
| `GET`, `POST`, `PUT`, `DELETE` | `/api/admin/products` | `src/app/api/admin/products/route.ts` | Полный цикл управления товарами склада |
| `GET`, `PUT` | `/api/admin/orders` | `src/app/api/admin/orders/route.ts` | Просмотр заказов и смена статусов (`NEW` → `PROCESSING` → `COMPLETED`) |
| `GET`, `PUT`, `DELETE` | `/api/admin/users` | `src/app/api/admin/users/route.ts` | Управление учетными записями и ролями |
| `GET`, `POST`, `PUT`, `DELETE` | `/api/admin/games` | `src/app/api/admin/games/route.ts` | Управление базой игр и бенчмарков |
