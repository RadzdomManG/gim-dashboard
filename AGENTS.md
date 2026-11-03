<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Grace in Motion (GIM) — Master AI Agent Instructions & Operating Rules

> **CRITICAL DIRECTIVE FOR ALL AI AGENTS (Antigravity, Codex, etc.):**  
> This file establishes the non-negotiable operational rules, architectural boundaries, brand identity standards, and quality gates for the **Grace in Motion (GIM)** codebase. You must follow these instructions without deviation.

---

## 1. Absolute Non-Negotiable Operational Rules

### 1.1 ClickUp Is 100% READ-ONLY
- ClickUp serves strictly as a **read-only** operational data source.
- **NEVER** create, update, delete, reassign, or change the status of any ClickUp task, subtask, list, folder, or space.
- **NEVER** post comments or modify ClickUp automations or webhooks.
- Any feature requiring task mutation must store changes in Supabase, not ClickUp.

### 1.2 Vercel Production Deployments Are FROZEN
- Automatic production deployments on Vercel are currently frozen.
- **NEVER** push unverified or experimental code to `main`.
- All development, feature additions, and styling verifications must be verified locally on `http://localhost:3000`.

### 1.3 Supabase Database Governance
- **NEVER** execute destructive operations (`DROP TABLE`, `TRUNCATE`, database resets) against Supabase project `eckdybswbcbhqidgwfkl`.
- All database modifications must be authored as version-controlled SQL files in `supabase/migrations/`.
- Row Level Security (RLS) policies must be strictly maintained to isolate client data.

---

## 2. Brand Identity & Visual Design Standards

You must preserve the authentic GIM brand identity. Never generate generic, cookie-cutter "AI dashboard" interfaces.

### 2.1 Canonical Color Palette
- **GIM Dark Green (`#3D5249`):** Primary brand surface, desktop navigation sidebar, dominant headers.
- **GIM Logo Green (`#466B53`):** Active nav indicator, secondary brand badges, brand highlights.
- **GIM Accent Green (`#518E6A`):** Interactive buttons, primary action triggers, active toggles.
- **GIM Warm Cream (`#FBF6F3`):** Page background, subtle surface contrast, card backdrops.
- **Pure White (`#FFFFFF`):** Data tables, cards, modals, form inputs.
- **Dark Charcoal (`#242E29`):** Primary text and headings.
- **Slate Grey (`#65746C`):** Secondary text, table headers, metadata.

### 2.2 Brand Emblem & Naming Rules
- **Brand Emblems:** Use `/gim-mark-white.png` on dark green surfaces and `/gim-mark-green.png` on light surfaces.
- **NEVER** replace the GIM logo mark with a plain text letter "G" or an emoji.
- **Platform Name:** The platform is strictly **GIM** or **Grace in Motion**.  
  **DO NOT** use the phrase *"Agency Operating System"* anywhere in the interface or page titles.

### 2.3 Typography & Iconography
- **Display / Brand:** `Cooper Black` (`public/fonts/CooperBlack.ttf`).
- **UI / Body / Tables:** `Montserrat` (`font-sans`).
- **Icons:** Use `lucide-react` exclusively with `strokeWidth={2}`. Emojis are strictly prohibited as functional UI icons or status badges.

---

## 3. Team Identity & Access Control

### 3.1 Core Admin Team (Universal Full Access)
The following verified leadership accounts hold universal administrative access across all clients, workspaces, automations, and scorecards:
1. **Divine Origines** — Role: `Owner`
2. **Radzdom Gallego** (Nickname: **Radz**) — Role: `Admin`
3. **Ma. Rose Anne (RA) Malinao** — Role: `Admin`

### 3.2 User Nickname Editing
- The platform user profile must correctly display **Radzdom Gallego** (Nickname: **Radz**).
- Users must have the ability to view and edit their profile nickname within the application settings without altering their underlying authentication or permissions.

### 3.3 Active Client Portfolio
The platform delivers operational tracking for GIM's authentic clients:
- **Little Treasures Company** (Paediatric therapy clinic, AU)
- **We Rock the Spectrum (WRTS)** (Sensory gym franchise, 21 n8n automations, AU)
- **Studio Nets** (Design & creative systems)
- **InVogue Cleans** (Premium cleaning services)
- **Aaron Ofosu Bootcamp** (Fitness & training)
- **Tch2Thrive** (Education & development)

---

## 4. Engineering Workflow & Quality Gates

Every code change must adhere to the 5-step lifecycle:
```
[1. AUDIT & DISCOVER] ──> [2. ARCHITECT & PLAN] ──> [3. IMPLEMENT] ──> [4. LOCAL QA] ──> [5. VERIFY & REPORT]
```

### Pre-Completion Verification Checklist
Before presenting work as complete, you must verify:
1. **TypeScript Compilation:** `pnpm exec tsc --noEmit` exits with 0 errors.
2. **Production Build:** `pnpm build` completes successfully.
3. **Multi-Viewport Quality:** Verified at `1440x900` (Desktop), `1366x768` (Laptop), and `390x844` (Mobile).
4. **Design Compliance:** All tokens, fonts, and assets match `docs/DESIGN_STANDARDS.md`.

---

## 5. Reference Standards Documentation

For detailed technical specifications, always refer to the canonical documentation:
- **Design Standards:** [`docs/DESIGN_STANDARDS.md`](file:///d:/GIM%20dashboard/docs/DESIGN_STANDARDS.md)
- **System Architecture:** [`docs/ARCHITECTURE.md`](file:///d:/GIM%20dashboard/docs/ARCHITECTURE.md)
- **Development Guidelines:** [`docs/DEVELOPMENT_GUIDELINES.md`](file:///d:/GIM%20dashboard/docs/DEVELOPMENT_GUIDELINES.md)
- **QA & Testing Standards:** [`docs/QA_STANDARDS.md`](file:///d:/GIM%20dashboard/docs/QA_STANDARDS.md)
