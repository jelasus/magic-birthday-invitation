# Random Card Art Pool — Design Spec

**Date:** 2026-06-10
**Project:** magic-birthday-invitation
**Builds on:** `2026-06-10-card-flip-realism-design.md`

---

## Goal

Make each invitation card show **real birthday card art** instead of the single generated cake SVG. The art is cropped from the user's five downloaded example cards and shown at random inside the existing personalized card, so different guests see different art while keeping the guest name, party details, the flip, and RSVP intact.

Decisions locked during brainstorming:
- **Source:** crop the illustration region out of the five downloaded JPGs in `.assets/` — do NOT generate new art and do NOT add invented art. Pool = these five only.
- **Cropping:** physically crop the files with ImageMagick (not CSS-crop the originals in place).
- **Selection:** random per guest, **deterministic from the guest's name** (same link → same card on refresh), random fallback when there is no guest, with an `?art=` override.
- **Scope:** art only. The frame, flip, and back stay as-is.

Accepted limitation: the sources are small (236–375 px wide), so cropped art is low-resolution and will look soft when displayed ~300 px wide. A light enhance pass mitigates but cannot add detail. The pool is folder-based, so higher-res replacements can be dropped in later with no code change.

---

## Source Images

In `.assets/` (committed by the user, low quality):

| File | Size | Art region to keep |
|------|------|--------------------|
| `card1.jpg` | 236×329 | Chocolate cake with lit "HAPPY BIRTHDAY" candles |
| `card2.jpg` | 375×523 | Dragon silhouette + "Happy Birthday!" + balloons |
| `card3.jpg` | 333×493 | Photo: person + flaming birthday cake |
| `card4.jpg` | 236×330 | Party scene: cake, gifts, balloons |
| `card5.jpg` | 375×523 | "LET'S PARTY!" crowd silhouettes on rainbow |

Each card uses a roughly standard layout: title bar at top, the illustration in the upper-middle, type line + rules text below. The crop keeps only the illustration, excluding frame, title, rules text, and edge watermarks (e.g. `MTGCARDSMITH.COM`, blogspot URLs, "Google Images").

---

## Cropping Procedure (build-time, one-off)

Performed during implementation and committed as output files — not run at runtime.

For each source image:

1. **Determine the crop rectangle** for the illustration region. Start from an estimate, run the crop, **view the output, and adjust** until the rectangle is tight on the art with no frame/title/watermark bleed. Exact rectangles are finalized during implementation by inspecting each output; estimated starting boxes (`WxH+X+Y`):
   - `card1.jpg` → ~`200x140+18+40`
   - `card2.jpg` → ~`320x240+28+60`
   - `card3.jpg` → ~`235x220+50+95`
   - `card4.jpg` → ~`200x150+18+40`
   - `card5.jpg` → ~`320x240+28+60`
2. **Crop + enhance + strip metadata** into `public/images/art/artN.jpg`:
   ```
   magick .assets/cardN.jpg -crop WxH+X+Y +repage \
     -resize 200% -unsharp 0x0.75 -strip -quality 85 \
     public/images/art/artN.jpg
   ```
   (`-resize 200%` mild upscale, `-unsharp` light sharpen, `-strip` removes metadata.)
3. Output: `public/images/art/art1.jpg … art5.jpg` (5 files), committed.

`public/images/cake-art.svg` stays as the config default / fallback and is unaffected.

---

## Selection Logic — `src/lib/art.ts`

A small, pure module owning the pool and the choice.

```ts
export const ART_POOL: string[] = [
  '/images/art/art1.jpg',
  '/images/art/art2.jpg',
  '/images/art/art3.jpg',
  '/images/art/art4.jpg',
  '/images/art/art5.jpg',
]

/** Deterministic pick from a seed (guest name); random when no seed. */
export function pickArt(seed?: string | null): string
```

Behavior:
- **With a non-empty seed:** hash the string to a stable non-negative integer, index `ART_POOL[hash % length]`. Same seed always returns the same path.
- **Without a seed (empty/undefined):** return a uniformly random element.
- **Explicit override:** the caller resolves `?art=` itself (see Pages) — `pickArt` only handles the seed/random path. Keeping the override out of `pickArt` keeps the function pure and deterministic for testing.

The hash is a simple deterministic string hash (e.g. a small `for` loop summing char codes with a multiplier). No crypto, no dependencies.

---

## Wiring

### `MtgCard` and `CardFront` — optional `artUrl` prop

Both gain an optional `artUrl?: string`. When present it overrides `config.card.artImageUrl` for the art window; when absent, behavior is unchanged (back-compat — existing tests stay green).

- `MtgCard` passes `artUrl` straight through to `CardFront`.
- `CardFront` uses `const art = artUrl ?? config.card.artImageUrl` for the art-window `background-image`.

No other props or behavior change. The art window keeps `background-size: cover` so each crop fills it cleanly regardless of aspect ratio.

### `invite/page.tsx`

```ts
const artParam = params.art            // optional explicit override
const artUrl = (artParam && ART_POOL.includes(artParam))
  ? artParam
  : pickArt(guestName || null)
```
Pass `artUrl` to `<MtgCard … artUrl={artUrl} />`. `searchParams` type adds `art?: string`.

### `page.tsx` (gallery)

Give each of the 10 preview cards varied art so the host sees the range — e.g. `artUrl={ART_POOL[i % ART_POOL.length]}` over the mapped guilds. This is presentation-only; no new logic.

---

## Data Flow

`guestName` (from URL) → `pickArt(guestName)` in `invite/page.tsx` → `artUrl` prop → `MtgCard` → `CardFront` → art-window background. `?art=` short-circuits selection when it names a pool member. No runtime image processing; the cropped files are static assets.

---

## Error / Edge Handling

- **`?art=` not in the pool:** ignored; falls back to `pickArt(guestName)`.
- **No guest, no art param:** random pool element (varies each load) — acceptable for an un-personalized preview link.
- **Missing art file at runtime:** the art window already layers the art over the guild gradient (`url(...), gradient`), so a failed image degrades to the gradient rather than a blank box.
- **Empty pool:** `ART_POOL` is a committed constant of 5 entries, so `pickArt` may assume it is non-empty; no empty-pool branch is needed.

---

## Testing

`__tests__/lib/art.test.ts` (new):
- `ART_POOL` is non-empty and every entry is a `/images/art/…` path.
- `pickArt('Brayan')` equals `pickArt('Brayan')` (deterministic).
- Different seeds can produce different results (assert the function spans more than one pool entry across a set of seeds — not that any two specific seeds differ).
- `pickArt()` with no seed returns a pool member.

`__tests__/components/CardFront.test.tsx` (extend):
- With `artUrl="/images/art/art2.jpg"`, the rendered art element's `background-image` references `art2.jpg`.
- Without `artUrl`, it references the config art (`cake-art.svg`).

`__tests__/components/MtgCard.test.tsx` (extend):
- `artUrl` passes through (a card rendered with `artUrl` surfaces that path in the DOM).

All existing 51 tests remain green (the new prop is optional and defaulted).

Note: asserting the cropped JPGs "look right" is a visual judgment made during the cropping step (view output, adjust), not a unit test.

---

## Files

**New:**
- `public/images/art/art1.jpg … art5.jpg` (cropped, enhanced)
- `src/lib/art.ts`
- `__tests__/lib/art.test.ts`

**Modified:**
- `src/components/CardFront.tsx` (+ optional `artUrl`)
- `src/components/MtgCard.tsx` (+ optional `artUrl`, pass-through)
- `src/app/invite/page.tsx` (compute + pass `artUrl`, accept `?art=`)
- `src/app/page.tsx` (vary gallery art)
- `__tests__/components/CardFront.test.tsx`, `__tests__/components/MtgCard.test.tsx` (art assertions)

**Unchanged:** the frame, flip, back, RSVP, maps, color system, `config.ts`, `cake-art.svg` (still the default fallback).

---

## Out of Scope

- Photoreal frame rebuild (frame/flip stay as-is).
- Generating or sourcing new art beyond cropping the five provided.
- Runtime image processing or an upload UI.
- Per-guild art mapping (selection is by guest, not color).
