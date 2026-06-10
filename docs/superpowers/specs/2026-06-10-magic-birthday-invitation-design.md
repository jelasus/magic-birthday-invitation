# Magic Birthday Invitation — Design Spec

**Date:** 2026-06-10
**Project:** magic-birthday-invitation
**Birthday:** Brayan, 28 años

---

## Overview

A Next.js web application that serves as a birthday party invitation styled after Magic: The Gathering trading cards. Each guest receives a personalized link that renders the invitation card in a unique 2-color MTG combo. The page is fully in Spanish, config-driven, and includes an RSVP mechanism backed by Supabase.

---

## Pages

### Home (`/`)
A gallery page showcasing the invitation card rendered in all 10 possible 2-color combinations (the 10 MTG guilds). This serves as a visual showcase of the theme and lets the host preview how each personalized link looks before sending.

### Invite (`/invite?guest=Alice&colors=ub`)
The personalized invitation page. Two URL parameters drive the experience:
- `guest`: the guest's name — pre-fills the RSVP form
- `colors`: a 2-letter code for the MTG color combo (e.g. `ub` = Dimir, `rg` = Gruul)

If `colors` is absent, the page picks a random combo. The page contains:
1. The MTG-styled invitation card
2. An embedded Google Maps iframe for the venue
3. The RSVP form

---

## MTG Color System

MTG has 5 colors: W (Blanco), U (Azul), B (Negro), R (Rojo), G (Verde).  
There are 10 possible 2-color combinations (guilds):

| Code | Guild | Colors |
|------|-------|--------|
| `wu` | Azorius | Blanco / Azul |
| `wb` | Orzhov | Blanco / Negro |
| `wr` | Boros | Blanco / Rojo |
| `wg` | Selesnya | Blanco / Verde |
| `ub` | Dimir | Azul / Negro |
| `ur` | Izzet | Azul / Rojo |
| `ug` | Simic | Azul / Verde |
| `br` | Rakdos | Negro / Rojo |
| `bg` | Golgari | Negro / Verde |
| `rg` | Gruul | Rojo / Verde |

Each guild has a canonical color palette (frame gradient, mana symbol colors) defined in `src/lib/colors.ts`.

---

## MTG Card Design

The card faithfully mimics the layout of a real MTG card. All text is in Spanish.

| Element | Value |
|---------|-------|
| **Nombre** | Celebración del 28 Cumpleaños de Brayan |
| **Coste de maná** | Two mana symbols in the guest's assigned colors |
| **Marco** | Dual-color gradient from `src/lib/colors.ts` for the assigned guild |
| **Arte** | Large illustration area — configurable via `card.artImageUrl` in `party.json` |
| **Línea de tipo** | `Conjuro Legendario — Celebración` |
| **Caja de texto** | Party details: date, time, venue name, address (from `party.json`) |
| **Texto de ambientación** | *"Incluso el Multiverso se detiene por el pastel."* (configurable) |
| **Fuerza/Resistencia** | `28 / ∞` |
| **Símbolo de edición** | 🎂 (configurable) |

---

## Config File

All party-specific content lives in `config/party.json`. This file is **committed to the repo with random/fake data** — it contains no real party information. The real values are set via the `PARTY_CONFIG` environment variable in Vercel at deploy time (see Deployment section).

`config/party.json` (committed, contains fake data only):

```json
{
  "birthday": {
    "name": "Gandalf",
    "age": 2019,
    "flavorText": "Incluso el Multiverso se detiene por el pastel."
  },
  "party": {
    "date": "Sábado, 1 de enero de 2000",
    "time": "00:00 hrs",
    "venue": "La Comarca",
    "address": "Bolsón Cerrado 1, La Comarca, Tierra Media",
    "mapsEmbedUrl": "https://maps.google.com/embed?pb=0"
  },
  "card": {
    "artImageUrl": "/images/card-art.jpg",
    "setSymbol": "🎂"
  }
}
```

---

## RSVP — Supabase

### Supabase Table: `rsvps`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Auto-generated primary key |
| `guest_name` | text | Pre-filled from `?guest=` URL param |
| `attending` | boolean | `true` = asiste, `false` = no asiste |
| `message` | text | Mensaje opcional para Brayan |
| `colors` | text | Color combo assigned to this guest (e.g. `ub`) |
| `created_at` | timestamp | Auto-generated |

### Flow
1. Guest opens personalized link — `guest` and `colors` are read from the URL
2. RSVP form is pre-filled with guest name; guest selects attendance and optionally writes a message
3. Form submits via POST to `/api/rsvp`
4. Next.js API route validates input and writes a row to Supabase
5. Page replaces the form with a confirmation message: *"¡Tu respuesta ha sido registrada!"*

The host views all RSVPs in the Supabase dashboard table view — no custom admin page is needed.

---

## Project Structure

```
magic-birthday-invitation/
├── config/
│   └── party.json                  # Committed with fake data — real data set via PARTY_CONFIG env var
├── src/
│   ├── app/
│   │   ├── page.tsx                # Gallery page — all 10 color combos
│   │   ├── invite/
│   │   │   └── page.tsx            # Personalized invite (?guest=&colors=)
│   │   └── api/
│   │       └── rsvp/
│   │           └── route.ts        # POST endpoint → Supabase insert
│   ├── components/
│   │   ├── MtgCard.tsx             # Card layout + color-aware frame
│   │   ├── RsvpForm.tsx            # Attendance form (client component)
│   │   └── MapEmbed.tsx            # Google Maps iframe wrapper
│   └── lib/
│       ├── colors.ts               # Guild definitions: name, hex palette, mana symbols
│       ├── config.ts               # Reads PARTY_CONFIG env var (prod) or party.json (dev)
│       └── supabase.ts             # Supabase client (uses env vars)
├── public/
│   └── images/
│       └── card-art.jpg            # Default card art — replace with custom image
└── .env.local                      # SUPABASE_URL, SUPABASE_ANON_KEY — never committed
```

---

## Deployment — Vercel

Since `config/party.json` is gitignored, party details are passed to Vercel as a single environment variable `PARTY_CONFIG` containing the full JSON string. A `src/lib/config.ts` helper reads from `PARTY_CONFIG` in production and falls back to `config/party.json` in local development — no other code needs to know the difference.

**Steps:**
1. Push the repository to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → import the repo
3. In **Environment Variables**, add:
   - `SUPABASE_URL` — from your Supabase project settings → API
   - `SUPABASE_ANON_KEY` — from the same page
   - `PARTY_CONFIG` — paste the full contents of your local `config/party.json` as a JSON string
4. Click **Deploy** — Vercel auto-detects Next.js, no config needed
5. Every `git push` to `main` triggers an automatic redeploy

### Supabase Setup (one-time)
1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. In the SQL editor, run:
```sql
create table rsvps (
  id uuid default gen_random_uuid() primary key,
  guest_name text not null,
  attending boolean not null,
  message text,
  colors text,
  created_at timestamp with time zone default now()
);
```
4. Copy `Project URL` and `anon public` key from Settings → API

---

## Generating Guest Links

For each guest, the host constructs a URL with their name and a chosen (or random) color combo:

```
https://your-domain.vercel.app/invite?guest=Alice&colors=ub
https://your-domain.vercel.app/invite?guest=Carlos&colors=rg
https://your-domain.vercel.app/invite?guest=María&colors=wr
```

These links can be shared via WhatsApp, email, or any messaging platform.

---

## Error Handling

- Missing `colors` param → random guild assigned client-side
- Missing `guest` param → RSVP form shows empty name field
- Supabase insert failure → API returns 500, form shows Spanish error: *"Ocurrió un error. Por favor intenta de nuevo."*
- Duplicate RSVP (same guest name) → allowed; last submission is visible in dashboard

---

## Out of Scope

- Admin dashboard (Supabase table view is sufficient)
- Email notifications on RSVP
- Authentication
- Multiple events / multi-tenant support
