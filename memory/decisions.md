# Architectural Decision Records (ADRs)

> **File:** `memory/decisions.md`  
> **Purpose:** Document key technical rationale to prevent re-debating or rewriting architectural patterns.

---

### ADR-001: Next.js 15 Client/Server Component Boundary for 3D & State
* **Context:** Three.js and stateful stores (builder, cart, theme) require browser APIs (`window`, `WebGLRenderingContext`, `localStorage`).
* **Decision:** Keep page routes (`app/**/page.tsx`) as lightweight server entry points, and wrap canvas and interactive views in leaf components with `'use client'` and `dynamic(..., { ssr: false })`.
* **Consequence:** Zero SSR hydration mismatches, maximum performance, clean SEO for outer metadata.

---

### ADR-002: Procedural 3D Geometry Over Heavy GLTF Models
* **Context:** Loading multi-megabyte 3D files (GLTF/GLB) for custom PC cases, cables, and fans causes slow load times and bandwidth consumption in Central Asia / mobile connections.
* **Decision:** Build procedural modular meshes directly in Three.js (`BoxGeometry`, `CylinderGeometry`, `TorusGeometry`, procedural canvas textures).
* **Consequence:** Instant load times (under 50KB total bundle overhead), dynamic real-time color changes for ARGB lighting, zero external asset hosting failure risk.

---

### ADR-003: Token Conservation Protocol via `task/` and `memory/` Folders
* **Context:** Long sessions and compacting context cause the agent to re-read tens of files, consuming excessive tokens and slowing down response times.
* **Decision:** Record all critical tech stacks, decisions, active tasks, and full sitemap in `memory/` and `task/`.
* **Consequence:** When starting a turn or after compaction, reading 1-2 small markdown files provides instant full context at 90% fewer tokens.

---

### ADR-004: Dual Theme Strategy with Class Switching
* **Context:** Hardware configurators traditionally benefit from high-tech dark modes, but general ecommerce users often require clean light modes for outdoor or daylight reading.
* **Decision:** Support both themes via `dark` class on `document.documentElement` with CSS variable mapping in `globals.css` and a one-click toggle in the header.

---

### ADR-005: Flex-IT Corporate Tech Design System Adoption
* **Context:** Ad-hoc cyberpunk multi-stop gradients caused visual fatigue, color clashes (green next to magenta), and white gradient leaks on card surfaces.
* **Decision:** Adopt the strict color palette and layout architecture of the **Flex-IT IT Solutions template** (`--clr-main: #09aff4`, `--clr-dark-blue: #060922`, `--clr-card: #0a1033`, `--clr-accent: #0d1857`). Primary actions use solid Electric Cyan `#09aff4`; secondary actions use subtle navy or cyan outlines.
* **Consequence:** Clean, cohesive, executive-grade technology aesthetic with zero visual glare and 100% color harmony.

---

### ADR-006: Rule 4 Stylesheet & Asset Live Verification Requirement
* **Context:** Concurrently building while `next dev` is running can overwrite `.next` manifests, causing raw HTML with 404s on CSS chunks.
* **Decision:** Enforce Rule 4: all changes must be verified using programmatic HTTP checks (`scripts/verify-css.js`) ensuring every route returns HTTP 200 and every linked CSS bundle resolves with length > 100 bytes.
