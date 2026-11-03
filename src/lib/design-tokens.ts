/**
 * Grace in Motion (GIM) — Design System Tokens
 * Source of truth for all brand and operational UI components.
 */

export const GIM_COLORS = {
  // Brand Palette
  darkGreen: "#3D5249",      // Primary dark brand color (Sidebar, deep anchors, major headings)
  logoGreen: "#466B53",      // Authentic GIM logo color (Emblems, brand badges)
  accentGreen: "#518E6A",    // Primary interactive accent (CTAs, active states, key metrics)
  accentGreenHover: "#457B5B", // Hover state for primary buttons
  warmCream: "#FBF6F3",      // Background canvas (Soft, grounded warmth, avoids sterile white)
  warmCreamSubtle: "#F5EFEA",// Secondary background / table header tint
  white: "#FFFFFF",          // Content containers, table cards, active modals

  // Text & Typography
  charcoal: "#242E29",       // High-contrast primary text (sharp, readable, non-harsh)
  charcoalSecondary: "#45544C", // Subheadings and table data
  mutedGrey: "#65746C",      // Captions, helper text, timestamps, labels
  mutedGreyLight: "#8A9991", // Disabled text, placeholder text

  // Borders & Dividers
  borderWarm: "#E8E2DD",     // Hairline container borders
  borderGreen: "rgba(61, 82, 73, 0.12)", // Subtle brand border
  borderDarkGreen: "rgba(70, 107, 83, 0.35)", // Sidebar dividers

  // Operational Semantic Status Colors
  status: {
    active: {
      bg: "rgba(70, 107, 83, 0.10)",
      border: "rgba(70, 107, 83, 0.25)",
      text: "#3D5249",
      dot: "#518E6A",
    },
    review: {
      bg: "#FFF9EB",
      border: "#FDE68A",
      text: "#92400E",
      dot: "#D97706",
    },
    upcoming: {
      bg: "#F8FAFC",
      border: "#E2E8F0",
      text: "#475569",
      dot: "#94A3B8",
    },
    critical: {
      bg: "#FEF2F2",
      border: "#FECACA",
      text: "#991B1B",
      dot: "#DC2626",
    },
  },
} as const;

export const GIM_TYPOGRAPHY = {
  display: "var(--font-display)", // Cooper Black for editorial statements / brand anchors
  sans: "var(--font-sans)",       // Montserrat for UI, tables, and navigation
} as const;
