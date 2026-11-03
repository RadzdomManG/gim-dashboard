# Grace in Motion (GIM) — Design Standards & UI/UX Guidelines

## 1. Brand Identity & Design Philosophy

Grace in Motion (GIM) is a premier automation, operational systems, and digital engineering consultancy. The GIM Dashboard serves as the central operating platform for GIM leadership, team members, operations, and clients.

The interface must project:
- **Authority and Polish:** High-end, bespoke engineering, avoiding generic AI-generated dashboard tropes (e.g., random purple gradients, excessive cards with arbitrary statistics, unnecessary glow effects).
- **Organic Warmth & Structure:** Grounded in deep forest greens and warm cream surfaces that reflect GIM's brand character.
- **Clarity & Utility:** High information density without visual clutter, crisp typography, distinct visual hierarchies, and purposeful micro-interactions.

---

## 2. Master Color System

All interfaces must strictly adhere to the established GIM brand palette. Hex values are canonical.

### Primary Brand Palette
| Token Name | Hex Code | Purpose & Application |
| :--- | :--- | :--- |
| **GIM Dark Green** | `#3D5249` | Primary brand color, desktop sidebar background, dominant headers, high-emphasis branding. |
| **GIM Logo Green** | `#466B53` | Brand emblems, active navigation item indicator, primary badges, secondary brand surfaces. |
| **GIM Accent Green** | `#518E6A` | Primary interactive buttons, key action highlights, focus rings, active toggle states. |
| **GIM Accent Hover** | `#427457` | Hover state for primary buttons and interactive elements. |
| **GIM Warm Cream** | `#FBF6F3` | Primary page background, light surface contrast, modal backdrops. |
| **Pure White** | `#FFFFFF` | Content card backgrounds, data tables, modals, input fields, popovers. |

### Text & Neutral Scale
| Token Name | Hex Code | Purpose & Application |
| :--- | :--- | :--- |
| **Dark Charcoal** | `#242E29` | Primary headings, table row data, modal titles, high-contrast text. |
| **Muted Slate Grey** | `#65746C` | Secondary text, table headers, breadcrumbs, helper captions, metadata. |
| **Border Neutral** | `#E5E0DB` | Card borders, table dividers, input borders, structural separators. |
| **Border Dark** | `#2D3D36` | Sidebar internal dividers and subtle borders within dark green surfaces. |
| **Subtle Cream** | `#F3EEEA` | Secondary button backgrounds, table header rows, hover states on cards. |

### Semantic & Status Palette
| State | Text Color | Background Color | Border Color | Dot / Indicator |
| :--- | :--- | :--- | :--- | :--- |
| **Success / Completed** | `#276749` | `#EDFDF5` | `#C6F6D5` | `#38A169` |
| **In Progress / Active** | `#2C5282` | `#EBF8FF` | `#BEE3F8` | `#3182CE` |
| **Review / Approval** | `#744210` | `#FEFCBF` | `#FAF089` | `#D69E2E` |
| **Pending / Queued** | `#4A5568` | `#EDF2F7` | `#E2E8F0` | `#718096` |
| **Blocked / Urgent** | `#9B2C2C` | `#FFF5F5` | `#FED7D7` | `#E53E3E` |

---

## 3. Brand Assets & Logo Usage Rules

### Approved Brand Assets
1. **Sidebar Brand Emblem (Dark Surfaces):** `/gim-mark-white.png`
   - Must be displayed at `28px` to `36px` height.
   - Used exclusively on GIM Dark Green (`#3D5249`) or dark backgrounds.
2. **Light Surface Brand Emblem:** `/gim-mark-green.png`
   - Used on Warm Cream (`#FBF6F3`) or White (`#FFFFFF`) surfaces.
3. **Master Logo & Wordmark:** `/gim-logo.png`
   - Used in login/auth portals, exported client reports, and formal documentation.

### Absolute Prohibitions
- **NEVER** replace the authentic GIM logo mark with a plain text letter "G" in a square or circle.
- **NEVER** use emojis (e.g., 🚀, ⚡, 📁, 🤖) as brand emblems or functional interface icons.
- **NEVER** label the platform with the phrase *"Agency Operating System"*. The official platform naming is strictly **GIM** or **Grace in Motion**.

---

## 4. Typography

### Font Families
- **Display & Brand Wordmark:** `Cooper Black` (`public/fonts/CooperBlack.ttf`)
  - Used sparingly for the GIM brand mark, top-level dashboard header accents, and formal brand cards.
- **UI, Navigation, Tables & Body:** `Montserrat` (`font-sans`, imported via Google Fonts / `next/font`)
  - Weights: `400` (Regular), `500` (Medium), `600` (Semi-bold), `700` (Bold).

### Scale & Hierarchy
| Style | Size | Weight | Line Height | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display H1** | `24px` (`1.5rem`) | `700` | `1.25` | `-0.01em` | Page main headers (e.g., "Operations Hub") |
| **Section H2** | `18px` (`1.125rem`) | `600` | `1.35` | `normal` | Card container titles, modal headers |
| **Subtitle H3** | `14px` (`0.875rem`) | `600` | `1.4` | `normal` | Sub-sections, grouped list headers |
| **Body Default** | `14px` (`0.875rem`) | `400` / `500` | `1.5` | `normal` | Table rows, descriptive text, input values |
| **Metadata / Small** | `12px` (`0.75rem`) | `500` / `600` | `1.4` | `0.02em` | Table headers, badges, timestamps, captions |
| **Micro / Tag** | `11px` (`0.6875rem`) | `600` | `1.3` | `0.04em` | Status dots, category tags, keyboard hints |

### Rules
- Never use full uppercase for body sentences or multi-word button labels. Uppercase is permitted ONLY for small tracking tags (e.g., `STATUS`, `CLIENT`, `PRIORITY`).
- Maintain maximum text line lengths between 60 to 75 characters for readability in documentation and descriptions.

---

## 5. Iconography

- **Library:** Use `lucide-react` exclusively.
- **Stroke Width:** Default `strokeWidth={2}` across all components for optical consistency.
- **Sizing:**
  - Navigation icons: `18px` or `20px`
  - Button action icons: `16px`
  - Table and badge status icons: `14px`
- **Icon Colors:** Inherit text color or match semantic tokens. Never use multi-color arbitrary icon sets.
- **No Emojis:** Do not use Unicode emojis as UI controls, status indicators, or navigation icons.

---

## 6. Layout & Grid System

### Breakpoint Matrix
- **Mobile (`< 768px`):** Single column, collapsible slide-over navigation drawer, horizontal scrolling on large tables, compact cards.
- **Tablet / Small Laptop (`768px - 1023px`):** 2-column card layout, condensed sidebar or collapsible drawer.
- **Standard Laptop (`1024px - 1439px`):** Fixed `256px` (`w-64`) sidebar, 3 or 4-column metrics grid, full data tables.
- **Desktop / Ultra-wide (`≥ 1440px`):** Max container width `1440px` or full fluid width with bounded content areas (`max-w-7xl` centered).

### Spacing Scale
- Use Tailwind's 4px spacing scale:
  - Micro: `p-1` (4px), `p-2` (8px)
  - Element spacing: `gap-3` (12px), `gap-4` (16px)
  - Card & Container padding: `p-5` (20px), `p-6` (24px)
  - Page level margins: `p-6` (24px) to `p-8` (32px)
- **Border Radii:**
  - Badges, pills, buttons: `rounded-lg` (8px) or `rounded-full` (9999px)
  - Cards, panels, modals: `rounded-xl` (12px) or `rounded-2xl` (16px)
  - Dropdowns, tooltips: `rounded-lg` (8px)

---

## 7. Component Specifications

### 7.1 Buttons
- **Primary Button:**
  - Background: GIM Accent Green (`#518E6A`), Hover: `#427457`
  - Text: `#FFFFFF`, `font-medium`, `text-sm`
  - Padding: `px-4 py-2.5`, Radius: `rounded-lg`
  - Focus ring: `ring-2 ring-[#518E6A] ring-offset-2`
- **Secondary / Subdued Button:**
  - Background: `#FFFFFF`, Border: `1px solid #E5E0DB`, Hover: `#F3EEEA`
  - Text: `#242E29`, `font-medium`, `text-sm`
- **Ghost / Icon Button:**
  - Transparent background, hover: `bg-black/5` or `bg-white/10` (on dark surfaces)
  - Text: `#65746C` or `#FFFFFF`

### 7.2 Cards & Containers
- Background: `#FFFFFF`
- Border: `1px solid #E5E0DB`
- Radius: `rounded-xl` (`12px`)
- Shadow: `shadow-xs` or `shadow-sm` (clean, non-diffuse shadows; no glowing borders)
- Internal Header: Separated by subtle border `border-b border-[#E5E0DB]` or unified padding `p-5`.

### 7.3 Data Tables
- Header Row: Background `#FBF6F3`, Text `#65746C`, uppercase `text-xs font-semibold tracking-wider`.
- Row Height: Minimum `48px` to ensure touch and readability compliance.
- Row Border: `border-b border-[#E5E0DB]`. Hover state: `hover:bg-[#FBF6F3]/50`.
- Cells: Text `#242E29`, `text-sm font-normal`, numeric data right-aligned.

### 7.4 Modals & Slide-over Drawers
- Backdrop: `bg-black/40 backdrop-blur-xs`
- Modal Surface: `#FFFFFF`, `rounded-2xl`, `border border-[#E5E0DB]`, `shadow-xl`
- Animation: Smooth fade and scale transition (150ms - 200ms).
- Always support `Escape` key close and backdrop click dismissal.

---

## 8. Accessibility & Quality Rules

1. **Contrast Ratio:** Text on any surface must meet **WCAG 2.1 AA** standards (minimum `4.5:1` for normal text, `3:1` for large text/icons).
2. **Keyboard Navigation:** All interactive elements must provide visible, high-contrast focus rings (`focus-visible:ring-2`).
3. **Empty & Loading States:** Every table, card, or dynamic list must provide a dedicated loading skeleton and an informative empty state illustration/message with a primary call to action.
4. **Touch Targets:** Interactive targets on mobile must measure at least `44px x 44px`.
