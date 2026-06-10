# Card Flip + Realism Overhaul — Design Spec

**Date:** 2026-06-10
**Project:** magic-birthday-invitation
**Builds on:** `2026-06-10-magic-birthday-invitation-design.md`

---

## Goal

Make the invitation card look and feel like a real Magic: The Gathering card:

1. **Flip interaction** — the card loads on its personalized front; clicking/tapping flips it to reveal the **authentic Magic card back** (logo, color wheel, "Deckmaster"). Clicking again flips back.
2. **Front realism overhaul** — refined frame proportions, real vector mana symbols, parchment/leather textures, and a custom cake illustration as the default art.
3. **Custom assets** — author all icons/textures as vector (SVG / procedural SVG). No dependency on copyrighted binary scans; no binary PNGs committed.

Decisions locked during brainstorming:
- Flip: **starts front, click to peek the back.**
- Back: **faithful — keep the "Deckmaster" wordmark.**
- Scope: **full front realism overhaul + flip + authentic back.**

---

## Component Architecture

`MtgCard` currently is a single server-renderable component. It becomes a **client component** (flip needs local state) and is split into focused pieces:

| File | Responsibility | Props |
|------|----------------|-------|
| `src/components/MtgCard.tsx` | Flip container + interaction. Holds `flipped` state, perspective/3D transform, keyboard + `aria-pressed`, `prefers-reduced-motion`. Composes the two faces. | `guild`, `config`, `guestName?` |
| `src/components/CardFront.tsx` | Overhauled front face (current content, refined). | `guild`, `config`, `guestName?` |
| `src/components/CardBack.tsx` | Authentic Magic back as inline SVG. Static. | none |
| `src/components/ManaSymbol.tsx` | One vector mana pip (W/U/B/R/G) in its canonical color. | `code`, `size?` |
| `src/lib/mana.ts` | Maps color code → `{ label, color, symbol }` (canonical mana color + which glyph to draw). | — |

**Why split:** the current file mixes layout, color math, and a sub-component. The flip adds a second face and interaction. Splitting keeps each face independently understandable and testable, and keeps files small enough to edit reliably.

Both faces render in the DOM at once (CSS 3D flip), so existing front-content tests keep passing. `MtgCard` is reused unchanged on both the invite page and the 10-card gallery; each card flips independently.

Color helpers currently inside `MtgCard` (`hexLuminance`, `readableOn`) move with the front content into `CardFront` (or a tiny shared `src/lib/contrast.ts` if both faces need them — the back does not, so they live in `CardFront`).

---

## The Flip

Standard CSS 3D flip:

- Outer wrapper: `perspective: ~1200px`, fixed card dimensions.
- Inner `.flipper`: `transform-style: preserve-3d`, `transition: transform 600ms`.
- `.front` / `.back`: `position: absolute`, `inset: 0`, `backface-visibility: hidden`. Back pre-rotated `rotateY(180deg)`.
- Flipped state toggles `transform: rotateY(180deg)` on the flipper.

**Dimensions:** the card adopts the real MTG aspect ratio **2.5 × 3.5 in ≈ 0.714**. Width stays ~330px → height ~462px. Both faces share these exact dimensions so they register during the spin.

**Interaction & a11y:**
- Wrapper is a real `<button type="button">` (or `role="button"` div) labeled in Spanish (e.g. `aria-label="Voltear la carta"`), with `aria-pressed={flipped}`.
- Click and Enter/Space flip.
- A small persistent hint ("toca para ver el reverso ↻") and/or a corner flip affordance.
- `prefers-reduced-motion: reduce` → no spin; instant face swap (`transition: none`).

CSS for the flip lives in `globals.css` as small utility classes (`.card-flip`, `.card-flip--flipped`, `.card-face`, etc.) plus a reduced-motion media query. Per-guild colors stay inline.

---

## Front Realism Overhaul

Layout follows real modern-frame anatomy, top to bottom, inside a black card-stock border with rounded corners:

1. **Black border** — the card stock edge; rounded corners (~14px outer).
2. **Beveled guild-gradient inner frame** — dual-color gradient from `colors.ts`, with inset bevel highlights/shadows.
3. **Title bar** — card name (`Celebración del {age}° Cumpleaños de {name}`) on the left; **mana cost** on the right rendered with `ManaSymbol` (real vector pips, not letters).
4. **Art window** — framed, inset-shadowed; **custom cake illustration** by default (`/images/cake-art.svg`), still overridable via `card.artImageUrl`.
5. **Type line** — `Conjuro Legendario — Celebración` on the left; **set symbol** (🎂 / vector) on the right, rarity-tinted (gold/mythic feel).
6. **Text box (parchment)** — party details (date / time / venue / address) with small glyphs; hairline divider; **italic flavor text**.
7. **Collector line** — `Ilustración • {name}` and `{guild.name} · {code}`.
8. **Power/Toughness badge** — bottom-right, `{age}/∞`.

**Mana symbols** (`ManaSymbol.tsx`): recognizable vector glyphs in canonical mana colors —
W = sun (off-white `#FFFBD5`), U = water droplet (blue `#AAE0FA`), B = skull (black `#CBC2BF`), R = flame (red `#F9AA8F`), G = tree (green `#9BD3AE`) — each on a beveled circular pip. Each pip carries an `aria-label` (e.g. "maná azul").

**Textures:** procedural **SVG `feTurbulence`** filters used as CSS/SVG backgrounds — a fine parchment grain on the text box and a faint leather grain on the frame. No binary PNGs. Defined once (inline SVG `<defs>` or a small reusable snippet) and referenced by both faces where needed.

---

## Authentic Back (custom asset)

`CardBack.tsx` returns an inline SVG sized to the card, recreating the real back:

- **Field:** dark-brown leather-tome background, rounded corners matching the front.
- **Border:** ornate filigree frame with **four red rivets** near the corners.
- **Center:** lighter-brown **oval** panel.
- **Logo:** the **blue "Magic: The Gathering"** wordmark (recreated as styled SVG text/paths in the classic blue, layered look).
- **Color wheel:** the **five mana pips (W/U/B/R/G)** arranged in a ring (reuses `ManaSymbol`).
- **Bottom:** **"Deckmaster"** wordmark.

Authored as inline SVG (not an `<img>`) for crispness, theming, and self-containment.

**Trademark note:** this reproduces Wizards of the Coast's trademarked card back and logo. Acceptable here because the project is a **private, non-commercial birthday invitation** (explicit user request). Documented so the decision is intentional, not accidental.

---

## Assets To Create (all vector, authored in-repo)

| Asset | Form | Notes |
|-------|------|-------|
| Cake art | `public/images/cake-art.svg` | Layered birthday cake (tiers, candles+flames, drips, plate). Becomes the default `card.artImageUrl` in `config/party.json`. |
| Card back | inline SVG in `CardBack.tsx` | Full authentic back. |
| Mana symbols (×5) | inline SVG in `ManaSymbol.tsx` | W/U/B/R/G pips. |
| Set symbol | inline SVG / emoji | 🎂 default, vector optional. |
| Textures | procedural SVG `feTurbulence` | Parchment + leather grain. No binary files. |

`config/party.json` updated: `card.artImageUrl` → `/images/cake-art.svg`. (The committed file already holds fake data; real data comes from `PARTY_CONFIG` env var.)

---

## Data Flow

Unchanged from the base design: `guild` + `config` + `guestName` flow into `MtgCard`, which passes them to `CardFront`. `CardBack` is static. `flipped` is local `useState` in `MtgCard`. No new network or server work.

---

## Error / Edge Handling

- **Missing/oversized art image:** art window falls back to the guild gradient behind the (possibly failing) image, as today. Cake SVG is the committed default, so the common path always has art.
- **Reduced motion:** flip becomes an instant swap; no functionality lost.
- **Long names / guest names:** title bar and guest line clamp/wrap as today; fixed card height means very long text truncates with ellipsis rather than breaking the aspect ratio.
- **Server rendering:** `MtgCard` is `'use client'`; faces render server-side too (content present for SEO/tests), interactivity hydrates on the client.

---

## Testing

Keep every existing `MtgCard` assertion (front text: name, age, date/time/venue, type line, flavor, guest name, P/T) — both faces are in the DOM, so these pass unchanged.

Add:
- **Flip:** clicking the card (and pressing Enter) toggles `aria-pressed` / the flipped class.
- **Back content:** `CardBack` renders "Magic: The Gathering" and "Deckmaster".
- **Mana symbols:** `MtgCard` / `CardFront` renders the guild's two mana pips (asserted via `aria-label`).
- New `__tests__/components/CardBack.test.tsx`.
- Reduced-motion path need not be unit-tested (CSS-only); covered by manual check.

Existing `colors.test.ts`, `config.test.ts`, `RsvpForm`, `MapEmbed` tests are unaffected.

---

## Out of Scope

- Changing the RSVP flow, Supabase, maps, routing, or config mechanism.
- Real holofoil/animated shaders.
- Multiple art slots or per-guest art.
- Replacing the title/type-line wording (stays as in the base spec).

---

## Files Touched (summary)

**New:** `CardFront.tsx`, `CardBack.tsx`, `ManaSymbol.tsx`, `src/lib/mana.ts`, `public/images/cake-art.svg`, `__tests__/components/CardBack.test.tsx`.
**Modified:** `MtgCard.tsx` (→ flip container, `'use client'`), `globals.css` (flip + texture utilities), `config/party.json` (cake art), `__tests__/components/MtgCard.test.tsx` (flip + mana assertions).
**Unchanged:** `colors.ts`, `config.ts`, invite/gallery pages (consume `MtgCard` as before), RSVP/maps.
