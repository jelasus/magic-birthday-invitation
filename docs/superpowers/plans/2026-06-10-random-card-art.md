# Random Card Art Pool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single generated cake art with a random pool of real birthday card art cropped from the user's five downloaded examples, shown inside the existing personalized card and chosen deterministically per guest.

**Architecture:** Crop the illustration region from each `.assets/cardN.jpg` into `public/images/art/artN.jpg` (build-time, committed). A pure `src/lib/art.ts` owns the pool + a deterministic `pickArt(seed)`. `MtgCard`/`CardFront` gain an optional `artUrl` prop (override; omitted → current config art). `invite/page.tsx` computes the art from the guest name (with `?art=` override); the gallery varies art across its cards.

**Tech Stack:** Next.js 16.2.9 (App Router), React 19, TypeScript, Tailwind v4, Jest + React Testing Library, ImageMagick (`magick`) for one-off cropping.

**Environment:** Jest/Next tooling require Node 22+. Run test/lint/build commands as `bash -lc 'source ~/.nvm/nvm.sh && nvm use 22 && <cmd>'`. Run a single test file with `npx jest <path>`.

**Conventions:** Commit after every green task; end commit messages with the repo's `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` trailer. UI text stays Spanish.

---

## File Structure

| File | Responsibility | New/Modified |
|------|----------------|--------------|
| `public/images/art/art1.jpg … art5.jpg` | Cropped + enhanced birthday art (the pool) | New |
| `src/lib/art.ts` | `ART_POOL` constant + deterministic `pickArt(seed)` | New |
| `__tests__/lib/art.test.ts` | Pool + selection tests | New |
| `src/components/CardFront.tsx` | Optional `artUrl` override + `data-testid` on art window | Modified |
| `src/components/MtgCard.tsx` | Optional `artUrl` pass-through | Modified |
| `src/app/invite/page.tsx` | Compute `artUrl` from guest / `?art=`, pass down | Modified |
| `src/app/page.tsx` | Vary gallery art across the 10 cards | Modified |
| `__tests__/components/CardFront.test.tsx` | `artUrl` override / fallback assertions | Modified |
| `__tests__/components/MtgCard.test.tsx` | `artUrl` pass-through assertion | Modified |

Unchanged: frame, flip, `CardBack`, `ManaSymbol`, `colors.ts`, `config.ts`, `cake-art.svg` (still the default fallback), RSVP, maps.

---

## Task 1: Crop the art pool from the downloaded cards

**Files:**
- Create: `public/images/art/art1.jpg … art5.jpg`

This is a one-off, visual, build-time task — not TDD. The goal: each output contains only the illustration (no frame, title, rules text, or edge watermark), enhanced for the best perceived quality.

- [ ] **Step 1: Create the output directory**

Run: `mkdir -p public/images/art`

- [ ] **Step 2: Crop each source with a starting rectangle**

Source sizes: card1 236×329, card2 375×523, card3 333×493, card4 236×330, card5 375×523. Run each (geometry is `WxH+X+Y`):

```bash
magick .assets/card1.jpg -crop 200x140+18+40 +repage -resize 200% -unsharp 0x0.75 -strip -quality 85 public/images/art/art1.jpg
magick .assets/card2.jpg -crop 320x240+28+60 +repage -resize 200% -unsharp 0x0.75 -strip -quality 85 public/images/art/art2.jpg
magick .assets/card3.jpg -crop 235x220+50+95 +repage -resize 200% -unsharp 0x0.75 -strip -quality 85 public/images/art/art3.jpg
magick .assets/card4.jpg -crop 200x150+18+40 +repage -resize 200% -unsharp 0x0.75 -strip -quality 85 public/images/art/art4.jpg
magick .assets/card5.jpg -crop 320x240+28+60 +repage -resize 200% -unsharp 0x0.75 -strip -quality 85 public/images/art/art5.jpg
```

- [ ] **Step 3: View each output and adjust until tight**

Use the Read tool on each `public/images/art/artN.jpg` to view it. Acceptance per image:
- Shows the illustration (cake / party scene / etc.), centered.
- No card frame edge, no title bar, no rules-text box.
- No legible watermark (`MTGCARDSMITH.COM`, blogspot URL, "Google Images"). If a watermark sits at an edge, tighten the rectangle to exclude it; if it overlaps the art centrally and can't be excluded, crop to minimize it and accept the rest.

If an image fails acceptance, re-run its `magick` command with an adjusted `WxH+X+Y` (and re-view). Reference (from the spec) of what each art is:
- card1 → chocolate cake with lit candles
- card2 → dragon silhouette + "Happy Birthday!" + balloons
- card3 → person + flaming birthday cake (photo)
- card4 → party scene: cake, gifts, balloons
- card5 → "LET'S PARTY!" silhouettes on rainbow

- [ ] **Step 4: Confirm all five exist and are non-trivial**

Run: `ls -la public/images/art/ && magick identify public/images/art/*.jpg`
Expected: five JPGs, each a few KB+ and with sensible dimensions (roughly 2× the crop box).

- [ ] **Step 5: Commit**

```bash
git add public/images/art
git commit -m "$(printf 'feat: add birthday art pool cropped from example cards\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

## Task 2: Art selection module

**Files:**
- Create: `src/lib/art.ts`
- Test: `__tests__/lib/art.test.ts`

- [ ] **Step 1: Write the failing test** — create `__tests__/lib/art.test.ts`:

```ts
import { ART_POOL, pickArt } from '@/lib/art'

describe('art', () => {
  it('exposes a non-empty pool of /images/art paths', () => {
    expect(ART_POOL.length).toBeGreaterThan(0)
    for (const p of ART_POOL) {
      expect(p).toMatch(/^\/images\/art\/.+\.(jpg|png|svg)$/)
    }
  })

  it('is deterministic for the same seed', () => {
    expect(pickArt('Brayan')).toBe(pickArt('Brayan'))
    expect(pickArt('Alice')).toBe(pickArt('Alice'))
  })

  it('spans more than one pool entry across different seeds', () => {
    const seeds = ['Ana', 'Beto', 'Carla', 'Diego', 'Eva', 'Frank', 'Gabriela', 'Hugo', 'Ivan', 'Julia']
    const chosen = new Set(seeds.map(s => pickArt(s)))
    expect(chosen.size).toBeGreaterThan(1)
  })

  it('returns a pool member when given no seed', () => {
    expect(ART_POOL).toContain(pickArt())
    expect(ART_POOL).toContain(pickArt(''))
    expect(ART_POOL).toContain(pickArt(null))
  })

  it('always returns a member of the pool', () => {
    expect(ART_POOL).toContain(pickArt('whatever-seed'))
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/lib/art.test.ts`
Expected: FAIL — `Cannot find module '@/lib/art'`.

- [ ] **Step 3: Write minimal implementation** — create `src/lib/art.ts`:

```ts
/** Birthday art cropped from the example cards. Add/remove files freely. */
export const ART_POOL: string[] = [
  '/images/art/art1.jpg',
  '/images/art/art2.jpg',
  '/images/art/art3.jpg',
  '/images/art/art4.jpg',
  '/images/art/art5.jpg',
]

/** Stable non-negative hash of a string. */
function hashSeed(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0
  }
  return h
}

/**
 * Pick an art path. With a non-empty seed (e.g. the guest's name) the choice is
 * deterministic, so the same link always shows the same card. Without a seed it
 * is random. ART_POOL is a non-empty constant, so no empty-pool branch is needed.
 */
export function pickArt(seed?: string | null): string {
  if (seed) {
    return ART_POOL[hashSeed(seed) % ART_POOL.length]
  }
  return ART_POOL[Math.floor(Math.random() * ART_POOL.length)]
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/lib/art.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/art.ts __tests__/lib/art.test.ts
git commit -m "$(printf 'feat: add deterministic art pool selection\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

## Task 3: CardFront `artUrl` override

**Files:**
- Modify: `src/components/CardFront.tsx`
- Test: `__tests__/components/CardFront.test.tsx`

- [ ] **Step 1: Add the failing tests** — append these two `it` blocks inside the existing `describe('CardFront', …)` in `__tests__/components/CardFront.test.tsx` (before its closing `})`):

```ts
  it('uses artUrl when provided, overriding config art', () => {
    render(<CardFront guild={GUILDS.ub} config={config} artUrl="/images/art/art2.jpg" />)
    expect(screen.getByTestId('card-art').style.backgroundImage).toContain('art2.jpg')
  })

  it('falls back to config art when artUrl is omitted', () => {
    render(<CardFront guild={GUILDS.ub} config={config} />)
    expect(screen.getByTestId('card-art').style.backgroundImage).toContain('cake-art.svg')
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/components/CardFront.test.tsx`
Expected: FAIL — `Unable to find an element by: [data-testid="card-art"]`.

- [ ] **Step 3: Implement** — in `src/components/CardFront.tsx`:

3a. Add `artUrl` to the props interface:

```ts
interface CardFrontProps {
  guild: Guild
  config: PartyConfig
  guestName?: string
  artUrl?: string
}
```

3b. Destructure it and resolve the art source. Change:

```ts
export function CardFront({ guild, config, guestName }: CardFrontProps) {
  const { birthday, party, card } = config
  const barInk = readableOn(guild.nameBarColor)
```

to:

```ts
export function CardFront({ guild, config, guestName, artUrl }: CardFrontProps) {
  const { birthday, party, card } = config
  const art = artUrl ?? card.artImageUrl
  const barInk = readableOn(guild.nameBarColor)
```

3c. In the art-window inner `<div>` (the one with `aspectRatio: '4 / 3'`), add a `data-testid` and use `art` instead of `card.artImageUrl`. Change:

```tsx
          <div
            className="w-full rounded-[3px]"
            style={{
              aspectRatio: '4 / 3',
              backgroundImage: `url(${card.artImageUrl}), ${guild.frameGradient}`,
```

to:

```tsx
          <div
            data-testid="card-art"
            className="w-full rounded-[3px]"
            style={{
              aspectRatio: '4 / 3',
              backgroundImage: `url(${art}), ${guild.frameGradient}`,
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/components/CardFront.test.tsx`
Expected: PASS (all CardFront tests, including the two new ones).

- [ ] **Step 5: Commit**

```bash
git add src/components/CardFront.tsx __tests__/components/CardFront.test.tsx
git commit -m "$(printf 'feat: let CardFront override art via artUrl prop\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

## Task 4: MtgCard `artUrl` pass-through

**Files:**
- Modify: `src/components/MtgCard.tsx`
- Test: `__tests__/components/MtgCard.test.tsx`

- [ ] **Step 1: Add the failing test** — append inside the existing `describe('MtgCard', …)` in `__tests__/components/MtgCard.test.tsx` (before its closing `})`):

```ts
  it('passes artUrl through to the front face', () => {
    render(<MtgCard guild={GUILDS.ub} config={mockConfig} artUrl="/images/art/art3.jpg" />)
    expect(screen.getByTestId('card-art').style.backgroundImage).toContain('art3.jpg')
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/components/MtgCard.test.tsx`
Expected: FAIL — `MtgCard` does not accept/forward `artUrl`, so the art window shows the config art (`cake-art.svg`), not `art3.jpg`.

- [ ] **Step 3: Implement** — in `src/components/MtgCard.tsx`:

3a. Add `artUrl` to the props interface:

```ts
interface MtgCardProps {
  guild: Guild
  config: PartyConfig
  guestName?: string
  artUrl?: string
}
```

3b. Destructure and forward it. Change the signature line:

```ts
export function MtgCard({ guild, config, guestName }: MtgCardProps) {
```

to:

```ts
export function MtgCard({ guild, config, guestName, artUrl }: MtgCardProps) {
```

3c. Pass it to `CardFront`. Change:

```tsx
            <CardFront guild={guild} config={config} guestName={guestName} />
```

to:

```tsx
            <CardFront guild={guild} config={config} guestName={guestName} artUrl={artUrl} />
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/components/MtgCard.test.tsx`
Expected: PASS (all MtgCard tests, including the new one).

- [ ] **Step 5: Commit**

```bash
git add src/components/MtgCard.tsx __tests__/components/MtgCard.test.tsx
git commit -m "$(printf 'feat: forward artUrl through MtgCard to the front face\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

## Task 5: Wire pages — per-guest art + gallery variety

**Files:**
- Modify: `src/app/invite/page.tsx`
- Modify: `src/app/page.tsx`

No unit test (server components); verified by build + the smoke test in Task 6.

- [ ] **Step 1: Wire the invite page**

In `src/app/invite/page.tsx`:

1a. Add the import (next to the other `@/lib` imports):

```ts
import { ART_POOL, pickArt } from '@/lib/art'
```

1b. Extend `searchParams` to accept `art`:

```ts
interface InvitePageProps {
  searchParams: Promise<{ guest?: string; colors?: string; art?: string }>
}
```

1c. After the existing `const guild = getGuild(guildCode)` / config lines, compute the art and pass it to the card. Replace:

```tsx
      <MtgCard guild={guild} config={config} guestName={guestName} />
```

with (add the computation just above the `return`, near the other derived values):

```tsx
  const artParam = params.art
  const artUrl =
    artParam && ART_POOL.includes(artParam) ? artParam : pickArt(guestName || null)
```

and the JSX:

```tsx
      <MtgCard guild={guild} config={config} guestName={guestName} artUrl={artUrl} />
```

(Place the `const artParam …` / `const artUrl …` lines alongside the existing `const guestName` / `const guild` declarations, before `return (`.)

- [ ] **Step 2: Wire the gallery page**

In `src/app/page.tsx`:

2a. Add `ART_POOL` to the existing `@/lib/colors`/config imports:

```ts
import { ART_POOL } from '@/lib/art'
```

2b. In the guilds `.map(...)`, add the index and pass varied art. Change:

```tsx
          {Object.values(GUILDS).map(guild => (
            <div key={guild.code} className="flex flex-col items-center gap-2">
              <MtgCard guild={guild} config={config} />
```

to:

```tsx
          {Object.values(GUILDS).map((guild, i) => (
            <div key={guild.code} className="flex flex-col items-center gap-2">
              <MtgCard guild={guild} config={config} artUrl={ART_POOL[i % ART_POOL.length]} />
```

- [ ] **Step 3: Verify the suite still passes and it compiles**

Run: `npx jest` — expect all suites PASS.
Run: `npm run lint` — expect clean.

- [ ] **Step 4: Commit**

```bash
git add src/app/invite/page.tsx src/app/page.tsx
git commit -m "$(printf 'feat: show random per-guest art on invite and varied art in gallery\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

## Task 6: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Test suite**

Run: `npx jest`
Expected: all suites PASS (art, contrast, mana, ManaSymbol, CardBack, CardFront, MtgCard, config, colors, RsvpForm, MapEmbed, rsvp).

- [ ] **Step 2: Lint + build**

Run: `npm run lint` — clean.
Run: `rm -rf .next && npm run build` — succeeds.

- [ ] **Step 3: Runtime smoke test**

Start the prod server on a free port and confirm the art wiring:

```bash
PORT=3100 npm run start > /tmp/art-smoke.log 2>&1 &
sleep 5
# Same guest twice → same art (deterministic)
curl -s "http://localhost:3100/invite?guest=Alice&colors=ub" | grep -oE '/images/art/art[0-9]\.jpg' | head -1
curl -s "http://localhost:3100/invite?guest=Alice&colors=ub" | grep -oE '/images/art/art[0-9]\.jpg' | head -1
# Explicit override honored
curl -s "http://localhost:3100/invite?guest=Alice&colors=ub&art=/images/art/art3.jpg" | grep -oF 'art3.jpg' | head -1
# Gallery shows multiple distinct arts
curl -s "http://localhost:3100/" | grep -oE '/images/art/art[0-9]\.jpg' | sort -u
pkill -f "next start" 2>/dev/null; pkill -f "next-server" 2>/dev/null
```

Expected: the two Alice requests print the **same** `artN.jpg`; the override prints `art3.jpg`; the gallery prints several distinct `artN.jpg` paths.

- [ ] **Step 4: Manual visual check (optional)**

`npm run dev`, open `/invite?guest=Alice&colors=ub` and `/` — the cropped birthday art appears in the card art window, the flip still works, and different guests/gallery cards show different art.

---

## Self-Review Notes

- **Spec coverage:** crop pool (Task 1), `art.ts` deterministic selection (Task 2), `artUrl` override on CardFront (Task 3) and MtgCard (Task 4), invite per-guest + `?art=` + gallery variety (Task 5), verification incl. determinism/override smoke (Task 6). All spec sections map to a task.
- **Test hook:** the art-window div gains `data-testid="card-art"` so override/fallback are assertable; this is the only structural change to CardFront's markup.
- **Type consistency:** `artUrl?: string` is identical on `CardFront` and `MtgCard`; `pickArt(seed?: string | null)` is called with `guestName || null`. `ART_POOL` is imported where the override is validated (invite page) and where the gallery cycles it.
- **Back-compat:** `artUrl` is optional and defaulted to `config.card.artImageUrl`, so every pre-existing test (which renders without `artUrl`) stays green.
