# Active Tasks & Roadmap

> **Current Sprint:** UI/UX Motion Overhaul & Context System Setup  
> **Status:** Active  
> **Last Updated:** 2026-11-08

---

## 1. Completed Tasks (Done)
- [x] **Install Custom UI/UX & Motion Skill:** Created `.agents/skills/ui-ux-motion-master/SKILL.md` with recipes for motion and Three.js effects.
- [x] **Global Skill Registration:** Registered `ui-ux-motion-master` globally in `~/.gemini/config/skills/`.
- [x] **Modern UI/UX Overhaul in `globals.css`:**
  - Added `.bg-cyber-grid` with radial fade mask.
  - Added `@keyframes shimmerSweep` / `.animate-shimmer` hardware блик.
  - Added `.glass-panel` and neon glows (`glow-indigo`, `glow-cyan`, `glow-amber`).
  - Added WCAG compliance media query `@media (prefers-reduced-motion: reduce)`.
- [x] **Catalog Enhancement (`CatalogView.tsx`):**
  - High-tech Hero Banner with glowing live beacon, micro-specs pills, and sheen-sweep CTA buttons.
  - Interactive Bento Shimmer Skeleton (8-card loading state) replacing bare spinner.
  - L1-L2 Surface Hierarchy for product cards with hover top glow, glare sweep, and tabular-nums specs.
  - Glassmorphism toast notifications with spring slide-in and neon emerald border.
- [x] **Header Enhancement (`Header.tsx`):**
  - Smooth spring scale micro-interactions (`active:scale-95`).
  - Glowing logo and refined backdrop blur (`backdrop-blur-xl`).
- [x] **Professional Visual Redesign (Non-AI Hardware Aesthetic):**
  - [x] **Typography System:** Integrated `Inter` (UI typography) and `JetBrains Mono` (hardware specs, TDP, pricing, FPS telemetry) via `next/font/google`.
  - [x] **Color Palette & Noble Dark Mode:** Replaced loud multi-stop gradients with obsidian/carbon surfaces (`#07080c`, `#0c0e14`), hairline borders (`border-white/[0.07]`), and disciplined single-accent cobalt.
  - [x] **Authentic Game Images:** Replaced all repetitive Unsplash placeholders with 100% verified, unique high-res Steam CDN key art across all 20 games in database and API routes.
  - [x] **Header Redesign:** Matte titanium logo, segmented pill navigation, refined cart and auth buttons.
  - [x] **Catalog Redesign:** Flagship hardware editorial banner, segmented category and brand filters, clean product cards with monochrome spec chips.
  - [x] **FPS Telemetry Redesign:** 16:9 benchmark cards with official game key art, high-contrast mono FPS badges, frametime metrics, and subtle bottleneck indicators.
  - [x] **PC Builder Polish:** Minimalist component slots with structured socket/TDP specs and tactile actions.
  - [x] **Cyber / Neon Flagship Redesign (Matching User Reference Image):**
  - [x] **Header:** Cyber processor badge with pulsing neon beacon, segmented glass pill navigation with cyan active indicators, radiant cart badge.
  - [x] **Brand Partner Marquee:** Floating glass capsules for ASUS ROG, NVIDIA RTX, AMD Radeon, Intel, NZXT, Corsair, MSI, DeepCool with instant filter toggle.
  - [x] **Showcase Hero Banner:** Deep cosmic dark gradient, radial cyan and purple spotlights, micro-specs pills, and neon CTA buttons.
  - [x] **Cyber Product Cards:** `rounded-3xl` glass cards with cyan hairline borders, radiant hover auras, electric cyan price tags, and high-impact action buttons.
  - [x] **FPS Telemetry Grid:** 20 verified Steam game posters with neon HUD FPS badges, smoothness ratings, and frametime stats.
  - [x] **Builder & Slot Modal Polish:** High-contrast cyber HUD cards, glowing slots, and neon checkout triggers.
  - [x] **Cart Drawer Upgrade:** Glassmorphism drawer with cyan telemetry and emerald checkout button.
  - [x] **Zero Build / Type Errors:** 22/22 routes compiled cleanly in Next.js.
- [x] **Flex-IT IT Solutions Corporate Tech Redesign (TemplateMonster #297700):**
  - [x] **Harmonious Palette Extraction:** Inspected live Flex-IT stylesheet: Electric Cyan (`#09aff4`), Dark Navy (`#060922`), Surface Navy (`#0a1033`), Chip Accent (`#0d1857`), Royal Indigo (`#4820a7`).
  - [x] **Eliminated White Glare Leak:** Replaced patchy child gradients with solid dark navy card surfaces in `BuilderView.tsx`.
  - [x] **Eliminated Color Clashing:** Replaced conflicting magenta + green button pairs with unified `#09aff4` primary solid buttons and cyan outline secondary buttons.
  - [x] **Global System Upgrade:** Replaced CSS tokens in `globals.css` with `.flexit-card`, `.btn-flexit`, and `.btn-flexit-outline`.
  - [x] **Full View Harmonization:** Aligned Header, Catalog, Builder, FPS Calculator, Slot Modal, and Cart Drawer.
  - [x] **Live CSS Chunk Verification:** Automated `scripts/verify-css.js` confirming all routes return 200 OK and ~120KB CSS.
- [x] **UI/UX Motion Master Full Visual Enrichment (Filling Empty Spaces):**
  - [x] **Hero Banner 2-Column Showcase:** Converted the empty hero banner into a high-impact 12-column layout. Left column (7 cols) has clear typography and live trust metrics (`4.98 рейтинг`, `1200+ сборок`, `24ч доставка`). Right column (5 cols) features an interactive Flagship Rig Showcase Card with 3 tabs (`Apex 4K`, `Pro 2K`, `CyberSport`), live FPS & cooling badges, spec pills, price, and instant «В 3D Конструктор» action.
  - [x] **Trust & Engineering Bento Bar:** Added 4 feature pillars (3D WebGL, 100% Совместимость, Телеметрия 20 игр, Экспресс-сборка в Ташкенте).
  - [x] **Curated Ready-to-Ship Gaming PCs Section:** Added 3 flagship turnkey build cards with real hardware specs, FPS bars in top games, and 1-click loading into 3D Builder or shopping cart.
  - [x] **Builder Quick Starter:** Added 1-click preset build loader directly in the 3D builder when empty.

---

## 2. Active / In-Progress Tasks
- [x] **Context & Rules Standardization:**
  - [x] Create `task/sitemap.md` (Full page and endpoint catalog)
  - [x] Create `task/todo.md` (Task tracker & active sprint)
  - [x] Create `task/state.md` (Session snapshot for instant context restoration)
  - [x] Create `memory/tech-stack.md` (Detailed tech stack specs)
  - [x] Create `memory/decisions.md` (Architectural Decision Records - ADRs)
  - [x] Create `memory/context.md` (Business rules & compatibility formulas)
  - [x] Deploy Global Rules to `~/.gemini/config/rules/` and `~/.gemini/config/GEMINI.md`
  - [x] Deploy Workspace Rules to `.agents/rules/` and root `GEMINI.md`

---

## 3. Backlog (Future Enhancements)
- [ ] Add sound effects toggle (subtle clicks, cyber hum) for builder component snap.
- [ ] Export PC build specification to PDF or shareable URL with QR code.
- [ ] Real-time Telegram bot webhook for instant order notifications.
