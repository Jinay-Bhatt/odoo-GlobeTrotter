# DEV D — Frontend Dev
> **Role:** Design System + Layout + Dashboard + Community + Admin Dashboard
> **Stack:** Next.js 14 App Router · TypeScript · Tailwind CSS · shadcn/ui · Chart.js · TanStack Query
> **Branch:** `feature/dev-d-layout-dashboard`
> **Critical:** Push design tokens + Navbar + Sidebar on Day 1 morning — Dev C can't build screens without the layout.

---

## Project Context
GlobeTrotter — travel planning platform for Odoo × LDCE Hackathon.
12 screens, 3 roles (Traveler / Admin / Public). Backend is Fastify + Prisma + NeonDB (Dev A & B). You own the design system, layout, dashboard, community, and admin screens.

---

## What You Need FROM Others

| From | What | When |
|------|------|------|
| Dev B | `docs/API_CONTRACTS.md` — for mock data shapes | Day 1 EOD |
| Dev C | `src/types/index.ts` — TypeScript types | Day 1 |
| Dev C | `src/lib/api.ts` — Axios instance | Day 1 |
| Dev C | `src/lib/mockData.ts` — shared mock data | Day 1 |

## What Others Need FROM You

| Who | What | When |
|-----|------|------|
| Dev C | `tailwind.config.ts` + `globals.css` design tokens | **Day 1 morning** |
| Dev C | `Navbar.tsx`, `Sidebar.tsx`, `FilterBar.tsx`, `layout.tsx` | **Day 1** |
| Dev C | `BudgetChart.tsx` (for itinerary view) | Day 2 |

---

## Your Tasks

### Day 1 — Design System (Do This Immediately)
- [ ] `tailwind.config.ts` — color palette, fonts, custom tokens (see below)
- [ ] `src/app/globals.css` — import Inter font, CSS variables, base dark theme
- [ ] `src/app/layout.tsx` — QueryClientProvider + Toaster + dark bg + Inter font
- [ ] `src/components/shared/Navbar.tsx` — logo, search, user avatar + dropdown
- [ ] `src/components/shared/Sidebar.tsx` — nav links, active state, admin-only link
- [ ] `src/components/shared/FilterBar.tsx` — Group by / Filter / Sort dropdowns (reused everywhere)
- [ ] `src/components/shared/LoadingSpinner.tsx`
- [ ] `src/components/shared/ErrorMessage.tsx`

### Day 2 — Dashboard + Search
- [ ] `app/(main)/dashboard/page.tsx` — banner + regional cards + previous trips + CTA
- [ ] `components/dashboard/Banner.tsx` — full-width hero with bg image
- [ ] `components/dashboard/RegionalCards.tsx` — 5 popular city cards row
- [ ] `components/dashboard/PreviousTrips.tsx` — 3 recent trip cards row
- [ ] `app/(main)/search/page.tsx` — search bar + filter + city/activity results
- [ ] `components/search/SearchBar.tsx`, `CityCard.tsx`, `ActivityCard.tsx`
- [ ] `src/hooks/useCities.ts` — TanStack Query for cities (mock first)
- [ ] `src/hooks/useActivities.ts` — TanStack Query for activities (mock first)
- [ ] `components/itinerary/BudgetChart.tsx` — Chart.js pie + bar (for Dev C's itinerary screen)

### Day 3 — Community + Profile + Admin
- [ ] `app/(main)/community/page.tsx` — social feed
- [ ] `components/community/PostCard.tsx` + `CreatePost.tsx`
- [ ] `src/hooks/useCommunity.ts` — paginated feed (mock first)
- [ ] `app/(main)/profile/page.tsx` — editable profile + preplanned + previous trips
- [ ] `app/admin/page.tsx` — 4 tabs: Users / Cities / Activities / Analytics
- [ ] `components/admin/AdminStats.tsx` + `AdminCharts.tsx`

### Day 3-4 — Integration
- [ ] `useCities` → `GET /api/cities?popular=true` or `?search=`
- [ ] `useActivities` → `GET /api/activities?cityId=&category=&search=`
- [ ] `useCommunity` → `GET /api/community?page=1&limit=20`
- [ ] Admin → `GET /api/admin/stats`, `/popular-cities`, `/popular-activities`, `/users`

---

## Screens You Own

| Screen | Route | Priority |
|--------|-------|----------|
| Main Dashboard | `/dashboard` | P0 |
| City/Activity Search | `/search` | P0 |
| Community Tab | `/community` | P1 |
| User Profile | `/profile` | P1 |
| Admin Dashboard | `/admin` | P2 |
| Navbar + Sidebar + Layout | all screens | P0 |
| FilterBar | all listing screens | P0 |
| BudgetChart | in Dev C's `/trips/[id]` | P1 |

---

## Tailwind Color Palette

```typescript
// tailwind.config.ts
colors: {
  brand: {
    50:  '#f0f9ff', 100: '#e0f2fe',
    400: '#38bdf8', 500: '#0ea5e9',  // primary
    600: '#0284c7', 700: '#0369a1', 900: '#0c4a6e',
  },
  surface: {
    DEFAULT: '#0f172a',   // dark background
    card:    '#1e293b',   // card bg
    border:  '#334155',   // borders
  },
  accent: {
    DEFAULT: '#f59e0b',   // amber highlights
    light:   '#fef3c7',
  }
}
// Font: Inter from Google Fonts
```

---

## Component Props Reference

```typescript
// FilterBar.tsx
interface FilterBarProps {
  groupByOptions?: { label: string; value: string }[]
  filterOptions?:  { label: string; value: string }[]
  sortOptions?:    { label: string; value: string }[]
  onGroupBy?: (val: string) => void
  onFilter?:  (val: string) => void
  onSort?:    (val: string) => void
}

// BudgetChart.tsx
interface BudgetChartProps {
  sections: Section[]        // from src/types/index.ts
  totalBudget: number
}
// Renders: pie chart (budget by section) + bar chart (estimated vs actual)
```

---

## Community Screen Notes
- Paginated feed (newest first), infinite scroll or Load More button
- Each `PostCard`: user avatar, name, timestamp, text, optional image, optional linked trip name
- `CreatePost` modal: text textarea + image upload input + optional trip selector dropdown
- Use `useCommunity` hook with `useInfiniteQuery` for pagination

## Admin Screen Notes
- Tab 1 Manage Users: table with avatar, name, email, role badge, joined date
- Tab 2 Popular Cities: ranked list with bar showing popularity score
- Tab 3 Popular Activities: ranked list by usage count
- Tab 4 User Trends: line chart (signups over time) + pie chart (traveler vs admin ratio)
- Guard: if `user.role !== 'ADMIN'` redirect to `/dashboard`

## Dashboard Notes
- RegionalCards: horizontal scroll on mobile, 5 city cards desktop
- PreviousTrips: last 3 completed/ongoing trips from `useTrips()` filtered by status
- "＋ Plan a Trip" CTA button → `/trips/new`
- Banner: dark overlay gradient on bg image, headline "Plan Your Next Adventure", subtext, CTA


