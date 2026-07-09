# FocusFlow Design DNA

## Product Identity
FocusFlow is an adaptive workflow execution platform for neurodivergent users (ADHD, Autism, Dyslexia). Every screen answers: "What should I do right now?"

## Design Principles
- One dominant action per screen
- Calm information density — white space is functional
- Clear task states distinguishable without color alone
- WCAG AA minimum contrast
- No unnecessary charts, badges, or notifications
- Purposeful motion only, respect prefers-reduced-motion

## Typography
- Primary: Lexend
- Accessibility: OpenDyslexic (toggleable)
- Scale: 12/14/16/20/24/32/40px
- Body: Lexend 16px, line-height 1.6
- Headings: Lexend 24px screen titles, 20px section headers
- Task titles: Lexend 18px medium
- Labels: Lexend 14px muted

## Color Palette — Light Mode
- Background: #FAF9F7 (warm off-white)
- Surface cards: #FFFFFF, border #E8E6E1
- Primary text: #1A1A1A
- Secondary text: #6B6660
- Muted text: #9E988E
- Primary accent: #4F46E5 (indigo)
- Success: #059669 (emerald)
- Warning/blocked: #D97706 (amber)
- Active glow: #4F46E5 at 15% opacity
- Divider: #E8E6E1

## Task State Colors — Left Border Strips (3px)
- Ready (TODO): indigo #4F46E5
- Blocked: amber #D97706, muted title
- Active (IN_PROGRESS): indigo with glow shadow
- Completed: emerald #059669, slightly muted
- Postponed: amber #D97706, italicized

## Spacing
- Screen padding: 24px mobile, 32px desktop
- Card padding: 20px
- Card gap: 16px
- Section gap: 32px
- Element gap: 12px

## Surfaces
- Screen background: flat #FAF9F7
- Cards: rounded-xl (12px), border #E8E6E1
- Active task card: box-shadow 0 0 0 2px rgba(79,70,229,0.15)
- Hover: gentle scale 1.01

## Components
- Primary button: indigo fill #4F46E5, white text, rounded-lg
- Secondary button: outline indigo border
- Ghost button: text only
- Progress bars: indigo fill, 6px height, rounded
- Badges: small pills, muted colors

## Neuro-Inclusive Patterns
- Single focus target per view
- No auto-playing animations
- No notification badges
- Clear feedback after every action
- No time pressure UI (no countdowns)
- Predictable navigation
- Generous white space

## Motion
- Page transitions: fade in 200ms ease-out
- Cards: fade up + scale 300ms, staggered 50ms
- Status changes: subtle pulse
- Respect prefers-reduced-motion (disable all)