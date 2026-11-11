import { CompatibilityIssue, CompatibilityReport, SelectedParts } from './types';

export function checkCompatibility(parts: SelectedParts): CompatibilityReport {
  const issues: CompatibilityIssue[] = [];
  
  const cpu = parts.CPU;
  const mb = parts.MOTHERBOARD;
  const ram = parts.RAM;
  const gpu = parts.GPU;
  const storage = parts.STORAGE;
  const psu = parts.PSU;
  const pcCase = parts.CASE;
  const cooler = parts.COOLER;

  // 1. CPU vs Motherboard Socket
  if (cpu && mb && cpu.socket && mb.socket) {
    if (cpu.socket.toLowerCase() !== mb.socket.toLowerCase()) {
      issues.push({
        type: 'error',
        componentA: 'CPU',
        componentB: 'MOTHERBOARD',
        titleRu: 'Несовместимость сокетов процессора и мат. платы',
        titleUz: 'Protsessor va ona plata soketlari mos kelmaydi',
        messageRu: `Процессор ${cpu.brand} рассчитан на сокет ${cpu.socket}, а материнская плата имеет сокет ${mb.socket}. Физическая установка невозможна.`,
        messageUz: `Protsessor ${cpu.socket} soketiga mo'ljallangan, ona plata esa ${mb.socket} soketiga ega. O'rnatish imkonsiz.`,
      });
    }
  }

  // 2. RAM vs Motherboard Memory Type (DDR4 vs DDR5)
  if (ram && mb && ram.memoryType && mb.memoryType) {
    if (ram.memoryType.toUpperCase() !== mb.memoryType.toUpperCase()) {
      issues.push({
        type: 'error',
        componentA: 'RAM',
        componentB: 'MOTHERBOARD',
        titleRu: 'Несовпадение стандарта оперативной памяти',
        titleUz: "Operativ xotira standarti mos kelmaydi",
        messageRu: `Выбранная память стандарта ${ram.memoryType}, а материнская плата поддерживает только ${mb.memoryType}. Слоты физически несовместимы.`,
        messageUz: `Tanlangan xotira ${ram.memoryType} standartida, ona plata esa faqat ${mb.memoryType} ni qo'llab-quvvatlaydi.`,
      });
    }
  }

  // 3. Motherboard Form Factor vs Case
  if (mb && pcCase && mb.formFactor && pcCase.supportedMotherboards) {
    const supportedList = pcCase.supportedMotherboards.split(',').map((s) => s.trim().toLowerCase());
    const mbFormat = mb.formFactor.toLowerCase();
    
    if (!supportedList.includes(mbFormat)) {
      issues.push({
        type: 'error',
        componentA: 'MOTHERBOARD',
        componentB: 'CASE',
        titleRu: 'Форм-фактор мат. платы не поддерживается корпусом',
        titleUz: 'Ona plata o\'lchami korpusga sig\'maydi',
        messageRu: `Материнская плата формата ${mb.formFactor} не поместится в корпус, поддерживающий форматы: ${pcCase.supportedMotherboards}.`,
        messageUz: `${mb.formFactor} formatidagi ona plata ushbu korpusga sig'maydi. Korpus faqat ${pcCase.supportedMotherboards} o'lchamlarini sig'diradi.`,
      });
    }
  }

  // 4. GPU Length vs Case Max GPU Length
  if (gpu && pcCase && gpu.lengthMm && pcCase.maxGpuLength) {
    if (gpu.lengthMm > pcCase.maxGpuLength) {
      issues.push({
        type: 'error',
        componentA: 'GPU',
        componentB: 'CASE',
        titleRu: 'Видеокарта слишком длинная для данного корпуса',
        titleUz: 'Videokarta ushbu korpus uchun juda uzun',
        messageRu: `Длина видеокарты (${gpu.lengthMm} мм) превышает максимальное пространство в корпусе (${pcCase.maxGpuLength} мм).`,
        messageUz: `Videokarta uzunligi (${gpu.lengthMm} mm) korpusning ruxsat etilgan maksimal bo'shlig'idan (${pcCase.maxGpuLength} mm) katta.`,
      });
    }
  }

  // 5. Cooler Height vs Case Max Cooler Clearance
  if (cooler && pcCase && cooler.coolerHeight && pcCase.maxCoolerHeight) {
    if (cooler.coolerHeight > pcCase.maxCoolerHeight) {
      issues.push({
        type: 'error',
        componentA: 'COOLER',
        componentB: 'CASE',
        titleRu: 'Кулер превышает высоту корпуса',
        titleUz: 'Kuler balandligi korpus ruxsatidan oshib ketdi',
        messageRu: `Высота кулера (${cooler.coolerHeight} мм) больше максимального зазора корпуса (${pcCase.maxCoolerHeight} мм). Боковая крышка не закроется.`,
        messageUz: `Kuler balandligi (${cooler.coolerHeight} mm) korpus sig'diradigan balandlikdan (${pcCase.maxCoolerHeight} mm) yuqori. Yon shisha yopilmaydi.`,
      });
    }
  }

  // 6. Cooler Socket Support vs CPU Socket
  if (cooler && cpu && cooler.supportedSockets && cpu.socket) {
    const supportedSockets = cooler.supportedSockets.split(',').map((s) => s.trim().toLowerCase());
    if (!supportedSockets.includes(cpu.socket.toLowerCase())) {
      issues.push({
        type: 'warning',
        componentA: 'COOLER',
        componentB: 'CPU',
        titleRu: 'Возможно отсутствует крепеж кулера под сокет',
        titleUz: 'Kuler soket uchun maxsus qotirgichga ega bo\'lmasligi mumkin',
        messageRu: `Кулер заявляет поддержку (${cooler.supportedSockets}), сокет процессора (${cpu.socket}). Убедитесь в наличии крепления в комплекте.`,
        messageUz: `Kuler (${cooler.supportedSockets}) soketlarini qo'llaydi, protsessor esa (${cpu.socket}). Qutida to'g'ri qotirgich borligini tekshiring.`,
      });
    }
  }

  // 7. TDP & Power Consumption Calculation
  const cpuTdp = cpu?.tdp || 65;
  const gpuTdp = gpu?.tdp || 75;
  const baseMotherboardAndFans = 70; // Fans, RAM, SSD, Chipset consumption
  const estimatedPeakTdp = (cpu ? cpuTdp : 65) + (gpu ? gpuTdp : 50) + baseMotherboardAndFans;
  const recommendedPsuWattage = Math.round((estimatedPeakTdp * 1.3) / 50) * 50; // +30% headroom rounded to 50W

  if (psu && psu.wattage) {
    if (psu.wattage < estimatedPeakTdp) {
      issues.push({
        type: 'error',
        componentA: 'PSU',
        titleRu: 'Критическая нехватка мощности блока питания',
        titleUz: 'Quvvat blokining kuchi yetarli emas',
        messageRu: `Пиковое потребление системы составляет ~${estimatedPeakTdp} Вт, а мощность БП всего ${psu.wattage} Вт. ПК будет аварийно выключаться под нагрузкой.`,
        messageUz: `Tizimning eng yuqori sarfi ~${estimatedPeakTdp} W, lekin quvvat bloki bor-yo'g'i ${psu.wattage} W. Kompyuter o'chib qolishi mumkin.`,
      });
    } else if (psu.wattage < recommendedPsuWattage) {
      issues.push({
        type: 'warning',
        componentA: 'PSU',
        titleRu: 'Рекомендуется более мощный блок питания',
        titleUz: 'Kuchliroq quvvat bloki tavsiya etiladi',
        messageRu: `Текущий БП на ${psu.wattage} Вт будет работать на пределе. Рекомендуемая мощность с запасом: от ${recommendedPsuWattage} Вт.`,
        messageUz: `${psu.wattage} W quvvat manbai og'ir rejimda ishlaydi. Barqarorlik uchun kamida ${recommendedPsuWattage} W tavsiya etiladi.`,
      });
    }
  }

  const hasFatalErrors = issues.some((i) => i.type === 'error');

  return {
    isCompatible: !hasFatalErrors,
    totalTdp: estimatedPeakTdp,
    recommendedPsuWattage,
    issues,
  };
}
