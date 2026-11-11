export type Language = 'ru' | 'uz';

export type Category = 
  | 'CPU' 
  | 'GPU' 
  | 'MOTHERBOARD' 
  | 'RAM' 
  | 'STORAGE' 
  | 'PSU' 
  | 'CASE' 
  | 'COOLER';

export interface ProductItem {
  id: string;
  slug: string;
  titleRu: string;
  titleUz: string;
  descriptionRu?: string | null;
  descriptionUz?: string | null;
  category: string;
  brand: string;
  priceUzs: number;
  imageUrl: string;
  inStock: boolean;
  
  tdp?: number | null;
  socket?: string | null;
  chipset?: string | null;
  formFactor?: string | null;
  memoryType?: string | null;
  ramSlots?: number | null;
  capacityGb?: number | null;
  modulesCount?: number | null;
  speedMhz?: number | null;
  lengthMm?: number | null;
  maxGpuLength?: number | null;
  coolerHeight?: number | null;
  maxCoolerHeight?: number | null;
  wattage?: number | null;
  efficiencyRating?: string | null;
  supportedSockets?: string | null;
  supportedMotherboards?: string | null;
  benchmarkScore?: number | null;
  specsJson?: string | null;
}

export interface GameItem {
  id: string;
  name: string;
  slug: string;
  posterUrl: string;
  genre: string;
  cpuDemand: number;
  gpuDemand: number;
  baseFps1080p: number;
  descriptionRu?: string | null;
  descriptionUz?: string | null;
}

export type SelectedParts = {
  CPU?: ProductItem | null;
  MOTHERBOARD?: ProductItem | null;
  RAM?: ProductItem | null;
  GPU?: ProductItem | null;
  STORAGE?: ProductItem | null;
  PSU?: ProductItem | null;
  CASE?: ProductItem | null;
  COOLER?: ProductItem | null;
};

export interface CompatibilityIssue {
  type: 'error' | 'warning';
  titleRu: string;
  titleUz: string;
  messageRu: string;
  messageUz: string;
  componentA: Category;
  componentB?: Category;
}

export interface CompatibilityReport {
  isCompatible: boolean;
  totalTdp: number;
  recommendedPsuWattage: number;
  issues: CompatibilityIssue[];
}

export type GraphicPreset = 'low' | 'medium' | 'high' | 'ultra';
export type Resolution = '1080p' | '1440p' | '4k';

export interface GameFpsResult {
  game: GameItem;
  fps: number;
  fps1PercentLow: number;
  isPlayable: boolean;
  bottleneck: 'gpu' | 'cpu' | 'balanced';
}
