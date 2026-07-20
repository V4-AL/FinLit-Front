---
name: finlit
description: Duolingo-for-personal-finance — gamified daily lessons in a calm, credible shell
colors:
  background: "#F9FAFB"
  surface: "#FFFFFF"
  border: "#E5E7EB"
  ink: "#111827"
  ink-secondary: "#6B7280"
  ink-muted: "#9CA3AF"
  growth-emerald: "#10B981"
  growth-emerald-light: "#D1FAE5"
  growth-emerald-dark: "#047857"
  streak-amber-bg: "#FEF3C7"
  streak-amber-border: "#FDE68A"
  xp-mint-bg: "#ECFDF5"
  xp-mint-border: "#A7F3D0"
  danger-bg: "#FEF2F2"
  danger-border: "#FECACA"
  danger-text: "#DC2626"
  quiz-select-blue: "#3B82F6"
  quiz-select-blue-bg: "#EFF6FF"
typography:
  display:
    fontFamily: "System (SF Pro on iOS, Roboto on Android)"
    fontSize: "32px"
    fontWeight: 800
    lineHeight: "38px"
    letterSpacing: "0.5px"
  headline:
    fontFamily: "System (SF Pro on iOS, Roboto on Android)"
    fontSize: "24px"
    fontWeight: 800
    lineHeight: "30px"
    letterSpacing: "normal"
  title:
    fontFamily: "System (SF Pro on iOS, Roboto on Android)"
    fontSize: "18px"
    fontWeight: 800
    lineHeight: "24px"
    letterSpacing: "normal"
  body:
    fontFamily: "System (SF Pro on iOS, Roboto on Android)"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: "22px"
    letterSpacing: "normal"
  label:
    fontFamily: "System (SF Pro on iOS, Roboto on Android)"
    fontSize: "12px"
    fontWeight: 800
    lineHeight: "16px"
    letterSpacing: "1px"
rounded:
  sm: "14px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  full: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.growth-emerald}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    height: "52px"
    padding: "0 24px"
  button-primary-disabled:
    backgroundColor: "{colors.border}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.md}"
    height: "52px"
  card-surface:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "24px"
  badge-pill:
    backgroundColor: "{colors.xp-mint-bg}"
    textColor: "{colors.growth-emerald-dark}"
    rounded: "{rounded.full}"
    padding: "8px 12px"
  input-field:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    height: "52px"
    padding: "0 16px"
---

# Design System: finlit

## 1. Overview

**Creative North Star: "The Trusted Playground"**

finlit's whole visual system sits on a deliberate tension: the mechanics are pure playground — streaks, XP, levels, a lesson that ends in a trophy emoji and a spring-animated badge — but the shell around them is calm, bordered, and quiet. Nothing about the surface shouts. Cards are flat with a hairline border rather than a shadow; type leans heavy (700-800 weight) for confidence rather than loud for attention; the one saturated color in the whole system is a single emerald green that means "growth" everywhere it appears. That restraint is what lets the game-like parts read as credible instead of gimmicky — this is still an app about someone's money.

This system explicitly rejects the stuffy-bank-app look (no navy-and-gold, no dense tables, no cold institutional distance) and the generic-AI-dashboard look (no cream/gray card grids, no decorative gradients). Warmth comes from color use, rounded shapes, and copy tone — not from a tinted neutral background pretending to be "friendly."

**Key Characteristics:**
- Flat surfaces, hairline borders — depth is a border and a background shift, not a shadow.
- One accent, many jobs: Growth Emerald marks progress, success, active state, and the one primary action per screen.
- Heavy type weight (700-800) does the hierarchy work; size varies less than weight does.
- Generous, consistent roundness (14-24px on containers, full-round on pills/avatars) — nothing sharp-cornered.
- Emoji as illustration. There is no icon library in use; emoji carry all iconography and decorative imagery.

## 2. Colors

The palette is a cool near-white neutral base with a single warm-growth accent; two supporting tints (amber for streaks, blue for quiz selection) exist only to mark a specific state, never as decoration.

### Primary
- **Growth Emerald** (`#10B981`): The one accent color in the system. Primary buttons, active tab, active progress fill, links/highlighted text, the "continue learning" CTA card. In dark mode the swatch shifts to `#6EE7B7` for text-on-dark contexts while the button/fill green itself stays `#10B981`.

### Neutral
- **Cloud Background** (`#F9FAFB` light / `#0F172A` dark): App background, the canvas everything else sits on.
- **Surface White** (`#FFFFFF` light / `#1E293B` dark): Cards, the auth form, the profile card, the bottom tab bar.
- **Hairline Border** (`#E5E7EB` light / `#334155` dark): Every card, input, and row border. Also the "locked" and "track-off" state color.
- **Ink** (`#111827` light / `#F1F5F9` dark): Primary text — names, titles, values.
- **Ink Secondary** (`#6B7280` light / `#94A3B8` dark): Supporting text — descriptions, meta lines, subtitles.
- **Ink Muted** (`#9CA3AF` light / `#64748B` dark): Placeholder text, locked/disabled labels, the least important text on a screen.

### Named Rules
**The One Accent Rule.** Growth Emerald is the only saturated color allowed to represent a positive/active state. Don't introduce a second "brand" color; every other hue in the system exists to mark one specific, narrow state (streak = amber, danger = red, quiz-selected = blue) and appears nowhere else.

### State colors (supporting, narrow-purpose only)
- **Streak Amber** (bg `#FEF3C7`, border `#FDE68A`): Exists only inside the streak badge (🔥 count). Never used for anything else.
- **XP Mint** (bg `#ECFDF5`, border `#A7F3D0`, text `#047857`): Exists only inside XP/level badges and pills.
- **Danger Red** (bg `#FEF2F2`, border `#FECACA`, text `#DC2626`): Form errors and the sign-out action only.
- **Quiz Select Blue** (`#3B82F6`, bg `#EFF6FF`): Marks a tapped-but-unchecked quiz option. Distinct from the emerald "correct" state and the red "wrong" state so a learner can always tell selection apart from feedback.

## 3. Typography

**Display/Body Font:** System default — SF Pro on iOS, Roboto on Android. No custom font is loaded anywhere in the app.

**Character:** Crisp and confident. There's no serif, no script, no display face — hierarchy is built entirely from weight (500 → 800) and a fairly narrow size range (12px → 32px), which keeps every screen feeling like the same tool rather than a stack of different type systems.

### Hierarchy
- **Display** (800, 32px, 38px line-height): The "finlit" wordmark on the splash screen only.
- **Headline** (800, 24-28px, 30-36px line-height): Screen-level titles — "Welcome Back," "Learning Modules," "Settings," the dashboard username line.
- **Title** (800, 18-20px, 24-28px line-height): Card-level titles — module title, quiz question, "Level N."
- **Body** (500-600, 14-16px, 18-22px line-height): Descriptions, lesson paragraph text, form labels, buttons (buttons run 700 weight at 15-16px).
- **Label** (800, 11-13px, uppercase, 0.5-1.5px tracking): Module numbers ("MODULE 1"), the quiz tag ("QUIZ CHALLENGE"), section headers in Settings ("APPEARANCE"), form field labels.

### Named Rules
**The Weight-Over-Size Rule.** When something needs to feel more important, make it heavier (600 → 700 → 800), not bigger. The type scale only spans 12-32px across the entire app; 800-weight at 15px (a button) reads as confident, not small.

## 4. Elevation

**Grounded & Flat.** Depth is conveyed with a background-color shift and a 1-1.5px border, not a shadow — cards, rows, buttons, and the tab bar are all flat at rest (the tab bar explicitly zeroes out its native shadow/elevation). Shadow is reserved for exactly two deliberate, narrow uses: an ambient brand glow behind the splash-screen logo, and a small physical shadow on the Settings dark-mode toggle's thumb, because that one control is meant to feel like a real physical switch.

### Shadow Vocabulary
- **Ambient Brand Glow** (`shadowColor: '#10B981', shadowOffset: {0, 8}, shadowOpacity: 0.15, shadowRadius: 15, elevation: 4`): Splash screen logo only. Signals "alive" during the loading pulse.
- **Toggle Thumb Lift** (`shadowColor: '#000', shadowOffset: {0, 1}, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2`): The physical nub inside the dark-mode toggle switch only.

### Named Rules
**The Flat-By-Default Rule.** If you're reaching for a shadow anywhere other than the two listed above, use a border and a surface-color shift instead. Shadow in this system means "this is a physical toggle" or "this is the brand mark," not "this is elevated content."

## 5. Components

### Buttons
- **Shape:** 16px radius (`rounded.md`), 52-56px height, full-width in forms and finish screens.
- **Primary:** Growth Emerald background, white 700-weight text, centered. Used for exactly one primary action per screen (sign in/up, continue lesson, continue onboarding).
- **Disabled:** Background drops to Hairline Border gray, text drops to Ink Muted — no opacity trick, an explicit color swap.
- **Quiz options (secondary/interactive variant):** 2px border (not the standard 1-1.5px), 16px radius, white/surface background at rest; state colors (blue = selected, emerald = correct, red = wrong) swap both border and background together, never one without the other.

### Badges / Pills
- **Style:** Colored background + matching-hue border (never a border alone), fully rounded (`rounded.full`), bold small text (11-13px, 700-800 weight).
- **Variants:** Streak (amber), XP/Level (mint), each scoped to its one context per the Named Rule in Colors.

### Cards / Containers
- **Corner Style:** 20px for list-style headers (module header, options list), 24px for hero/primary cards (dashboard progress card, CTA card, auth card, profile card).
- **Background:** Surface White; CTA cards use Growth Emerald as background with white text instead.
- **Shadow Strategy:** None — see Elevation. Depth comes from the Surface/Background color contrast plus the 1px Hairline Border.
- **Border:** 1-1.5px Hairline Border on all surface cards; CTA/accent cards omit the border since the color itself provides contrast.
- **Internal Padding:** 20-24px.

### Inputs / Fields
- **Style:** 1.5px Hairline Border, `background` fill (Background gray, not pure white — a subtle recessed feel), 14px radius, 52px height, uppercase tracked label sitting above the field rather than inside it as a placeholder-only pattern.
- **Focus:** No distinct focus treatment currently implemented — placeholder text uses Ink Muted at standard opacity.
- **Error:** A single centered Danger Red text line above the form; individual fields do not currently re-color on error.

### Navigation
- **Bottom tab bar:** Surface White (dark: Surface Slate), 1px top border, zero shadow/elevation, 56px height. Active tab tinted Growth Emerald, inactive tinted Ink Muted. Icons are emoji, not an icon font. Labels are 12px/600-weight.
- **Stack headers:** Hidden throughout (`headerShown: false`) — every screen builds its own custom header row instead of using the native nav bar.

### Progress Bars (signature component)
Used on the dashboard (level progress), modules list (per-module progress), and lesson screen (slide progress). Always the same shape: a Hairline Border-colored track, fully rounded ends, Growth Emerald fill that animates via width percentage. This is the single most-repeated component in the app and the clearest visual expression of "you are making progress."

## 6. Do's and Don'ts

### Do:
- **Do** use Growth Emerald (`#10B981`) as the only accent carrying meaning — progress, success, active state, primary action.
- **Do** build hierarchy with font-weight (500→800) before reaching for a bigger size.
- **Do** keep cards and rows flat with a 1-1.5px Hairline Border; reserve shadow for the two named exceptions (splash glow, toggle thumb).
- **Do** pair every state color with both a background tint and a matching border — never a bare-border accent.
- **Do** keep every screen consuming `useTheme()` tokens so light/dark mode stays correct app-wide.

### Don't:
- **Don't** design anything that reads as "a stuffy corporate bank app" — no navy-and-gold, no dense data tables, no cold institutional distance. This is a named anti-reference from PRODUCT.md.
- **Don't** add a second saturated "brand" accent alongside Growth Emerald — every other hue in this system is scoped to one narrow state and nothing else.
- **Don't** use `border-left`/`border-right` as a colored accent stripe anywhere.
- **Don't** hardcode hex colors in a screen file — every screen (including LessonScreen, migrated to theme tokens) pulls color from `useTheme().colors` so dark mode stays correct everywhere.
- **Don't** add drop shadows to cards or buttons "for depth" — flat + border is the system's answer to depth, not shadow.
