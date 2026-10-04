---
name: VibeMove Design System
description: Dark-mode editorial wellness and mood-adaptive fitness interface design system.
colors:
  primary: "#FF6347"
  primary-hover: "#E55338"
  accent-forest: "#2A4032"
  accent-forest-hover: "#23362A"
  background: "#121316"
  surface: "#1E2026"
  surface-elevated: "#252830"
  border: "#2B2E37"
  text-primary: "#F4F4F6"
  text-secondary: "#9094A0"
  text-on-primary: "#FFFFFF"
  text-on-accent: "#FFFFFF"
  success: "#34D399"
  warning: "#FBBF24"
  error: "#F87171"
typography:
  display-serif:
    fontFamily: "'Editorial New', 'Playfair Display', Georgia, serif"
    fontSize: "1.375rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  h2:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body-md:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label-sm:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
  stat-num:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.2
    fontVariantNumeric: "tabular-nums"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  3xl: "32px"
components:
  hero-banner:
    backgroundColor: "{colors.accent-forest}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xl}"
    textColor: "{colors.text-on-accent}"
  button-primary-pill:
    backgroundColor: "#FFFFFF"
    textColor: "#1C2B22"
    rounded: "{rounded.full}"
    padding: "12px 24px"
    fontWeight: 600
  category-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
    border: "1px solid {colors.border}"
  progress-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
    border: "1px solid {colors.border}"
  floating-dock:
    backgroundColor: "rgba(26, 28, 33, 0.88)"
    backdropFilter: "blur(16px)"
    rounded: "{rounded.full}"
    border: "1px solid {colors.border}"
    padding: "8px 16px"
---

## Overview
VibeMove merges the precision of modern biometric activity tracking with the mindful, qualitative experience of energy-based training. The interface rejects generic gym aesthetics and harsh neon accents in favor of a sophisticated dark canvas accented by calming forest tones and warm coral feedback. It creates an intimate, calm digital space encouraging users to tune in to their physical and emotional states.

## Colors
- **Primary (#FF6347):** Used exclusively for high-salience moments: the active state pill indicator in navigation, biometric progress ring gauges, and key metric alerts.
- **Accent Forest (#2A4032):** The signature thematic color dedicated to mood assessment containers and holistic workout recommendation cards.
- **Background (#121316):** An ultra-deep warm obsidian canvas that prevents the visual glare and eye strain associated with pure black (#000000) or high-contrast OLED black themes.
- **Surface (#1E2026):** Elevated container layer providing clear semantic separation for modular categories and daily progress metrics.
- **Borders (#2B2E37):** Minimal 1px hairlines used where visual grouping requires structure without high-contrast divides.

## Typography
- **Editorial Serif Pairing:** Feature banners utilize an expressive serif typeface with italicized keywords (e.g. *what*, *train*) to evoke editorial mindfulness and human warmth.
- **Geometric Sans Utility:** All interactive components, category tags, timestamps, and metric readouts rely on clean geometric sans-serif (Inter/SF Pro) for high legibility at glanceable sizes.
- **Tabular Figures:** Metric data values utilize `font-variant-numeric: tabular-nums` to ensure stability in live activity tracking.

## Spacing & Layout
- Strict 4px/8px modular spacing rhythm.
- Screen-edge margin: 16px on compact mobile viewports.
- Inter-component vertical gap: 24px between distinct functional blocks.
- Asymmetric vertical hierarchy: Section titles feature 24px spacing above and 12px spacing below to maintain immediate Gestalt grouping with their respective card groups.

## Shapes & Elevation
- **Radius Hierarchy:** Major thematic hero banners use 24px radius (`rounded.xl`). Sub-containers and metric cards use 16px radius (`rounded.lg`). Quick-action buttons and category chips use 8px - 12px, while persistent floating navigation bars and CTA buttons use full capsule pills (`rounded.full`).
- **Flat Tonal Elevation:** No heavy box-shadows. Depth is articulated purely through surface tint progression (#121316 -> #1E2026 -> #252830) and delicate translucent border strokes.

## Components
- **Mood Banner:** Houses custom micro-illustrations and the high-contrast white CTA button.
- **Progress Metrics:** Features compact 36px ring charts built with SVG circles, utilizing stroke-dasharray and stroke-dashoffset calculations.
- **Floating Tab Bar:** Pill-shaped dock elevated with `backdrop-filter: blur(16px)` to allow content to gracefully pass underneath during vertical scrolling.

## Rules to Never Break
- Never introduce pure pitch black (#000000) backgrounds or pure white (#FFFFFF) body copy.
- Never apply standard fuzzy drop-shadows on dark cards; maintain clean tonal surface elevation.
- Never substitute generic sans-serif for the mood question headline; the editorial serif italic styling is integral to the brand character.