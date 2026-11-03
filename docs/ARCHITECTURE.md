# Grace in Motion (GIM) — System Architecture & Technical Specifications

## 1. System Overview

The **GIM Dashboard** is the centralized mission control platform for Grace in Motion (GIM). It consolidates client delivery backlogs, automation monitoring, approval workflows, scorecard metrics, and team capacity tracking into a unified, high-performance web application.

```
                      +-----------------------------+
                      |         Web Client          |
                      |   Next.js 16 App Router     |
                      |  (Desktop / Laptop / Phone) |
                      +--------------+--------------+
                                     |
               +---------------------+---------------------+
               |                                           |
               v                                           v
+-------------------------------+         +-------------------------------+
|       Supabase Cloud          |         |       ClickUp Workspace       |
|    (PostgreSQL Database)      |         |     (Read-Only Data Feed)     |
+-------------------------------+         +-------------------------------+
| - Authentication & RBAC       |         | - Spaces, Folders & Lists     |
| - User Profiles & Nicknames   |         | - Client Delivery Backlogs    |
| - Approval Queues             |         | - Sprint Tasks & Due Dates    |
| - Scorecards & Metrics        |         | - Task Custom Fields          |
| - Row Level Security (RLS)    |         | * STRICTLY NO WRITE / MUTATE  |
+-------------------------------+         +-------------------------------+
```

---

## 2. Directory & Codebase Structure

The project strictly distinguishes between executable application code and operational intake references:

```
D:/GIM dashboard/
├── src/
│   ├── app/                         # Next.js 16 App Router
│   │   ├── layout.tsx               # Root layout, fonts, CSS import, metadata
│   │   ├── page.tsx                 # Operations Hub / Main Dashboard view
│   │   ├── globals.css              # Tailwind CSS v4 theme variables and utilities
│   │   ├── api/                     # Server-side API route handlers
│   │   │   └── clickup/             # Read-only ClickUp data proxy endpoints
│   │   ├── clients/                 # Client portfolio views
│   │   ├── automations/             # Automation health & monitoring dashboard
│   │   ├── approvals/               # Client & internal approval queues
│   │   └── settings/                # Profile & team settings (nickname editor)
│   ├── components/
│   │   ├── ui/                      # Reusable design system primitives
│   │   │   ├── button.tsx           # Standardized GIM button variants
│   │   │   ├── badge.tsx            # Status pills and semantic tags
│   │   │   ├── card.tsx             # Card containers with headers and content
│   │   │   ├── table.tsx            # High-density data tables
│   │   │   ├── input.tsx            # Text inputs, search bars, selects
│   │   │   ├── modal.tsx            # Accessible dialog windows
│   │   │   └── status-dot.tsx       # Live status indicators
│   │   └── layout/                  # Shell components
│   │       ├── sidebar.tsx          # GIM Forest-green navigation sidebar
│   │       ├── header.tsx           # Top navigation bar, search, user menu
│   │       └── mobile-drawer.tsx    # Slide-over navigation for mobile devices
│   └── lib/                         # Shared libraries and utilities
│       ├── supabase/                # Supabase browser and server clients
│       │   ├── client.ts            # Client-side Supabase client
│       │   └── server.ts            # Server-side authenticated Supabase client
│       ├── clickup/                 # Read-only ClickUp API client & types
│       │   └── client.ts            # Read-only fetchers for tasks, lists, spaces
│       └── utils.ts                 # Classname merger (cn), formatters, helpers
├── supabase/
│   └── migrations/                  # Version-controlled SQL schema migrations
│       └── 20261103_init_rbac.sql   # RBAC tables, profiles, RLS policies
├── public/                          # Static public assets
│   ├── fonts/                       # Local fonts (CooperBlack.ttf)
│   ├── gim-logo.png                 # Master brand mark & wordmark (813x813)
│   ├── gim-mark-white.png           # White emblem for dark green surfaces
│   └── gim-mark-green.png           # Green emblem for cream/white surfaces
├── docs/                            # Permanent Engineering & Design Standards
│   ├── DESIGN_STANDARDS.md          # Visual identity, typography, tokens
│   ├── ARCHITECTURE.md              # System design & data boundaries (this file)
│   ├── DEVELOPMENT_GUIDELINES.md    # Conventions, patterns, error handling
│   └── QA_STANDARDS.md              # Verification scripts, testing standards
├── GIM Operating System (1)/        # READ-ONLY operational intake & reference library
│   ├── 01 Strategic Foundations/    # Vision, value proposition, core pillars
│   ├── 02 Client Delivery Systems/  # Playbooks, client dossiers, intake notes
│   ├── 03 Automation & Technology/  # n8n workflows, webhook mappings
│   ├── 04 GIM Internal/            # Command center specs, capacity sheets
│   └── 05 Growth & Marketing/       # Marketing strategy, proposals
├── AGENTS.md                        # Master AI agent instructions & operational rules
├── package.json                     # Node dependencies and scripts
├── postcss.config.mjs               # PostCSS configuration for Tailwind v4
├── next.config.ts                   # Next.js compiler settings
└── tsconfig.json                    # Strict TypeScript configuration
```

---

## 3. Data Integration & External Boundaries

### 3.1 ClickUp Integration (Strictly Read-Only)
- **Role:** Source of truth for client task delivery backlogs, sprint tasks, and status tracking.
- **Access Boundary:** **STRICTLY READ-ONLY**. Under no circumstances may application code, background agents, or scripts create, update, delete, reassign, or alter any task, folder, or comment in ClickUp.
- **Data Extracted:**
  - Spaces, Folders, and Lists
  - Tasks, Subtasks, and Descriptions
  - Due Dates, Assignees, and Priority Levels
  - Custom fields (e.g., Client Name, Delivery Phase, Approval State)
- **Caching & Proxy:** All ClickUp API calls must pass through internal Next.js server route handlers (`/api/clickup/*`) with caching headers to prevent rate-limiting and protect API keys.

### 3.2 Supabase Database & Authentication
- **Role:** Primary operational store for user profiles, access control, approval submissions, scorecard entries, and live automation health metrics.
- **Project Reference:** `eckdybswbcbhqidgwfkl`
- **Core Tables:**
  - `profiles`: User information, email, role, avatar URL, and customizable `nickname`.
  - `clients`: Registered client accounts (Little Treasures, WRTS, Studio Nets, InVogue Cleans, Aaron Ofosu Bootcamp, Tch2Thrive).
  - `approvals`: Client deliverable approval queue (pending, approved, rejected, revision comments).
  - `automation_health`: Real-time health, ping status, and execution logs for n8n/webhook pipelines.
  - `scorecards`: Weekly/monthly agency KPI metrics and throughput metrics.
- **Schema Management:** All database changes must be authored as SQL scripts in `supabase/migrations/` and never executed as ad-hoc destructive operations.

---

## 4. Role-Based Access Control (RBAC) & Security

### 4.1 Core Admin Team (Universal Full Access)
The following verified leadership accounts hold universal administrative authority across all modules, client spaces, scorecards, and system configurations:
1. **Divine Origines** — Role: `Owner` (Founder / Executive Lead)
2. **Radzdom Gallego** (Nickname: **Radz**) — Role: `Admin` (Operations & Technical Lead)
3. **Ma. Rose Anne (RA) Malinao** — Role: `Admin` (Project & Delivery Lead)

### 4.2 Client Isolation & Multi-Tenancy
- **Client Roles:** `Client User` or `Client Reviewer`.
- **Row Level Security (RLS):** Supabase RLS policies enforce that users assigned to a specific client organization can query and view only the records matching their `client_id`.
- Clients have zero visibility into other clients' tasks, internal capacity worksheets, financial scorecards, or internal GIM discussions.

### 4.3 Profile & Nickname Customization
- Team members and users have the explicit right to view and update their display nickname in their profile without altering their primary system identity or email.

---

## 5. Active Client Roster & Scope Mapping

The platform accommodates and renders delivery streams for GIM's authentic client portfolio:
1. **Little Treasures Company:** Paediatric therapy clinic (Brisbane, AU). Clinical booking, GoHighLevel funnels, intake automation.
2. **We Rock the Spectrum (WRTS):** Sensory gym franchise (Preston, AU). 21 active n8n workflows, ClassReach/HubSpot sync.
3. **Studio Nets:** Creative design studio. Production pipelines and asset reviews.
4. **InVogue Cleans:** Premium cleaning services. Lead capture and quote dispatching.
5. **Aaron Ofosu Bootcamp:** Fitness training programs. Student onboarding and membership tracking.
6. **Tch2Thrive:** Educational consultancy. Course enrollments and client communications.

---

## 6. Hosting & Environment Protocols

- **Local Development:** `http://localhost:3000` via Next.js Turbopack (`pnpm dev`).
- **Production Host:** Vercel (`gim-dashboard` project).
- **Deployment Freeze:** Automatic deployments to production are currently **FROZEN**. All development, feature additions, and styling verifications must be executed and approved on `localhost` before pushing to `main`.
