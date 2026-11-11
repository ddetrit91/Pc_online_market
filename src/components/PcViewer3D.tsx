'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useBuilder } from '@/lib/builderStore';
import { useI18n } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { formatPriceUzs } from '@/lib/formatters';
import {
  createMotherboardCanvasTexture,
  createGpuBackplateCanvasTexture,
  createGpuSideLogoTexture,
  createFanHubBadgeTexture,
  createCoolerLcdCanvasTexture,
  createRamCanvasTexture,
  createTemperedGlassBorderTexture,
  createPsuCanvasTexture,
  createBraidedCableTexture,
  createRadiatorFinsTexture,
} from '@/lib/threeTextures';
import {
  RotateCcw,
  Eye,
  EyeOff,
  Layers,
  Box,
  Sparkles,
  Flame,
  Palette,
} from 'lucide-react';

/**
 * Builds a photorealistic 120mm ARGB fan module:
 * - Square outer 120mm housing with beveled screw tabs
 * - 4 Corner anti-vibration rubber damper pads
 * - Concentric stator tunnel with inner + outer ARGB halo rings
 * - Central motor hub cylinder with holographic reflective badge
 * - 4 Back stator aerodynamic support struts
 * - 9 Aerodynamic sculpted sickle blades made of frosted polycarbonate
 */
function createPhotorealisticFan(
  badgeTex: THREE.Texture,
  rgbMat: THREE.Material,
  bladeMat: THREE.Material
): { group: THREE.Group; bladesGroup: THREE.Group } {
  const group = new THREE.Group();

  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x0f141d,
    roughness: 0.5,
    metalness: 0.35,
  });

  const rubberMat = new THREE.MeshStandardMaterial({
    color: 0x07090e,
    roughness: 0.9,
    metalness: 0.05,
  });

  // Square frame outer perimeter struts
  const fw = 0.72;
  const fh = 0.07;
  const fd = 0.075;

  const topStrut = new THREE.Mesh(new THREE.BoxGeometry(fw, fh, fd), frameMat);
  topStrut.position.set(0, 0.33, 0);
  group.add(topStrut);

  const botStrut = new THREE.Mesh(new THREE.BoxGeometry(fw, fh, fd), frameMat);
  botStrut.position.set(0, -0.33, 0);
  group.add(botStrut);

  const leftStrut = new THREE.Mesh(new THREE.BoxGeometry(fh, fw - fh * 2, fd), frameMat);
  leftStrut.position.set(-0.33, 0, 0);
  group.add(leftStrut);

  const rightStrut = new THREE.Mesh(new THREE.BoxGeometry(fh, fw - fh * 2, fd), frameMat);
  rightStrut.position.set(0.33, 0, 0);
  group.add(rightStrut);

  // 4 Corner anti-vibration rubber damper pads with screw holes
  const corners: [number, number][] = [
    [-0.305, 0.305],
    [0.305, 0.305],
    [-0.305, -0.305],
    [0.305, -0.305],
  ];
  corners.forEach(([cx, cy]) => {
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.082), rubberMat);
    pad.position.set(cx, cy, 0);
    group.add(pad);

    const hole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.022, 0.086, 12),
      new THREE.MeshStandardMaterial({ color: 0x242d3d, metalness: 0.85, roughness: 0.25 })
    );
    hole.rotation.x = Math.PI / 2;
    hole.position.set(cx, cy, 0);
    group.add(hole);
  });

  // Outer ARGB Halo Ring
  const outerHalo = new THREE.Mesh(new THREE.TorusGeometry(0.315, 0.016, 16, 48), rgbMat);
  group.add(outerHalo);

  // Central Motor Hub Housing
  const motorHub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.065, 32),
    new THREE.MeshStandardMaterial({ color: 0x0c1018, roughness: 0.35, metalness: 0.7 })
  );
  motorHub.rotation.x = Math.PI / 2;
  group.add(motorHub);

  // Holographic Logo Badge on front face
  const badgeMesh = new THREE.Mesh(
    new THREE.CircleGeometry(0.11, 32),
    new THREE.MeshStandardMaterial({ map: badgeTex, roughness: 0.15, metalness: 0.9 })
  );
  badgeMesh.position.set(0, 0, 0.035);
  group.add(badgeMesh);

  // Inner ARGB Hub Diffuser Ring
  const innerHalo = new THREE.Mesh(new THREE.TorusGeometry(0.126, 0.011, 16, 32), rgbMat);
  group.add(innerHalo);

  // 4 Stator support struts at the rear
  for (let s = 0; s < 4; s++) {
    const sAngle = (s * Math.PI) / 2 + Math.PI / 4;
    const strut = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.018, 0.012), frameMat);
    strut.position.set(Math.cos(sAngle) * 0.21, Math.sin(sAngle) * 0.21, -0.032);
    strut.rotation.z = sAngle;
    group.add(strut);
  }

  // Rotating sculpted aerodynamic blades
  const bladesGroup = new THREE.Group();
  for (let b = 0; b < 9; b++) {
    const angle = (b / 9) * Math.PI * 2;
    const bladeMount = new THREE.Group();
    bladeMount.rotation.z = angle;

    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.065, 0.012), bladeMat);
    blade.position.set(0.19, 0, 0);
    blade.rotation.x = 0.36; // aerodynamic pitch angle
    blade.rotation.y = -0.12;
    bladeMount.add(blade);
    bladesGroup.add(bladeMount);
  }
  group.add(bladesGroup);

  return { group, bladesGroup };
}

/**
 * Creates custom braided sleeved cables with acrylic combs
 */
function createSleevedCable(
  points: THREE.Vector3[],
  radius: number,
  strandsCount: number,
  cableTex: THREE.Texture,
  combsAt: number[] = [0.35, 0.65]
): THREE.Group {
  const group = new THREE.Group();
  const curve = new THREE.CatmullRomCurve3(points);

  const cableMat = new THREE.MeshStandardMaterial({
    map: cableTex,
    color: 0x1e2636,
    roughness: 0.6,
    metalness: 0.25,
  });

  const combMat = new THREE.MeshPhysicalMaterial({
    color: 0x0f172a,
    transmission: 0.85,
    opacity: 0.95,
    transparent: true,
    roughness: 0.08,
    ior: 1.45,
  });

  const strandOffset = radius * 1.85;
  for (let s = 0; s < strandsCount; s++) {
    const offset = (s - (strandsCount - 1) / 2) * strandOffset;
    const strandPoints = points.map((p) => new THREE.Vector3(p.x, p.y, p.z + offset));
    const strandCurve = new THREE.CatmullRomCurve3(strandPoints);
    const geo = new THREE.TubeGeometry(strandCurve, 24, radius, 8, false);
    const strandMesh = new THREE.Mesh(geo, cableMat);
    group.add(strandMesh);
  }

  combsAt.forEach((t) => {
    const pt = curve.getPoint(t);
    const comb = new THREE.Mesh(
      new THREE.BoxGeometry(0.035, 0.035, strandsCount * strandOffset + 0.035),
      combMat
    );
    comb.position.copy(pt);
    group.add(comb);
  });

  return group;
}

/**
 * Creates GPU anti-sag support arm
 */
function createGpuSupportArm(): THREE.Group {
  const group = new THREE.Group();
  const aluMat = new THREE.MeshStandardMaterial({
    color: 0x1e2638,
    roughness: 0.25,
    metalness: 0.9,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.2,
    metalness: 0.85,
  });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.04, 24), aluMat);
  base.position.set(1.15, -0.76, 0.45);
  group.add(base);

  const col = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.56, 16), aluMat);
  col.position.set(1.15, -0.46, 0.45);
  group.add(col);

  const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.04, 16), accentMat);
  ring.position.set(1.15, -0.44, 0.45);
  group.add(ring);

  const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.028, 0.12), aluMat);
  shelf.position.set(1.11, -0.21, 0.45);
  group.add(shelf);

  const pad = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.015, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x0a0e17, roughness: 0.9 })
  );
  pad.position.set(1.11, -0.19, 0.45);
  group.add(pad);

  return group;
}

/**
 * Creates Liquid Cooler braided tubing from CPU block to top radiator
 */
function createLiquidCoolerTubing(): THREE.Group {
  const group = new THREE.Group();
  const fittingMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.2,
    metalness: 0.95,
  });
  const tubeMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.55,
    metalness: 0.2,
  });

  const curve1 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.16, 0.55, -0.15),
    new THREE.Vector3(-0.06, 0.82, -0.05),
    new THREE.Vector3(0.18, 1.14, 0.1),
    new THREE.Vector3(0.42, 1.35, 0.05),
  ]);
  const tube1 = new THREE.Mesh(new THREE.TubeGeometry(curve1, 28, 0.034, 12, false), tubeMat);
  group.add(tube1);

  const curve2 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.16, 0.49, -0.12),
    new THREE.Vector3(-0.03, 0.76, 0.02),
    new THREE.Vector3(0.26, 1.1, 0.15),
    new THREE.Vector3(0.52, 1.35, 0.08),
  ]);
  const tube2 = new THREE.Mesh(new THREE.TubeGeometry(curve2, 28, 0.034, 12, false), tubeMat);
  group.add(tube2);

  const fit1 = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.07, 16), fittingMat);
  fit1.position.set(-0.16, 0.55, -0.15);
  group.add(fit1);

  const fit2 = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.07, 16), fittingMat);
  fit2.position.set(-0.16, 0.49, -0.12);
  group.add(fit2);

  const clamp = new THREE.Mesh(
    new THREE.BoxGeometry(0.038, 0.11, 0.048),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.75, roughness: 0.28 })
  );
  clamp.position.set(0.1, 0.95, 0.075);
  group.add(clamp);

  return group;
}

export const PcViewer3D: React.FC<{ className?: string; onSelectSlot?: (category: string) => void }> = ({
  className = '',
  onSelectSlot,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { parts } = useBuilder();
  const { lang } = useI18n();
  const { theme } = useTheme();

  // 3D Controls state
  const [rgbColor, setRgbColor] = useState<string>('#3b82f6');
  const [rainbowCycle, setRainbowCycle] = useState<boolean>(false);
  const [glassOpen, setGlassOpen] = useState<boolean>(false);
  const [exploded, setExploded] = useState<boolean>(false);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [loadedModelsCount, setLoadedModelsCount] = useState<number>(0);
  const [hoveredComponent, setHoveredComponent] = useState<{
    category: string;
    title: string;
    price?: number;
    brand?: string;
    temp: number;
    watts?: number;
  } | null>(null);

  // REFS to prevent React stale closures inside requestAnimationFrame
  const explodedRef = useRef<boolean>(false);
  const glassOpenRef = useRef<boolean>(false);
  const rainbowCycleRef = useRef<boolean>(false);
  const rgbColorRef = useRef<string>('#3b82f6');
  const isRotatingRef = useRef<boolean>(true);
  const partsRef = useRef(parts);
  const coolerLcdMeshRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    partsRef.current = parts;
  }, [parts]);
  useEffect(() => {
    explodedRef.current = exploded;
  }, [exploded]);
  useEffect(() => {
    glassOpenRef.current = glassOpen;
  }, [glassOpen]);
  useEffect(() => {
    rainbowCycleRef.current = rainbowCycle;
  }, [rainbowCycle]);
  useEffect(() => {
    rgbColorRef.current = rgbColor;
  }, [rgbColor]);
  useEffect(() => {
    isRotatingRef.current = isRotating;
  }, [isRotating]);

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const fanMeshesRef = useRef<THREE.Group[]>([]);
  const rgbLightsRef = useRef<THREE.PointLight[]>([]);
  const rgbMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const glassPanelRef = useRef<THREE.Mesh | null>(null);
  const gltfPartsRef = useRef<{ [key: string]: THREE.Group }>({});
  const cablesGroupRef = useRef<THREE.Group | null>(null);

  // Spherical camera coordinates ref
  const sphericalRef = useRef({
    radius: 6.2,
    theta: Math.PI / 4,
    phi: Math.PI / 3,
    targetRadius: 6.2,
    targetTheta: Math.PI / 4,
    targetPhi: Math.PI / 3,
  });

  const setCameraView = (view: 'isometric' | 'internals' | 'top' | 'side') => {
    const s = sphericalRef.current;
    if (view === 'isometric') {
      s.targetRadius = 6.2;
      s.targetTheta = Math.PI / 4;
      s.targetPhi = Math.PI / 3;
    } else if (view === 'internals') {
      s.targetRadius = 3.6;
      s.targetTheta = Math.PI / 3.4;
      s.targetPhi = Math.PI / 2.6;
    } else if (view === 'top') {
      s.targetRadius = 5.6;
      s.targetTheta = Math.PI / 2;
      s.targetPhi = 0.15;
    } else if (view === 'side') {
      s.targetRadius = 5.2;
      s.targetTheta = Math.PI / 2;
      s.targetPhi = Math.PI / 2.2;
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 560;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const isDark = theme === 'dark';
    const bgColor = isDark ? 0x070a12 : 0xe2e8f0;
    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.FogExp2(bgColor, 0.028);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;
    const s = sphericalRef.current;
    camera.position.x = s.radius * Math.sin(s.phi) * Math.sin(s.theta);
    camera.position.y = s.radius * Math.cos(s.phi);
    camera.position.z = s.radius * Math.sin(s.phi) * Math.cos(s.theta);
    camera.lookAt(0, 0, 0);

    // 3. Renderer with soft shadows & ACES tone mapping
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isDark ? 1.35 : 1.2;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. Studio Softbox PMREM Environment Map
    // Gives photorealistic metallic sheen to all copper heatpipes, nickel fins, backplates and glass!
    const envCanvas = document.createElement('canvas');
    envCanvas.width = 1024;
    envCanvas.height = 512;
    const ectx = envCanvas.getContext('2d');
    if (ectx) {
      const grad = ectx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0, '#101624');
      grad.addColorStop(0.5, '#070a12');
      grad.addColorStop(1, '#020408');
      ectx.fillStyle = grad;
      ectx.fillRect(0, 0, 1024, 512);

      // Overhead softbox
      const topG = ectx.createRadialGradient(512, 70, 10, 512, 70, 240);
      topG.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      topG.addColorStop(0.4, 'rgba(215, 235, 255, 0.7)');
      topG.addColorStop(1, 'rgba(215, 235, 255, 0)');
      ectx.fillStyle = topG;
      ectx.fillRect(180, 0, 664, 180);

      // Front-Right key softbox
      const keyG = ectx.createRadialGradient(260, 240, 10, 260, 240, 180);
      keyG.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      keyG.addColorStop(0.5, 'rgba(180, 215, 255, 0.45)');
      keyG.addColorStop(1, 'rgba(180, 215, 255, 0)');
      ectx.fillStyle = keyG;
      ectx.fillRect(50, 90, 420, 280);

      // Warm rim softbox
      const rimG = ectx.createRadialGradient(820, 220, 10, 820, 220, 160);
      rimG.addColorStop(0, 'rgba(255, 215, 165, 0.7)');
      rimG.addColorStop(0.5, 'rgba(255, 165, 90, 0.25)');
      rimG.addColorStop(1, 'rgba(255, 165, 90, 0)');
      ectx.fillStyle = rimG;
      ectx.fillRect(650, 90, 340, 240);
    }
    const envTex = new THREE.CanvasTexture(envCanvas);
    envTex.mapping = THREE.EquirectangularReflectionMapping;
    const pmremGen = new THREE.PMREMGenerator(renderer);
    pmremGen.compileEquirectangularShader();
    const envMap = pmremGen.fromEquirectangular(envTex).texture;
    scene.environment = envMap;

    // 5. Studio Multi-Point Direct Lighting
    const ambientLight = new THREE.AmbientLight(isDark ? 0xffffff : 0xf8fafc, isDark ? 0.7 : 1.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, isDark ? 2.5 : 2.8);
    mainLight.position.set(6, 10, 6);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 30;
    mainLight.shadow.bias = -0.0004;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x60a5fa, isDark ? 1.2 : 1.4);
    fillLight.position.set(-6, 5, -5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xf59e0b, isDark ? 0.8 : 0.6);
    rimLight.position.set(4, 7, -6);
    scene.add(rimLight);

    // Ground Grid & Studio Pedestal
    const gridHelper = new THREE.GridHelper(
      14,
      28,
      isDark ? 0x2563eb : 0x94a3b8,
      isDark ? 0x172554 : 0xcbd5e1
    );
    gridHelper.position.y = -1.72;
    scene.add(gridHelper);

    const floorGeo = new THREE.CylinderGeometry(8, 8, 0.1, 48);
    const floorMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x050811 : 0xf1f5f9,
      roughness: 0.85,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -1.77;
    floor.receiveShadow = true;
    scene.add(floor);

    // 6. Main Root Group for Assembly
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    fanMeshesRef.current = [];
    rgbLightsRef.current = [];
    rgbMaterialsRef.current = [];
    gltfPartsRef.current = {};

    // Dynamic ARGB Materials
    const initialColor = new THREE.Color(rgbColorRef.current);
    const rgbGlowMat = new THREE.MeshStandardMaterial({
      color: initialColor,
      emissive: initialColor,
      emissiveIntensity: 3.0,
      roughness: 0.1,
    });
    rgbMaterialsRef.current.push(rgbGlowMat);

    // Internal Dynamic Point Lights
    const internalLight1 = new THREE.PointLight(initialColor, 4.5, 5.5);
    internalLight1.position.set(0, 0.35, 0.35);
    rootGroup.add(internalLight1);
    rgbLightsRef.current.push(internalLight1);

    const internalLight2 = new THREE.PointLight(initialColor, 3.5, 4.5);
    internalLight2.position.set(0.7, 0.1, -0.1);
    rootGroup.add(internalLight2);
    rgbLightsRef.current.push(internalLight2);

    // 7. Procedural High-Res Photorealistic Textures
    const mbTexture = createMotherboardCanvasTexture();
    const gpuBackplateTexture = createGpuBackplateCanvasTexture();
    const gpuSideLogoTex = createGpuSideLogoTexture();
    const fanHubBadgeTex = createFanHubBadgeTexture();
    const cpuName = parts.CPU ? (parts.CPU.titleRu || parts.CPU.titleUz) : 'AMD Ryzen 7 7800X3D';
    const coolerLcdTexture = createCoolerLcdCanvasTexture(parts.CPU ? 48 : 42, cpuName);
    const ramTexture = createRamCanvasTexture();
    const psuTexture = createPsuCanvasTexture();
    const glassBorderTexture = createTemperedGlassBorderTexture();
    const braidedCableTex = createBraidedCableTexture();
    const radFinsTex = createRadiatorFinsTexture();

    // Fan Blade Material: Frosted semi-translucent polycarbonate
    const fanBladeMat = new THREE.MeshPhysicalMaterial({
      color: 0xf1f5f9,
      roughness: 0.16,
      transmission: 0.42,
      opacity: 0.94,
      transparent: true,
      ior: 1.48,
    });

    // 8. Photorealistic 120mm ARGB Fans
    // Side 3x 120mm Intake Fans (Mounted on vertical chassis bracket)
    for (let i = 0; i < 3; i++) {
      const { group: fGroup, bladesGroup: bGroup } = createPhotorealisticFan(
        fanHubBadgeTex,
        rgbGlowMat,
        fanBladeMat
      );
      fGroup.position.set(1.52, -0.62 + i * 0.78, 0);
      fGroup.rotation.y = Math.PI / 2;
      rootGroup.add(fGroup);
      fanMeshesRef.current.push(bGroup);
    }

    // Rear 120mm Exhaust Fan
    const { group: rGroup, bladesGroup: rbGroup } = createPhotorealisticFan(
      fanHubBadgeTex,
      rgbGlowMat,
      fanBladeMat
    );
    rGroup.position.set(-1.62, 0.52, 0);
    rGroup.rotation.y = -Math.PI / 2;
    rootGroup.add(rGroup);
    fanMeshesRef.current.push(rbGroup);

    // Top 360mm Radiator: 3x 120mm Exhaust Fans under the roof panel
    for (let i = 0; i < 3; i++) {
      const { group: tGroup, bladesGroup: tbGroup } = createPhotorealisticFan(
        fanHubBadgeTex,
        rgbGlowMat,
        fanBladeMat
      );
      tGroup.position.set(-0.72 + i * 0.72, 1.35, 0);
      tGroup.rotation.x = Math.PI / 2;
      tGroup.scale.set(0.9, 0.9, 0.9);
      rootGroup.add(tGroup);
      fanMeshesRef.current.push(tbGroup);
    }

    // 9. Custom Braided Sleeved Cables & Liquid Tubing Harness
    const cablesGroup = new THREE.Group();
    cablesGroupRef.current = cablesGroup;

    // 24-Pin ATX Main Motherboard Cable (Sweeping from grommet into motherboard)
    const atxPoints = [
      new THREE.Vector3(0.82, 0.42, -0.62),
      new THREE.Vector3(0.9, 0.43, -0.35),
      new THREE.Vector3(0.86, 0.44, -0.2),
      new THREE.Vector3(0.72, 0.44, -0.15),
    ];
    const atxCable = createSleevedCable(atxPoints, 0.012, 12, braidedCableTex, [0.3, 0.7]);
    cablesGroup.add(atxCable);

    // 12VHPWR GPU Power Cable (Gracefully swooping from GPU socket down into PSU shroud grommet)
    const gpuPoints = [
      new THREE.Vector3(0.35, -0.06, 0.52),
      new THREE.Vector3(0.35, -0.22, 0.56),
      new THREE.Vector3(0.35, -0.52, 0.52),
      new THREE.Vector3(0.35, -0.78, 0.45),
    ];
    const gpuCable = createSleevedCable(gpuPoints, 0.013, 8, braidedCableTex, [0.35, 0.75]);
    cablesGroup.add(gpuCable);

    // Liquid Cooler AIO Tubing
    const tubing = createLiquidCoolerTubing();
    cablesGroup.add(tubing);

    // GPU Anti-Sag Support Arm
    const gpuArm = createGpuSupportArm();
    cablesGroup.add(gpuArm);

    rootGroup.add(cablesGroup);

    // 10. Load Detailed 3D GLB Models and apply custom textures & PBR materials
    const loader = new GLTFLoader();
    const modelConfigs = [
      { key: 'case', url: '/models/case.glb', pos: [0, 0, 0], scale: 1.0 },
      { key: 'motherboard', url: '/models/motherboard.glb', pos: [0, 0.22, -0.62], scale: 0.88 },
      { key: 'cpu', url: '/models/cpu.glb', pos: [-0.176, 0.44, -0.57], scale: 0.82 },
      { key: 'cooler', url: '/models/cooler.glb', pos: [-0.176, 0.52, -0.22], scale: 0.78 },
      { key: 'gpu', url: '/models/gpu.glb', pos: [0.08, -0.18, 0.12], scale: 0.88 },
      { key: 'ram', url: '/models/ram.glb', pos: [0.46, 0.48, -0.46], scale: 0.82 },
      { key: 'storage', url: '/models/storage.glb', pos: [0.08, 0.08, -0.58], scale: 0.82 },
      { key: 'psu', url: '/models/psu.glb', pos: [-0.72, -1.2, 0], scale: 0.92 },
    ];

    let count = 0;
    modelConfigs.forEach((cfg) => {
      loader.load(
        cfg.url,
        (gltf) => {
          const model = gltf.scene;
          model.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
          model.scale.set(cfg.scale, cfg.scale, cfg.scale);

          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              mesh.userData = { componentKey: cfg.key };

              const matName = (mesh.material as any)?.name || '';

              // Motherboard
              if (cfg.key === 'motherboard') {
                if (mesh.name.includes('PCB')) {
                  mesh.material = new THREE.MeshStandardMaterial({
                    map: mbTexture,
                    roughness: 0.45,
                    metalness: 0.25,
                  });
                } else if (mesh.name.includes('Armor') || mesh.name.includes('VRM') || mesh.name.includes('Chipset') || mesh.name.includes('M2')) {
                  mesh.material = new THREE.MeshStandardMaterial({
                    color: 0x1a2130,
                    roughness: 0.28,
                    metalness: 0.85,
                  });
                } else if (mesh.name.includes('Silver') || mesh.name.includes('Lever')) {
                  mesh.material = new THREE.MeshStandardMaterial({
                    color: 0xd1d5db,
                    roughness: 0.18,
                    metalness: 0.95,
                  });
                } else if (mesh.name.includes('Gold')) {
                  mesh.material = new THREE.MeshStandardMaterial({
                    color: 0xeab308,
                    roughness: 0.2,
                    metalness: 0.95,
                  });
                }
              }

              // GPU
              if (cfg.key === 'gpu') {
                if (mesh.name.includes('Backplate')) {
                  mesh.material = new THREE.MeshStandardMaterial({
                    map: gpuBackplateTexture,
                    roughness: 0.25,
                    metalness: 0.85,
                  });
                } else if (mesh.name.includes('RGB_Side_Strip')) {
                  mesh.material = new THREE.MeshStandardMaterial({
                    map: gpuSideLogoTex,
                    emissiveMap: gpuSideLogoTex,
                    emissive: new THREE.Color(0xffffff),
                    emissiveIntensity: 1.8,
                    roughness: 0.1,
                  });
                } else if (mesh.name.includes('Heatpipe')) {
                  mesh.material = new THREE.MeshStandardMaterial({
                    color: 0xda733a,
                    roughness: 0.18,
                    metalness: 0.95,
                  });
                } else if (mesh.name.includes('Fin')) {
                  mesh.material = new THREE.MeshStandardMaterial({
                    color: 0xc8d1dc,
                    roughness: 0.2,
                    metalness: 0.92,
                  });
                } else if (mesh.name.includes('PCIe_Bracket')) {
                  mesh.material = new THREE.MeshStandardMaterial({
                    color: 0x94a3b8,
                    roughness: 0.25,
                    metalness: 0.9,
                  });
                }
              }

              // Cooler
              if (cfg.key === 'cooler') {
                if (mesh.name.includes('LCD') || mesh.name.includes('Digits')) {
                  coolerLcdMeshRef.current = mesh;
                  mesh.material = new THREE.MeshStandardMaterial({
                    map: coolerLcdTexture,
                    emissiveMap: coolerLcdTexture,
                    emissive: new THREE.Color(0xffffff),
                    emissiveIntensity: 1.5,
                    roughness: 0.1,
                  });
                } else if (mesh.name.includes('Pipe')) {
                  mesh.material = new THREE.MeshStandardMaterial({
                    color: 0xda733a,
                    roughness: 0.18,
                    metalness: 0.95,
                  });
                } else if (mesh.name.includes('Tower') || mesh.name.includes('Fin')) {
                  mesh.material = new THREE.MeshStandardMaterial({
                    color: 0xc8d1dc,
                    roughness: 0.22,
                    metalness: 0.9,
                  });
                }
              }

              // RAM
              if (cfg.key === 'ram' && mesh.name.includes('Armor')) {
                mesh.material = new THREE.MeshStandardMaterial({
                  map: ramTexture,
                  roughness: 0.35,
                  metalness: 0.75,
                });
              }

              // PSU
              if (cfg.key === 'psu' && mesh.name.includes('Chassis')) {
                mesh.material = new THREE.MeshStandardMaterial({
                  map: psuTexture,
                  roughness: 0.5,
                  metalness: 0.45,
                });
              }

              // Case - Crystal-Clear Front Glass & Radiator Fin Texture
              if (cfg.key === 'case') {
                if (mesh.name.includes('Glass') || matName.includes('Glass')) {
                  mesh.material = new THREE.MeshPhysicalMaterial({
                    color: 0xffffff,
                    transmission: 0.98,
                    opacity: 1.0,
                    transparent: true,
                    roughness: 0.02,
                    metalness: 0.05,
                    ior: 1.52,
                    reflectivity: 0.5,
                    clearcoat: 1.0,
                    clearcoatRoughness: 0.02,
                  });
                } else if (mesh.name.includes('Radiator')) {
                  mesh.material = new THREE.MeshStandardMaterial({
                    map: radFinsTex,
                    roughness: 0.3,
                    metalness: 0.85,
                  });
                }
              }

              // Connect ARGB elements
              const mat = mesh.material as THREE.MeshStandardMaterial;
              if (mat && (matName.includes('RGB') || matName.includes('Glow') || matName.includes('Bar'))) {
                mat.color = initialColor;
                mat.emissive = initialColor;
                mat.emissiveIntensity = 2.5;
                rgbMaterialsRef.current.push(mat);
              }
            }
          });

          rootGroup.add(model);
          gltfPartsRef.current[cfg.key] = model;
          count++;
          setLoadedModelsCount(count);
        },
        undefined,
        (err) => console.warn(`Could not load ${cfg.url}`, err)
      );
    });

    // 11. Removable Side Tempered Glass Door Panel
    // Crystal clear 98% transmission glass with authentic black screen-printed perimeter & thumbscrews
    const glassMat = new THREE.MeshPhysicalMaterial({
      map: glassBorderTexture,
      color: 0xffffff,
      transmission: 0.98,
      opacity: 1.0,
      transparent: true,
      roughness: 0.02,
      metalness: 0.05,
      ior: 1.52,
      reflectivity: 0.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      specularIntensity: 1.0,
    });
    const glassPanel = new THREE.Mesh(new THREE.BoxGeometry(3.38, 2.68, 0.035), glassMat);
    glassPanel.position.set(0, 0.18, 0.88);
    glassPanel.castShadow = false;
    glassPanel.receiveShadow = true;
    glassPanel.userData = { componentKey: 'glass' };
    glassPanelRef.current = glassPanel;
    rootGroup.add(glassPanel);

    // 12. Interactive Mouse Orbit & Raycasting
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(rootGroup.children, true);

      for (const hit of intersects) {
        const k = hit.object.userData?.componentKey;
        if (k && k !== 'case' && k !== 'glass' && onSelectSlot) {
          const catMap: Record<string, string> = {
            gpu: 'GPU',
            cpu: 'CPU',
            motherboard: 'MOTHERBOARD',
            ram: 'RAM',
            cooler: 'COOLER',
            storage: 'STORAGE',
            psu: 'PSU',
          };
          if (catMap[k]) {
            onSelectSlot(catMap[k]);
            break;
          }
        }
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(rootGroup.children, true);

      let foundKey: string | null = null;
      for (const hit of intersects) {
        if (hit.object.userData?.componentKey) {
          foundKey = hit.object.userData.componentKey;
          break;
        }
      }

      if (foundKey && foundKey !== 'case' && foundKey !== 'glass') {
        const catMap: Record<string, string> = {
          gpu: 'GPU',
          cpu: 'CPU',
          motherboard: 'MOTHERBOARD',
          ram: 'RAM',
          cooler: 'COOLER',
          storage: 'STORAGE',
          psu: 'PSU',
        };
        const cat = catMap[foundKey];
        const selected = (partsRef.current as any)[cat];
        setHoveredComponent({
          category: cat,
          title: selected ? (lang === 'uz' ? (selected.titleUz || selected.titleRu) : selected.titleRu) : `${cat} Component`,
          price: selected?.priceUzs,
          brand: selected?.brand,
          temp: cat === 'GPU' ? 48 : cat === 'CPU' ? 52 : cat === 'COOLER' ? 42 : 36,
          watts: selected?.tdp || (cat === 'GPU' ? 285 : cat === 'CPU' ? 120 : undefined),
        });
      } else {
        setHoveredComponent(null);
      }

      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;

      const s = sphericalRef.current;
      s.targetTheta -= deltaX * 0.007;
      s.targetPhi -= deltaY * 0.007;
      s.targetPhi = Math.max(0.08, Math.min(Math.PI / 2 - 0.03, s.targetPhi));

      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = sphericalRef.current;
      s.targetRadius += e.deltaY * 0.004;
      s.targetRadius = Math.max(2.6, Math.min(9.5, s.targetRadius));
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    domElement.addEventListener('click', onClick);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });

    // 13. Main Render & Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();
    let hue = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Spin animated fan blades with aerodynamic speed
      fanMeshesRef.current.forEach((mesh) => {
        mesh.rotation.z += delta * 15;
      });

      // Rainbow RGB cycle mode using REF
      if (rainbowCycleRef.current) {
        hue = (hue + delta * 0.15) % 1.0;
        const rainbowColor = new THREE.Color().setHSL(hue, 1.0, 0.55);
        rgbLightsRef.current.forEach((light) => {
          light.color.copy(rainbowColor);
        });
        rgbMaterialsRef.current.forEach((mat) => {
          mat.color.copy(rainbowColor);
          mat.emissive.copy(rainbowColor);
        });
      }

      // Smooth camera interpolation (LERP)
      const s = sphericalRef.current;
      if (isRotatingRef.current && !isDragging) {
        s.targetTheta += delta * 0.18;
      }
      s.radius += (s.targetRadius - s.radius) * 0.08;
      s.theta += (s.targetTheta - s.theta) * 0.08;
      s.phi += (s.targetPhi - s.phi) * 0.08;

      camera.position.x = s.radius * Math.sin(s.phi) * Math.sin(s.theta);
      camera.position.y = s.radius * Math.cos(s.phi);
      camera.position.z = s.radius * Math.sin(s.phi) * Math.cos(s.theta);
      camera.lookAt(0, 0, 0);

      // Smoothly animate exploded view positions
      const isExp = explodedRef.current;
      const g = gltfPartsRef.current;
      if (g) {
        const targetGpuZ = isExp ? 1.7 : 0.12;
        const targetCoolerZ = isExp ? 1.45 : -0.22;
        const targetCpuZ = isExp ? 0.75 : -0.57;
        const targetRamZ = isExp ? 0.95 : -0.46;
        const targetStorageZ = isExp ? 0.8 : -0.58;
        const targetMbZ = isExp ? 0.15 : -0.62;
        const targetPsuX = isExp ? -1.85 : -0.72;

        if (g.gpu) g.gpu.position.z += (targetGpuZ - g.gpu.position.z) * 0.1;
        if (g.cooler) g.cooler.position.z += (targetCoolerZ - g.cooler.position.z) * 0.1;
        if (g.cpu) g.cpu.position.z += (targetCpuZ - g.cpu.position.z) * 0.1;
        if (g.ram) g.ram.position.z += (targetRamZ - g.ram.position.z) * 0.1;
        if (g.storage) g.storage.position.z += (targetStorageZ - g.storage.position.z) * 0.1;
        if (g.motherboard) g.motherboard.position.z += (targetMbZ - g.motherboard.position.z) * 0.1;
        if (g.psu) g.psu.position.x += (targetPsuX - g.psu.position.x) * 0.1;
      }

      // Smoothly animate removable glass panel door
      if (glassPanelRef.current) {
        const isOpen = glassOpenRef.current;
        const targetZ = isOpen ? 2.3 : isExp ? 2.5 : 0.88;
        const targetRotY = isOpen ? Math.PI / 3 : 0;
        glassPanelRef.current.position.z += (targetZ - glassPanelRef.current.position.z) * 0.08;
        glassPanelRef.current.rotation.y += (targetRotY - glassPanelRef.current.rotation.y) * 0.08;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 560;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener('mousedown', onMouseDown);
      domElement.removeEventListener('click', onClick);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [theme]);

  // Dynamically update cooler LCD when CPU changes in builder
  useEffect(() => {
    if (coolerLcdMeshRef.current) {
      const cpuName = parts.CPU ? (parts.CPU.titleRu || parts.CPU.titleUz) : 'AMD Ryzen 7 7800X3D';
      const newTex = createCoolerLcdCanvasTexture(parts.CPU ? 48 : 42, cpuName);
      const mat = coolerLcdMeshRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.map = newTex;
        mat.emissiveMap = newTex;
        mat.needsUpdate = true;
      }
    }
  }, [parts.CPU]);

  // Handle manual RGB color selection
  useEffect(() => {
    if (rainbowCycle) return;
    const color = new THREE.Color(rgbColor);
    rgbLightsRef.current.forEach((light) => {
      light.color = color;
    });
    rgbMaterialsRef.current.forEach((mat) => {
      mat.color = color;
      mat.emissive = color;
    });
  }, [rgbColor, rainbowCycle]);

  const presetColors = [
    { name: 'Cyber Blue', hex: '#3b82f6' },
    { name: 'Neon Purple', hex: '#a855f7' },
    { name: 'Emerald Tech', hex: '#10b981' },
    { name: 'Blood Crimson', hex: '#ef4444' },
    { name: 'Sunset Amber', hex: '#f59e0b' },
    { name: 'Stealth White', hex: '#ffffff' },
  ];

  return (
    <div className={`relative flex flex-col rounded-3xl border border-gray-200 dark:border-gray-800 bg-slate-100 dark:bg-gray-950 overflow-hidden shadow-2xl transition-colors ${className}`}>
      {/* 3D Canvas */}
      <div
        ref={containerRef}
        className="relative h-[500px] sm:h-[620px] w-full cursor-grab active:cursor-grabbing select-none"
      />

      {/* Top Floating Badges */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 pointer-events-none">
        <span className="flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-white/90 dark:bg-gray-900/90 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 backdrop-blur-md shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
          <span>PRO PHOTOREALISTIC 3D ASSEMBLY</span>
        </span>
        <span className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 backdrop-blur-md shadow-sm">
          <Box className="h-3.5 w-3.5 text-emerald-500" />
          <span>{loadedModelsCount}/8 3D High-Res Models Active</span>
        </span>
      </div>

      {/* Interactive Hover HUD Tooltip */}
      {hoveredComponent && (
        <div className="absolute top-16 left-4 z-20 max-w-xs rounded-2xl border border-blue-500/40 bg-white/95 dark:bg-gray-900/95 p-3.5 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 pointer-events-none">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {hoveredComponent.category}
            </span>
            <div className="flex items-center gap-2">
              {hoveredComponent.watts && (
                <span className="text-[10px] font-mono text-gray-400">
                  {hoveredComponent.watts}W
                </span>
              )}
              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                <Flame className="h-3 w-3" />
                <span>{hoveredComponent.temp}°C</span>
              </span>
            </div>
          </div>
          <h4 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">
            {hoveredComponent.title}
          </h4>
          {hoveredComponent.brand && (
            <p className="text-[10px] text-gray-500 font-mono mt-0.5">
              Бренд: {hoveredComponent.brand}
            </p>
          )}
          {hoveredComponent.price ? (
            <div className="mt-1.5 pt-1.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
              <span className="text-gray-400 text-[10px]">Цена:</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400">
                {formatPriceUzs(hoveredComponent.price, lang)}
              </span>
            </div>
          ) : (
            <p className="mt-1.5 text-[10px] text-blue-500 font-semibold">
              Кликните для выбора детали в сборку
            </p>
          )}
        </div>
      )}

      {/* Top-Right Camera Angles Selector */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/85 dark:bg-gray-900/85 p-1.5 backdrop-blur-md shadow-md">
        <button
          onClick={() => setCameraView('isometric')}
          className="rounded-xl px-2.5 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          title="Общий ракурс 3/4"
        >
          Общий
        </button>
        <button
          onClick={() => setCameraView('internals')}
          className="rounded-xl px-2.5 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          title="Приблизить комплектующие"
        >
          Внутри
        </button>
        <button
          onClick={() => setCameraView('side')}
          className="rounded-xl px-2.5 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          title="Вид сбоку"
        >
          Сбоку
        </button>
        <button
          onClick={() => setCameraView('top')}
          className="rounded-xl px-2.5 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          title="Вид сверху"
        >
          Сверху
        </button>
      </div>

      {/* Bottom Floating Interactive Toolbar */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 dark:border-gray-800/80 bg-white/85 dark:bg-gray-900/85 p-3.5 backdrop-blur-md shadow-lg">
        {/* RGB Palette & Rainbow Mode */}
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-blue-500 shrink-0 hidden sm:block" />
          <span className="text-xs font-bold text-gray-600 dark:text-gray-400 mr-1 hidden sm:block">RGB:</span>

          <div className="flex items-center gap-1.5">
            {presetColors.map((c) => (
              <button
                key={c.hex}
                onClick={() => {
                  setRainbowCycle(false);
                  setRgbColor(c.hex);
                }}
                style={{ backgroundColor: c.hex }}
                className={`h-6 w-6 rounded-full transition-transform ${
                  !rainbowCycle && rgbColor === c.hex
                    ? 'scale-125 ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-950 shadow-md'
                    : 'hover:scale-110 opacity-80'
                }`}
                title={c.name}
              />
            ))}

            {/* Rainbow Wave Cycle Toggle */}
            <button
              onClick={() => setRainbowCycle(!rainbowCycle)}
              className={`ml-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all shadow-sm ${
                rainbowCycle
                  ? 'bg-gradient-to-r from-red-500 via-green-500 to-blue-500 text-white shadow-md animate-pulse'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
              }`}
              title="Переливающаяся радужная подсветка"
            >
              🌈 Радуга
            </button>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="flex items-center gap-2">
          {/* Side Glass Toggle */}
          <button
            onClick={() => {
              const next = !glassOpen;
              setGlassOpen(next);
              glassOpenRef.current = next;
            }}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border transition-all ${
              glassOpen
                ? 'border-blue-500 bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'border-gray-300 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800'
            }`}
          >
            {glassOpen ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            <span>
              {glassOpen
                ? (lang === 'uz' ? 'Shishani yopish' : 'Закрыть стекло')
                : (lang === 'uz' ? 'Shishani ochish' : 'Снять стекло')}
            </span>
          </button>

          {/* Exploded / Assembly View Toggle */}
          <button
            onClick={() => {
              const next = !exploded;
              setExploded(next);
              explodedRef.current = next;
            }}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border transition-all ${
              exploded
                ? 'border-purple-500 bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'border-gray-300 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>
              {exploded
                ? (lang === 'uz' ? "Yig'ish" : 'Собрать')
                : (lang === 'uz' ? 'Qismlarga ajratish' : 'Взрыв-схема 3D')}
            </span>
          </button>

          {/* Auto Rotation Toggle */}
          <button
            onClick={() => {
              const next = !isRotating;
              setIsRotating(next);
              isRotatingRef.current = next;
            }}
            className={`rounded-xl border p-2 text-xs transition-all ${
              isRotating
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                : 'border-gray-300 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/70 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            title={lang === 'uz' ? 'Avtomatik aylanish' : 'Авто-вращение'}
          >
            <RotateCcw className={`h-4 w-4 ${isRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
          </button>
        </div>
      </div>
    </div>
  );
};
