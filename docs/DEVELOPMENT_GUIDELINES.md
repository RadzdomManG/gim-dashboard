# Grace in Motion (GIM) — Development Guidelines & Engineering Conventions

## 1. Core Engineering Workflow

To maintain code quality, avoid regressions, and ensure brand integrity, every engineer and AI agent working on GIM Dashboard must adhere to the 5-step lifecycle:

```
[1. AUDIT & DISCOVER] ──> [2. ARCHITECT & PLAN] ──> [3. IMPLEMENT] ──> [4. LOCAL QA] ──> [5. VERIFY & REPORT]
```

1. **Audit & Discover:** Inspect existing code, dependencies, and design tokens before writing or altering files. Never make assumptions about API signatures or CSS classes.
2. **Architect & Plan:** Determine file placement (`src/components/ui/`, `src/lib/`, `src/app/`), state management approach, and data flow.
3. **Implement:** Write modular, type-safe, and self-documenting code adhering strictly to the GIM Design Standards.
4. **Local QA:** Run type-checking (`tsc --noEmit`), build validation (`pnpm build`), and test in the browser across standard viewports (Desktop, Laptop, Mobile).
5. **Verify & Report:** Provide clickable file links, capture visual verification artifacts, and state exact outcomes.

---

## 2. TypeScript & Code Quality Standards

### 2.1 TypeScript Strict Mode
- Never use `any`. Always declare explicit interfaces or types.
- Ensure all component props have well-documented TypeScript types.
- Avoid non-null assertions (`!`) unless guaranteed by a strict guard.

```typescript
// Good
interface ClientDeliveryProps {
  clientId: string;
  clientName: string;
  status: 'active' | 'onboarding' | 'review' | 'paused';
  activeAutomationsCount: number;
  onSelect?: (clientId: string) => void;
}

export function ClientDeliveryCard({
  clientId,
  clientName,
  status,
  activeAutomationsCount,
  onSelect,
}: ClientDeliveryProps) {
  // ...
}
```

### 2.2 Naming Conventions
- **Components:** `PascalCase.tsx` (e.g., `ClientDeliveryCard.tsx`, `SidebarNav.tsx`).
- **Hooks:** `camelCase.ts` prefixed with `use` (e.g., `useClickupBacklog.ts`).
- **Utility Functions:** `camelCase.ts` (e.g., `formatCurrency.ts`, `dateUtils.ts`).
- **Constants & Configs:** `UPPER_SNAKE_CASE` (e.g., `GIM_BRAND_COLORS`, `DEFAULT_PAGE_SIZE`).
- **Database Tables & Columns:** `snake_case` (e.g., `created_at`, `user_id`, `company_name`).

### 2.3 Import Ordering
Group imports cleanly in the following order:
1. React & Next.js core (`react`, `next/link`, `next/navigation`)
2. Third-party packages (`lucide-react`, `@supabase/supabase-js`)
3. Internal design system primitives (`@/components/ui/*`)
4. Internal layouts & feature components (`@/components/*`)
5. Shared libraries, hooks, and utilities (`@/lib/*`, `@/hooks/*`)
6. Types & Interfaces (`@/types/*`)

---

## 3. UI Component Construction & Reusability

All reusable primitives MUST reside in `src/components/ui/`. Never build ad-hoc buttons or badges inline in pages.

### 3.1 Styling Rules (Tailwind CSS v4)
- Use standard CSS variables and tokens defined in `src/app/globals.css`.
- Avoid arbitrary hardcoded color values in inline styles. Use canonical GIM tokens:
  - Background: `bg-[#3D5249]`, `bg-[#FBF6F3]`, `bg-[#FFFFFF]`
  - Borders: `border-[#E5E0DB]`, `border-[#2D3D36]`
  - Text: `text-[#242E29]`, `text-[#65746C]`, `text-[#518E6A]`
- Utility merging: Always use `cn(...)` utility (`clsx` + `tailwind-merge`) when allowing custom class names on reusable components:

```typescript
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-lg",
        variant === "primary" && "bg-[#518E6A] text-white hover:bg-[#427457] focus-visible:ring-[#518E6A]",
        variant === "secondary" && "bg-[#FFFFFF] text-[#242E29] border border-[#E5E0DB] hover:bg-[#F3EEEA]",
        size === "sm" && "text-xs px-3 py-1.5",
        size === "md" && "text-sm px-4 py-2",
        className
      )}
      {...props}
    />
  );
}
```

---

## 4. State Management & Data Fetching

### 4.1 Server Components by Default
- Favor Next.js React Server Components (RSC) for data-fetching pages (`page.tsx`) to eliminate client bundle overhead and avoid client-side waterfalls.
- Use `"use client"` only for components requiring browser APIs, local state (`useState`, `useReducer`), or event listeners (`onClick`, `onChange`).

### 4.2 Loading & Empty States
Every interactive view or data grid must gracefully handle three states:
1. **Loading State:** Render structured skeletons (`animate-pulse`) matching the card or table shape rather than a generic spinner.
2. **Empty State:** Provide clear context, a muted icon, an explanatory description, and an action trigger.
3. **Error State:** Surface user-friendly error banners with retry mechanisms rather than unhandled exceptions or blank screens.

---

## 5. Security & Isolation Directives

### 5.1 ClickUp Protection (Non-Negotiable)
- All ClickUp client requests are **READ-ONLY**.
- Under no conditions should code introduce `POST`, `PUT`, `PATCH`, or `DELETE` methods against the ClickUp API.
- Do not add API endpoints or automation hooks that write back to ClickUp tasks or folders.

### 5.2 User Identity & Nickname Rule
- The platform user profile must properly display the user's authentic name: **Radzdom Gallego** (Nickname: **Radz**).
- The profile module must allow users to edit and save their nickname locally and in Supabase without altering primary administrative authorization.

---

## 6. Git & Version Control Protocol

1. **Branch Hygiene:** Work on descriptive feature branches or directly on `main` only for verified, non-breaking improvements.
2. **Commit Message Format:** Use conventional commits:
   - `feat(ui): add client delivery backlog card`
   - `fix(styling): restore tailwind v4 utility generation`
   - `docs(standards): add system architecture specifications`
   - `refactor(sidebar): implement accessible mobile drawer`
3. **Deployment Safety:** Do not trigger production Vercel builds until changes have been verified and cleared.
