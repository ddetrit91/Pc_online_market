# Project Tech Stack Reference

> **File:** `memory/tech-stack.md`  
> **Purpose:** Token-efficient summary of frameworks, dependencies, and environment configuration.

---

## 1. Core Framework & Runtime
* **Framework:** Next.js `15.1.7` (App Router)
* **React Engine:** React `19.0.0` & React DOM `19.0.0`
* **Language:** TypeScript `5.7.3` (Strict mode)
* **Build Tool:** Next.js Turbopack / Webpack hybrid build (`next build`)

## 2. Frontend Styling & Visual Design
* **Styling Engine:** Tailwind CSS `3.4.1` with PostCSS and Autoprefixer
* **Utility Helpers:** `clsx` (v2.1.1), `tailwind-merge` (v3.0.1)
* **Icon Library:** Lucide React (`lucide-react` v0.475.0)
* **Themes:** Dual-theme system (`class` strategy in `tailwind.config.ts`), root variables in `globals.css`
* **Custom Effects:** `.bg-cyber-grid`, `@keyframes shimmerSweep`, `.glass-panel`, `.glow-indigo`, `.glow-emerald`, `.glow-blue`

## 3. 3D Graphics & Canvas
* **Library:** Three.js `0.187.0` (`@types/three` 0.187.0)
* **Rendering Strategy:** Procedural mesh generation (Cases, Motherboards, Fans, Sleeved Cables, Shaders) inside `useEffect` in `PcViewer3D.tsx` with DPR clamping (`Math.min(window.devicePixelRatio, 2)`) and full GPU resource disposal.

## 4. Backend & Database
* **ORM:** Prisma `6.4.0` (`@prisma/client`)
* **Database Provider:** Serverless PostgreSQL on Neon (`@neon/config`, `@neon/env`)
* **Storage Provider:** AWS S3 SDK (`@aws-sdk/client-s3`)
* **State Management:** Custom lightweight React context stores (`builderStore`, `cartStore`, `authStore`, `theme`, `i18n`)
