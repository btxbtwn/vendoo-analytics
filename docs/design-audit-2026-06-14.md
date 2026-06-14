# Vendoo Analytics — Taste-Level Design Audit
## via taste-skill redesign framework + ChatGPT (CloakBrowser)
## 2026-06-14

---

## 1. CRITICAL ISSUES (ranked)

1. **Heavy inline styles** — biggest architectural problem. Components use `style={{ color: "var(--color-text-primary)" }}` everywhere instead of Tailwind classes. Makes the UI harder to maintain, audit, and keep consistent.

2. **Data typography not systemized** — `tabular-nums` only on trend arrows. Needs to be global: KPI values, table cells, chart axes, tooltips, pagination. Numbers are the most important content.

3. **Dark surface system too compressed** — `#08090a` / `#09090B` / `#111112` / `#18181B` is almost-black on almost-black. Cards depend entirely on 0.07-opacity borders for separation. Risk of disappearing on low-quality screens.

4. **Default Recharts patterns** — sparkline in every KPI card is an AI-dashboard smell. Some need trends, others need comparison sentences or rank indicators.

5. **No shared table primitive** — pagination, alignment, empty states, and truncation implemented per-tab. Needs one `DataTable` system.

## 2-9: Full section-by-section audit

[See original response for detailed breakdown per category]

## 10. QUICK WINS (<30 min each)

1. Add `tabular-nums` globally to all KPI values and table numeric cells
2. Strengthen card/table borders: `--color-border: rgba(255,255,255,0.10)` (from 0.07)
3. Replace repeated uppercase tracking-wide 11px labels with calmer 13px medium
4. Make active nav state stronger: border + background + font-weight
5. Add safe-area padding to mobile bottom nav

## Key Strengths
- 0px-radius commitment (consistent)
- Dark-first token system
- No generic shadows
- Uniform white KPI values
- Clear dashboard structure with 6 tabs
