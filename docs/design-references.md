# Vendoo Analytics Dashboard — Design Reference & Audit

## Executive Summary

This document captures design patterns, interaction models, and aesthetic references from best-in-class analytics dashboards, tailored specifically for a reselling business context. It serves as the north star for the BTX-58 redesign initiative.

---

## 1. Reference Dashboards Analyzed

### 1.1 Linear (linear.app)
**Why it matters:** The gold standard for dark-mode SaaS dashboards. Clean, fast, information-dense without clutter.

**Key patterns:**
- **Sidebar:** Icon-only collapsed state, expands to icon + label on hover/focus. No text truncation issues. Active state uses subtle left-border accent + background tint.
- **Cards:** 1px borders (`rgba(255,255,255,0.06)`), no heavy shadows. Backgrounds use layered z-depth: `zinc-950` → `zinc-900` → `zinc-800`.
- **Typography:** Inter/Geist, 13px body, 11px caps labels, massive contrast. Headings are `font-medium` not `bold`.
- **Color:** Minimal accent usage. Indigo for interactive, green for success, red sparingly. 90% of UI is grayscale.
- **Spacing:** 24px gutters, 16px internal padding. Consistent 4px grid.

**Applicable takeaways:**
- Collapsible sidebar with hover-expand (already partially implemented — tighten)
- Caps labels with `tracking-widest` for KPI headers
- No border-radius inflation — keep cards at `rounded-xl` or `rounded-2xl` max
- Grayscale-first, accent-second approach

---

### 1.2 Stripe Dashboard
**Why it matters:** Best-in-class for financial/metrics dashboards. Revenue, fees, net — exactly our domain.

**Key patterns:**
- **Metric cards:** Large number + tiny sparkline below + delta badge (▲ 12% vs last month). Cards are white on light, or dark gray on dark.
- **Charts:** Smooth area charts, monochrome with subtle gradient fills. No chart junk.
- **Tables:** Minimal borders, row hover states, monospace for money amounts, right-aligned.
- **Status badges:** Pill-shaped, colored dot + text. "Completed", "Pending", "Failed".

**Applicable takeaways:**
- Sparklines on KPI cards (BTX-61)
- Delta badges on every metric (BTX-61)
- Right-align all currency values in tables
- Monospace tabular-nums for all financial data

---

### 1.3 Vercel Dashboard
**Why it matters:** Developer-focused but nails "status at a glance." Deployment cards, traffic graphs, project health.

**Key patterns:**
- **Status indicators:** Colored dot (pulse for active) + label. Immediate readability.
- **Glassmorphism:** Subtle backdrop blur on overlays and modals. Not overused.
- **Dark mode depth:** Uses true black backgrounds with elevated surfaces at `zinc-900`.
- **Empty states:** Illustrative, helpful, never bleak.

**Applicable takeaways:**
- Pulse animation on "Live" badge (already done — keep)
- Glass overlay for modals/drawers
- True black (`#000`) base with `zinc-900/800` elevated cards

---

### 1.4 Shopify Analytics
**Why it matters:** E-commerce native. Understands seller psychology — total sales, AOV, conversion, top products.

**Key patterns:**
- **Overview first:** 4-6 big numbers at top, then trends, then tables.
- **Compare mode:** Toggle "Compare to previous period" overlays previous period as dashed line.
- **Contextual help:** Small "i" icon with tooltip explaining each metric.
- **Drill-down:** Click any chart segment to filter the whole dashboard.

**Applicable takeaways:**
- Period-over-period comparison (BTX-64)
- Metric tooltips explaining formulas
- Click-to-filter interaction model

---

### 1.5 Reselling-Specific Insights (FlipSail, Vendoo Native)

**What pro resellers actually need:**
1. **Sell-Through Rate** — inventory velocity. The #1 health metric.
2. **Average Days to Sell** — cash conversion cycle.
3. **Profit Margin per Item** — not just total profit, but unit economics.
4. **Platform Profitability** — revenue is vanity, profit is sanity.
5. **Inventory Aging** — dead stock identification.
6. **COGS vs Revenue (GMROI)** — return on inventory investment.
7. **Tax-Ready P&L** — Schedule C prep without spreadsheet exports.

**Current dashboard gaps:**
- No trend/delta on KPI cards
- No inventory aging visualization
- No loss-leader identification
- No goal-setting or target tracking
- No period comparison
- No tax export

---

## 2. Proposed Design System

### 2.1 Color Palette

**Base:**
- Background: `#030712` (true black, subtle depth)
- Surface: `#0a0a0f` (card base)
- Elevated: `#111118` (hover/focus states)
- Border: `#1e1e2e` (subtle separation)

**Semantic:**
- Revenue/Info: `#6366f1` (indigo-500)
- Profit/Success: `#22c55e` (green-500)
- Warning/Caution: `#f59e0b` (amber-500)
- Danger/Loss: `#ef4444` (red-500)
- Accent: `#8b5cf6` (violet-500) — used for brand moments

**Text:**
- Primary: `#f8fafc` (slate-50)
- Secondary: `#94a3b8` (slate-400)
- Tertiary: `#475569` (slate-600)

### 2.2 Typography

**Font:** Geist Sans (already in use — keep)

**Scale:**
- Display: 1.875rem (30px), font-bold, tracking-tight
- Title: 1.25rem (20px), font-semibold, tracking-tight
- Body: 0.875rem (14px), font-normal, leading-relaxed
- Caption: 0.75rem (12px), font-medium
- Micro: 0.6875rem (11px), font-medium, uppercase, tracking-widest

**Rules:**
- All financial data: `font-mono tabular-nums`
- All KPI labels: `uppercase tracking-widest text-secondary`
- Headlines never bold — use `font-semibold` or `font-medium`

### 2.3 Spacing

- Page padding: 24px (desktop), 16px (mobile)
- Card padding: 20px
- Card gap: 16px
- Internal element gap: 12px
- Section gap: 32px

### 2.4 Border Radius

- Cards: `rounded-2xl` (16px)
- Buttons/badges: `rounded-full`
- Inputs: `rounded-xl` (12px)
- Tables rows: `rounded-lg` (8px) — only on hover

### 2.5 Shadows & Depth

No drop shadows on dark mode. Depth via:
- Border opacity changes
- Background lightness changes
- Inset top highlight: `inset 0 1px 0 rgba(255,255,255,0.03)`

---

## 3. Component Patterns

### 3.1 KPI Card (Redesigned)

```
┌─────────────────────────────────────┐
│ ↑ REVENUE              [sparkline]  │
│ $6,182.41                           │
│ ▲ 12% vs last month                 │
│ [░░░░░░░░░░░░░░░░░░░░] 78% of goal │
└─────────────────────────────────────┘
```

- Caps label with trend arrow icon
- Large number, tabular nums
- Delta badge (green/red/neutral)
- Optional goal progress bar

### 3.2 Chart Card

```
┌─────────────────────────────────────┐
│ Revenue Over Time          [filter] │
│                                     │
│    ╭─╮  ╭──╮                        │
│   ╱   ╲╱    ╲___                    │
│                                     │
│ Jan   Feb   Mar   Apr   May         │
└─────────────────────────────────────┘
```

- Title left, action right
- Area or line chart, monochrome with gradient fill
- No grid lines or minimal grid
- Tooltip on hover with comparison delta

### 3.3 Alert Card

```
┌─────────────────────────────────────┐
│ ⚠️  14 items have been listed 90+   │
│     days without selling             │
│     [View Stale Items →]            │
└─────────────────────────────────────┘
```

- Icon + headline + action
- Amber border for warning, red for critical
- Count badge

### 3.4 Data Table

- No vertical borders
- Header: `uppercase text-xs tracking-widest text-secondary`
- Row hover: `bg-elevated`
- Numbers: right-aligned, monospace
- Status: colored dot + text

---

## 4. Layout Architecture

```
┌─────────┬────────────────────────────────────────────┐
│ Sidebar │  Header  [Title]              [Live badge] │
│  ┌───┐  ├────────────────────────────────────────────┤
│  │ O │  │  [Snapshot: Revenue | Profit | Sell-Through]│
│  │ R │  │  [Date Filter Bar]                       │
│  │ P │  ├────────────────────────────────────────────┤
│  │ P │  │  [KPI Grid - 4 cards wide]               │
│  │ I │  │                                            │
│  │ L │  │  [Chart Row - 2/3 + 1/3]                 │
│  │ B │  │                                            │
│  │ R │  │  [Table Row - Recent Sales]              │
│  │ A │  │                                            │
│  │ N │  │  [Alerts Row - Inventory Aging]          │
│  │ D │  │                                            │
│  │ S │  │                                            │
│  └───┘  └────────────────────────────────────────────┘
└─────────┘
```

- Sidebar: 64px collapsed, 224px expanded
- Main: max-width 1440px, centered
- Grid: 12-column on desktop, 4 on tablet, 2 on mobile
- Sticky header with backdrop blur

---

## 5. Animation & Micro-interactions

- Card hover: `border-opacity` increase, 150ms ease
- Tab switch: `opacity` + `translateY` fade, 200ms
- Number changes: count-up animation (optional)
- Loading: shimmer skeleton, not spinner
- Toast alerts: slide in from top-right, auto-dismiss 5s

---

## 6. Accessibility Targets

- WCAG AA: 4.5:1 for body text, 3:1 for large text
- Keyboard navigation: all interactive elements
- Screen reader: aria-label on all icon-only buttons
- Focus rings: `ring-2 ring-indigo-500 ring-offset-2 ring-offset-background`
- Reduced motion: respect `prefers-reduced-motion`

---

## 7. Mobile Strategy

- Sidebar becomes bottom nav (already implemented)
- Cards stack vertically
- Tables become horizontal scroll or card list
- Filters collapse into sheet/drawer
- Reduce padding by ~30%

---

*Document version: 1.0*
*Created for BTX-59*
*Next step: BTX-60 — Brand Identity Implementation*
