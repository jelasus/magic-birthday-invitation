# Example-Faithful Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render each invitation card like a real Magic card modeled on the five example birthday cards — English title/type/cost/flavor in the example's color identity, the birthday date/time/venue in the text box, and the exact Magic card-back image on the flip.

**Architecture:** A new `src/lib/cards.ts` defines a 5-card pool (art + title + type + cost + colors + flavor) selected deterministically per guest, replacing the art-only pool and the guild color driver for the front. `src/lib/frames.ts` derives the frame style from a card's colors (mono/gold/artifact). `CardFront` is refactored to take a `card` identity; `CardBack` embeds the real JPG; pages and RSVP are rewired to the card pool.

**Tech Stack:** Next.js 16.2.9 (App Router), React 19, TypeScript, Tailwind v4, Jest + RTL, ImageMagick available (for copying the asset).

**Environment:** Jest/Next need Node 22+. Run commands as `bash -lc 'source ~/.nvm/nvm.sh && nvm use 22 && <cmd>'`. Single test: `npx jest <path>`.

**Conventions:** Commit after each green task; end commit messages with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`. Card title/type/flavor are **English**; the text-box party details stay **Spanish**.

**Note on config:** `config.party.*` (date/time/venue/address) and `config.card.setSymbol` are still used. `config.birthday.flavorText` and `config.card.artImageUrl` become **unused on the front** (flavor + art now come from the card identity) — leave them in `party.json` (harmless), don't reference them in `CardFront`.

---

## File Structure

| File | Responsibility | New/Modified |
|------|----------------|--------------|
| `src/lib/cards.ts` | `CardIdentity`/`CostToken` types, `CARD_POOL` (5), `pickCard` | New |
| `src/lib/frames.ts` | `frameFor(colors)` → mono/gold/artifact `FrameStyle` | New |
| `src/components/ManaCost.tsx` | `ManaCost` renderer + generic numeric pip | New |
| `src/components/CardBack.tsx` | Embed `card-back.jpg` | Rewritten |
| `src/components/CardFront.tsx` | Take `card`; English title/type/cost/flavor + Spanish party text; no P/T | Rewritten |
| `src/components/MtgCard.tsx` | Props `{ card, config, guestName }`; glow from card colors | Modified |
| `src/components/RsvpForm.tsx` | `guildCode` prop → `cardId` | Modified |
| `src/app/invite/page.tsx` | `pickCard` + `?card=`; pass `card` + `card.id` | Modified |
| `src/app/page.tsx` | Gallery maps `CARD_POOL` | Modified |
| `public/images/card-back.jpg` | Exact Magic back (copied from `.assets/`) | New |
| Tests for each of the above | | New/Modified |
| `src/lib/art.ts`, `__tests__/lib/art.test.ts` | Superseded by `cards.ts` | Removed |

`src/lib/colors.ts` keeps the `ColorCode` type (used by cards/frames/mana); its `GUILDS`/`getGuild`/`randomGuildCode` become unused by the app but are left in place (harmless, keeps `colors.test.ts` green). `src/lib/mana.ts`, `ManaSymbol.tsx`, `contrast.ts` unchanged.

---

## Task 1: Card pool — `src/lib/cards.ts`

**Files:**
- Create: `src/lib/cards.ts`
- Test: `__tests__/lib/cards.test.ts`

- [ ] **Step 1: Write the failing test** — create `__tests__/lib/cards.test.ts`:

```ts
import { CARD_POOL, pickCard } from '@/lib/cards'

describe('cards', () => {
  it('has five fully-populated card identities', () => {
    expect(CARD_POOL).toHaveLength(5)
    for (const c of CARD_POOL) {
      expect(c.id).toBeTruthy()
      expect(c.art).toMatch(/^\/images\/art\/.+\.jpg$/)
      expect(c.title).toBeTruthy()
      expect(c.typeLine).toBeTruthy()
      expect(c.cost.length).toBeGreaterThan(0)
      expect(Array.isArray(c.colors)).toBe(true)
      expect(c.flavor).toBeTruthy()
    }
  })

  it('is deterministic for the same seed and varies across seeds', () => {
    expect(pickCard('Brayan')).toBe(pickCard('Brayan'))
    const seeds = ['Ana', 'Beto', 'Carla', 'Diego', 'Eva', 'Frank', 'Gabriela', 'Hugo']
    expect(new Set(seeds.map(s => pickCard(s).id)).size).toBeGreaterThan(1)
  })

  it('returns a pool member with no seed', () => {
    expect(CARD_POOL).toContain(pickCard())
    expect(CARD_POOL).toContain(pickCard(''))
    expect(CARD_POOL).toContain(pickCard(null))
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/lib/cards.test.ts`
Expected: FAIL — `Cannot find module '@/lib/cards'`.

- [ ] **Step 3: Write minimal implementation** — create `src/lib/cards.ts`:

```ts
import type { ColorCode } from '@/lib/colors'

/** A mana-cost token: a number = generic mana, a ColorCode = a colored pip. */
export type CostToken = number | ColorCode

export interface CardIdentity {
  id: string
  art: string
  title: string
  typeLine: string
  cost: CostToken[]
  colors: ColorCode[]
  flavor: string
}

export const CARD_POOL: CardIdentity[] = [
  { id: 'cake', art: '/images/art/art1.jpg', title: 'Birthday Cake', typeLine: 'Artifact — Cake', cost: [2], colors: [], flavor: 'Even the Multiverse stops for cake.' },
  { id: 'wish', art: '/images/art/art2.jpg', title: 'Happy Birthday', typeLine: 'Sorcery', cost: [2, 'u'], colors: ['u'], flavor: 'Youth is a gift of nature; age, a work of art.' },
  { id: 'make-a-wish', art: '/images/art/art3.jpg', title: 'Happy Birthday!', typeLine: 'Sorcery', cost: [1, 'g'], colors: ['g'], flavor: 'Make your wish before the candles win.' },
  { id: 'party', art: '/images/art/art4.jpg', title: 'Birthday Party', typeLine: 'Sorcery', cost: [4, 'b', 'b'], colors: ['b'], flavor: 'A spell you may cast but once a year.' },
  { id: 'lets-party', art: '/images/art/art5.jpg', title: "Let's Party", typeLine: 'Enchantment', cost: ['w', 'u', 'b', 'r', 'g'], colors: ['w', 'u', 'b', 'r', 'g'], flavor: 'Whenever a guest celebrates, the party was a success.' },
]

function hashSeed(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return h
}

/** Deterministic card from a seed (guest name); random when no seed. */
export function pickCard(seed?: string | null): CardIdentity {
  if (seed) return CARD_POOL[hashSeed(seed) % CARD_POOL.length]
  return CARD_POOL[Math.floor(Math.random() * CARD_POOL.length)]
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/lib/cards.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/cards.ts __tests__/lib/cards.test.ts
git commit -m "$(printf 'feat: add example-faithful card pool\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

## Task 2: Frame styling — `src/lib/frames.ts`

**Files:**
- Create: `src/lib/frames.ts`
- Test: `__tests__/lib/frames.test.ts`

- [ ] **Step 1: Write the failing test** — create `__tests__/lib/frames.test.ts`:

```ts
import { frameFor } from '@/lib/frames'

describe('frameFor', () => {
  it('returns an artifact frame for no colors', () => {
    const f = frameFor([])
    expect(f.frameGradient).toContain('linear-gradient')
    expect(f.barColor).toMatch(/^#[0-9a-fA-F]{6}$/)
    expect([f.barInk]).toContain(f.barInk) // present
  })

  it('returns a mono frame for a single color', () => {
    expect(frameFor(['u']).frameGradient).toContain('linear-gradient')
    expect(frameFor(['b']).frameGradient).not.toBe(frameFor(['u']).frameGradient)
  })

  it('returns the gold frame for multicolor', () => {
    const gold = frameFor(['w', 'u', 'b', 'r', 'g'])
    const mono = frameFor(['u'])
    expect(gold.frameGradient).not.toBe(mono.frameGradient)
  })

  it('chooses a readable ink (dark or parchment)', () => {
    expect(['#15110a', '#f4ecd8']).toContain(frameFor(['b']).barInk)
    expect(['#15110a', '#f4ecd8']).toContain(frameFor(['w']).barInk)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/lib/frames.test.ts`
Expected: FAIL — `Cannot find module '@/lib/frames'`.

- [ ] **Step 3: Write minimal implementation** — create `src/lib/frames.ts`:

```ts
import type { ColorCode } from '@/lib/colors'
import { readableOn } from '@/lib/contrast'

export interface FrameStyle {
  frameGradient: string
  barColor: string
  barInk: string
}

const MONO: Record<ColorCode, { frameGradient: string; barColor: string }> = {
  w: { frameGradient: 'linear-gradient(160deg,#f7f2dd 0%,#e9e0c2 55%,#cdbf95 100%)', barColor: '#efe7cf' },
  u: { frameGradient: 'linear-gradient(160deg,#bfe0f2 0%,#5aa0d6 55%,#246397 100%)', barColor: '#bcd9ef' },
  b: { frameGradient: 'linear-gradient(160deg,#3a3a3e 0%,#1d1d20 55%,#0b0b0d 100%)', barColor: '#26262a' },
  r: { frameGradient: 'linear-gradient(160deg,#f0a98f 0%,#d4502f 55%,#9c2415 100%)', barColor: '#e3a08a' },
  g: { frameGradient: 'linear-gradient(160deg,#bcd9a6 0%,#5f9c4f 55%,#2f6b2c 100%)', barColor: '#bcd2a6' },
}

const GOLD = { frameGradient: 'linear-gradient(160deg,#f3e2a3 0%,#caa84e 55%,#8a6a23 100%)', barColor: '#e6cf8f' }
const ARTIFACT = { frameGradient: 'linear-gradient(160deg,#d8dde2 0%,#aab2bb 55%,#6f7780 100%)', barColor: '#c7ccd2' }

/** Frame style from a card's color identity: 0 = artifact, 1 = mono, 2+ = gold. */
export function frameFor(colors: ColorCode[]): FrameStyle {
  const base = colors.length === 0 ? ARTIFACT : colors.length >= 2 ? GOLD : MONO[colors[0]]
  return { frameGradient: base.frameGradient, barColor: base.barColor, barInk: readableOn(base.barColor) }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/lib/frames.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/frames.ts __tests__/lib/frames.test.ts
git commit -m "$(printf 'feat: add color-identity frame styling\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

## Task 3: Mana cost renderer — `src/components/ManaCost.tsx`

**Files:**
- Create: `src/components/ManaCost.tsx`
- Test: `__tests__/components/ManaCost.test.tsx`

- [ ] **Step 1: Write the failing test** — create `__tests__/components/ManaCost.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { ManaCost } from '@/components/ManaCost'

describe('ManaCost', () => {
  it('renders a generic numeric pip and colored pips in order', () => {
    render(<ManaCost cost={[2, 'u']} />)
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByLabelText(/2 maná genérico/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/maná azul/i)).toBeInTheDocument()
  })

  it('renders five colored pips for a 5-color cost', () => {
    render(<ManaCost cost={['w', 'u', 'b', 'r', 'g']} />)
    expect(screen.getByLabelText(/maná blanco/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/maná verde/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/components/ManaCost.test.tsx`
Expected: FAIL — `Cannot find module '@/components/ManaCost'`.

- [ ] **Step 3: Write minimal implementation** — create `src/components/ManaCost.tsx`:

```tsx
import type { CostToken } from '@/lib/cards'
import { ManaSymbol } from '@/components/ManaSymbol'

function GenericPip({ value, size = 19 }: { value: number; size?: number }) {
  return (
    <span
      role="img"
      aria-label={`${value} maná genérico`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '9999px',
        background: 'radial-gradient(circle at 34% 28%, rgba(255,255,255,0.8), transparent 55%), #cdc6bb',
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.45), 0 1px 2px rgba(0,0,0,0.5)',
        color: '#1a1a1a',
        fontWeight: 700,
        fontSize: size * 0.58,
        lineHeight: 1,
      }}
    >
      {value}
    </span>
  )
}

/** Renders a mana cost (generic numbers + colored pips) left to right. */
export function ManaCost({ cost, size = 19 }: { cost: CostToken[]; size?: number }) {
  return (
    <span className="inline-flex gap-1">
      {cost.map((token, i) =>
        typeof token === 'number' ? (
          <GenericPip key={i} value={token} size={size} />
        ) : (
          <ManaSymbol key={i} code={token} size={size} />
        )
      )}
    </span>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/components/ManaCost.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/ManaCost.tsx __tests__/components/ManaCost.test.tsx
git commit -m "$(printf 'feat: add ManaCost renderer with generic mana pip\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

## Task 4: CardBack — embed the exact JPG

**Files:**
- Create: `public/images/card-back.jpg` (copied)
- Rewrite: `src/components/CardBack.tsx`
- Rewrite: `__tests__/components/CardBack.test.tsx`

- [ ] **Step 1: Copy the asset**

Run: `cp .assets/Magic_the_gathering-card_back.jpg public/images/card-back.jpg && ls -la public/images/card-back.jpg`
Expected: the file exists (~80 KB).

- [ ] **Step 2: Replace the test** — overwrite `__tests__/components/CardBack.test.tsx` with:

```tsx
import { render, screen } from '@testing-library/react'
import { CardBack } from '@/components/CardBack'

describe('CardBack', () => {
  it('renders the Magic card back image', () => {
    render(<CardBack />)
    const back = screen.getByRole('img', { name: /reverso/i })
    expect(back).toBeInTheDocument()
    expect(back.style.backgroundImage).toContain('card-back.jpg')
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx jest __tests__/components/CardBack.test.tsx`
Expected: FAIL — the current CardBack has no `role="img"` / `card-back.jpg`.

- [ ] **Step 4: Rewrite the component** — overwrite `src/components/CardBack.tsx` with:

```tsx
/** The authentic Magic: The Gathering card back (exact reference image). */
export function CardBack() {
  return (
    <div
      role="img"
      aria-label="Reverso de la carta Magic: The Gathering"
      className="h-full w-full rounded-[14px] bg-cover bg-center"
      style={{ backgroundImage: 'url(/images/card-back.jpg)' }}
    />
  )
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx jest __tests__/components/CardBack.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 6: Commit**

```bash
git add public/images/card-back.jpg src/components/CardBack.tsx __tests__/components/CardBack.test.tsx
git commit -m "$(printf 'feat: use exact Magic card-back image for the back face\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

## Task 5: CardFront — take a card identity

**Files:**
- Rewrite: `src/components/CardFront.tsx`
- Rewrite: `__tests__/components/CardFront.test.tsx`

- [ ] **Step 1: Replace the test** — overwrite `__tests__/components/CardFront.test.tsx` with:

```tsx
import { render, screen } from '@testing-library/react'
import { CardFront } from '@/components/CardFront'
import type { CardIdentity } from '@/lib/cards'
import type { PartyConfig } from '@/lib/config'

const card: CardIdentity = {
  id: 'wish', art: '/images/art/art2.jpg', title: 'Happy Birthday', typeLine: 'Sorcery',
  cost: [2, 'u'], colors: ['u'], flavor: 'Youth is a gift of nature; age, a work of art.',
}

const config: PartyConfig = {
  birthday: { name: 'Brayan', age: 28, flavorText: 'no-usado' },
  party: { date: 'Sábado 1', time: '19:00', venue: 'El Lugar', address: 'Calle 123', mapsEmbedUrl: 'https://maps.test' },
  card: { artImageUrl: '/images/cake-art.svg', setSymbol: '🎂' },
}

describe('CardFront', () => {
  it('renders the English title, type line and flavor', () => {
    render(<CardFront card={card} config={config} />)
    expect(screen.getByText('Happy Birthday')).toBeInTheDocument()
    expect(screen.getByText('Sorcery')).toBeInTheDocument()
    expect(screen.getByText(/Youth is a gift of nature/)).toBeInTheDocument()
  })

  it('renders the Spanish party details and age', () => {
    render(<CardFront card={card} config={config} />)
    expect(screen.getByText(/El Lugar/)).toBeInTheDocument()
    expect(screen.getByText(/Sábado 1/)).toBeInTheDocument()
    expect(screen.getAllByText(/28/).length).toBeGreaterThan(0)
  })

  it('shows the art from the card', () => {
    render(<CardFront card={card} config={config} />)
    expect(screen.getByTestId('card-art').style.backgroundImage).toContain('art2.jpg')
  })

  it('renders the mana cost pips for the card', () => {
    render(<CardFront card={card} config={config} />)
    expect(screen.getByLabelText(/2 maná genérico/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/maná azul/i)).toBeInTheDocument()
  })

  it('renders the guest line when provided', () => {
    render(<CardFront card={card} config={config} guestName="Alice" />)
    expect(screen.getByText(/Alice/)).toBeInTheDocument()
  })

  it('does not render a power/toughness badge', () => {
    render(<CardFront card={card} config={config} />)
    expect(screen.queryByText('28/∞')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/components/CardFront.test.tsx`
Expected: FAIL — current `CardFront` takes `guild`/`artUrl`, not `card`.

- [ ] **Step 3: Rewrite the component** — overwrite `src/components/CardFront.tsx` with:

```tsx
import type { PartyConfig } from '@/lib/config'
import type { CardIdentity } from '@/lib/cards'
import { ManaCost } from '@/components/ManaCost'
import { frameFor } from '@/lib/frames'

interface CardFrontProps {
  card: CardIdentity
  config: PartyConfig
  guestName?: string
}

const BEVEL =
  'inset 0 0 0 1px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.4), inset 0 -1px 1px rgba(0,0,0,0.25)'

const PARCHMENT_NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")"

export function CardFront({ card, config, guestName }: CardFrontProps) {
  const { birthday, party, card: cardCfg } = config
  const frame = frameFor(card.colors)

  return (
    <div
      className="absolute inset-0 flex flex-col rounded-[14px] p-[7px] select-none"
      style={{ background: 'linear-gradient(155deg, #2c2c2c 0%, #0a0a0a 60%, #000 100%)' }}
    >
      <div
        className="flex flex-1 flex-col gap-1.5 rounded-[9px] p-2"
        style={{
          background: frame.frameGradient,
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.4), inset 0 1px 3px rgba(255,255,255,0.25)',
        }}
      >
        {/* Name bar: English title + mana cost */}
        <div
          className="flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5"
          style={{ background: frame.barColor, boxShadow: BEVEL }}
        >
          <span
            className="font-[family-name:var(--font-cinzel)] text-[12px] font-semibold leading-tight"
            style={{ color: frame.barInk }}
          >
            {card.title}
          </span>
          <ManaCost cost={card.cost} />
        </div>

        {/* Art */}
        <div className="rounded-md p-[3px]" style={{ background: 'linear-gradient(180deg,#1c1c1c,#000)' }}>
          <div
            data-testid="card-art"
            className="w-full rounded-[3px]"
            style={{
              aspectRatio: '4 / 3',
              backgroundImage: `url(${card.art}), ${frame.frameGradient}`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.6), inset 0 3px 14px rgba(0,0,0,0.45)',
            }}
          />
        </div>

        {/* Type line: English type + set symbol */}
        <div
          className="flex items-center justify-between rounded-md px-2.5 py-1"
          style={{ background: frame.barColor, boxShadow: BEVEL }}
        >
          <span
            className="font-[family-name:var(--font-cinzel)] text-[10.5px] font-medium tracking-wide"
            style={{ color: frame.barInk }}
          >
            {card.typeLine}
          </span>
          <span className="text-sm leading-none">{cardCfg.setSymbol}</span>
        </div>

        {/* Text box: Spanish party details + English flavor */}
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
            <p className="font-semibold">
              🎂 {birthday.age}° Cumpleaños de {birthday.name}
            </p>
            <p>
              <span className="opacity-60">📅</span> {party.date}
            </p>
            <p>
              <span className="opacity-60">⏰</span> {party.time} · <span className="opacity-60">📍</span> {party.venue}
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

          <p className="text-[12.5px] italic leading-snug text-[#3a3326]">&ldquo;{card.flavor}&rdquo;</p>
        </div>

        {/* Collector line */}
        <div
          className="flex items-center justify-between rounded px-2 py-0.5 text-[8.5px] tracking-wide"
          style={{ background: 'rgba(0,0,0,0.28)', color: '#f4ecd8' }}
        >
          <span>Ilustración • {birthday.name}</span>
          <span className="uppercase">{card.title}</span>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/components/CardFront.test.tsx`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/CardFront.tsx __tests__/components/CardFront.test.tsx
git commit -m "$(printf 'feat: render CardFront from a card identity (title/type/cost/flavor)\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

## Task 6: MtgCard — accept a card

**Files:**
- Modify: `src/components/MtgCard.tsx`
- Rewrite: `__tests__/components/MtgCard.test.tsx`

- [ ] **Step 1: Replace the test** — overwrite `__tests__/components/MtgCard.test.tsx` with:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MtgCard } from '@/components/MtgCard'
import type { CardIdentity } from '@/lib/cards'
import type { PartyConfig } from '@/lib/config'

const card: CardIdentity = {
  id: 'wish', art: '/images/art/art2.jpg', title: 'Happy Birthday', typeLine: 'Sorcery',
  cost: [2, 'u'], colors: ['u'], flavor: 'Youth is a gift of nature; age, a work of art.',
}

const mockConfig: PartyConfig = {
  birthday: { name: 'Brayan', age: 28, flavorText: 'no-usado' },
  party: { date: 'Sábado 1', time: '19:00', venue: 'El Lugar', address: 'Calle 123', mapsEmbedUrl: 'https://maps.test' },
  card: { artImageUrl: '/images/cake-art.svg', setSymbol: '🎂' },
}

describe('MtgCard', () => {
  it('renders the card title and type', () => {
    render(<MtgCard card={card} config={mockConfig} />)
    expect(screen.getByText('Happy Birthday')).toBeInTheDocument()
    expect(screen.getByText('Sorcery')).toBeInTheDocument()
  })

  it('renders party details and guest name', () => {
    render(<MtgCard card={card} config={mockConfig} guestName="Alice" />)
    expect(screen.getByText(/El Lugar/)).toBeInTheDocument()
    expect(screen.getByText(/Alice/)).toBeInTheDocument()
  })

  it('shows the card art', () => {
    render(<MtgCard card={card} config={mockConfig} />)
    expect(screen.getByTestId('card-art').style.backgroundImage).toContain('art2.jpg')
  })

  it('shows the Magic card back', () => {
    render(<MtgCard card={card} config={mockConfig} />)
    expect(screen.getByRole('img', { name: /reverso/i })).toBeInTheDocument()
  })

  it('flips when clicked', async () => {
    const user = userEvent.setup()
    render(<MtgCard card={card} config={mockConfig} />)
    const el = screen.getByRole('button', { name: /carta/i })
    expect(el).toHaveAttribute('aria-pressed', 'false')
    await user.click(el)
    expect(el).toHaveAttribute('aria-pressed', 'true')
  })

  it('flips on Enter and is not a native button', async () => {
    const user = userEvent.setup()
    render(<MtgCard card={card} config={mockConfig} />)
    const el = screen.getByRole('button', { name: /carta/i })
    expect(el.tagName).not.toBe('BUTTON')
    el.focus()
    await user.keyboard('{Enter}')
    expect(el).toHaveAttribute('aria-pressed', 'true')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/components/MtgCard.test.tsx`
Expected: FAIL — current `MtgCard` takes `guild`/`artUrl`, not `card`.

- [ ] **Step 3: Edit the component** — in `src/components/MtgCard.tsx`:

3a. Replace the imports + props interface block:

```tsx
import { useState } from 'react'
import type { Guild } from '@/lib/colors'
import type { PartyConfig } from '@/lib/config'
import { CardFront } from '@/components/CardFront'
import { CardBack } from '@/components/CardBack'

interface MtgCardProps {
  guild: Guild
  config: PartyConfig
  guestName?: string
  artUrl?: string
}
```

with:

```tsx
import { useState } from 'react'
import type { PartyConfig } from '@/lib/config'
import type { CardIdentity } from '@/lib/cards'
import { manaInfo } from '@/lib/mana'
import { CardFront } from '@/components/CardFront'
import { CardBack } from '@/components/CardBack'

interface MtgCardProps {
  card: CardIdentity
  config: PartyConfig
  guestName?: string
}
```

3b. Replace the function signature + the glow/state line:

```tsx
export function MtgCard({ guild, config, guestName, artUrl }: MtgCardProps) {
  const [flipped, setFlipped] = useState(false)
  const toggle = () => setFlipped(f => !f)
```

with:

```tsx
export function MtgCard({ card, config, guestName }: MtgCardProps) {
  const [flipped, setFlipped] = useState(false)
  const toggle = () => setFlipped(f => !f)
  const glow = card.colors[0] ? manaInfo(card.colors[0]).pipColor : '#c7ccd2'
```

3c. In the wrapper `<div role="button" …>`'s inline `style`, replace the `boxShadow` line that uses `guild.manaColors[0]`:

```tsx
          boxShadow: `0 0 26px ${guild.manaColors[0]}40, 0 14px 38px rgba(0,0,0,0.75)`,
```

with:

```tsx
          boxShadow: `0 0 26px ${glow}40, 0 14px 38px rgba(0,0,0,0.75)`,
```

3d. Replace the `CardFront` usage:

```tsx
            <CardFront guild={guild} config={config} guestName={guestName} artUrl={artUrl} />
```

with:

```tsx
            <CardFront card={card} config={config} guestName={guestName} />
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/components/MtgCard.test.tsx`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/MtgCard.tsx __tests__/components/MtgCard.test.tsx
git commit -m "$(printf 'feat: MtgCard takes a card identity; glow from card colors\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

## Task 7: Wire pages + RSVP; remove the old art pool

**Files:**
- Modify: `src/components/RsvpForm.tsx`, `__tests__/components/RsvpForm.test.tsx`
- Modify: `src/app/invite/page.tsx`
- Modify: `src/app/page.tsx`
- Remove: `src/lib/art.ts`, `__tests__/lib/art.test.ts`

- [ ] **Step 1: Rename the RsvpForm prop** — in `src/components/RsvpForm.tsx`:

Change the props interface:

```tsx
interface RsvpFormProps {
  guestName: string
  guildCode: string
}
```

to:

```tsx
interface RsvpFormProps {
  guestName: string
  cardId: string
}
```

Change the destructure `export function RsvpForm({ guestName, guildCode }: RsvpFormProps) {` to `export function RsvpForm({ guestName, cardId }: RsvpFormProps) {`.

Change the fetch body field — replace `colors: guildCode` with `colors: cardId`:

```tsx
        body: JSON.stringify({ guest_name: name, attending, colors: cardId }),
```

- [ ] **Step 2: Update the RsvpForm test** — in `__tests__/components/RsvpForm.test.tsx`, replace every `guildCode="ub"` with `cardId="wish"` (5 occurrences across the `render(<RsvpForm … />)` calls).

- [ ] **Step 3: Run the RsvpForm test**

Run: `npx jest __tests__/components/RsvpForm.test.tsx`
Expected: PASS (the prop rename compiles; behavior unchanged).

- [ ] **Step 4: Rewrite the invite page** — overwrite `src/app/invite/page.tsx` with:

```tsx
import { getPartyConfig } from '@/lib/config'
import { CARD_POOL, pickCard } from '@/lib/cards'
import { MtgCard } from '@/components/MtgCard'
import { MapEmbed } from '@/components/MapEmbed'
import { RsvpForm } from '@/components/RsvpForm'

export const dynamic = 'force-dynamic'

interface InvitePageProps {
  searchParams: Promise<{ guest?: string; card?: string }>
}

export default async function InvitePage({ searchParams }: InvitePageProps) {
  const params = await searchParams
  const guestName = params.guest || ''
  const config = getPartyConfig()
  const card =
    (params.card && CARD_POOL.find(c => c.id === params.card)) || pickCard(guestName || null)

  return (
    <main
      className="min-h-screen flex flex-col items-center py-12 px-4"
      style={{ background: 'linear-gradient(135deg, #0d0d1a 0%, #1a0d2e 50%, #0d1a0d 100%)' }}
    >
      <h1 className="text-4xl font-black text-amber-400 mb-1 text-center tracking-wide drop-shadow-lg font-[family-name:var(--font-cinzel)]">
        ¡Estás invitado!
      </h1>
      <p className="text-amber-200 mb-8 text-base text-center italic font-[family-name:var(--font-eb-garamond)]">
        Una aventura mágica te espera
      </p>

      <MtgCard card={card} config={config} guestName={guestName} />

      <div className="mt-10 w-full max-w-sm">
        <h2 className="text-amber-400 font-bold text-lg mb-3 font-[family-name:var(--font-cinzel)]">
          📍 Cómo llegar
        </h2>
        <MapEmbed url={config.party.mapsEmbedUrl} />
      </div>

      <div className="mt-10 w-full max-w-sm mb-16">
        <h2 className="text-amber-400 font-bold text-lg mb-3 font-[family-name:var(--font-cinzel)]">
          ✅ Confirmar asistencia
        </h2>
        <RsvpForm guestName={guestName} cardId={card.id} />
      </div>
    </main>
  )
}
```

- [ ] **Step 5: Rewrite the gallery map** — in `src/app/page.tsx`:

5a. Replace the import `import { GUILDS } from '@/lib/colors'` with `import { CARD_POOL } from '@/lib/cards'`.

5b. Replace the guilds grid block:

```tsx
        <div className="grid grid-cols-1 justify-items-center gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Object.values(GUILDS).map(guild => (
            <div key={guild.code} className="flex flex-col items-center gap-2">
              <MtgCard guild={guild} config={config} />
              <p className="text-xs font-bold text-amber-300">
                {guild.name} ({guild.code.toUpperCase()})
              </p>
            </div>
          ))}
        </div>
```

with:

```tsx
        <div className="grid grid-cols-1 justify-items-center gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {CARD_POOL.map(card => (
            <div key={card.id} className="flex flex-col items-center gap-2">
              <MtgCard card={card} config={config} />
              <p className="text-xs font-bold text-amber-300">{card.title}</p>
            </div>
          ))}
        </div>
```

(Also update the nearby heading text `Estilos de carta` / its subtitle if it references "10 combinaciones" — change "las 10 combinaciones de colores que se asignan al azar." to "las cartas que se asignan al azar a cada invitado." Leave other gallery content, the LinkGenerator, and the LockScreen unchanged.)

- [ ] **Step 6: Remove the superseded art pool**

Run: `git rm src/lib/art.ts __tests__/lib/art.test.ts`

- [ ] **Step 7: Run the full suite + lint**

Run: `npx jest` — expect all suites PASS.
Run: `npm run lint` — expect clean (no unused-import errors from the removed `art`/`guild` references).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "$(printf 'feat: wire invite/gallery/RSVP to the card pool; drop art pool\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

## Task 8: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Test suite**

Run: `npx jest`
Expected: all suites PASS (cards, frames, ManaCost, ManaSymbol, contrast, mana, CardBack, CardFront, MtgCard, config, colors, RsvpForm, MapEmbed, rsvp). No reference to the removed `art` module remains.

- [ ] **Step 2: Lint + build**

Run: `npm run lint` — clean.
Run: `rm -rf .next && npm run build` — succeeds.

- [ ] **Step 3: Runtime smoke test**

```bash
PORT=3100 npm run start > /tmp/cards-smoke.log 2>&1 &
sleep 5
# Same guest twice → same card title (deterministic); back image present
curl -s "http://localhost:3100/invite?guest=Alice" | grep -oE 'Birthday Cake|Happy Birthday!?|Birthday Party|Let&#x27;s Party|Let.s Party' | head -1
curl -s "http://localhost:3100/invite?guest=Alice" | grep -oE 'Birthday Cake|Happy Birthday!?|Birthday Party|Let&#x27;s Party|Let.s Party' | head -1
# Card override
curl -s "http://localhost:3100/invite?guest=Alice&card=lets-party" | grep -oc "Let" 
# Back image served
curl -s -o /dev/null -w "card-back.jpg -> HTTP %{http_code}\n" "http://localhost:3100/images/card-back.jpg"
# Gallery shows multiple distinct titles
curl -s "http://localhost:3100/" | grep -oE 'Birthday Cake|Happy Birthday!?|Birthday Party|Let' | sort -u | wc -l
pkill -f "next start" 2>/dev/null; pkill -f "next-server" 2>/dev/null
```

Expected: the two Alice requests print the **same** title; the override page contains "Let"; `card-back.jpg` returns HTTP 200; the gallery shows multiple distinct titles.

- [ ] **Step 4: Manual visual check (optional)**

`npm run dev`, open `/invite?guest=Alice` and `/` — the front shows an English MTG title/type/cost in its color identity with the birthday details in the text box; clicking flips to the **exact** Magic back; different guests get different cards.

---

## Self-Review Notes

- **Spec coverage:** card pool w/ colors (Task 1), frame system (Task 2), mana cost incl. generic pip (Task 3), exact JPG back (Task 4), Hybrid CardFront — English title/type/flavor + Spanish party data, no P/T (Task 5), MtgCard card prop + glow (Task 6), pages + RSVP rewire + art-pool removal (Task 7), verification (Task 8). All spec sections map to a task.
- **Fonts:** Cinzel/EB Garamond retained (already in `layout.tsx`); no font task needed. Exact back font ships via the JPG. (Proprietary Beleren note is out of scope per the spec.)
- **Type consistency:** `CardIdentity` fields (`id/art/title/typeLine/cost/colors/flavor`) are used identically in cards.ts (Task 1), CardFront (Task 5), MtgCard (Task 6), pages (Task 7). `CostToken` (number | ColorCode) consumed by `ManaCost` (Task 3) and CardFront. `frameFor` returns `{ frameGradient, barColor, barInk }` used by CardFront. `RsvpForm` prop is `cardId` everywhere (Task 7).
- **Config:** `config.birthday.flavorText` / `config.card.artImageUrl` intentionally unreferenced on the front; left in `party.json`.
- **Dead code:** `colors.ts` GUILDS/getGuild/randomGuildCode become unused but are kept (ColorCode type is still needed; keeps `colors.test.ts` green) — no eslint error for unused exports.
