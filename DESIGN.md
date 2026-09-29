# Sochi Design System

## 1. Principles

- **Legibility first** — every text element meets WCAG AA (4.5:1) minimum; body and headings target AAA (7:1+).
- **Warm neutrals** — parchment-yellow backgrounds evoke physical noticeboards; nothing feels sterile.
- **Urgency clarity** — colour signals urgency, not decoration. One red thing means act now.
- **Density without clutter** — committee view shows many issues at once; resident view is a single focused form.

---

## 2. Colour Tokens

All tokens are CSS custom properties defined in `app/globals.css`. No hardcoded hex values appear in component files.

### 2.1 Light Mode (`:root`)

| Token | Value | Role |
|---|---|---|
| `--bg` | `#FEFAE0` | Page background |
| `--surface` | `#FFFFFF` | Cards, inputs, drawers |
| `--surface-2` | `#F4EFC8` | Hovered/active surfaces, table stripes |
| `--ink` | `#262624` | Primary text, icons, borders-strong |
| `--ink-inverse` | `#FEFAE0` | Text on filled-ink buttons |
| `--muted` | `#5E5A48` | Secondary text, meta, labels |
| `--border-token` | `#DAD3A6` | Default borders, dividers |
| `--border-strong` | `#262624` | Focus rings, emphasized borders |

**Contrast (WCAG, against `--bg` `#FEFAE0`):**
- `--ink` `#262624` → **14.3:1** (AAA ✓)
- `--muted` `#5E5A48` → **6.4:1** (AA ✓, near-AAA)

### 2.2 Dark Mode (`.dark`)

| Token | Value | Role |
|---|---|---|
| `--bg` | `#1C1C1A` | Page background |
| `--surface` | `#262624` | Cards, inputs, drawers |
| `--surface-2` | `#302F2C` | Hovered/active surfaces |
| `--ink` | `#FEFAE0` | Primary text, icons |
| `--ink-inverse` | `#1C1C1A` | Text on filled-ink buttons |
| `--muted` | `#B0AB98` | Secondary text, meta, labels |
| `--border-token` | `#3F3D38` | Default borders, dividers |
| `--border-strong` | `#FEFAE0` | Focus rings, emphasized borders |

**Contrast (WCAG, against `--bg` `#1C1C1A`):**
- `--ink` `#FEFAE0` → **17.0:1** (AAA ✓)
- `--muted` `#B0AB98` → **8.1:1** (AAA ✓)

---

## 3. Urgency & Status Tokens

These tokens are **unchanged** between palette updates. They use separate semantic colour families that are independently contrast-checked against their tint backgrounds.

### Light

| Token | Value | Tint | Use |
|---|---|---|---|
| `--critical` | `#d62f1f` | `#fbe3df` | Critical urgency |
| `--high` | `#b8600e` | `#f8e6d0` | High urgency |
| `--medium` | `#3d6c9e` | `#dfe9f3` | Medium urgency |
| `--low` | `#5e7659` | `#e4ebe1` | Low urgency / live indicator |
| `--resolved` | `#2f6b4f` | `#dcebe3` | Resolved status |
| `--review` | `#8a6a00` | — | AI-unsure flag |

### Dark

| Token | Value | Tint |
|---|---|---|
| `--critical` | `#ff5a48` | `#3a1712` |
| `--high` | `#f0a04b` | `#33230f` |
| `--medium` | `#7faedd` | `#152433` |
| `--low` | `#a2bc9b` | `#1d2a1b` |
| `--resolved` | `#5db88c` | `#14281f` |
| `--review` | `#e6c25c` | — |

---

## 4. Typography

| Role | Font | Weight | Size |
|---|---|---|---|
| Display / headings | Archivo (variable) | 900 | 28–52px |
| Body | Atkinson Hyperlegible | 400/700 | 15–18px |
| Devanagari | Noto Sans Devanagari | 400/700 | matches body |

Count numerals use Archivo 900 at 72px (row) / 96px (focus) with `font-stretch: 70%`.

---

## 5. Spacing & Radius

- Container: `max-w-[1200px]` with `px-4 md:px-8` — shared by header and all page content.
- Card radius: `12px`
- Button radius: `8px` (`rounded-lg`)
- Focus rings: `2px` solid `var(--border-strong)` with `2px` offset.

---

## 6. Motion

- Count-up animation: 600ms ease-in-out, fires once per session (`hasCountedRef`).
- Live indicator: CSS `animate-pulse` on the green dot.
- All transitions respect `prefers-reduced-motion: reduce` (global `0.01ms` override in globals.css).
