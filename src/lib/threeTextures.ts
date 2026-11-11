import * as THREE from 'three';

/**
 * Creates a high-detail procedural PCB Motherboard texture with gold traces and component markings.
 */
export function createMotherboardCanvasTexture(): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.CanvasTexture({} as HTMLCanvasElement);

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 1. Dark matte PCB background
  ctx.fillStyle = '#0a0e17';
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle PCB grid texture
  ctx.strokeStyle = '#111927';
  ctx.lineWidth = 1;
  for (let i = 0; i < 1024; i += 16) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 1024);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(1024, i);
    ctx.stroke();
  }

  // 2. Copper & Golden Circuit traces (High-Density Bus lines)
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.55;

  const drawTrace = (startX: number, startY: number, points: [number, number][]) => {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    points.forEach(([px, py]) => ctx.lineTo(px, py));
    ctx.stroke();
  };

  // Traces from CPU to RAM
  for (let i = 0; i < 16; i++) {
    const yOff = i * 14;
    drawTrace(360, 240 + yOff, [
      [420, 240 + yOff],
      [460, 210 + yOff],
      [580, 210 + yOff],
    ]);
  }

  // Traces from CPU to PCIe
  for (let i = 0; i < 12; i++) {
    const xOff = i * 16;
    drawTrace(320 + xOff, 480, [
      [320 + xOff, 530],
      [360 + xOff, 570],
      [360 + xOff, 620],
    ]);
  }

  // 3. Silkscreen Labels and Typography
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 24px monospace';
  ctx.fillText('PC-ULTRA PRO GAMING', 380, 160);

  ctx.font = 'bold 16px sans-serif';
  ctx.fillStyle = '#3b82f6';
  ctx.fillText('SOCKET AM5 / LGA1700 HYBRID', 280, 200);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px monospace';
  ctx.fillText('PCIe 5.0 x16 SAFE-SLOT', 320, 680);
  ctx.fillText('M.2 NVMe Gen5x4 HEATSINK', 320, 750);
  ctx.fillText('DDR5 DUAL CHANNEL 6400+ (OC)', 620, 190);

  // 4. VRM Area decorative heatsink lines
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(80, 120, 160, 320);
  ctx.fillRect(240, 80, 360, 100);

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.8;
  ctx.strokeRect(84, 124, 152, 312);

  // Audio separation line (Yellow/Orange trace)
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(80, 580);
  ctx.lineTo(160, 640);
  ctx.lineTo(160, 920);
  ctx.stroke();

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('SUPREME FX AUDIO', 85, 940);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Creates high-detail GPU backplate and shroud texture with carbon fiber weave and branding.
 */
export function createGpuBackplateCanvasTexture(): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.CanvasTexture({} as HTMLCanvasElement);

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Brushed titanium base
  ctx.fillStyle = '#131822';
  ctx.fillRect(0, 0, 1024, 512);

  // Carbon fiber weave pattern
  ctx.fillStyle = '#0d1117';
  for (let y = 0; y < 512; y += 12) {
    for (let x = 0; x < 1024; x += 12) {
      if ((x / 12 + y / 12) % 2 === 0) {
        ctx.fillRect(x, y, 12, 12);
      }
    }
  }

  // Brushed metal horizontal lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  for (let y = 0; y < 512; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Geometric flow-through ventilation grill lines
  ctx.fillStyle = '#06080d';
  for (let i = 0; i < 18; i++) {
    ctx.beginPath();
    ctx.roundRect(680 + (i % 6) * 45, 80 + Math.floor(i / 6) * 110, 32, 85, 6);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Large White GEFORCE RTX Typography
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 48px "Arial Black", sans-serif';
  ctx.fillText('GEFORCE RTX™', 100, 240);

  // Green accent bar
  ctx.fillStyle = '#76b900';
  ctx.fillRect(100, 265, 480, 8);

  // High-tech subtext
  ctx.font = 'bold 20px monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('ULTRA OC EDITION • 24GB GDDR6X • DLSS 3.5', 100, 310);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Creates illuminated side "GEFORCE RTX" logo plate for graphics card.
 */
export function createGpuSideLogoTexture(): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.CanvasTexture({} as HTMLCanvasElement);

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Black anodized brushed base
  ctx.fillStyle = '#0b0f17';
  ctx.fillRect(0, 0, 512, 128);

  // Subtle metallic horizontal grain
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  for (let y = 0; y < 128; y += 3) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Glowing GeForce Green / Cyan side pill
  ctx.fillStyle = '#76b900';
  ctx.fillRect(24, 20, 8, 88);

  // Bold illuminated GEFORCE RTX Stencil
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#60a5fa';
  ctx.shadowBlur = 12;
  ctx.font = '900 38px "Arial Black", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('GEFORCE RTX™', 48, 76);

  ctx.shadowBlur = 0;
  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('24GB • GDDR6X • DLSS 3.5', 48, 102);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Creates holographic metallic fan center sticker with reflective concentric rings.
 */
export function createFanHubBadgeTexture(): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.CanvasTexture({} as HTMLCanvasElement);

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#090d16';
  ctx.beginPath();
  ctx.arc(128, 128, 128, 0, Math.PI * 2);
  ctx.fill();

  // Silver concentric rings
  for (let r = 20; r <= 110; r += 16) {
    ctx.beginPath();
    ctx.arc(128, 128, r, 0, Math.PI * 2);
    ctx.strokeStyle = r % 32 === 0 ? '#38bdf8' : 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Center logo emblem
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(128, 128, 22, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Creates digital animated LCD / HUD display texture for CPU Cooler.
 */
export function createCoolerLcdCanvasTexture(cpuTemp = 48, cpuName = 'AMD Ryzen 7 7800X3D'): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.CanvasTexture({} as HTMLCanvasElement);

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Black glossy screen base
  ctx.fillStyle = '#030712';
  ctx.fillRect(0, 0, 512, 512);

  // Circular gauge outer ring
  ctx.beginPath();
  ctx.arc(256, 230, 160, 0, Math.PI * 2);
  ctx.lineWidth = 12;
  ctx.strokeStyle = '#1e293b';
  ctx.stroke();

  // Active temperature gradient ring
  const grad = ctx.createLinearGradient(120, 230, 380, 230);
  grad.addColorStop(0, '#38bdf8');
  grad.addColorStop(0.6, '#3b82f6');
  grad.addColorStop(1, '#a855f7');

  ctx.beginPath();
  ctx.arc(256, 230, 160, -Math.PI * 0.75, Math.PI * 0.45);
  ctx.lineWidth = 14;
  ctx.strokeStyle = grad;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Main Temperature Digits
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 84px "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${cpuTemp}`, 240, 250);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText('°C', 320, 215);

  // CPU Model subtext
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 18px monospace';
  ctx.fillText('CPU TEMPERATURE', 256, 150);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 20px sans-serif';
  const cleanName = cpuName.replace('Процессор ', '').replace('Protsessor ', '').slice(0, 24);
  ctx.fillText(cleanName, 256, 320);

  // Pump & Fan telemetry
  ctx.font = '16px monospace';
  ctx.fillStyle = '#10b981';
  ctx.fillText('● PUMP: 2600 RPM  |  FAN: 1450 RPM', 256, 420);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Creates high-detail RAM heatsink texture with brushed metal lines & DDR5 branding.
 */
export function createRamCanvasTexture(): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.CanvasTexture({} as HTMLCanvasElement);

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Dark brushed metal
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, 512, 256);

  // Silver angular facets
  ctx.fillStyle = '#374151';
  ctx.beginPath();
  ctx.moveTo(80, 40);
  ctx.lineTo(240, 40);
  ctx.lineTo(200, 220);
  ctx.lineTo(40, 220);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px "Arial Black", sans-serif';
  ctx.fillText('FURY BEAST', 260, 110);

  ctx.fillStyle = '#3b82f6';
  ctx.font = '900 24px monospace';
  ctx.fillText('DDR5 6000MHz RGB', 260, 150);

  ctx.fillStyle = '#9ca3af';
  ctx.font = '14px monospace';
  ctx.fillText('INTEL XMP 3.0 / AMD EXPO READY', 260, 185);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Creates realistic tempered glass frame texture with screen-printed black border.
 */
export function createTemperedGlassBorderTexture(): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.CanvasTexture({} as HTMLCanvasElement);

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Clear glass interior
  ctx.clearRect(0, 0, 1024, 1024);

  // Solid black silk-screen border (typical of all gaming PC glass panels)
  ctx.fillStyle = '#090d16';
  const bw = 50; // border width
  ctx.fillRect(0, 0, 1024, bw); // top
  ctx.fillRect(0, 1024 - bw, 1024, bw); // bottom
  ctx.fillRect(0, 0, bw, 1024); // left
  ctx.fillRect(1024 - bw, 0, bw, 1024); // right

  // 4 Corner Thumbscrew mounts
  const drawScrew = (x: number, y: number) => {
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#475569';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.fillStyle = '#94a3b8';
    ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x - 12, y - 2, 24, 4);
    ctx.fillRect(x - 2, y - 12, 4, 24);
  };

  drawScrew(bw + 15, bw + 15);
  drawScrew(1024 - bw - 15, bw + 15);
  drawScrew(bw + 15, 1024 - bw - 15);
  drawScrew(1024 - bw - 15, 1024 - bw - 15);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Creates PSU 80 PLUS GOLD label and honeycomb exhaust texture.
 */
export function createPsuCanvasTexture(): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.CanvasTexture({} as HTMLCanvasElement);

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 512, 512);

  // Golden Shield Badge
  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.roundRect(140, 120, 232, 140, 16);
  ctx.fill();
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('80', 256, 185);
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('PLUS GOLD', 256, 225);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('1000W ATX 3.0', 256, 320);

  ctx.font = '16px monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('PCIE 5.0 12VHPWR READY', 256, 360);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Creates high-detail braided cloth cable texture with diagonal cross-weave.
 */
export function createBraidedCableTexture(): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.CanvasTexture({} as HTMLCanvasElement);

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Dark matte carbon background
  ctx.fillStyle = '#0f141d';
  ctx.fillRect(0, 0, 256, 256);

  // Braided diamond cross-weave
  const step = 8;
  for (let y = 0; y < 256; y += step) {
    for (let x = 0; x < 256; x += step) {
      const isEven = ((x / step) + (y / step)) % 2 === 0;
      ctx.fillStyle = isEven ? '#1e2638' : '#0d1117';
      ctx.fillRect(x, y, step, step);

      // Fine thread highlights
      ctx.strokeStyle = isEven ? 'rgba(96, 165, 250, 0.15)' : 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y + step);
      ctx.lineTo(x + step, y);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 16);
  return texture;
}

/**
 * Creates dense aluminum radiator micro-fin texture.
 */
export function createRadiatorFinsTexture(): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.CanvasTexture({} as HTMLCanvasElement);

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#0b0f17';
  ctx.fillRect(0, 0, 512, 128);

  // Micro-fin vertical louvers
  for (let x = 0; x < 512; x += 3) {
    ctx.strokeStyle = x % 6 === 0 ? '#334155' : '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, 4);
    ctx.lineTo(x, 124);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 1);
  return texture;
}
