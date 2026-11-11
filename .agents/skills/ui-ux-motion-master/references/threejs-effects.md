# Three.js 3D & WebGL Effects Guide

Guidelines and code patterns for interactive 3D hardware visualizations (such as PC cases, components, and lighting).

---

## 1. Setup & Performance Optimization

### Responsive Canvas & DPR Clamping
```ts
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance',
});

// Clamp DPR to max 2 to prevent GPU throttling on 4K screens
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
```

---

## 2. Hardware Materials & Lighting Setup

### High-Tech Studio Lighting
```ts
export const setupStudioLighting = (scene: THREE.Scene) => {
  // Key Light (Sharp shadows, warm white)
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
  keyLight.position.set(5, 8, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  keyLight.shadow.bias = -0.0001;
  scene.add(keyLight);

  // Fill Light (Soft cool blue tone for hardware contrast)
  const fillLight = new THREE.DirectionalLight(0x6366f1, 1.2);
  fillLight.position.set(-6, 3, -4);
  scene.add(fillLight);

  // Rim / Back Light (Accentuates edges)
  const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
  rimLight.position.set(0, -3, -6);
  scene.add(rimLight);

  // Soft Ambient for non-pitch-black shadows
  const ambientLight = new THREE.HemisphereLight(0xffffff, 0x090d16, 0.7);
  scene.add(ambientLight);
};
```

---

## 3. Dynamic RGB Lighting Cycle

```ts
// In your animation loop:
export const updateRgbFans = (fanMaterials: THREE.MeshStandardMaterial[], time: number) => {
  const r = (Math.sin(time * 2) + 1) / 2;
  const g = (Math.sin(time * 2 + (2 * Math.PI) / 3) + 1) / 2;
  const b = (Math.sin(time * 2 + (4 * Math.PI) / 3) + 1) / 2;
  
  const color = new THREE.Color(r, g, b);

  fanMaterials.forEach((mat) => {
    mat.emissive = color;
    mat.emissiveIntensity = 1.8;
  });
};
```

---

## 4. Resource Cleanup (Strict Next.js / React Protocol)

Always clean up in `useEffect` to prevent browser memory leaks:
```ts
return () => {
  cancelAnimationFrame(animationFrameId);
  window.removeEventListener('resize', handleResize);
  renderer.dispose();
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose();
      if (Array.isArray(object.material)) {
        object.material.forEach((m) => m.dispose());
      } else if (object.material) {
        object.material.dispose();
      }
    }
  });
};
```
