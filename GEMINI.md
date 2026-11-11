# Project Guidelines & Memory Architecture

This project follows the **Token Conservation & Persistence Standard**:

1. **Sitemap:** Every route is documented in [task/sitemap.md](file:///c:/Users/Lenovo/Desktop/Проект%20по%20AI-разработке/4-Проект%20с%20курсор/Pc_online_market/task/sitemap.md). Keep it updated whenever pages or APIs change.
2. **Context Persistence:**
   - Active tasks & progress: [task/todo.md](file:///c:/Users/Lenovo/Desktop/Проект%20по%20AI-разработке/4-Проект%20с%20курсор/Pc_online_market/task/todo.md)
   - Fast state recovery after compaction: [task/state.md](file:///c:/Users/Lenovo/Desktop/Проект%20по%20AI-разработке/4-Проект%20с%20курсор/Pc_online_market/task/state.md)
   - Stack & dependencies: [memory/tech-stack.md](file:///c:/Users/Lenovo/Desktop/Проект%20по%20AI-разработке/4-Проект%20с%20курсор/Pc_online_market/memory/tech-stack.md)
   - Architectural decisions: [memory/decisions.md](file:///c:/Users/Lenovo/Desktop/Проект%20по%20AI-разработке/4-Проект%20с%20курсор/Pc_online_market/memory/decisions.md)
   - Business & compatibility rules: [memory/context.md](file:///c:/Users/Lenovo/Desktop/Проект%20по%20AI-разработке/4-Проект%20с%20курсор/Pc_online_market/memory/context.md)
3. **UI / UX Motion Master:** Apply [.agents/skills/ui-ux-motion-master/SKILL.md](file:///c:/Users/Lenovo/Desktop/Проект%20по%20AI-разработке/4-Проект%20с%20курсор/Pc_online_market/.agents/skills/ui-ux-motion-master/SKILL.md) for all front-end and 3D visual implementations.
4. **Theme Policy:** Maintain dual dark/light theme support (`class="dark"`), and always ask the user their preferred theme strategy when creating new projects.
5. **Asset & Stylesheet Verification Rule:** Never assume a 200 on `/` means styles work. Always verify that all linked CSS chunks resolve with HTTP 200 and length > 100 bytes (preventing unstyled HTML from dev server / build cache desync).
