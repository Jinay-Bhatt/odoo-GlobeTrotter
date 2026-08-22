# GlobeTrotter — Living Project Context & Master To-Do List

> **Hackathon:** Odoo × LDCE Hackathon
> **Scope:** Backend API Development (Dev A + Dev B)
> **Stack:** Fastify · Prisma ORM · NeonDB (PostgreSQL) · Zod · JWT · bcryptjs
> **Last Updated:** August 22, 2026
> **Status:** 🏁 **100% BACKEND DEVELOPMENT COMPLETE & VERIFIED (0 TS Errors)**

---

## 📌 Architectural Overview

GlobeTrotter Backend is a production-grade, highly performant Fastify REST API engineered to support all **12 screens** and **3 user roles** (Traveler, Admin, Public visitor).

### 7 Relational Database Models (`backend/prisma/schema.prisma`)
1. **`User`**: Account identity, bcrypt hashed passwords, role (`TRAVELER` | `ADMIN`), contact & location details.
2. **`Trip`**: Core trip entity with start/end dates, automatic status computation (`DRAFT` | `UPCOMING` | `ONGOING` | `COMPLETED`), `isPublic`, UUID4 `shareToken`, and `totalBudget`.
3. **`Section`**: Repeatable itinerary legs with date range boundaries, budget allocation, and sequence ordering.
4. **`City`**: Master destination registry with popularity ranking.
5. **`Activity`**: Categorized attractions/experiences linked to cities with estimated cost.
6. **`StopActivity`**: Day-specific activity assignment within an itinerary section + expense tracking.
7. **`CommunityPost`**: User social feed post with optional photo and trip reference.

---

## 🚀 COMPLETE BACKEND AUDIT & VERIFICATION LIST

### 1. Core System & Security (Dev A)
- [x] **Fastify Server Engine**: Configured with CORS, JWT, Multipart file uploads, and `@fastify/static` file serving (`backend/src/server.ts`).
- [x] **Database & ORM**: Prisma 5 client singleton (`backend/src/lib/prisma.ts`) connected to NeonDB / PostgreSQL (`backend/prisma/schema.prisma`).
- [x] **Security Middleware**:
  - `authenticate.ts`: JWT bearer token verification.
  - `requireAdmin.ts`: Role-based route guard (`req.user.role === 'ADMIN'`).
- [x] **Image File Uploads (`/api/upload`)**: Multipart JPG/PNG/WEBP/GIF validation with 5MB cap, UUID filename generation, and static HTTP serving (`/uploads/*`).

### 2. Authentication API (`/api/auth`)
- [x] `POST /api/auth/register`: Zod validated, bcrypt password hashing (salt 12), user creation & JWT emission.
- [x] `POST /api/auth/login`: Zod validated, credential check, JWT emission.
- [x] `GET /api/auth/me`: Authenticated profile fetch.
- [x] `PUT /api/auth/profile`: Editable profile details update.
- [x] `POST /api/auth/change-password`: Current password check + bcrypt hash update.

### 3. Trip Management API (`/api/trips`)
- [x] `GET /api/trips`: List user's trips with auto-computed `status` & `totalBudget`.
- [x] `POST /api/trips`: Create new trip in `DRAFT`/`UPCOMING`/`ONGOING` state.
- [x] `GET /api/trips/:id`: Retrieve single trip with nested sections and stop activities.
- [x] `PUT /api/trips/:id`: Update trip details + date bounds + status.
- [x] `DELETE /api/trips/:id`: Cascade delete trip and all child sections/activities.
- [x] `POST /api/trips/:id/toggle-share`: Toggle public visibility & generate cryptographically secure UUID4 `shareToken`.
- [x] `POST /api/trips/:id/copy`: **Full deep copy transaction** (copies Trip + Sections + StopActivities).

### 4. Itinerary Section API (`/api/sections`)
- [x] `POST /api/sections`: Create section with date range boundary validation (must fall within parent trip start/end).
- [x] `PUT /api/sections/:id`: Update section dates, budget, and sequence ordering.
- [x] `DELETE /api/sections/:id`: Cascade delete section.
- [x] `POST /api/sections/:id/activities`: Add day-wise activity stop with expense.
- [x] `DELETE /api/sections/:id/activities/:stopId`: Delete activity stop.

### 5. Discovery & Search API (`/api/cities`, `/api/activities`)
- [x] `GET /api/cities`: List cities with `?search=` and `?popular=true` popularity ranking.
- [x] `GET /api/cities/:id`: Get city detail with associated activities.
- [x] `GET /api/activities`: List activities filtered by `?cityId=`, `?category=`, and `?search=`.

### 6. Social Feed API (`/api/community`)
- [x] `GET /api/community`: Paginated feed (`?page=1&limit=20`) returning author avatar & linked trip details.
- [x] `POST /api/community`: Create text + image post linked to optional trip.
- [x] `DELETE /api/community/:id`: Delete post (owner or Admin).

### 7. Public Share Token API (`/api/share`)
- [x] `GET /api/share/:token`: **Unauthenticated public read-only trip viewer**. Returns 404 for private trips to prevent record ID leaks.

### 8. Admin Analytics & Moderation API (`/api/admin`)
- [x] `GET /api/admin/stats`: Aggregate counts (total users, trips, posts, cities).
- [x] `GET /api/admin/popular-cities`: Top 10 cities by popularity.
- [x] `GET /api/admin/popular-activities`: Top 10 activities by usage count.
- [x] `GET /api/admin/users`: Full user directory with trip & post counts.
- [x] `DELETE /api/admin/posts/:id`: Hard moderation delete of any post.

---

## 🛠️ Verification & Build Status

```bash
cd backend
npm run build
```
- **Result**: `tsc` build completed with **0 errors**.
- **Output**: Transpiled ESM files ready in `backend/dist/`.

---

## 🚀 How to Execute Backend Locally

1. **Configure Environment (`backend/.env`)**:
   ```bash
   DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
   PORT=4000
   JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
   ```

2. **Push Schema & Seed Database**:
   ```bash
   cd backend
   npm run db:push
   npm run db:seed
   ```

3. **Launch Server**:
   ```bash
   npm run dev
   # API: http://localhost:5000
   # Health: http://localhost:5000/health
   # Uploads: http://localhost:5000/uploads/<filename>
   ```

---

## 🎨 FRONTEND TEAM CONTINUATION ROADMAP (Dev C & Dev D)

### 1. Repository Setup & Sync
```bash
git checkout main
git pull origin main
```

### 2. Frontend Initializer Command
Run in project root:
```bash
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir
cd frontend
npx shadcn-ui@latest init
npm install @tanstack/react-query axios react-hook-form zod @hookform/resolvers react-big-calendar chart.js react-chartjs-2 react-hot-toast lucide-react
```

### 3. Developer Work Breakdown & Starting Points

#### 🔹 Developer C (Auth, Trips, Itinerary Builder & Public Share)
- **Branch**: `frontend/feature/dev-c-auth-trips-ui`
- **Reference Doc**: [`docs/DEV_C.md`](file:///c:/Users/jinay/OneDrive/Desktop/odoo-globeTrotter/docs/DEV_C.md) & [`docs/API_CONTRACTS.md`](file:///c:/Users/jinay/OneDrive/Desktop/odoo-globeTrotter/docs/API_CONTRACTS.md)
- **Where to Start**:
  1. `src/types/index.ts` — Define TypeScript interfaces matching backend Prisma models (`User`, `Trip`, `Section`, `Activity`, `CommunityPost`).
  2. `src/lib/api.ts` — Create Axios client connected to `http://localhost:5000/api` with JWT Bearer Token interceptor.
  3. `app/(auth)/login/page.tsx` & `app/(auth)/register/page.tsx` — Build authentication pages with React Hook Form + Zod.
  4. `app/(main)/trips/page.tsx` & `app/(main)/trips/[id]/page.tsx` — Implement Trip Dashboard, Section/Day builder, and Itinerary timeline.
  5. `app/share/[token]/page.tsx` — Unauthenticated public read-only trip viewer (connects to `GET /api/share/:token`).

#### 🔹 Developer D (Layout, Design System, Discovery, Community & Admin)
- **Branch**: `frontend/feature/dev-d-layout-community-admin-ui`
- **Reference Doc**: [`docs/DEV_D.md`](file:///c:/Users/jinay/OneDrive/Desktop/odoo-globeTrotter/docs/DEV_D.md) & [`docs/API_CONTRACTS.md`](file:///c:/Users/jinay/OneDrive/Desktop/odoo-globeTrotter/docs/API_CONTRACTS.md)
- **Where to Start**:
  1. `tailwind.config.ts` & `src/app/globals.css` — Configure theme palette, typography, and dark mode tokens.
  2. `src/components/shared/Navbar.tsx` & `Sidebar.tsx` — Build main app navigation frame.
  3. `app/(main)/dashboard/page.tsx` & `app/(main)/search/page.tsx` — Build City & Activity discovery catalog with search and category filtering.
  4. `app/(main)/community/page.tsx` — Build social feed with post creation form and multipart image uploader.
  5. `app/admin/page.tsx` — Build Admin Dashboard with Chart.js analytics for popular cities/activities and user management tables.


