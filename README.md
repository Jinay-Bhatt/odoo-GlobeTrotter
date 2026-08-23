# 🌍 GlobeTrotter — Smart Travel Planning & Itinerary Platform

> **Odoo × LDCE Hackathon Project**  
> GlobeTrotter is a full-stack, production-grade travel planning and itinerary management platform engineered to deliver end-to-end trip curation, day-by-day budget tracking, destination & activity discovery, public trip sharing via tokenized links, community story sharing, and real-time administrative analytics.

---

## 📸 Overview & Key Features

GlobeTrotter provides an intuitive, high-performance web platform for travelers to plan, organize, cost-estimate, and share their travel experiences while offering administrators powerful moderation and analytics tools.

### 🌟 Core Capabilities

- 🔐 **Authentication & Role-Based Access Control (RBAC)**
  - JWT Bearer token authentication with secure `bcryptjs` password hashing (12 salt rounds).
  - Multi-role support (`TRAVELER` and `ADMIN`).
  - Quick-fill **Demo Login Buttons** on `/login` for seamless evaluation.
  - Profile customization and credential management.

- 🗺️ **Comprehensive Trip Curation & Lifecycle Management**
  - Create trips with auto-computed status tracking (`DRAFT`, `UPCOMING`, `ONGOING`, `COMPLETED`).
  - Group trips into status tabs for quick overview.
  - Deep-cloning feature (`POST /api/trips/:id/copy`) allowing travelers to duplicate public or previous itineraries with sections and stop activities intact.

- 🗓️ **Section-Based Day-by-Day Itinerary & Budget Builder**
  - Divide trips into logical geographical legs or sections (e.g., "Paris Leg", "French Riviera Experience").
  - Date-boundary validation ensuring sections fit within parent trip dates.
  - Assign city activities to specific days with custom expense logs and notes.
  - Real-time aggregated budget calculation (Estimated vs Actual expenses).

- 🔍 **Destination & Activity Discovery Catalog**
  - City exploration with popularity ranking.
  - Filter activities by categories (`ADVENTURE`, `CULTURE`, `FOOD`, `NATURE`, `OTHER`).
  - Search cities and attractions with instant response.
  - Local suggestions integrated into trip planning views.

- 🔗 **Tokenized Public Trip Sharing**
  - Generate cryptographically secure UUID `shareToken` links for public itinerary sharing (`/share/[token]`).
  - Access-controlled unauthenticated view — non-registered visitors can inspect complete trip schedules without editing rights or account creation.

- 💬 **Community Social Feed**
  - Travelers can publish trip stories, travel advice, and photos.
  - Link posts directly to completed or ongoing trips.
  - Paginated social feed (`GET /api/community?page=1&limit=20`).

- 📅 **Interactive Trip Calendar**
  - Graphical calendar view (`/calendar`) visualizing planned trip timelines across months using `react-big-calendar`.

- 🛡️ **System Admin Dashboard & Analytics**
  - Real-time platform metrics (Total Users, Trips, Community Posts, Total Expenditure).
  - Popularity metrics & ranking for top cities and activities.
  - User directory management (viewing users, granting admin privileges).
  - Global content moderation (deleting inappropriate posts).

---

## 🏗️ Tech Stack & System Architecture

GlobeTrotter is built with a modern, decoupled client-server architecture:

```
                  ┌─────────────────────────────────────────┐
                  │           Next.js 16 App Router         │
                  │   TypeScript · Tailwind CSS · React 19   │
                  │      TanStack Query · Lucide Icons      │
                  └────────────────────┬────────────────────┘
                                       │ HTTP / REST APIs
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │             Fastify REST API            │
                  │   TypeScript · Zod Validation · JWT     │
                  │       @fastify/multipart Uploads        │
                  └────────────────────┬────────────────────┘
                                       │ Prisma ORM 5
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │             PostgreSQL Database         │
                  │           Hosted on NeonDB (Cloud)      │
                  └─────────────────────────────────────────┘
```

### 💻 Frontend Tech Stack
- **Framework:** Next.js 16 (App Router) + React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS + PostCSS
- **State & Data Fetching:** TanStack React Query v5 + Axios
- **Form Handling:** React Hook Form + Zod Validation
- **Calendar & UI Components:** `react-big-calendar`, `date-fns`, `react-hot-toast`, `lucide-react`

### ⚡ Backend Tech Stack
- **HTTP Server Framework:** Fastify v4
- **Language & Runtime:** TypeScript + `tsx` (Node.js)
- **Database & ORM:** PostgreSQL (NeonDB) + Prisma ORM 5
- **Security & Validation:** `@fastify/jwt`, `bcryptjs`, `zod`
- **File Processing:** `@fastify/multipart` + `@fastify/static`

---

## 📁 Project Directory Structure

```
odoo-globeTrotter/
├── backend/                        # Fastify REST API & Database layer
│   ├── prisma/
│   │   ├── schema.prisma           # Prisma PostgreSQL data models & enums
│   │   └── seed.ts                 # Database seeding script (Admin & Traveler demo data)
│   ├── src/
│   │   ├── lib/
│   │   │   └── prisma.ts           # Prisma client singleton
│   │   ├── middleware/
│   │   │   ├── authenticate.ts     # JWT Auth middleware
│   │   │   └── requireAdmin.ts     # Role-based route guard
│   │   ├── routes/
│   │   │   ├── admin.ts            # Admin stats, moderation & user role endpoints
│   │   │   ├── auth.ts             # Auth login, register, profile endpoints
│   │   │   ├── cities.ts           # City discovery endpoints
│   │   │   ├── community.ts        # Social feed endpoints
│   │   │   ├── search.ts           # Activities search endpoints
│   │   │   ├── sections.ts         # Itinerary section & activity stop endpoints
│   │   │   ├── share.ts            # Public tokenized trip sharing endpoints
│   │   │   ├── trips.ts            # Trip CRUD, cloning & share toggles
│   │   │   └── upload.ts           # Multipart image upload handler
│   │   └── server.ts               # Fastify server entrypoint & plugin registration
│   ├── uploads/                    # User uploaded image assets directory
│   ├── package.json
│   └── tsconfig.json
│
├── FrontEnd/                       # Next.js 16 Client application
│   ├── public/                     # Static media & assets
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/             # Login & Registration pages
│   │   │   ├── (main)/             # Authenticated layout & primary application routes
│   │   │   │   ├── admin/          # System Administration Dashboard
│   │   │   │   ├── calendar/       # Interactive trip calendar
│   │   │   │   ├── cities/         # City & activity catalog with filter chips
│   │   │   │   ├── community/      # Community feed & story submission modal
│   │   │   │   ├── dashboard/      # Main traveler home dashboard
│   │   │   │   ├── profile/        # User profile settings
│   │   │   │   └── trips/          # Trip creation & itinerary manager
│   │   │   ├── share/[token]/      # Public read-only trip viewer
│   │   │   ├── globals.css         # Tailwind global styles
│   │   │   ├── layout.tsx          # App root layout with TanStack Query provider
│   │   │   └── page.tsx            # Landing page
│   │   ├── components/             # Reusable UI components (Navbar, Sidebar, Cards, etc.)
│   │   ├── hooks/                  # Custom React hooks & TanStack Query hooks
│   │   ├── lib/                    # API client instance & helpers
│   │   └── types/                  # TypeScript data interfaces
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                           # Team documentation & architectural specifications
│   ├── API_CONTRACTS.md            # Detailed API request/response specifications
│   ├── CONTEXT_TODO.md             # Master project context & backend audit roadmap
│   ├── DEV_A.md                    # Core system & auth dev guide
│   ├── DEV_B.md                    # Trip, section & community API dev guide
│   ├── DEV_C.md                    # Frontend Auth & Itinerary Builder dev guide
│   ├── DEV_D.md                    # Frontend Design System, Discovery & Admin guide
│   ├── PLAN.md                     # Master hackathon blueprint
│   └── TEST.md                     # Manual testing & execution guide
├── API_CONTRACTS.md                # Root level API contracts reference
├── CONTEXT_TODO.md                 # Root level project todo & context
├── TEST.md                         # End-to-end manual testing guide
└── README.md                       # Root documentation (You are here)
```

---

## 🗄️ Database Schema & Data Models

GlobeTrotter utilizes **7 relational Prisma entities**:

```mermaid
erDiagram
    User ||--o{ Trip : "owns"
    User ||--o{ CommunityPost : "creates"
    Trip ||--o{ Section : "contains"
    Trip ||--o{ CommunityPost : "referenced by"
    Section ||--o{ StopActivity : "contains"
    City ||--o{ Activity : "has"
    Activity ||--o{ StopActivity : "scheduled in"

    User {
        String id PK
        String email UK
        String password
        String firstName
        String lastName
        Role role "TRAVELER | ADMIN"
    }

    Trip {
        String id PK
        String name
        DateTime startDate
        DateTime endDate
        TripStatus status "DRAFT | UPCOMING | ONGOING | COMPLETED"
        Boolean isPublic
        String shareToken UK
        Float totalBudget
    }

    Section {
        String id PK
        String name
        DateTime sectionStart
        DateTime sectionEnd
        Float budget
        Int sequence
    }

    City {
        String id PK
        String name
        String country
        Int popularity
    }

    Activity {
        String id PK
        String name
        Category category "ADVENTURE | CULTURE | FOOD | NATURE | OTHER"
        Float estimatedCost
    }

    StopActivity {
        String id PK
        Int day
        Float expense
        String notes
    }

    CommunityPost {
        String id PK
        String content
        String image
        DateTime createdAt
    }
```

---

## 🔑 Demo Credentials & Quick Login

The NeonDB cloud database is pre-seeded with sample user accounts for testing:

| User Role | Email Address | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| 🧑‍💼 **Normal Traveler** | `user@globetrotter.com` | `User@123456` | Create & edit trips, itinerary builder, community stories, public link sharing |
| 🛡️ **System Admin** | `admin@globetrotter.com` | `Admin@123456` | Platform analytics, user directory, role switching, global content moderation |

> ⚡ **Quick Fill Buttons:** On the `/login` page, click either **Traveler Demo** or **Admin Demo** to auto-fill the form instantly.

---

## 🔌 Complete REST API Specification

**Base URL:** `http://localhost:4000`  
**Authentication Header:** `Authorization: Bearer <jwt_token>`

### 1. Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account (`email`, `password`, `firstName`, `lastName`).
- `POST /api/auth/login` — Authenticate and receive JWT token + user profile.
- `GET /api/auth/me` — Fetch current user details.
- `PUT /api/auth/profile` — Update account profile details.
- `POST /api/auth/change-password` — Update user password.

### 2. Trip Management (`/api/trips`)
- `GET /api/trips` — List authenticated user's trips with computed `status` and `totalBudget`.
- `POST /api/trips` — Create a new trip.
- `GET /api/trips/:id` — Retrieve full trip with nested sections and stop activities.
- `PUT /api/trips/:id` — Update trip details and dates.
- `DELETE /api/trips/:id` — Cascade delete trip and child sections.
- `POST /api/trips/:id/toggle-share` — Enable/disable public sharing & generate UUID `shareToken`.
- `POST /api/trips/:id/copy` — Deep clone trip, sections, and stop activities into current user's profile.

### 3. Sections & Day Builder (`/api/sections`)
- `POST /api/sections` — Add section to trip (with date range boundary checks).
- `PUT /api/sections/:id` — Update section dates, budget, or sequence.
- `DELETE /api/sections/:id` — Cascade delete section.
- `POST /api/sections/:id/activities` — Assign activity to section day with expense.
- `DELETE /api/sections/:id/activities/:stopId` — Remove activity stop.

### 4. Discovery (`/api/cities`, `/api/activities`)
- `GET /api/cities` — List cities (supports `?search=` and `?popular=true`).
- `GET /api/cities/:id` — Get single city with attractions.
- `GET /api/activities` — Query activities (supports `?cityId=`, `?category=`, `?search=`).

### 5. Community Feed (`/api/community`)
- `GET /api/community` — Get paginated community posts (`?page=1&limit=20`).
- `POST /api/community` — Publish post with optional image and trip reference.
- `DELETE /api/community/:id` — Delete post (owner or Admin).

### 6. Public Sharing (`/api/share`)
- `GET /api/share/:token` — Unauthenticated public read-only trip details viewer.

### 7. Administration (`/api/admin`)
- `GET /api/admin/stats` — Platform overall aggregate statistics.
- `GET /api/admin/popular-cities` — Ranked list of popular destinations.
- `GET /api/admin/popular-activities` — Popular activities ranked by usage count.
- `GET /api/admin/users` — Full system user management table.
- `PATCH /api/admin/users/:id/role` — Update user role (`TRAVELER` ↔ `ADMIN`).
- `DELETE /api/admin/posts/:id` — Moderate/delete community post.

### 8. File Uploads (`/api/upload`)
- `POST /api/upload` — Multipart form-data image upload (JPG, PNG, WEBP, GIF; max 5MB).

---

## 🚀 Local Installation & Setup Guide

### 📋 Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **Git**

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Jinay-Bhatt/odoo-GlobeTrotter.git
cd odoo-GlobeTrotter
```

---

### Step 2: Configure & Start Backend Server

1. Navigate to `backend`:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables (`backend/.env`):
   ```env
   DATABASE_URL="postgresql://neondb_owner:npg_gAStXfEed07v@ep-dry-breeze-a11n2wgg-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
   PORT=4000
   JWT_SECRET="globetrotter-super-secret-jwt-key-2026-odoo-ldce"
   ```

4. Push Prisma schema & seed database:
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. Start backend development server:
   ```bash
   npm run dev
   # Server runs at http://localhost:4000
   ```

---

### Step 3: Configure & Start Frontend Application

1. Open a new terminal window and navigate to `FrontEnd`:
   ```bash
   cd FrontEnd
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables (`FrontEnd/.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

4. Start frontend development server:
   ```bash
   npm run dev
   # Application runs at http://localhost:3000
   ```

---

## 🧪 Manual Testing & Verification Flow

### 🧑‍💻 Traveler User Flow
1. **Login:** Open `http://localhost:3000/login` and click **Traveler Demo**.
2. **Dashboard & Discovery:** Browse popular cities (`/cities`), apply category filters (`Culture`, `Food`), and search for destinations.
3. **Plan Trip:** Navigate to `/trips/new` and create a trip (e.g., "Autumn in Tokyo").
4. **Itinerary Builder:** Select the trip, add itinerary sections, and schedule city activities with custom expense logs.
5. **Share Trip:** Toggle **Enable Public Sharing** on the trip detail page, copy the generated share URL, and paste it into an incognito window to test public view (`/share/[token]`).
6. **Community Post:** Visit `/community`, create a post linked to your trip, and upload a story photo.
7. **Calendar View:** Open `/calendar` to view your scheduled trips rendered on the calendar grid.

### 🛡️ Admin Moderation Flow
1. **Login:** Log out from traveler account, go to `/login`, and click **Admin Demo**.
2. **Analytics Dashboard:** Visit `/admin` to view live system metric counters, user tables, and destination statistics.
3. **Role Management:** Toggle a user's role between `TRAVELER` and `ADMIN`.
4. **Moderation:** Delete community posts directly from the feed or admin panel.

---

## 👥 Team & Development Credits

Developed for the **Odoo × LDCE Hackathon**:

| Role | Core Responsibilities |
| :--- | :--- |
| **Dev A** | Fastify Server setup, Prisma Schema definition, Auth & JWT Middleware, File Uploads, Database Seeding |
| **Dev B** | REST API routes (Trips, Sections, StopActivities, Community, Public Sharing, Admin Analytics) |
| **Dev C** | Next.js App Router setup, Auth UI, Trip Dashboard, Itinerary Builder, Public Share Page |
| **Dev D** | Design System, Layout, Navbar/Sidebar, City Discovery & Filtering, Social Feed, Admin Dashboard |

---

## 📜 License

This project is licensed under the MIT License — created for the Odoo × LDCE Hackathon 2026.
