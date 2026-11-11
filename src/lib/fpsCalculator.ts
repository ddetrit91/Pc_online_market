import { GameFpsResult, GameItem, GraphicPreset, Resolution, SelectedParts } from './types';

const RESOLUTION_MULTIPLIERS: Record<Resolution, number> = {
  '1080p': 1.0,
  '1440p': 0.72,
  '4k': 0.45,
};

const PRESET_MULTIPLIERS: Record<GraphicPreset, number> = {
  low: 1.62,
  medium: 1.28,
  high: 1.0,
  ultra: 0.74,
};

// Baseline reference system: Core i5 / Ryzen 5 5600 (5500 pts) + RTX 4060 Ti (6300 pts)
const BASELINE_CPU_SCORE = 5500;
const BASELINE_GPU_SCORE = 6300;

export function calculateGameFps(
  game: GameItem,
  parts: SelectedParts,
  preset: GraphicPreset = 'high',
  resolution: Resolution = '1080p'
): GameFpsResult {
  const cpu = parts.CPU;
  const gpu = parts.GPU;
  const ram = parts.RAM;

  // Default fallback scores if not selected
  const cpuScore = cpu?.benchmarkScore || 5000;
  const gpuScore = gpu?.benchmarkScore || 4500;
  const ramCapacity = ram?.capacityGb || 16;

  // RAM scaling factor (16GB standard, 32GB gives slight boost in heavy titles, 8GB penalties)
  let ramFactor = 1.0;
  if (ramCapacity < 16) {
    ramFactor = 0.82;
  } else if (ramCapacity >= 32) {
    ramFactor = 1.06;
  }

  // Scaling ratios based on demanding factors
  // In 4K, GPU demand dominates heavily. In 1080p, CPU matters more.
  const resMult = RESOLUTION_MULTIPLIERS[resolution];
  const presetMult = PRESET_MULTIPLIERS[preset];

  // Weight distribution between CPU and GPU depending on resolution
  let cpuWeight = 0.4;
  let gpuWeight = 0.6;
  if (resolution === '1440p') {
    cpuWeight = 0.25;
    gpuWeight = 0.75;
  } else if (resolution === '4k') {
    cpuWeight = 0.12;
    gpuWeight = 0.88;
  }

  // Calculate potential FPS limited by CPU and limited by GPU
  const cpuRatio = Math.pow(cpuScore / BASELINE_CPU_SCORE, 0.75);
  const gpuRatio = Math.pow(gpuScore / BASELINE_GPU_SCORE, 0.95);

  const cpuPotentialFps = game.baseFps1080p * cpuRatio * (1 / (game.cpuDemand * 0.4 + 0.6));
  const gpuPotentialFps = game.baseFps1080p * gpuRatio * (1 / (game.gpuDemand * 0.4 + 0.6));

  // Determine Bottleneck
  let bottleneck: 'gpu' | 'cpu' | 'balanced' = 'balanced';
  if (cpuPotentialFps < gpuPotentialFps * 0.8) {
    bottleneck = 'cpu';
  } else if (gpuPotentialFps < cpuPotentialFps * 0.8) {
    bottleneck = 'gpu';
  }

  // Final combined FPS with weighted harmonic-geometric blend
  const blendedRatio = Math.pow(cpuRatio, cpuWeight) * Math.pow(gpuRatio, gpuWeight);
  let finalFps = game.baseFps1080p * blendedRatio * resMult * presetMult * ramFactor;

  // Keep within reasonable realism limits
  finalFps = Math.max(15, Math.min(360, finalFps));
  const avgFps = Math.round(finalFps);
  const fps1PercentLow = Math.max(10, Math.round(avgFps * 0.73));

  return {
    game,
    fps: avgFps,
    fps1PercentLow,
    isPlayable: avgFps >= 45,
    bottleneck,
  };
}

export function calculateAllGamesFps(
  games: GameItem[],
  parts: SelectedParts,
  preset: GraphicPreset = 'high',
  resolution: Resolution = '1080p'
): GameFpsResult[] {
  return games.map((game) => calculateGameFps(game, parts, preset, resolution));
}
