# Card Flip + Realism Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the invitation card render like a real Magic: The Gathering card — an overhauled, textured front that flips on click to reveal an authentic "Deckmaster" card back.

**Architecture:** Split the monolithic `MtgCard` into a client-side 3D-flip container that composes a refined `CardFront` and a static authentic `CardBack`. Mana pips and color-contrast logic become small shared modules. All new art (cake, card back, mana symbols, textures) is authored as crisp inline/asset SVG — no binary PNGs.

**Tech Stack:** Next.js 16.2.9 (App Router), React 19, TypeScript, Tailwind v4, Jest + React Testing Library. Card interactivity uses `'use client'` + `useState` (same pattern as `src/components/RsvpForm.tsx`).

**Before you start — repo rule:** `AGENTS.md` requires reading the relevant Next.js guide before writing code. The only new framework concept here is the client boundary: skim `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md`. Key point already verified: props crossing into a client component must be serializable — `guild`/`config`/`guestName` are plain objects/strings, so this is satisfied.

**Conventions:**
- Run a single test file with `npx jest <path>`; run everything with `npm test`.
- Lint with `npm run lint`. Production check with `npm run build`.
- Commit after every green task. End commit messages with the `Co-Authored-By` trailer used in this repo.
- All UI text is Spanish (matches the existing card).

---

## File Structure

| File | Responsibility | New/Modified |
|------|----------------|--------------|
| `src/lib/contrast.ts` | `hexLuminance` + `readableOn` (extracted from MtgCard; used by ManaSymbol & CardFront) | New |
| `src/lib/mana.ts` | Color code → `{ code, label, pipColor, inkColor }` for the 5 MTG colors | New |
| `src/components/ManaSymbol.tsx` | One vector mana pip (sun/drop/skull/flame/tree) with `aria-label` | New |
| `src/components/CardBack.tsx` | Authentic Magic back as inline SVG (logo, color wheel, Deckmaster) | New |
| `src/components/CardFront.tsx` | Overhauled front face (refined frame, real pips, textures) | New |
| `src/components/MtgCard.tsx` | Client 3D-flip container composing the two faces | Modified (rewritten) |
| `public/images/cake-art.svg` | Custom layered birthday-cake default art | New |
| `config/party.json` | `card.artImageUrl` → `/images/cake-art.svg` | Modified |
| `src/app/globals.css` | Flip utility classes + reduced-motion + texture filter | Modified |
| `__tests__/components/ManaSymbol.test.tsx` | Pip render + aria-label | New |
| `__tests__/components/CardBack.test.tsx` | Logo + Deckmaster + 5 pips | New |
| `__tests__/components/CardFront.test.tsx` | Front content + mana pips | New |
| `__tests__/components/MtgCard.test.tsx` | Existing content asserts + flip interaction | Modified |
| `__tests__/lib/contrast.test.ts` | Luminance/readable-ink | New |
| `__tests__/lib/mana.test.ts` | Color map | New |

Unchanged: `src/lib/colors.ts`, `src/lib/config.ts`, `src/app/page.tsx`, `src/app/invite/page.tsx` (they consume `MtgCard` exactly as before), RSVP/maps.

---

## Task 1: Extract color-contrast helpers

**Files:**
- Create: `src/lib/contrast.ts`
- Test: `__tests__/lib/contrast.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// __tests__/lib/contrast.test.ts
import { hexLuminance, readableOn } from '@/lib/contrast'

describe('contrast', () => {
  it('computes luminance of pure white as ~1 and black as 0', () => {
    expect(hexLuminance('#ffffff')).toBeCloseTo(1, 2)
    expect(hexLuminance('#000000')).toBe(0)
  })

  it('returns 0 for malformed hex', () => {
    expect(hexLuminance('#abc')).toBe(0)
  })

  it('picks dark ink on light backgrounds and light parchment on dark', () => {
    expect(readableOn('#f4ecd8')).toBe('#15110a')
    expect(readableOn('#0a0a0a')).toBe('#f4ecd8')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/lib/contrast.test.ts`
Expected: FAIL — `Cannot find module '@/lib/contrast'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/contrast.ts

/** Relative luminance of a #rrggbb colour (0 = black, 1 = white). */
export function hexLuminance(hex: string): number {
  const c = hex.replace('#', '')
  if (c.length !== 6) return 0
  const r = parseInt(c.slice(0, 2), 16) / 255
  const g = parseInt(c.slice(2, 4), 16) / 255
  const b = parseInt(c.slice(4, 6), 16) / 255
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Pick dark ink or light parchment text so it stays legible on any background. */
export function readableOn(hex: string): string {
  return hexLuminance(hex) > 0.55 ? '#15110a' : '#f4ecd8'
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/lib/contrast.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/contrast.ts __tests__/lib/contrast.test.ts
git commit -m "$(printf 'refactor: extract color-contrast helpers into src/lib/contrast\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

## Task 2: Mana color map

**Files:**
- Create: `src/lib/mana.ts`
- Test: `__tests__/lib/mana.test.ts`

Provides canonical Magic mana colors and human labels per color code. `ManaSymbol` consumes this; the glyph shape is chosen by `code` inside the component.

- [ ] **Step 1: Write the failing test**

```ts
// __tests__/lib/mana.test.ts
import { MANA, manaInfo } from '@/lib/mana'

describe('mana', () => {
  it('defines all five MTG colors', () => {
    expect(Object.keys(MANA).sort()).toEqual(['b', 'g', 'r', 'u', 'w'])
  })

  it('returns a Spanish label and a pip color for a code', () => {
    const u = manaInfo('u')
    expect(u.label).toMatch(/azul/i)
    expect(u.pipColor).toMatch(/^#[0-9a-fA-F]{6}$/)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/lib/mana.test.ts`
Expected: FAIL — `Cannot find module '@/lib/mana'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/mana.ts
import type { ColorCode } from '@/lib/colors'

export interface ManaInfo {
  code: ColorCode
  /** Spanish accessibility label, e.g. "maná azul". */
  label: string
  /** Canonical Magic pip background colour. */
  pipColor: string
}

export const MANA: Record<ColorCode, ManaInfo> = {
  w: { code: 'w', label: 'maná blanco', pipColor: '#FBF7E6' },
  u: { code: 'u', label: 'maná azul', pipColor: '#AAE0FA' },
  b: { code: 'b', label: 'maná negro', pipColor: '#CCC2C0' },
  r: { code: 'r', label: 'maná rojo', pipColor: '#F9AA8F' },
  g: { code: 'g', label: 'maná verde', pipColor: '#9BD3AE' },
}

export function manaInfo(code: ColorCode): ManaInfo {
  return MANA[code]
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/lib/mana.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/mana.ts __tests__/lib/mana.test.ts
git commit -m "$(printf 'feat: add canonical mana color map\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

## Task 3: ManaSymbol component (vector pips)

**Files:**
- Create: `src/components/ManaSymbol.tsx`
- Test: `__tests__/components/ManaSymbol.test.tsx`

Renders a circular pip in the canonical mana color with a recognizable vector glyph (W=sun, U=droplet, B=skull, R=flame, G=tree) inked with `readableOn(pipColor)`. The pip exposes an `aria-label` from `manaInfo`.

- [ ] **Step 1: Write the failing test**

```tsx
// __tests__/components/ManaSymbol.test.tsx
import { render, screen } from '@testing-library/react'
import { ManaSymbol } from '@/components/ManaSymbol'

describe('ManaSymbol', () => {
  it('labels the pip by its mana color', () => {
    render(<ManaSymbol code="u" />)
    expect(screen.getByLabelText(/maná azul/i)).toBeInTheDocument()
  })

  it('renders an svg glyph', () => {
    const { container } = render(<ManaSymbol code="g" />)
    expect(container.querySelector('svg')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/components/ManaSymbol.test.tsx`
Expected: FAIL — `Cannot find module '@/components/ManaSymbol'`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/components/ManaSymbol.tsx
import type { ColorCode } from '@/lib/colors'
import { manaInfo } from '@/lib/mana'
import { readableOn } from '@/lib/contrast'

interface ManaSymbolProps {
  code: ColorCode
  size?: number
}

/** Simplified but recognizable vector glyphs, drawn in a 24×24 viewBox. */
const GLYPHS: Record<ColorCode, React.ReactNode> = {
  // Sun
  w: (
    <g>
      <circle cx="12" cy="12" r="4.2" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
        <rect
          key={a}
          x="11.2"
          y="1.6"
          width="1.6"
          height="3.6"
          rx="0.8"
          transform={`rotate(${a} 12 12)`}
        />
      ))}
    </g>
  ),
  // Water droplet
  u: <path d="M12 3 C12 3 5 11 5 15 a7 7 0 0 0 14 0 C19 11 12 3 12 3 Z" />,
  // Skull
  b: (
    <g>
      <path d="M12 3 C7 3 4 6.5 4 11 c0 2.4 1.2 3.9 2.6 4.8 V18 a1 1 0 0 0 1 1 h8.8 a1 1 0 0 0 1-1 v-2.2 C18.8 14.9 20 13.4 20 11 C20 6.5 17 3 12 3 Z" />
      <circle cx="9" cy="11" r="1.7" fill="#fff" />
      <circle cx="15" cy="11" r="1.7" fill="#fff" />
      <path d="M11 15 l1-2 1 2 z" fill="#fff" />
    </g>
  ),
  // Flame
  r: <path d="M12 2 C13.5 6 17.5 7.5 16 13 a4.2 4.2 0 0 1-8.2 0 C6.8 9.6 9.5 7.5 10 4.5 C10.7 6 11.6 6.5 12 7.5 C12.4 6 12.3 4 12 2 Z" />,
  // Pine tree
  g: (
    <g>
      <path d="M12 2 L16 9 H8 Z" />
      <path d="M12 7 L17 15 H7 Z" />
      <rect x="10.6" y="15" width="2.8" height="5" rx="0.6" />
    </g>
  ),
}

export function ManaSymbol({ code, size = 19 }: ManaSymbolProps) {
  const { label, pipColor } = manaInfo(code)
  const ink = readableOn(pipColor)
  return (
    <span
      role="img"
      aria-label={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '9999px',
        background: `radial-gradient(circle at 34% 28%, rgba(255,255,255,0.75), transparent 55%), ${pipColor}`,
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.45), 0 1px 2px rgba(0,0,0,0.5)',
      }}
    >
      <svg
        width={size * 0.66}
        height={size * 0.66}
        viewBox="0 0 24 24"
        fill={ink}
        aria-hidden="true"
      >
        {GLYPHS[code]}
      </svg>
    </span>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/components/ManaSymbol.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/ManaSymbol.tsx __tests__/components/ManaSymbol.test.tsx
git commit -m "$(printf 'feat: add vector ManaSymbol pips\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

## Task 4: Authentic CardBack

**Files:**
- Create: `src/components/CardBack.tsx`
- Test: `__tests__/components/CardBack.test.tsx`

Inline SVG recreating the real back: dark-brown tome field, ornate border with four red rivets, lighter-brown oval, blue "Magic: The Gathering" wordmark, five-color mana wheel (reusing `ManaSymbol`), and "Deckmaster" at the bottom. Sized to fill its parent (`width/height: 100%`).

- [ ] **Step 1: Write the failing test**

```tsx
// __tests__/components/CardBack.test.tsx
import { render, screen } from '@testing-library/react'
import { CardBack } from '@/components/CardBack'

describe('CardBack', () => {
  it('shows the Magic wordmark', () => {
    render(<CardBack />)
    expect(screen.getByText(/Magic: The Gathering/i)).toBeInTheDocument()
  })

  it('shows the Deckmaster brand', () => {
    render(<CardBack />)
    expect(screen.getByText(/Deckmaster/i)).toBeInTheDocument()
  })

  it('renders all five mana colors in the wheel', () => {
    render(<CardBack />)
    expect(screen.getByLabelText(/maná blanco/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/maná azul/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/maná negro/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/maná rojo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/maná verde/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/components/CardBack.test.tsx`
Expected: FAIL — `Cannot find module '@/components/CardBack'`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/components/CardBack.tsx
import type { ColorCode } from '@/lib/colors'
import { ManaSymbol } from '@/components/ManaSymbol'

const WHEEL: ColorCode[] = ['w', 'u', 'b', 'r', 'g']

/** Authentic Magic: The Gathering card back (tome, oval, logo, color wheel, Deckmaster). */
export function CardBack() {
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-[14px] font-[family-name:var(--font-cinzel)]"
      style={{
        background: 'linear-gradient(160deg,#5b3415 0%,#3a1f0c 55%,#27150a 100%)',
        boxShadow: 'inset 0 0 0 6px #1c0f06, inset 0 0 60px rgba(0,0,0,0.6)',
      }}
    >
      {/* Ornate inner border */}
      <div
        className="absolute inset-[10px] rounded-[9px]"
        style={{
          border: '2px solid #c79a4b',
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.5), 0 0 12px rgba(199,154,75,0.25)',
        }}
      />
      {/* Four red rivets */}
      {[
        { top: 16, left: 16 },
        { top: 16, right: 16 },
        { bottom: 16, left: 16 },
        { bottom: 16, right: 16 },
      ].map((pos, i) => (
        <span
          key={i}
          className="absolute h-3 w-3 rounded-full"
          style={{
            ...pos,
            background: 'radial-gradient(circle at 35% 30%, #ff6a4d, #8b1a0a 70%)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.7)',
          }}
        />
      ))}

      {/* Central oval */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="flex h-[78%] w-[74%] flex-col items-center justify-between rounded-[50%] px-6 py-10 text-center"
          style={{
            background:
              'radial-gradient(circle at 50% 35%, #7a4a22 0%, #5d3417 60%, #43250f 100%)',
            boxShadow:
              'inset 0 0 0 2px rgba(0,0,0,0.45), inset 0 0 26px rgba(0,0,0,0.55), 0 0 18px rgba(0,0,0,0.4)',
          }}
        >
          {/* Logo */}
          <div className="mt-2">
            <p
              className="text-[15px] font-semibold italic leading-none tracking-wide"
              style={{ color: '#9ec9ef', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
            >
              Magic:
            </p>
            <p
              className="text-[20px] font-bold italic leading-tight tracking-wide"
              style={{ color: '#6fa9e0', textShadow: '0 2px 3px rgba(0,0,0,0.85)' }}
            >
              The&nbsp;Gathering
            </p>
          </div>

          {/* Color wheel */}
          <div className="flex gap-1.5">
            {WHEEL.map(code => (
              <ManaSymbol key={code} code={code} size={20} />
            ))}
          </div>

          {/* Deckmaster */}
          <p
            className="mb-2 text-[12px] font-semibold uppercase tracking-[0.3em]"
            style={{ color: '#e7d3a6', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
          >
            Deckmaster
          </p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/components/CardBack.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/CardBack.tsx __tests__/components/CardBack.test.tsx
git commit -m "$(printf 'feat: add authentic Magic card back\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

## Task 5: Custom cake art + config wiring

**Files:**
- Create: `public/images/cake-art.svg`
- Modify: `config/party.json`
- Modify: `__tests__/lib/config.test.ts` (add one assertion)

- [ ] **Step 1: Create the cake illustration**

```svg
<!-- public/images/cake-art.svg -->
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2a1b3d"/>
      <stop offset="100%" stop-color="#160d24"/>
    </linearGradient>
    <linearGradient id="frosting" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff4f7"/>
      <stop offset="100%" stop-color="#f3c9d8"/>
    </linearGradient>
    <linearGradient id="sponge" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#a9623a"/>
      <stop offset="100%" stop-color="#7c4426"/>
    </linearGradient>
    <radialGradient id="flame" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#fff6c0"/>
      <stop offset="55%" stop-color="#ffb036"/>
      <stop offset="100%" stop-color="#ff6a1a"/>
    </radialGradient>
  </defs>

  <rect width="400" height="300" fill="url(#sky)"/>

  <!-- sparkles -->
  <g fill="#f4d98b" opacity="0.7">
    <circle cx="60" cy="50" r="2"/><circle cx="330" cy="40" r="2.4"/>
    <circle cx="120" cy="30" r="1.6"/><circle cx="280" cy="70" r="1.8"/>
    <circle cx="40" cy="120" r="1.6"/><circle cx="360" cy="120" r="2"/>
  </g>

  <!-- plate -->
  <ellipse cx="200" cy="252" rx="140" ry="20" fill="#241634"/>
  <ellipse cx="200" cy="248" rx="128" ry="16" fill="#3a2750"/>

  <!-- bottom tier -->
  <rect x="92" y="170" width="216" height="78" rx="10" fill="url(#sponge)"/>
  <path d="M92 182 q27-18 54 0 t54 0 t54 0 t54 0 v-12 H92 Z" fill="url(#frosting)"/>
  <!-- top tier -->
  <rect x="126" y="120" width="148" height="56" rx="9" fill="url(#sponge)"/>
  <path d="M126 132 q24.7-16 49.3 0 t49.3 0 t49.4 0 v-12 H126 Z" fill="url(#frosting)"/>

  <!-- candles -->
  <g>
    <rect x="168" y="86" width="9" height="34" rx="2" fill="#e96a9a"/>
    <rect x="173" y="86" width="4" height="34" fill="#ffd1e1" opacity="0.5"/>
    <rect x="196" y="80" width="9" height="40" rx="2" fill="#6aa9e9"/>
    <rect x="201" y="80" width="4" height="40" fill="#cfe4ff" opacity="0.5"/>
    <rect x="224" y="86" width="9" height="34" rx="2" fill="#8ad08f"/>
    <rect x="229" y="86" width="4" height="34" fill="#d6f0d8" opacity="0.5"/>
  </g>
  <!-- flames -->
  <g>
    <path d="M172.5 86 c5-6 5-12 0-18 c-5 6-5 12 0 18 Z" fill="url(#flame)"/>
    <path d="M200.5 80 c5.5-6.5 5.5-13 0-20 c-5.5 6.5-5.5 13 0 20 Z" fill="url(#flame)"/>
    <path d="M228.5 86 c5-6 5-12 0-18 c-5 6-5 12 0 18 Z" fill="url(#flame)"/>
  </g>

  <!-- sprinkles -->
  <g stroke-width="3" stroke-linecap="round">
    <line x1="150" y1="150" x2="156" y2="146" stroke="#ffd23f"/>
    <line x1="220" y1="152" x2="226" y2="148" stroke="#5ad2c0"/>
    <line x1="185" y1="205" x2="191" y2="201" stroke="#ff7aa8"/>
    <line x1="250" y1="208" x2="256" y2="204" stroke="#7aa8ff"/>
    <line x1="128" y1="210" x2="134" y2="206" stroke="#b58aff"/>
  </g>
</svg>
```

- [ ] **Step 2: Point config at the cake art**

In `config/party.json`, change the `card.artImageUrl` value from `/images/card-art.svg` to `/images/cake-art.svg`:

```json
  "card": {
    "artImageUrl": "/images/cake-art.svg",
    "setSymbol": "🎂"
  }
```

- [ ] **Step 3: Add a config assertion**

Open `__tests__/lib/config.test.ts` and add this test inside the existing top-level `describe` (place it after the last existing `it(...)` block, before the closing `})`):

```ts
  it('defaults the card art to the cake illustration', () => {
    expect(getPartyConfig().card.artImageUrl).toBe('/images/cake-art.svg')
  })
```

If `getPartyConfig` is not already imported at the top of that file, add `import { getPartyConfig } from '@/lib/config'`.

- [ ] **Step 4: Run the config test**

Run: `npx jest __tests__/lib/config.test.ts`
Expected: PASS (including the new assertion).

- [ ] **Step 5: Commit**

```bash
git add public/images/cake-art.svg config/party.json __tests__/lib/config.test.ts
git commit -m "$(printf 'feat: add custom cake card art and make it the default\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

## Task 6: CardFront (overhauled front face)

**Files:**
- Create: `src/components/CardFront.tsx`
- Test: `__tests__/components/CardFront.test.tsx`

Moves the current front content out of `MtgCard`, refines the frame, and swaps the letter-pips for `ManaSymbol`. Fills its parent (`absolute inset-0`); the fixed card size is owned by `MtgCard` (Task 8). Keeps all existing text so content tests stay green.

- [ ] **Step 1: Write the failing test**

```tsx
// __tests__/components/CardFront.test.tsx
import { render, screen } from '@testing-library/react'
import { CardFront } from '@/components/CardFront'
import { GUILDS } from '@/lib/colors'
import type { PartyConfig } from '@/lib/config'

const config: PartyConfig = {
  birthday: { name: 'Brayan', age: 28, flavorText: 'Texto de ambientación.' },
  party: { date: 'Sábado 1', time: '19:00', venue: 'El Lugar', address: 'Calle 123', mapsEmbedUrl: 'https://maps.test' },
  card: { artImageUrl: '/images/cake-art.svg', setSymbol: '🎂' },
}

describe('CardFront', () => {
  it('renders name, type line, details, flavor and P/T', () => {
    render(<CardFront guild={GUILDS.ub} config={config} />)
    expect(screen.getAllByText(/Brayan/).length).toBeGreaterThan(0)
    expect(screen.getByText(/Conjuro Legendario/)).toBeInTheDocument()
    expect(screen.getByText(/El Lugar/)).toBeInTheDocument()
    expect(screen.getByText(/Texto de ambientación/)).toBeInTheDocument()
    expect(screen.getByText('28/∞')).toBeInTheDocument()
  })

  it('renders the guild mana pips as vector symbols', () => {
    render(<CardFront guild={GUILDS.ub} config={config} />)
    // Dimir = U + B
    expect(screen.getByLabelText(/maná azul/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/maná negro/i)).toBeInTheDocument()
  })

  it('renders the guest line when provided', () => {
    render(<CardFront guild={GUILDS.ub} config={config} guestName="Alice" />)
    expect(screen.getByText(/Alice/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/components/CardFront.test.tsx`
Expected: FAIL — `Cannot find module '@/components/CardFront'`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/components/CardFront.tsx
import type { Guild } from '@/lib/colors'
import type { PartyConfig } from '@/lib/config'
import { ManaSymbol } from '@/components/ManaSymbol'
import { readableOn } from '@/lib/contrast'

interface CardFrontProps {
  guild: Guild
  config: PartyConfig
  guestName?: string
}

const BEVEL =
  'inset 0 0 0 1px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.4), inset 0 -1px 1px rgba(0,0,0,0.25)'

// Faint parchment grain, encoded so it needs no binary asset.
const PARCHMENT_NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")"

export function CardFront({ guild, config, guestName }: CardFrontProps) {
  const { birthday, party, card } = config
  const barInk = readableOn(guild.nameBarColor)

  return (
    <div
      className="absolute inset-0 flex flex-col rounded-[14px] p-[7px] select-none"
      style={{ background: 'linear-gradient(155deg, #2c2c2c 0%, #0a0a0a 60%, #000 100%)' }}
    >
      {/* Coloured frame */}
      <div
        className="flex flex-1 flex-col gap-1.5 rounded-[9px] p-2"
        style={{
          background: guild.frameGradient,
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.4), inset 0 1px 3px rgba(255,255,255,0.25)',
        }}
      >
        {/* Name bar */}
        <div
          className="flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5"
          style={{ background: guild.nameBarColor, boxShadow: BEVEL }}
        >
          <span
            className="font-[family-name:var(--font-cinzel)] text-[12px] font-semibold leading-tight"
            style={{ color: barInk }}
          >
            Celebración del {birthday.age}° Cumpleaños de {birthday.name}
          </span>
          <div className="flex shrink-0 gap-1">
            {guild.colors.map(code => (
              <ManaSymbol key={code} code={code} />
            ))}
          </div>
        </div>

        {/* Art box */}
        <div
          className="rounded-md p-[3px]"
          style={{ background: 'linear-gradient(180deg,#1c1c1c,#000)' }}
        >
          <div
            className="w-full rounded-[3px]"
            style={{
              aspectRatio: '4 / 3',
              backgroundImage: `url(${card.artImageUrl}), ${guild.frameGradient}`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.6), inset 0 3px 14px rgba(0,0,0,0.45)',
            }}
          />
        </div>

        {/* Type line */}
        <div
          className="flex items-center justify-between rounded-md px-2.5 py-1"
          style={{ background: guild.nameBarColor, boxShadow: BEVEL }}
        >
          <span
            className="font-[family-name:var(--font-cinzel)] text-[10.5px] font-medium tracking-wide"
            style={{ color: barInk }}
          >
            Conjuro Legendario — Celebración
          </span>
          <span className="text-sm leading-none">{card.setSymbol}</span>
        </div>

        {/* Text box (parchment) */}
        <div
          className="flex-1 rounded-md px-3 py-2 font-[family-name:var(--font-eb-garamond)]"
          style={{
            backgroundColor: '#f1e7cd',
            backgroundImage: `${PARCHMENT_NOISE}, linear-gradient(180deg,#f7f0de 0%,#ece0c4 100%)`,
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.3), inset 0 1px 4px rgba(0,0,0,0.12)',
            color: '#1c160c',
          }}
        >
          <div className="space-y-0.5 text-[13.5px] leading-snug">
            <p>
              <span className="opacity-60">📅</span>{' '}
              <strong className="font-semibold">{party.date}</strong>
            </p>
            <p>
              <span className="opacity-60">⏰</span> {party.time}
            </p>
            <p>
              <span className="opacity-60">📍</span> {party.venue}
            </p>
            <p className="pl-5 text-[12px] text-[#574a33]">{party.address}</p>
          </div>

          {guestName && (
            <p className="mt-1.5 text-[13px] font-semibold" style={{ color: '#6b4a12' }}>
              ✨ Invitado especial: {guestName}
            </p>
          )}

          <div
            className="my-1.5 h-px"
            style={{ background: 'linear-gradient(90deg,transparent,rgba(0,0,0,0.28),transparent)' }}
          />

          <p className="text-[12.5px] italic leading-snug text-[#3a3326]">
            &ldquo;{birthday.flavorText}&rdquo;
          </p>
        </div>

        {/* Collector / artist line */}
        <div
          className="flex items-center justify-between rounded px-2 py-0.5 text-[8.5px] tracking-wide"
          style={{ background: 'rgba(0,0,0,0.28)', color: '#f4ecd8' }}
        >
          <span>Ilustración • {birthday.name}</span>
          <span className="uppercase">
            {guild.name} · {guild.code.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Power / toughness */}
      <div
        className="absolute bottom-2 right-2 rounded-[5px] border px-2 py-0.5 font-[family-name:var(--font-cinzel)] text-[13px] font-bold"
        style={{
          background: guild.nameBarColor,
          borderColor: 'rgba(0,0,0,0.55)',
          color: barInk,
          boxShadow: '0 2px 6px rgba(0,0,0,0.55), ' + BEVEL,
        }}
      >
        {birthday.age}/∞
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/components/CardFront.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/CardFront.tsx __tests__/components/CardFront.test.tsx
git commit -m "$(printf 'feat: add overhauled CardFront face with vector pips and texture\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

## Task 7: Flip + texture CSS utilities

**Files:**
- Modify: `src/app/globals.css`

Add the 3D-flip utility classes and a reduced-motion override. Tailwind v4 imports stay at the top.

- [ ] **Step 1: Append the flip utilities**

Add to the end of `src/app/globals.css`:

```css
/* --- Card flip --- */
.card-flip {
  perspective: 1200px;
}

.card-flip__inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 600ms cubic-bezier(0.2, 0.7, 0.2, 1);
}

.card-flip--flipped .card-flip__inner {
  transform: rotateY(180deg);
}

.card-flip__face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.card-flip__face--back {
  transform: rotateY(180deg);
}

@media (prefers-reduced-motion: reduce) {
  .card-flip__inner {
    transition: none;
  }
}
```

- [ ] **Step 2: Verify the app still compiles**

Run: `npm run lint`
Expected: PASS (no errors). CSS has no unit test; correctness is confirmed visually in Task 9.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "$(printf 'feat: add 3D card-flip CSS utilities\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

## Task 8: MtgCard flip container

**Files:**
- Modify: `src/components/MtgCard.tsx` (rewrite)
- Modify: `__tests__/components/MtgCard.test.tsx`

`MtgCard` becomes a `'use client'` flip container: fixed card size (real MTG ratio), holds `flipped` state, is a keyboard-operable button with `aria-pressed`, and composes `CardFront` + `CardBack`. The art-driven height is replaced by a fixed `aspect-ratio`.

- [ ] **Step 1: Update the test file**

Replace the entire contents of `__tests__/components/MtgCard.test.tsx` with:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MtgCard } from '@/components/MtgCard'
import { GUILDS } from '@/lib/colors'
import type { PartyConfig } from '@/lib/config'

const mockConfig: PartyConfig = {
  birthday: { name: 'Brayan', age: 28, flavorText: 'Texto de ambientación.' },
  party: { date: 'Sábado 1', time: '19:00', venue: 'El Lugar', address: 'Calle 123', mapsEmbedUrl: 'https://maps.test' },
  card: { artImageUrl: '/images/cake-art.svg', setSymbol: '🎂' },
}

describe('MtgCard', () => {
  it('renders the birthday person name', () => {
    render(<MtgCard guild={GUILDS.ub} config={mockConfig} />)
    expect(screen.getAllByText(/Brayan/).length).toBeGreaterThan(0)
  })

  it('renders the age', () => {
    render(<MtgCard guild={GUILDS.ub} config={mockConfig} />)
    expect(screen.getAllByText(/28/).length).toBeGreaterThan(0)
  })

  it('renders party date, time, and venue', () => {
    render(<MtgCard guild={GUILDS.ub} config={mockConfig} />)
    expect(screen.getByText(/Sábado 1/)).toBeInTheDocument()
    expect(screen.getByText(/19:00/)).toBeInTheDocument()
    expect(screen.getByText(/El Lugar/)).toBeInTheDocument()
  })

  it('renders flavor text', () => {
    render(<MtgCard guild={GUILDS.ub} config={mockConfig} />)
    expect(screen.getByText(/Texto de ambientación/)).toBeInTheDocument()
  })

  it('renders guest name when provided', () => {
    render(<MtgCard guild={GUILDS.ub} config={mockConfig} guestName="Alice" />)
    expect(screen.getByText(/Alice/)).toBeInTheDocument()
  })

  it('does not render guest name section when omitted', () => {
    render(<MtgCard guild={GUILDS.ub} config={mockConfig} />)
    expect(screen.queryByText(/Invitado especial/)).not.toBeInTheDocument()
  })

  it('renders the Spanish type line', () => {
    render(<MtgCard guild={GUILDS.ub} config={mockConfig} />)
    expect(screen.getByText(/Conjuro Legendario/)).toBeInTheDocument()
  })

  it('renders power/toughness with age', () => {
    render(<MtgCard guild={GUILDS.ub} config={mockConfig} />)
    expect(screen.getByText('28/∞')).toBeInTheDocument()
  })

  it('shows the authentic Magic back', () => {
    render(<MtgCard guild={GUILDS.ub} config={mockConfig} />)
    expect(screen.getByText(/Deckmaster/i)).toBeInTheDocument()
  })

  it('flips when clicked', async () => {
    const user = userEvent.setup()
    render(<MtgCard guild={GUILDS.ub} config={mockConfig} />)
    const card = screen.getByRole('button', { name: /carta/i })
    expect(card).toHaveAttribute('aria-pressed', 'false')
    await user.click(card)
    expect(card).toHaveAttribute('aria-pressed', 'true')
  })

  it('flips on Enter key', async () => {
    const user = userEvent.setup()
    render(<MtgCard guild={GUILDS.ub} config={mockConfig} />)
    const card = screen.getByRole('button', { name: /carta/i })
    card.focus()
    await user.keyboard('{Enter}')
    expect(card).toHaveAttribute('aria-pressed', 'true')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/components/MtgCard.test.tsx`
Expected: FAIL — current `MtgCard` has no `button` role / `aria-pressed` and no `Deckmaster`.

- [ ] **Step 3: Rewrite MtgCard as the flip container**

Replace the entire contents of `src/components/MtgCard.tsx` with:

```tsx
'use client'

import { useState } from 'react'
import type { Guild } from '@/lib/colors'
import type { PartyConfig } from '@/lib/config'
import { CardFront } from '@/components/CardFront'
import { CardBack } from '@/components/CardBack'

interface MtgCardProps {
  guild: Guild
  config: PartyConfig
  guestName?: string
}

export function MtgCard({ guild, config, guestName }: MtgCardProps) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        aria-label={flipped ? 'Mostrar el frente de la carta' : 'Voltear la carta'}
        aria-pressed={flipped}
        onClick={() => setFlipped(f => !f)}
        className={`card-flip block w-[330px] cursor-pointer rounded-[16px] p-0 ${
          flipped ? 'card-flip--flipped' : ''
        }`}
        style={{
          aspectRatio: '2.5 / 3.5',
          background: 'transparent',
          border: 'none',
          boxShadow: `0 0 26px ${guild.manaColors[0]}40, 0 14px 38px rgba(0,0,0,0.75)`,
          borderRadius: 16,
        }}
      >
        <div className="card-flip__inner">
          <div className="card-flip__face card-flip__face--front">
            <CardFront guild={guild} config={config} guestName={guestName} />
          </div>
          <div className="card-flip__face card-flip__face--back">
            <CardBack />
          </div>
        </div>
      </button>
      <span className="text-[11px] italic text-amber-200/70 font-[family-name:var(--font-eb-garamond)]">
        toca para ver el reverso ↻
      </span>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/components/MtgCard.test.tsx`
Expected: PASS (11 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/MtgCard.tsx __tests__/components/MtgCard.test.tsx
git commit -m "$(printf 'feat: make MtgCard a flippable front/back container\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

## Task 9: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Run the whole test suite**

Run: `npm test`
Expected: all suites PASS (contrast, mana, ManaSymbol, CardBack, CardFront, MtgCard, config, colors, RsvpForm, MapEmbed, rsvp).

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: build succeeds (validates the `'use client'` boundary and serializable props for `MtgCard` on both pages).

- [ ] **Step 4: Manual visual check**

Run: `npm run dev`, then open:
- `http://localhost:3000/invite?guest=Alice&colors=ub` — front shows the cake art, refined frame, two vector pips; clicking flips to the brown "Magic: The Gathering / Deckmaster" back and back again; hint text visible.
- `http://localhost:3000/` (gallery) — all 10 guild cards render at the new aspect ratio and each flips independently.
Confirm `prefers-reduced-motion` (DevTools → Rendering → Emulate) removes the spin but still swaps faces.

- [ ] **Step 5: Final commit (if any manual tweaks were needed)**

```bash
git add -A
git commit -m "$(printf 'chore: card flip + realism overhaul verification pass\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

## Self-Review Notes

- **Spec coverage:** flip (Tasks 7–8), authentic back w/ Deckmaster + color wheel (Task 4), front overhaul w/ vector pips + texture (Tasks 3, 6), cake art (Task 5), real aspect ratio (Task 8), a11y + reduced motion (Tasks 7–8), tests incl. CardBack (every task). All spec sections map to a task.
- **Contrast helpers:** spec floated `contrast.ts` "if both faces need them." `ManaSymbol` (used on both faces) needs `readableOn`, so the helpers are extracted to `src/lib/contrast.ts` (Task 1) and the old inline copies in `MtgCard` are removed when it is rewritten (Task 8).
- **Type consistency:** `ManaInfo.pipColor`/`label` (Task 2) are consumed unchanged in Tasks 3–4; `MtgCard` props are identical to today's signature, so `page.tsx`/`invite/page.tsx` need no edits.
