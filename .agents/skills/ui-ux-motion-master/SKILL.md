---
name: ui-ux-motion-master
description: >-
  Comprehensive UI/UX, motion design, graphic effects, and 3D WebGL styling expert for Next.js, React,
  Tailwind CSS, and Three.js. Use whenever designing, restyling, animating, or reviewing web interfaces,
  cards, navigation, landing pages, 3D product viewers, micro-interactions, dark/light themes, and visual effects.
---

# UI/UX, Motion Design & Creative Effects Skill

This skill governs the aesthetic, interactive, motion, and visual standards for web applications with a focus on modern tech/hardware products (e.g. Next.js 15, React 19, Tailwind CSS, Lucide icons, and Three.js).

---

## 1. Core Visual Aesthetic & UI Architecture

### 1.1 Spatial Depth & Surface Hierarchy
1. **Z-Axis Layering**: Interface is not flat; establish 4 clear elevation tiers:
   - **Base Layer (L0)**: Background `#090d16` (dark mode) / `#f8fafc` (light mode), subtle grid or radial mesh gradient.
   - **Card Surface (L1)**: `bg-gray-900/60 dark:bg-gray-950/70 backdrop-blur-md border border-white/5 dark:border-gray-800/80 rounded-2xl`.
   - **Floating Interactive (L2)**: Hover states, dropdowns, sticky headers, popovers (`bg-gray-800/90 shadow-2xl ring-1 ring-white/10`).
   - **Overlays / Modals (L3)**: Backdrops with `backdrop-blur-xl bg-black/60`, elevated dialogs with subtle neon edge glow.
2. **Glassmorphism Done Right**:
   - Always pair `backdrop-blur-*` with a subtle semi-transparent border (`border-white/10` or `border-gray-800/80`).
   - Avoid excessive blur radius that degrades frame rate; `backdrop-blur-md` (12px) is optimal for interactive surfaces.
3. **Cyber & Hardware Accents**:
   - Utilize targeted glow utilities (`glow-blue`, `glow-emerald`, `glow-rose`) on active badges, indicators, and primary CTAs.
   - Employ gradient borders and sheen highlights (`bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-[1px] rounded-2xl`).

### 1.2 Bento Grid & Data Density
- Use CSS Grid with Bento layouts (`grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6`).
- Feature cards should span `col-span-2` or `row-span-2` with visual weight (e.g., 3D canvas, live FPS meter).
- Tech specs (MHz, TDP, VRAM, Clock, Dimensions) must use `font-mono tabular-nums text-xs tracking-wider text-muted-foreground`.

---

## 2. Motion Design & Micro-Interactions

### 2.1 Motion Physics & Timing
- **Never use linear easings** for UI interactions.
- **Spring Physics Parameters**:
  - Snappy / Hardware feel (buttons, switches): `stiffness: 400`, `damping: 30`, `mass: 0.8`.
  - Smooth Spatial transitions (drawers, modals): `stiffness: 260`, `damping: 24`, `mass: 1`.
  - Gentle Floats / Badges: `stiffness: 120`, `damping: 14`.
- **Micro-Interactions Checklist**:
  - **Click/Tap**: `active:scale-[0.97] transition-transform duration-100`.
  - **Card Hover**: Soft lift `hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 transition-all duration-300 ease-out`.
  - **Sheen Sweep**: Light glare on hover across premium cards (`before:absolute before:inset-0 before:-translate-x-full hover:before:translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:transition-transform before:duration-700`).

### 2.2 Orchestration & Staggering
- When loading or revealing lists/grids, stagger elements with an offset of `40ms` to `60ms` per item.
- For animated mounts and unmounts, keep exit animations 25% faster than enter animations (e.g., Enter: 280ms, Exit: 200ms).

### 2.3 Accessibility: Reduced Motion
Always respect user preferences:
```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 3. 3D WebGL (Three.js) & Canvas Effects

For interactive 3D components (e.g., `PcViewer3D.tsx`):
1. **Rendering Performance**:
   - Cap `devicePixelRatio` to `Math.min(window.devicePixelRatio, 2)` to protect high-DPI GPUs.
   - Use `requestAnimationFrame` with delta timing; pause the render loop or reduce tick rate when the tab is inactive or out of viewport (via `IntersectionObserver`).
2. **Lighting & Material Realism**:
   - Contrast directional key lights with soft ambient/hemisphere lights (`HemisphereLight(0xffffff, 0x111827, 0.6)`).
   - Enhance metallic and hardware surfaces with subtle roughness and metalness textures (`MeshStandardMaterial` with `roughness: 0.3-0.5`, `metalness: 0.8-0.95`).
   - Add pulsating RGB or glowing emissive elements (`material.emissive.setHex(...)` with sinusoidal time modulation).
3. **Clean Lifecycle & Resource Disposal**:
   - Always dispose geometries, materials, and textures in `useEffect` cleanup to prevent memory leaks in Single Page Applications.

---

## 4. Next.js 15 & React 19 Best Practices

1. **Client/Server Boundary**:
   - Keep page metadata, static layout frames, and server data fetching in Server Components.
   - Isolate animated elements, interactive modals, and Three.js canvas in `'use client'` leaf components.
   - Dynamically import heavy 3D or canvas components:
     ```tsx
     const PcViewer3D = dynamic(() => import('@/components/PcViewer3D'), {
       ssr: false,
       loading: () => <PcViewerSkeleton />,
     });
     ```
2. **GPU Compositing Rule**:
   - Only animate `transform`, `opacity`, and `filter`.
   - Never animate `width`, `height`, `margin`, `padding`, or `top/left` directly, as they trigger full layout reflows.

---

## 5. Reference Recipes

- Detailed CSS & Motion recipes: [motion-recipes.md](./references/motion-recipes.md)
- Three.js WebGL lighting, materials, and optimization: [threejs-effects.md](./references/threejs-effects.md)
