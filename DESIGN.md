# FocusFlow Design System — Japanese Paper & Sumi Ink (Wabi-Sabi Editorial)

## Product Identity
- **Product Name**: FocusFlow
- **Tagline**: One thing at a time.
- **Philosophy**: An adaptive, sensory-ergonomic workflow platform designed for neurodivergent minds (ADHD, Autism, Dyslexia). Tactile, grounded, high-legibility, and free from generic AI/SaaS visual cliches.

---

## 1. Color System (Japanese Paper & Sumi Ink)

### Light Mode ("Washi & Vermilion")
- **Canvas / Background**: `#F4F0EA` (Warm Washi Paper — eliminates glare & scotopic visual vibration)
- **Surfaces / Cards**: `#FAF8F5` (Crisp Warm Linen)
- **Surface Hover / Subtle**: `#EFEAE1` (Soft Sand)
- **Borders**: `#E2DDD5` (1px Fine Ink Line)
- **Text (Primary / Headline)**: `#18181B` (Deep Sumi Ink — 14.5:1 WCAG AAA)
- **Text (Secondary / Muted)**: `#71717A` (Charcoal Ink)
- **Text (Tertiary / Caption)**: `#A1A1AA` (Muted Ink)
- **Primary CTA / Focus Anchor**: `#D34E24` (Japanese Lacquer Vermilion — high salience without panic)
- **Primary Hover**: `#BA421D`

### Dark Mode ("Smoked Ink")
- **Canvas / Background**: `#121214` (Warm Smoked Basalt — non-blue, restful at night)
- **Surfaces / Cards**: `#1A1A1E` (Deep Charcoal Slate)
- **Surface Hover**: `#222228`
- **Borders**: `#27272A` (Basalt Line)
- **Text (Primary)**: `#EDEDEE` (Rice Bone White)
- **Text (Secondary)**: `#A1A1AA` (Ash)
- **Text (Tertiary)**: `#71717A` (Muted Ash)
- **Primary CTA / Focus Anchor**: `#E05D34` (Ember Vermilion)
- **Primary Hover**: `#F06E45`

### Semantic Functional State Signals
- **Ready / Active / Focus**: `#D34E24` (Lacquer Vermilion)
- **Completed / Micro-Win**: `#4A6B4E` (Wasabi / Matcha Green)
- **Blocked / Waiting on Dependency**: `#C27803` (Persimmon Amber)
- **Info / Dependency Line**: `#78716C` (Stone Gray)

### Support Mode Dynamic Tints
- **ADHD Mode**: Tactile Vermilion-Orange Focus (`#D34E24`) + Single-task visual focus
- **Autism Mode**: Structured Sky-Slate (`#2B6CB0`) + Explicit dependency badges & multi-day timeline
- **Dyslexia Mode**: High-contrast Amber (`#C27803`) + OpenDyslexic typography + Relaxed letter spacing

---

## 2. Typography

- **Primary Font**: `Lexend`, `Inter`, sans-serif (Engineered specifically for reading fluency)
- **Dyslexia Toggle**: `OpenDyslexic`, sans-serif (Weighted bottom anchors for dyslexic reading)
- **Scale**:
  - `Display / Hero`: `40px` (Weight 600, Line-height 1.15, Letter-spacing -0.02em)
  - `Page Title / H1`: `28px` (Weight 600, Line-height 1.2, Letter-spacing -0.01em)
  - `Card Header / H2`: `20px` (Weight 500, Line-height 1.3)
  - `Section Label / H3`: `14px` (Weight 600, Uppercase, Letter-spacing 0.05em, `#71717A`)
  - `Body Regular`: `14px` (Weight 400, Line-height 1.5)
  - `Small / Meta`: `12px` (Weight 500, Line-height 1.4)

---

## 3. Surface & Card Geometry

- **Border Radius**:
  - Cards & Containers: `rounded-2xl` (`16px`)
  - Buttons & Inputs: `rounded-xl` (`12px`)
  - Badges & Pills: `rounded-full` (`9999px`)
- **Borders**: Clean `1px solid var(--border)`
- **Task State Left Border**:
  - `3px solid var(--state-color)` on left edge of every task card.
- **Shadows**:
  - Flat/Minimal: `shadow-[0_1px_3px_rgba(0,0,0,0.04)]` (Light) / `shadow-[0_1px_3px_rgba(0,0,0,0.4)]` (Dark)
  - Active Task Glow: `shadow-[0_4px_16px_rgba(211,78,36,0.12)]`

---

## 4. Neuro-Inclusive Design Rules

1. **No Time Pressure UI**: No countdowns, no flashing countdown numbers, no anxiety triggers. All timers count UP progressively (`FocusTimer.tsx`).
2. **One Dominant Action Per Screen**: The "Next Best Action" is visually unmistakable.
3. **Calm Density**: Generous padding (`p-6` to `p-8`), clear breathing room.
4. **State Distinguishable Without Color Alone**: Every state pairs color with an explicit icon (Check, Lock, Play, Circle) and text label.