# Example-Faithful Cards — Design Spec

**Date:** 2026-06-10
**Project:** magic-birthday-invitation
**Builds on:** `2026-06-10-random-card-art-design.md`, `2026-06-10-card-flip-realism-design.md`

---

## Goal

Make each invitation card read like a real Magic card modeled on the user's five example birthday cards: an English MTG **title**, **type line**, **mana cost**, and **flavor** drawn from the source example, in that example's **color identity**, with the **birthday date/time/venue** carried in the text box. The back is the **exact** Magic card-back image.

Decisions locked in brainstorming:
- **Front = Hybrid:** example's English title + type + art + flavor; the text box holds the personalized Spanish party details + guest.
- **Colors = B2:** each pool card carries its source example's color identity (mono/gold/artifact). This **replaces the 10-guild color randomizer for the front**.
- **Back = C1:** embed the real `Magic_the_gathering-card_back.jpg` as the back face (pixel-exact, logo font included).
- **Fonts:** closest free Beleren/Plantin stand-ins for the front; the embedded JPG gives the back's logo font exactly. Real Magic/Beleren fonts are proprietary and not bundled.

---

## Card Pool — `src/lib/cards.ts`

Replaces the art-only pool (`src/lib/art.ts`) with a richer card identity. Each entry pairs one cropped art with its example's text and colors.

```ts
import type { ColorCode } from '@/lib/colors'

/** A mana-cost token: a number = generic mana, a ColorCode = a colored pip. */
export type CostToken = number | ColorCode

export interface CardIdentity {
  id: string
  art: string          // /images/art/artN.jpg
  title: string        // English, e.g. "Birthday Cake"
  typeLine: string     // English, e.g. "Sorcery"
  cost: CostToken[]    // mana cost, left→right
  colors: ColorCode[]  // color identity → drives the frame ([] = colorless/artifact)
  flavor: string       // English flavor line (curated from the example's joke text)
}
```

The five entries (curated; final wording confirmable at spec review):

| id | art | title | typeLine | cost | colors | flavor |
|----|-----|-------|----------|------|--------|--------|
| `cake` | art1 | Birthday Cake | Artifact — Cake | `[2]` | `[]` | "Even the Multiverse stops for cake." |
| `wish` | art2 | Happy Birthday | Sorcery | `[2,'u']` | `['u']` | "Youth is a gift of nature; age, a work of art." |
| `make-a-wish` | art3 | Happy Birthday! | Sorcery | `[1,'g']` | `['g']` | "Make your wish before the candles win." |
| `party` | art4 | Birthday Party | Sorcery | `[4,'b','b']` | `['b']` | "A spell you may cast but once a year." |
| `lets-party` | art5 | Let's Party | Enchantment | `['w','u','b','r','g']` | `['w','u','b','r','g']` | "Whenever a guest celebrates, the party was a success." |

`pickCard(seed?: string | null): CardIdentity` — deterministic from the guest name (same hash approach as the current `pickArt`), random when no seed. `CARD_POOL` is a non-empty constant. An optional `?card=<id>` override is honored only when the id is in the pool.

`src/lib/art.ts` is removed; its `pickArt`/`ART_POOL` responsibilities move here. (The cropped `public/images/art/artN.jpg` files stay.)

---

## Frame System — `src/lib/frames.ts`

The front frame is now derived from a card's color identity rather than a guild. One function:

```ts
import type { ColorCode } from '@/lib/colors'

export interface FrameStyle {
  frameGradient: string  // outer colored frame
  barColor: string       // name bar / type line background
  barInk: string         // readable text color on the bar (via readableOn)
}

export function frameFor(colors: ColorCode[]): FrameStyle
```

Rules:
- **0 colors → Artifact:** brushed-silver/steel gradient, grey bar.
- **1 color → Mono frame** for W/U/B/R/G, built from that color's canonical tone (reuses `mana.ts` pip colors, darkened for the frame).
- **2+ colors → Gold (multicolor):** the classic gold/tan multicolor frame.

`barInk` uses the existing `readableOn` helper so text stays legible. This is the only new color logic; `colors.ts` GUILDS / `getGuild` / `randomGuildCode` are no longer used by the front (see "Removed/Changed").

---

## CardFront (refactor)

`CardFront` stops taking `guild`/`artUrl` and takes the card identity instead:

```ts
interface CardFrontProps {
  card: CardIdentity
  config: PartyConfig
  guestName?: string
}
```

Layout (top→bottom), same MTG anatomy as today but example-faithful:
- **Name bar:** `card.title` (English) on the left; **mana cost** on the right — `card.cost` rendered left→right, generic numbers as a grey numeric pip, colors via `ManaSymbol`.
- **Art window:** `card.art` (keeps `data-testid="card-art"`, `cover`).
- **Type line:** `card.typeLine` (English) + the set symbol (🎂).
- **Text box (parchment, Spanish — the birthday data):**
  - `{config.birthday.age}° Cumpleaños de {config.birthday.name}` (bold)
  - 📅 date · ⏰ time · 📍 venue · address
  - `✨ Invitado especial: {guestName}` when present
  - divider, then the **flavor** line `card.flavor` (English, italic).
- **Collector line:** `Ilustración • {config.birthday.name}` and the card `id`/title.
- **No Power/Toughness badge** — these card types (Sorcery/Artifact/Enchantment) have none; removing it is more faithful. The age lives in the text box instead.

Frame styling comes from `frameFor(card.colors)`. Color-contrast helpers (`readableOn`) stay in `@/lib/contrast`.

**New: generic mana pip.** `ManaSymbol` gains a sibling for generic cost (`<GenericPip value={2} />`): a grey beveled circle with the number, matching MTG's generic mana. Colored pips keep using `ManaSymbol`. A small `ManaCost` helper renders a `CostToken[]`.

---

## CardBack (embed exact JPG)

`Magic_the_gathering-card_back.jpg` (267×373, aspect 0.716 — matches the card ratio) is copied to `public/images/card-back.jpg`. `CardBack` becomes a thin component rendering it to fill the face:

```tsx
export function CardBack() {
  return (
    <div
      className="h-full w-full rounded-[14px] bg-center bg-cover"
      style={{ backgroundImage: 'url(/images/card-back.jpg)' }}
      aria-label="Reverso de la carta Magic: The Gathering"
      role="img"
    />
  )
}
```

The prior CSS/SVG recreation (logo, oval, rivets, color wheel, Deckmaster markup) is removed. Tests that asserted "Magic: The Gathering"/"Deckmaster" text become an image/`aria-label` assertion.

---

## Fonts

- **Back:** exact — baked into the embedded JPG.
- **Front title/type:** keep **Cinzel** (the project's deliberate Beleren stand-in) as the closest freely-hostable match; **EB Garamond** for the body/flavor (Plantin/Goudy stand-in) — both already loaded in `layout.tsx`.
- **Honest note:** the real **Beleren** (card names/types) and the **Magic logo** font are proprietary and cannot be legally bundled. If the user supplies a Beleren font file, it drops into `public/fonts/` and wires through `layout.tsx` as a CSS variable for an exact front match. This is an optional follow-up, not part of this spec's scope.

---

## Selection & Wiring

- **`invite/page.tsx`:** `const card = (params.card && CARD_POOL.find(c => c.id === params.card)) || pickCard(guestName || null)`. Pass `card` to `MtgCard`. `searchParams` gains `card?: string` and drops reliance on `colors`/`guild` for the front. The `?colors=` param is no longer used for the front; remove guild lookup.
- **`MtgCard`:** props become `{ card: CardIdentity; config: PartyConfig; guestName?: string }`; forwards `card` to `CardFront`. Flip + `div[role=button]` + keyboard handling unchanged. The guild-glow on the wrapper uses `frameFor(card.colors)` or the first color.
- **`page.tsx` (gallery):** map `CARD_POOL` (the 5 cards) instead of the 10 guilds; label each by title.
- **RSVP:** `RsvpForm` currently receives `guildCode` and stores it as `colors`. Change to pass `card.id`; the Supabase `colors` column now stores the card id (still a short string — no schema change required). `invite/page.tsx` passes `card.id`.

---

## Removed / Changed

- **Removed:** `src/lib/art.ts` (superseded by `cards.ts`); the CSS/SVG card-back internals in `CardBack.tsx`.
- **No longer used by the front:** `colors.ts` GUILDS, `getGuild`, `randomGuildCode`. The `ColorCode` type and `mana.ts` stay (used by pips/frames). If GUILDS becomes fully unused after wiring, it is deleted; if anything still imports it, it stays. (Implementation determines this; the plan will check imports.)
- **Kept:** flip, `MtgCard` interaction, `ManaSymbol`, `contrast.ts`, RSVP flow/route, map, the cropped `artN.jpg` files, `config/party.json` (party data).

---

## Data Flow

`guestName` → `pickCard(guestName)` (or `?card=`) → `card: CardIdentity` → `MtgCard` → `CardFront` (title/type/cost/art/flavor + `frameFor(card.colors)`) and to `RsvpForm` as `card.id`. Party details come from `config` (PartyConfig) as before. Back is a static image.

---

## Testing

- **`cards.ts`:** `CARD_POOL` non-empty; every entry has art/title/typeLine/cost/colors/flavor; `pickCard` deterministic per seed, varies across seeds, random/fallback with no seed; `?card=` resolution (valid id resolves, bogus id falls back).
- **`frames.ts`:** `frameFor([])` → artifact style; `frameFor(['u'])` → a mono style; `frameFor(['w','u','b','r','g'])` → gold style; `barInk` is a readable color.
- **`CardFront`:** renders `card.title`, `card.typeLine`, `card.flavor`; shows party `venue`/date from config; shows the guest line when provided; the art window (`data-testid="card-art"`) uses `card.art`; renders the colored pips for `card.colors` and a generic pip for numeric cost; no P/T badge.
- **`CardBack`:** renders an element with the card-back image / `role="img"` + Spanish `aria-label` (replaces the old text assertions).
- **`MtgCard`:** content present (title/type), flip still toggles `aria-pressed`, passes `card` through.
- **Gallery/RSVP:** existing RSVP route tests unaffected (still stores a short `colors` string — now the card id).
- Remove/replace obsolete tests tied to `art.ts`, guild-based `CardFront`/`MtgCard` props, and the old CSS `CardBack` text.

---

## Out of Scope

- Bundling proprietary Beleren / Magic-logo fonts (optional user-supplied follow-up).
- Power/Toughness or creature cards.
- Re-cropping the art or sourcing new images.
- Changing the RSVP schema, map, or party-config mechanism.
- Per-card unique frame artwork beyond the mono/gold/artifact gradients.
