# Family Kitchen - Project Roadmap & Living Status

> **Note for Agents**: Keep this document up-to-date. When finishing a task, check off the item and add any relevant notes under the Recent Activity log.

---

## 🎯 Active Project Tracks

### Track 1: 🎨 UI, UX & Look & Feel
- [x] Baseline meal planner grid and recipe modals
- [x] Roaming animal chef avatar (`WanderingAvatar.tsx`)
- [ ] Component modularization (break down `src/app/page.tsx` into `src/components/planner/`, `src/components/recipes/`, `src/components/grocery/`)
- [ ] Mobile-first bottom sheets and touch gestures
- [ ] Micro-interactions & animations (delightful feedback when adding/ticking meals)
- [ ] Light / Dark mode contrast refinement

### Track 2: 🛒 Supermarket Automation (Tesco & Sainsbury's)
- [x] Initial Playwright scripts (`scripts/tesco_daemon.js`, `scripts/sainsburys_daemon.js`)
- [x] Checkout API route streaming logs to UI (`src/app/api/checkout/route.ts`)
- [ ] Test & harden Tesco cart population and out-of-stock fallback
- [ ] Test & harden Sainsbury's cart automation and slot booking
- [ ] Session persistence & cookie handling

### Track 3: 📱 Multi-Device & Family/Lodger Access
- [x] Supabase cloud store setup (`src/lib/store.ts`, `src/lib/supabase.ts`)
- [ ] Supabase Realtime subscriptions for multi-screen sync
- [ ] Role partitioning (Family/Lodgers view & add vs Host/Admin "Shop Now")
- [ ] Cloud deployment (Vercel) & PWA setup ("Add to Home Screen")
- [ ] Localhost daemon webhook/listener for cloud-triggered shopping runs

- [x] Extract `groceryKnowledgeBase` and default recipes into `src/lib/knowledgeBase.ts` (150+ items, 25+ recipes)

---

## 📜 Recent Activity Log
- **2026-09-02**: Built robust unit conversion and aggregation utility in `src/lib/unitConverter.ts` with smart pack-rounding, and integrated it into the checkout queue in `src/app/api/checkout/route.ts`.
- **2026-09-02**: Extracted `groceryKnowledgeBase` and default recipes into `src/lib/knowledgeBase.ts`, expanding to 150+ standard UK items and 25+ family-friendly default recipes.
- **2026-09-02**: Extracted Family Kitchen into a clean, isolated workspace. Verified builds and configured multi-agent guidelines (`AGENTS.md`).
