'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language } from './types';

export interface Translations {
  siteTitle: string;
  catalog: string;
  builder: string;
  fpsCalculator: string;
  cart: string;
  admin: string;
  allCategories: string;
  cpu: string;
  motherboard: string;
  ram: string;
  gpu: string;
  storage: string;
  psu: string;
  case: string;
  cooler: string;
  addToBuild: string;
  removeFromBuild: string;
  changePart: string;
  choosePart: string;
  totalPrice: string;
  powerConsumption: string;
  compatibilityStatus: string;
  allCompatible: string;
  hasErrors: string;
  hasWarnings: string;
  noErrorsFound: string;
  resetBuild: string;
  saveBuild: string;
  orderNow: string;
  preset: string;
  resolution: string;
  low: string;
  medium: string;
  high: string;
  ultra: string;
  avgFps: string;
  low1Percent: string;
  bottleneck: string;
  cpuBottleneck: string;
  gpuBottleneck: string;
  balanced: string;
  filterByBrand: string;
  inStock: string;
  emptyCatalog: string;
  selectSlot: string;
  selectComponentForSlot: string;
  close: string;
  searchPlaceholder: string;
  gamesListTitle: string;
  heavyGamesNote: string;
  som: string;
}

export const translations: Record<Language, Translations> = {
  ru: {
    siteTitle: 'PC Ultra Market & Builder',
    catalog: 'Каталог комплектующих',
    builder: 'Конструктор ПК',
    fpsCalculator: 'Калькулятор FPS',
    cart: 'Корзина',
    admin: 'Админ-панель',
    allCategories: 'Все категории',
    cpu: 'Процессор',
    motherboard: 'Материнская плата',
    ram: 'Оперативная память',
    gpu: 'Видеокарта',
    storage: 'Накопитель SSD/HDD',
    psu: 'Блок питания',
    case: 'Корпус',
    cooler: 'Охлаждение CPU',
    addToBuild: 'В сборку',
    removeFromBuild: 'Удалить',
    changePart: 'Заменить',
    choosePart: 'Выбрать деталь',
    totalPrice: 'Итоговая стоимость',
    powerConsumption: 'Энергопотребление',
    compatibilityStatus: 'Проверка совместимости',
    allCompatible: 'Все компоненты на 100% совместимы!',
    hasErrors: 'Обнаружены критические несовместимости!',
    hasWarnings: 'Есть предупреждения по сборке',
    noErrorsFound: 'Критических конфликтов нет',
    resetBuild: 'Очистить сборку',
    saveBuild: 'Оформить заказ',
    orderNow: 'Оформить заказ',
    preset: 'Настройки графики',
    resolution: 'Разрешение экрана',
    low: 'Низкие',
    medium: 'Средние',
    high: 'Высокие',
    ultra: 'Ультра',
    avgFps: 'Средний FPS',
    low1Percent: '1% Min FPS',
    bottleneck: 'Баланс системы',
    cpuBottleneck: 'Упор в процессор (CPU)',
    gpuBottleneck: 'Упор в видеокарту (GPU)',
    balanced: 'Идеальный баланс',
    filterByBrand: 'Бренд',
    inStock: 'В наличии',
    emptyCatalog: 'Товары не найдены',
    selectSlot: 'Выберите компонент',
    selectComponentForSlot: 'Выбор детали для слота',
    close: 'Закрыть',
    searchPlaceholder: 'Поиск по названию или характеристикам...',
    gamesListTitle: 'Производительность в 20 тяжелых играх',
    heavyGamesNote: 'Расчет выполняется на базе бенчмарков с учетом тактовой частоты, ядер, памяти и архитектурных особенностей.',
    som: 'сум',
  },
  uz: {
    siteTitle: 'PC Ultra Market & Konstruktor',
    catalog: 'Kompyuter qismlari',
    builder: 'Kompyuter konstruktori',
    fpsCalculator: 'FPS Kalkulyatori',
    cart: 'Savat',
    admin: 'Boshqaruv paneli',
    allCategories: 'Barcha toifalar',
    cpu: 'Protsessor',
    motherboard: 'Ona plata',
    ram: 'Operativ xotira (RAM)',
    gpu: 'Videokarta',
    storage: 'SSD/HDD xotira',
    psu: 'Quvvat bloki (BP)',
    case: 'Tizim korpusi',
    cooler: 'Kuler (Sovutgich)',
    addToBuild: "Yig'maga qo'shish",
    removeFromBuild: "O'chirish",
    changePart: "Almashtirish",
    choosePart: 'Qismni tanlash',
    totalPrice: 'Umumiy narxi',
    powerConsumption: 'Quvvat sarfi',
    compatibilityStatus: 'Moslikni tekshirish',
    allCompatible: "Barcha qismlar 100% bir-biriga mos!",
    hasErrors: "Jiddiy mos kelmasliklar aniqlandi!",
    hasWarnings: "Yig'ma bo'yicha tavsiyalar mavjud",
    noErrorsFound: 'Ziddiyatlar aniqlanmadi',
    resetBuild: "Yig'mani tozalash",
    saveBuild: 'Buyurtma berish',
    orderNow: 'Buyurtma berish',
    preset: 'Grafika sozlamalari',
    resolution: 'Ekran o\'lchami',
    low: 'Past',
    medium: "O'rta",
    high: 'Yuqori',
    ultra: 'Ultra',
    avgFps: "O'rtacha FPS",
    low1Percent: '1% Min FPS',
    bottleneck: 'Tizim balansi',
    cpuBottleneck: 'Protsessor yuklamasi (CPU)',
    gpuBottleneck: 'Videokarta yuklamasi (GPU)',
    balanced: 'Ideal balans',
    filterByBrand: 'Brend',
    inStock: 'Mavjud',
    emptyCatalog: 'Mahsulotlar topilmadi',
    selectSlot: 'Qismni tanlang',
    selectComponentForSlot: 'Slot uchun detal tanlash',
    close: 'Yopish',
    searchPlaceholder: "Nomi yoki xususiyati bo'yicha qidiruv...",
    gamesListTitle: "20 ta eng og'ir o'yindagi unumdorlik",
    heavyGamesNote: "Hisoblash chastota, yadrolar, arxitektura va grafik yuklama testlari asosida amalga oshiriladi.",
    som: "so'm",
  },
};

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'ru',
  setLang: () => {},
  t: translations.ru,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>('ru');

  useEffect(() => {
    const saved = localStorage.getItem('pc_market_lang') as Language;
    if (saved === 'ru' || saved === 'uz') {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('pc_market_lang', newLang);
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
