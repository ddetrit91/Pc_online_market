import { NextResponse } from 'next/server';
import { checkCompatibility } from '@/lib/compatibility';
import { calculateGameFps } from '@/lib/fpsCalculator';

export async function GET() {
  // Test 1: Incompatible Socket (Ryzen 7 7800X3D AM5 + MSI B760 LGA1700)
  const test1 = checkCompatibility({
    CPU: { id: '1', slug: 'cpu', titleRu: 'Ryzen 7', titleUz: 'Ryzen 7', category: 'CPU', brand: 'AMD', priceUzs: 1000, imageUrl: '', inStock: true, socket: 'AM5', tdp: 120 },
    MOTHERBOARD: { id: '2', slug: 'mb', titleRu: 'MSI B760', titleUz: 'MSI B760', category: 'MOTHERBOARD', brand: 'MSI', priceUzs: 1000, imageUrl: '', inStock: true, socket: 'LGA1700', memoryType: 'DDR5' },
  });

  // Test 2: Incompatible RAM (DDR4 RAM on DDR5 Motherboard)
  const test2 = checkCompatibility({
    MOTHERBOARD: { id: '2', slug: 'mb', titleRu: 'MSI B650', titleUz: 'MSI B650', category: 'MOTHERBOARD', brand: 'MSI', priceUzs: 1000, imageUrl: '', inStock: true, socket: 'AM5', memoryType: 'DDR5' },
    RAM: { id: '3', slug: 'ram', titleRu: 'Kingston DDR4', titleUz: 'Kingston DDR4', category: 'RAM', brand: 'Kingston', priceUzs: 1000, imageUrl: '', inStock: true, memoryType: 'DDR4' },
  });

  // Test 3: GPU too long for Case (RTX 4090 357mm in Compact Case 255mm)
  const test3 = checkCompatibility({
    GPU: { id: '4', slug: 'gpu', titleRu: 'RTX 4090', titleUz: 'RTX 4090', category: 'GPU', brand: 'ASUS', priceUzs: 1000, imageUrl: '', inStock: true, lengthMm: 357, tdp: 450 },
    CASE: { id: '5', slug: 'case', titleRu: 'Jonsbo C6', titleUz: 'Jonsbo C6', category: 'CASE', brand: 'Jonsbo', priceUzs: 1000, imageUrl: '', inStock: true, maxGpuLength: 255 },
  });

  // Test 4: Insufficient PSU Wattage (500W PSU with 14900K + RTX 4090 ~ 770W peak)
  const test4 = checkCompatibility({
    CPU: { id: '1', slug: 'cpu', titleRu: 'i9', titleUz: 'i9', category: 'CPU', brand: 'Intel', priceUzs: 1000, imageUrl: '', inStock: true, tdp: 253 },
    GPU: { id: '4', slug: 'gpu', titleRu: 'RTX 4090', titleUz: 'RTX 4090', category: 'GPU', brand: 'ASUS', priceUzs: 1000, imageUrl: '', inStock: true, tdp: 450 },
    PSU: { id: '6', slug: 'psu', titleRu: '500W', titleUz: '500W', category: 'PSU', brand: 'DeepCool', priceUzs: 1000, imageUrl: '', inStock: true, wattage: 500 },
  });

  // Test 5: Fully Compatible Build
  const test5 = checkCompatibility({
    CPU: { id: '1', slug: 'cpu', titleRu: '7800X3D', titleUz: '7800X3D', category: 'CPU', brand: 'AMD', priceUzs: 1000, imageUrl: '', inStock: true, socket: 'AM5', tdp: 120, benchmarkScore: 9800 },
    MOTHERBOARD: { id: '2', slug: 'mb', titleRu: 'B650', titleUz: 'B650', category: 'MOTHERBOARD', brand: 'ASUS', priceUzs: 1000, imageUrl: '', inStock: true, socket: 'AM5', memoryType: 'DDR5', formFactor: 'ATX' },
    RAM: { id: '3', slug: 'ram', titleRu: '32GB DDR5', titleUz: '32GB DDR5', category: 'RAM', brand: 'Kingston', priceUzs: 1000, imageUrl: '', inStock: true, memoryType: 'DDR5', capacityGb: 32 },
    GPU: { id: '4', slug: 'gpu', titleRu: 'RTX 4080 Super', titleUz: 'RTX 4080 Super', category: 'GPU', brand: 'MSI', priceUzs: 1000, imageUrl: '', inStock: true, lengthMm: 310, tdp: 320, benchmarkScore: 12500 },
    CASE: { id: '5', slug: 'case', titleRu: 'Lian Li', titleUz: 'Lian Li', category: 'CASE', brand: 'Lian Li', priceUzs: 1000, imageUrl: '', inStock: true, maxGpuLength: 420, maxCoolerHeight: 167, supportedMotherboards: 'ATX,Micro-ATX' },
    COOLER: { id: '7', slug: 'cooler', titleRu: 'AK620', titleUz: 'AK620', category: 'COOLER', brand: 'DeepCool', priceUzs: 1000, imageUrl: '', inStock: true, coolerHeight: 162, supportedSockets: 'AM4,AM5,LGA1700' },
    PSU: { id: '6', slug: 'psu', titleRu: '850W', titleUz: '850W', category: 'PSU', brand: 'DeepCool', priceUzs: 1000, imageUrl: '', inStock: true, wattage: 850 },
  });

  // Test FPS Calculation for Cyberpunk 2077
  const fpsCyberpunk = calculateGameFps(
    {
      id: 'cp',
      name: 'Cyberpunk 2077',
      slug: 'cyberpunk-2077',
      genre: 'RPG',
      posterUrl: '',
      cpuDemand: 1.5,
      gpuDemand: 2.1,
      baseFps1080p: 65,
    },
    {
      CPU: { id: '1', slug: 'cpu', titleRu: '7800X3D', titleUz: '7800X3D', category: 'CPU', brand: 'AMD', priceUzs: 1000, imageUrl: '', inStock: true, benchmarkScore: 9800 },
      GPU: { id: '4', slug: 'gpu', titleRu: 'RTX 4080 Super', titleUz: 'RTX 4080 Super', category: 'GPU', brand: 'MSI', priceUzs: 1000, imageUrl: '', inStock: true, benchmarkScore: 12500 },
      RAM: { id: '3', slug: 'ram', titleRu: '32GB', titleUz: '32GB', category: 'RAM', brand: 'Kingston', priceUzs: 1000, imageUrl: '', inStock: true, capacityGb: 32 },
    },
    'ultra',
    '1440p'
  );

  return NextResponse.json({
    test1_socket_mismatch: { passed: !test1.isCompatible, issue: test1.issues[0]?.titleRu },
    test2_ram_mismatch: { passed: !test2.isCompatible, issue: test2.issues[0]?.titleRu },
    test3_gpu_length: { passed: !test3.isCompatible, issue: test3.issues[0]?.titleRu },
    test4_psu_deficit: { passed: !test4.isCompatible, issue: test4.issues[0]?.titleRu },
    test5_fully_compatible: {
      passed: test5.isCompatible,
      totalTdp: test5.totalTdp,
      recommendedPsu: test5.recommendedPsuWattage,
    },
    fps_test_cyberpunk_1440p_ultra: {
      game: fpsCyberpunk.game.name,
      avgFps: fpsCyberpunk.fps,
      low1Percent: fpsCyberpunk.fps1PercentLow,
      bottleneck: fpsCyberpunk.bottleneck,
    },
  });
}
