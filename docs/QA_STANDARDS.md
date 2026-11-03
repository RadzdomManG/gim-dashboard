# Grace in Motion (GIM) — Quality Assurance & Verification Standards

## 1. Quality Assurance Philosophy

A flawless operational platform demands rigorous, repeatable verification before any feature or styling change is merged. Quality is not an afterthought; it is enforced through automated static checks, functional test criteria, and multi-viewport visual audits.

---

## 2. Automated Static Verification Suite

Before presenting any code changes or marking a task complete, every engineer and AI agent must run and pass the following static checks locally:

### 2.1 TypeScript Compilation Check
Verify that all types, interfaces, and component signatures compile without errors:
```bash
pnpm exec tsc --noEmit
```
*Acceptance Criteria:* Zero TypeScript errors. No use of implicit `any`.

### 2.2 Next.js Production Build Validation
Verify that Turbopack and the Next.js production bundler generate all routes without static rendering errors, broken imports, or missing packages:
```bash
pnpm build
```
*Acceptance Criteria:* Exit code 0, all static and dynamic routes compile successfully.

### 2.3 PostCSS & Tailwind Generation Verification
Verify that `postcss.config.mjs` and Tailwind CSS v4 generate the required utility classes:
- Inspect compiled CSS size (standard dashboard CSS should exceed ~35KB with full component utilities).
- Ensure no raw unstyled HTML elements appear in the browser DOM.

---

## 3. Visual & Viewport Verification Matrix

Visual inspection must be conducted using automated headless browser testing (e.g., Playwright) or active browser devtools across three standard viewport dimensions:

| Device Category | Target Dimensions | Key Verification Criteria |
| :--- | :--- | :--- |
| **Desktop / Wide Display** | `1440 x 900` | Full `256px` forest green sidebar visible, multi-column metric grid, complete data tables with all columns displayed without horizontal scroll. |
| **Standard Laptop** | `1366 x 768` | Balanced typography, compact cards, header elements do not overlap, data tables fit comfortably. |
| **Mobile / Phone** | `390 x 844` (iPhone 14) | Desktop sidebar is hidden; hamburger menu triggers accessible slide-over drawer; cards stack in single column; tables scroll horizontally without breaking layout. |

### Visual Artifact Capture
- Any significant UI overhaul must capture screenshots across these three viewports.
- Screenshots must be reviewed to verify that buttons, badges, user profile footers, and logo marks render cleanly without clipping or overlapping with dev indicators.

---

## 4. Design Standards Verification Checklist

Every pull request or feature update must pass this checklist:

- [ ] **Branding:** Uses authentic `/gim-mark-white.png` on dark surfaces and `/gim-mark-green.png` on light surfaces. Never uses a raw "G" letter or generic icon.
- [ ] **Naming:** No instances of *"Agency Operating System"* in headers, subtitles, meta tags, or page titles. Uses **GIM** or **Grace in Motion**.
- [ ] **User Identity:** Profile correctly displays **Radzdom Gallego** (Nickname: **Radz**).
- [ ] **Color Fidelity:**
  - Dark Green: `#3D5249`
  - Logo Green: `#466B53`
  - Accent Green: `#518E6A`
  - Warm Cream: `#FBF6F3`
  - White: `#FFFFFF`
  - Charcoal: `#242E29`
  - Slate Grey: `#65746C`
- [ ] **Typography:** Display elements utilize `Cooper Black`, UI and tabular data utilize `Montserrat`. No full-uppercase sentences.
- [ ] **Iconography:** All icons originate from `lucide-react` with `strokeWidth={2}`. Absolutely zero emojis in UI controls or status badges.
- [ ] **Contrast:** All text satisfies WCAG AA contrast ratios (≥ 4.5:1).

---

## 5. Functional & Behavioral Verification Checklist

- [ ] **Navigation:** All sidebar links and mobile drawer links navigate to valid routes or active tabs without 404 errors.
- [ ] **Modal Behaviors:**
  - Opens cleanly upon trigger click.
  - Can be dismissed via the close "X" button, backdrop click, or pressing `Escape`.
  - Traps focus appropriately while open.
- [ ] **Form & Input Validation:**
  - Required fields indicate validation errors when left empty.
  - Profile nickname editor allows editing and saving without altering core permissions.
- [ ] **ClickUp Boundaries:**
  - Read-only data displays without triggering any network `POST`, `PUT`, or `DELETE` requests to ClickUp.
- [ ] **Dev Indicator Placement:**
  - Next.js development indicator is disabled or positioned so it does not collide with the user profile footer.
