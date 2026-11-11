# Session State & Fast Context Recovery

> **Usage:** Read this file when resuming work or after conversation compaction to immediately understand project state without wasting tokens re-reading codebase files.

---

## 1. Quick Glance
* **Project Name:** PC Online Market & 3D Configurator (`pc-online-market`)
* **Live Stack:** Next.js 15.1.7 (App Router), React 19.0.0, TypeScript 5.7.3, Tailwind CSS 3.4.1, Three.js 0.187.0, Prisma 6.4.0, Neon PostgreSQL.
* **Current Working Directory:** `c:\Users\Lenovo\Desktop\Проект по AI-разработке\4-Проект с курсор\Pc_online_market`
* **Theme Support:** Dual mode (Dark default `#090d16` + Light `#f8fafc`), controlled via class `dark` on `<html>`.
* **Currency:** Uzbekistan Som (`UZS`), formatted via `formatPriceUzs` (`src/lib/formatters.ts`).
* **Languages:** Russian (`ru`) and Uzbek (`uz`), controlled by `useI18n` (`src/lib/i18n.tsx`).

---

## 2. Key Directories & Modules
* `src/components/CatalogView.tsx`: Main catalog with Bento shimmer, high-tech hero banner, and product cards.
* `src/components/BuilderView.tsx`: PC Builder coordinator with 3D/2D views, slot selectors, compatibility checks.
* `src/components/PcViewer3D.tsx`: Three.js procedural 3D case, animated ARGB fans, braided sleeved cables.
* `src/components/Header.tsx`: Sticky glassmorphism header with active micro-interactions.
* `src/lib/builderStore.tsx`: Selected parts state, total TDP, total price, and real-time compatibility report.
* `src/lib/cartStore.tsx`: Shopping cart state with drawer trigger.
* `src/lib/compatibility.ts`: Strict logic checking socket match, RAM type DDR4/DDR5, GPU length vs Case clearance, PSU wattage safety margin.

---

## 3. Immediate Context & Last Changes
* **Full Visual Density & Rich UI/UX Motion Master Implementation:**
  - **Hero Showcase Enrichment:** Eliminated empty space in hero banner by introducing an interactive 2-column showcase: Left column (7 cols) with authoritative value proposition and live trust indicators (`4.98 рейтинг`, `1200+ сборок`, `24ч доставка`); Right column (5 cols) with interactive Flagship Rig Card featuring 3 switchable presets (`Apex 4K`, `Pro 2K`, `CyberSport`), floating telemetry badges (`185+ FPS 4K`, `❄ 46°C LCD 360`), live specs, and 1-click builder load.
  - **Engineering & Trust Bento Strip:** 4 high-density value pillars directly under the hero banner.
  - **Ready-to-Ship Turnkey Rigs:** 3 curated flagship PC cards with gaming benchmarks and dual CTAs («В 3D Сборку» / «В корзину»).
  - **Builder Quick Starter:** Added 1-click preset loader in PC Builder when empty.
  - **Verification:** All 4 routes return HTTP 200 with 122.2 KB CSS.
