# Global Development Rules & Architecture Standards

These rules govern the development, memory retention, and UI standards of this project.

---

## 1. Project Sitemap & Route Maintenance Rule
* **Mandatory Sitemap File:** Maintain an up-to-date sitemap document at `task/sitemap.md`.
* **Content Requirements:**
  - Table of all Frontend/Client routes (`/`, `/builder`, etc.), file paths, access levels (Public, Auth, Admin), and feature descriptions.
  - Table of all Backend/API routes (`/api/*`), HTTP methods (`GET`, `POST`, etc.), file paths, and request/response purposes.
* **Proactive Synchronization:** Whenever new pages, dynamic routes, or API endpoints are added or refactored, the agent MUST update `task/sitemap.md`.

---

## 2. Theme Preference Inception Rule (Dark / Light Theme)
* **Mandatory User Inquiry:** When creating, bootstrapping, or starting work on any new project or major UI design overhaul, the agent **MUST ALWAYS actively ask the user** for their preferred theme strategy before proceeding.
* **Standard Inquiry Options:**
  1. **Dual Theme (Recommended):** Light + Dark mode switchable via class (`class="dark"`), synced to user preference or `localStorage`.
  2. **Dark Theme Only:** High-tech / Cyberpunk / OLED Dark palette (e.g. `#090d16`, deep slate).
  3. **Light Theme Only:** Clean Minimalist SaaS / Editorial White (e.g. `#ffffff`, `#f8fafc`).
* **Rule Constraint:** Never silently assume or hardcode a single theme for a new project without asking.

---

## 3. Token Conservation & Memory Persistence Protocol
To minimize context token consumption and prevent loss of critical project knowledge when the context window compacts or resets:

### A. The `memory/` Directory (Architectural Persistence)
Maintain the following files in the project root under `memory/`:
* `memory/tech-stack.md`: Current frameworks, versions, database, UI libraries, and styling stack.
* `memory/decisions.md`: Architectural Decision Records (ADRs). Documents *why* a particular library, pattern, or workaround was chosen to avoid re-debating or reverting in future sessions.
* `memory/context.md`: Core domain knowledge, business logic, calculations, currency, localization, and compliance rules.

### B. The `task/` Directory (Session & Workflow Persistence)
Maintain the following files in the project root under `task/`:
* `task/sitemap.md`: Full catalog of URLs and endpoints.
* `task/todo.md`: Sprint tasks, completed items (`[x]`), active in-progress goals, and backlog.
* `task/state.md`: A 1-page high-density summary of project state, active branch, and immediate context for instant session recovery without reading dozens of files.

### C. Agent Token Economy Protocol
1. **Fast Recovery:** After context compaction or when starting a session, read `task/state.md` and `memory/tech-stack.md` first before scanning entire directories.
2. **Milestone Updates:** Update `task/todo.md` and `memory/decisions.md` whenever key features or fixes are completed.
3. **Concise Outputs:** Avoid dumping full file contents into conversational chat; use file references and concise summaries.

---

## 4. End-to-End Asset & Stylesheet Live Verification Rule (Zero "Unstyled HTML" Guarantee)
* **Never Rely Only on Server/HTML HTTP 200:** A server returning 200 for `/` does NOT guarantee the user sees styles — static assets or CSS chunks can be 404/broken due to cache invalidation, build desync, or missing stylesheets.
* **Mandatory CSS Asset Verification:** Whenever UI changes, CSS updates, build tasks (`next build`), or server restarts occur, the agent **MUST ALWAYS programmatically verify that all stylesheet `<link>` tags in the page resolve to valid, non-empty CSS (HTTP 200, length > 100 bytes)**.
* **Dev Server & Build Collision Prevention:** When executing a production build (`npm run build` / `next build`) in a project where a dev server (`next dev`) may be running, the agent must check and restart/resync the dev process, as `next build` alters `.next` artifacts and causes the live dev server to serve 404 for newly generated CSS/JS chunks.
* **Visual Integrity Check Before Completion:** Before reporting to the user that a redesign or frontend task is done, test the route and confirm all stylesheets and assets load cleanly without 404 or missing styles.

