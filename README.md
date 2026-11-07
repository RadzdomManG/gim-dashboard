# Grace in Motion (GIM) — Agency Operating System & Mission Control

[![Vercel Production](https://img.shields.io/badge/Production-Live%20on%20Vercel-3D5249?style=for-the-badge&logo=vercel)](https://graceinmotion.vercel.app)
[![Next.js 16.4](https://img.shields.io/badge/Next.js-16.4%20(Turbopack)-466B53?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript 5.x](https://img.shields.io/badge/TypeScript-Strict%20Zero%20Errors-518E6A?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Security Isolation](https://img.shields.io/badge/RLS%20Isolation-100%25%20Zero%20Leak-3D5249?style=for-the-badge&logo=shield)](https://graceinmotion.vercel.app)

> **Central digital engineering, franchise automation, and operational delivery command center for Grace in Motion (GIM).**  
> Live Production URL: **`https://graceinmotion.vercel.app`**

---

## 🏆 Top 10 High-Impact System Upgrades

The platform incorporates 10 advanced architectural, visual, and operational upgrades:

### 1. Personalized Internal AI Co-Pilot (Single-Tenant Boundary)
- A floating intelligent assistant (`bottom-right`) tailored specifically to each logged-in personnel (`[Member]'s Co-Pilot`).
- Strictly enforces multi-tenant security isolation: non-admin specialists can only inspect and interact with deliverables from their authorized clients. Cross-client queries are immediately blocked by security guardrails.

### 2. Natural Language Task Move Commands
- Team members can instruct their AI Co-Pilot in natural language (e.g. *"Move task #8699h7y6k to In Progress"* or *"Mark task #... as Done"*).
- The AI responds with an interactive **one-click confirmation button** directly in the chat bubble that instantly triggers the state mutation in the dashboard.

### 3. 1-Click Card Grid vs. Table View Switcher
- Fast toggle on the Task Backlog header:
  - **Card Grid View:** 3-column responsive visual cards with client source tags, gate codes (`G5`, `G7`), assignee chips with avatars, and due date alerts.
  - **Table View:** Dense spreadsheet-style layout optimized for high-density auditing and bulk verification.

### 4. Scoped Task Creation (`+ New Task`)
- When any specialist clicks `+ New Task`, their authorized client organization is automatically pre-selected, and the client dropdown is strictly filtered to their allowed scope to guarantee zero cross-client drift.

### 5. Instant End of Shift (EOS) Report Generator
- Specialists can click *"Draft today's End of Shift note"* in their Co-Pilot. The AI instantly drafts a formal GIM EOS report based on their actual tasks and shift milestones for the day, complete with a one-click copy button.

### 6. Messenger-Style Chat Bubble Alignment
- Chat messages feature distinct color-coded messenger bubbles:
  - **Current User / Original Sender:** Right-aligned in **GIM Brand Green (`#466B53`)** with white text.
  - **Other Team Members:** Left-aligned in warm cream cards with dark charcoal text for effortless speaker recognition.

### 7. Client-Dedicated Channels & Auto-Routing
- Dedicated communication channels for every authentic client (`#little-treasures-ops`, `#wrts-automations`, `#juvibolt-cybertech`, `#risewise-growth`, `#noirlab-digital`, `#studio-nets-ops`, `#invogue-growth`, `#tch2thrive-systems`, and `#general-gim`).
- Specialists automatically gain access to their client channels upon login without manual invites.

### 8. Active Deliverables Default (Zero Backlog Overwhelm)
- The backlog defaults to actionable work (`To Do`, `In Progress`, `For Review`), shielding team members from over 1,200 archived ClickUp tasks while keeping search instantaneous.

### 9. Executive Admin Governance Dashboard (`MembershipAccessManager`)
- Executive stats strip displaying Core Admins, Specialists, Client Portals, and Tenant Isolation metrics.
- Includes a live search bar and instant toggle switches for Goal visibility, Financial rate locks, and account restoration.

### 10. Full Roster Authenticity & Zero Hardcoded Lag
- All 20 verified team members and client principals have guaranteed credentials in `BUILT_IN_ACCOUNTS`.
- Overdue dates are dynamically compared using `Date.now()`, eliminating false overdue warnings.

---

## 👥 Verified Personnel Credentials Directory (20 Accounts)

All accounts can be tested live at **`https://graceinmotion.vercel.app/login`**:

### Executive & Core Admin Leadership (Universal Authority)
| Personnel | Username | Password | Role | Assigned Client Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Divine Origines** | `divine.origines` | `GIM_Divine2026!Strategy` | Owner | **All Accounts** (Universal) |
| **Radzdom Gallego (Radz)** | `rdzgllgo` | `GIM_Radz2026!Architect` | Admin | **All Accounts** (Universal) |
| **Ma. Rose Anne Malinao (RA)** | `ra.malinao` | `GIM_RA2026!Finance` | Admin | **All Accounts** (Universal) |
| **RA Operations** | `aneweraa.ai@gmail.com` | `GIM_RA2026!Operations` | Admin | **All Accounts** (Universal) |

### Delivery Squad & Client Specialists (Scoped Isolation)
| Personnel | Username | Password | Role | Assigned Client Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Erwin Manaog** | `erwin.manaog` | `GIM_Erwin2026!Sprint` | Project Owner | `Little Treasures Company`, `We Rock the Spectrum (WRTS)` |
| **BJ Ricafrente** | `bj.ricafrente` | `GIM_BJ2026!Franchise` | Operations Specialist | `We Rock the Spectrum (WRTS)`, `Grace In Motion (Internal)` |
| **Camille Bautista** | `camille.smm` | `GIM_Camille2026!Social` | Social Media Specialist | `Little Treasures Company` Only |
| **Jerold Recaplaza** | `jerold.recaplaza` | `GIM_Jerold2026!Growth` | Operations Specialist | `Risewise` Only |
| **Jane Caillio** | `jane.caillio` | `GIM_Jane2026!Lead` | Project Lead | `NoirLab` Only |
| **Jedy Caillio** | `jedy.caillio` | `GIM_Jedy2026!Systems` | Operations Specialist | `InVogue Cleans` Only |
| **Ellyka Claire Pama** | `ellyka.pama` | `GIM_Ellyka2026!Assist` | Operations Assistant | `InVogue Cleans`, `Studio Nets` |
| **Joyce Roble** | `joyce.roble` | `GIM_Joyce2026!Design` | Project Specialist | `Studio Nets` Only |
| **Joy Fabular** | `joy.fabular` | `GIM_Joy2026!Clean` | Operations Assistant | `InVogue Cleans` Only |
| **Aldwin** | `aldwin.ops` | `GIM_Aldwin2026!Ops` | Operations Assistant | `We Rock the Spectrum (WRTS)` Only |
| **Hashim Saudi** | `hashim.saudi` | `GIM_Hashim2026!Tech` | Tech Specialist | `Studio Nets` Only |
| **Kimberly Besa** | `kimberly.besa` | `GIM_Kimberly2026!GIM` | Operations Assistant | `Grace In Motion (Internal)` Only |

### Verified Client Principals (Single-Tenant Portal Isolation)
| Personnel | Username | Password | Role | Client Portal Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Zoe Horner** | `zoe.horner` | `Portal_Zoe2026!LTC` | Client User | `Little Treasures Company` Only |
| **Aaron Ofosu** | `aaron.ofosu` | `Portal_Aaron2026!JB` | Client User | `Juvibolt Cybertech` Only |
| **Matthew Robbins** | `matthew.robbins` | `Portal_Matthew2026!IVC` | Client User | `InVogue Cleans` Only |
| **Nathan Blake** | `nathan.blake` | `Portal_Nathan2026!SN` | Client User | `Studio Nets` Only |

---

## 🎨 Master Brand Identity & Design System

The platform strictly follows the GIM Design Standards (`docs/DESIGN_STANDARDS.md`):

| Token Name | Hex Value | Application |
| :--- | :--- | :--- |
| **GIM Dark Green** | `#3D5249` | Primary brand surface, dominant headers, sidebar background |
| **GIM Logo Green** | `#466B53` | Brand emblems, active indicators, secondary badges, sender chat bubbles |
| **GIM Accent Green** | `#518E6A` | Interactive action buttons, active toggles, focus rings |
| **GIM Warm Cream** | `#FBF6F3` | Primary page backdrop, light surface contrast |
| **Dark Charcoal** | `#242E29` | High-contrast headings and primary typography |
| **Muted Slate Grey** | `#65746C` | Subtitles, table headers, metadata |

- **Typography:** `Montserrat` (`font-sans`) for UI and tables; `Cooper Black` accents for formal brand emblems.
- **Iconography:** `lucide-react` exclusively with `strokeWidth={2}`. Emojis are strictly prohibited as functional UI icons or status badges.

---

## 🚀 Development & Verification Workflow

```bash
# Install dependencies
pnpm install

# Run TypeScript compilation check (0 errors required)
pnpm exec tsc --noEmit

# Run Next.js production build (Turbopack)
pnpm build

# Deploy to Vercel production
npx vercel --prod --yes --scope radzdoms-projects
```

---

*Authored by **Radzdom Gallego** (Chief Automation Architect, Grace in Motion)*
