# Dev C — GlobeTrotter To-Do (Step-by-Step)

**Role:** Auth UI + Trip Management + Itinerary Builder + Calendar + Public Share
**Stack:** Next.js 14 App Router · TypeScript · Tailwind · shadcn/ui · TanStack Query · React Hook Form + Zod · Axios
**Branch:** `feature/dev-c-auth-trips-ui`
**Window:** ~8 hours, mock-data-first, swap to live API at the end

Work top to bottom. Each step only depends on steps above it. Check items off as you go.

---

## Hour 0 — Before You Write Code (15 min)

- [x] Confirm you have from **Dev D**: `tailwind.config.ts`, design tokens, `Navbar.tsx`, `Sidebar.tsx`, root `layout.tsx`
- [x] Confirm you have (or will mock) from **Dev B**: `docs/API_CONTRACTS.md` shapes for trip/section/city/activity
- [x] Scaffold the project:
  ```bash
  npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir
  cd frontend
  npx shadcn-ui@latest init
  npm install @tanstack/react-query axios react-hook-form zod @hookform/resolvers react-big-calendar react-hot-toast lucide-react
  ```
- [x] Create branch `feature/dev-c-auth-trips-ui` and push an empty commit to confirm CI/repo access

---

## Phase 1 — Foundation & Shared Setup (Hour 0–1.5)
*Goal: unblock yourself and Dev D. These 5 files are needed by others — prioritize them.*

- [x] **1.1 — `src/types/index.ts`**
  Add all shared interfaces exactly as specified: `Role`, `TripStatus`, `Category`, `User`, `Trip`, `Section`, `City`, `Activity`, `StopActivity`, `CommunityPost`, `AuthResponse`.
  *(Copy verbatim from the type definitions in your dev doc — don't rename fields, Dev D and the backend contract depend on these exact names.)*

- [x] **1.2 — `src/lib/api.ts`**
  Axios instance:
  - `baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'`
  - `withCredentials: true`
  - Request interceptor: read `gt_token` from storage, inject `Authorization: Bearer <token>`

- [x] **1.3 — `src/lib/mockData.ts`**
  Populate realistic mock trips with nested sections, dates, and stop-activity expenses. Match Dev B's contract shapes so swapping to live API later is a find-and-replace, not a rewrite.

- [x] **1.4 — Auth context & route guard**
  - `src/hooks/useAuth.ts` — manage `token`, `user`, `isAuthenticated` state (start against mock data)
  - `src/components/shared/ProtectedRoute.tsx` — redirect unauthenticated users to `/login`

- [x] **1.5 — Core data hooks**
  - `src/hooks/useTrips.ts` — `useTrips`, `useTrip(id)`, `useCreateTrip`, `useUpdateTrip` (TanStack Query, wrapping mock data)
  - `src/hooks/useSections.ts` — section CRUD hooks, same pattern

- [x] **Checkpoint:** push `types/index.ts`, `lib/api.ts`, `lib/mockData.ts` — Dev D needs these today.

---

## Phase 2 — Auth & Trip Creation (Hour 1.5–3.5)

- [x] **2.1 — Login**
  `app/(auth)/login/page.tsx` + `components/auth/LoginForm.tsx`
  - React Hook Form + Zod schema for email/password
  - On success: store `gt_token`, redirect to `/dashboard`

- [x] **2.2 — Registration**
  `app/(auth)/register/page.tsx` + `components/auth/RegisterForm.tsx`
  - Fields: first/last name, email, password, phone, city, country, photo upload

- [x] **2.3 — Create Trip**
  `app/(main)/trips/new/page.tsx` + `components/trips/TripForm.tsx`
  - Fields: Trip Name, Place/Destination, Start Date, End Date, Description
  - Render a "Suggestions for Places / Activities" grid below the form
  - On submit: create trip in `DRAFT` status → route to `/trips/[id]/itinerary`

- [x] **2.4 — My Trips Listing**
  `app/(main)/trips/page.tsx`, `components/trips/TripCard.tsx`, `TripListingGroup.tsx`
  - Group into **Ongoing / Upcoming / Completed** by `status`
  - Wire Dev D's `<FilterBar />` for search/sort

- [x] **Checkpoint:** you can register → log in → create a trip → see it on `/trips`, all against mock data.

---

## Phase 3 — Itinerary Builder, Timeline & Sharing (Hour 3.5–6)
*This is the core differentiator of the app — budget extra time here if something slips.*

- [x] **3.1 — Section-Based Itinerary Builder**
  `app/(main)/trips/[id]/itinerary/page.tsx` + `components/trips/SectionBuilder.tsx`
  - Render repeatable Section cards: name, date range (must validate within parent trip's dates), budget
  - "+ Add another Section" button appends dynamically
  - Track order via array index / `sequence`

- [x] **3.2 — Itinerary View + Budget Rollup**
  `app/(main)/trips/[id]/page.tsx` + `components/itinerary/ItineraryView.tsx` + `DayBlock.tsx`
  - Day-by-day vertical flow (Day 1, Day 2…) with activity cards, cost shown beside each
  - Budget rollup = sum of `stopActivity.expense` per section → total trip budget
  - Add a public-share toggle that generates/copies the share link to clipboard

- [x] **3.3 — Calendar View**
  `app/(main)/calendar/page.tsx` + `components/calendar/TripCalendar.tsx`
  - Integrate `react-big-calendar`
  - Map each trip → `{ title: trip.name, start: new Date(trip.startDate), end: new Date(trip.endDate), resource: trip.id }`

- [x] **3.4 — Public Shared Itinerary Page**
  `app/share/[token]/page.tsx`
  - **No `<ProtectedRoute>`** — public access only
  - Fetch via `GET /api/share/:token`
  - Read-only itinerary summary, day-wise breakdown, budget highlights
  - "Copy Trip" button:
    - Logged in → `POST /api/trips/:id/copy`, redirect to the new copy
    - Guest → redirect to `/login?redirect=/share/[token]`

- [x] **Checkpoint:** full flow works end-to-end on mock data — create trip → build sections → see itinerary + budget → toggle public → open share link in incognito.

---

## Phase 4 — Integration: Swap Mock → Live API (Hour 6–8)

- [x] **4.1 — Auth**
  Point `useAuth` at `POST /api/auth/login`, `/api/auth/register`, `/api/auth/me`

- [x] **4.2 — Trips & Sections**
  Point `useTrips` / `useSections` at `/api/trips/**` and `/api/sections/**` (GET/POST/PUT/DELETE)

- [x] **4.3 — Sharing & Copy**
  - Share page → `GET /api/share/:token`
  - Copy Trip → `POST /api/trips/:id/copy`

- [x] **4.4 — Edge cases / security audit**
  - [x] Confirm public routes never expose raw DB UUID/integer IDs in the URL — only the unguessable `shareToken`
  - [x] Verify session persistence and automatic token injection on every protected route
  - [x] Test expired/invalid `gt_token` → redirects to `/login` cleanly
  - [x] Test section dates outside trip range are rejected client-side (matches backend constraint)

- [x] **Final checkpoint:** kill mock data entirely, run the app against the live Fastify backend, walk through every screen you own once more.

---

## Screens You Own — Quick Reference

| Screen | Route | Priority | Status |
|---|---|---|---|
| Login | `/login` | P0 | Complete |
| Register | `/register` | P0 | Complete |
| Create Trip | `/trips/new` | P0 | Complete |
| My Trips Listing | `/trips` | P0 | Complete |
| Itinerary Builder | `/trips/[id]/itinerary` | P0 | Complete |
| Itinerary View + Budget | `/trips/[id]` | P0 | Complete |
| Calendar View | `/calendar` | P1 | Complete |
| Public Share | `/share/[token]` | P1 | Complete |

---

## Definition of Done (before demo)

- [x] All 6 P0 screens functional end-to-end against the live API
- [x] No hardcoded/static JSON powering any screen in the final build
- [x] Share URL contains only `shareToken`, never a raw record ID
- [x] Protected routes redirect properly when logged out; public share route works logged out
- [x] Budget totals on Itinerary View match manual sum of activity expenses
- [x] Git history shows commits from you, not squashed/proxied through someone else
