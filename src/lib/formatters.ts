import { Language } from './types';

export function formatPriceUzs(amount: number, lang: Language = 'ru'): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `0 ${lang === 'uz' ? "so'm" : 'сум'}`;
  }
  const formatted = new Intl.NumberFormat('ru-RU').format(Math.round(amount));
  return `${formatted} ${lang === 'uz' ? "so'm" : 'сум'}`;
}

export function formatWattage(watt: number): string {
  return `${watt} W`;
}

export function formatSize(mm: number): string {
  return `${mm} мм`;
}
