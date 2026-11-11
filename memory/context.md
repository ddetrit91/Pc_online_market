# Domain Knowledge & Business Rules

> **File:** `memory/context.md`  
> **Purpose:** Document project domain logic, constraints, and business formulas.

---

## 1. PC Compatibility Engine Rules (`src/lib/compatibility.ts`)
1. **CPU & Motherboard Socket Match:**
   - Both must share the identical socket string (e.g. `LGA1700`, `AM5`, `AM4`). If mismatch, flag critical error.
2. **Motherboard & RAM Memory Type Match:**
   - Must match RAM technology (`DDR4` vs `DDR5`). Mismatch is an incompatible build.
3. **GPU Clearance (Dimensions):**
   - Video card length (`lengthMm`) must be less than or equal to Case maximum GPU clearance (`maxGpuLengthMm`).
4. **Power Supply Safety Margin:**
   - Total System TDP = CPU TDP + GPU TDP + 75W (Motherboard, RAM, Fans, NVMe drives).
   - Recommended PSU Wattage = Total TDP * 1.25 (25% safety overhead for transient power spikes).
   - If PSU wattage is lower than Total TDP, trigger red critical warning.

---

## 2. Localization & Currency Standards
* **Currency:** Always format prices in Uzbek Som (`UZS`), using spaces as thousand separators (e.g., `12 500 000 сум` / `12 500 000 so'm`).
* **Languages:** Supported languages are Russian (`ru`) and Uzbek (`uz`). All UI labels must support both via `t` dictionary in `src/lib/i18n.tsx`.
