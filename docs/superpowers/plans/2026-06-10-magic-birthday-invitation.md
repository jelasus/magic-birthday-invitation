# Magic Birthday Invitation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js birthday invitation web app with MTG theming, 10 personalized 2-color guild links, embedded Google Maps, Supabase RSVP, and all UI strings in Spanish.

**Architecture:** Two pages (`/` gallery, `/invite` personalized invite) plus one API route (`POST /api/rsvp`). Party details are read from `PARTY_CONFIG` env var in production, falling back to `config/party.json` (committed with fake data) in development. Guest identity and color combo are encoded in the URL as `?guest=Name&colors=ub`.

**Tech Stack:** Next.js 15 (App Router, TypeScript), Tailwind CSS, @supabase/supabase-js, Jest + React Testing Library, Cinzel + IM Fell English (Google Fonts)

---

## File Map

| File | Responsibility |
|------|----------------|
| `config/party.json` | Fake party data — committed to public repo |
| `src/lib/colors.ts` | 10 guild definitions: frame gradients, mana colors, border colors |
| `src/lib/config.ts` | Reads `PARTY_CONFIG` env var or falls back to `party.json` |
| `src/lib/supabase.ts` | Supabase client singleton |
| `src/app/api/rsvp/route.ts` | POST: validates input and inserts RSVP row into Supabase |
| `src/components/MtgCard.tsx` | Full MTG card layout: name bar, art, type line, text box, P/T |
| `src/components/MapEmbed.tsx` | Google Maps iframe wrapper |
| `src/components/RsvpForm.tsx` | Client component: form with attending toggle, optimistic submit |
| `src/app/invite/page.tsx` | Reads `?guest` + `?colors`, renders card + map + RSVP form |
| `src/app/page.tsx` | Gallery: all 10 guilds + link generator instructions |
| `src/app/layout.tsx` | Root layout: Google Fonts, Spanish lang, metadata |
| `src/app/globals.css` | Tailwind base + card font CSS variables |

---

### Task 1: Bootstrap Next.js project and configure Jest

**Files:**
- Create: `jest.config.ts`
- Create: `jest.setup.ts`
- Modify: `package.json` (test scripts)
- Create: `.env.local`

- [ ] **Step 1: Scaffold the project**

Run inside `/home/sadrac/magic-birthday-invitation`:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias --yes
```

Expected: Next.js project scaffolded, dependencies installed.

- [ ] **Step 2: Install additional dependencies**

```bash
npm install @supabase/supabase-js
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest
```

- [ ] **Step 3: Create jest.config.ts**

```typescript
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const customConfig: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}

export default createJestConfig(customConfig)
```

- [ ] **Step 4: Create jest.setup.ts**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Add test scripts to package.json**

In `package.json`, add to `"scripts"`:

```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 6: Create .env.local**

```
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

Replace with real values from your Supabase project → Settings → API.

- [ ] **Step 7: Verify .gitignore covers sensitive files**

Open `.gitignore` (created by create-next-app). Confirm it contains:

```
.env*.local
```

If not, add it.

- [ ] **Step 8: Verify Jest works with a smoke test**

Create `__tests__/smoke.test.ts`:

```typescript
test('jest is configured', () => {
  expect(true).toBe(true)
})
```

Run:

```bash
npm test
```

Expected: `PASS __tests__/smoke.test.ts` — 1 test passed.

- [ ] **Step 9: Delete smoke test and commit**

```bash
rm __tests__/smoke.test.ts
git add -A
git commit -m "chore: bootstrap Next.js project with Jest and Supabase"
```

---

### Task 2: Color system

**Files:**
- Create: `src/lib/colors.ts`
- Create: `__tests__/lib/colors.test.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/lib/colors.test.ts`:

```typescript
import { getGuild, randomGuildCode, GUILDS } from '@/lib/colors'

describe('GUILDS', () => {
  it('has exactly 10 guilds', () => {
    expect(Object.keys(GUILDS)).toHaveLength(10)
  })

  it('every guild has required properties', () => {
    Object.values(GUILDS).forEach(guild => {
      expect(guild.code).toBeTruthy()
      expect(guild.name).toBeTruthy()
      expect(guild.frameGradient).toContain('gradient')
      expect(guild.manaColors).toHaveLength(2)
      expect(guild.colors).toHaveLength(2)
      expect(guild.nameBarColor).toMatch(/^#/)
      expect(guild.textBoxColor).toMatch(/^#/)
      expect(guild.borderColor).toMatch(/^#/)
    })
  })
})

describe('getGuild', () => {
  it('returns the correct guild for a valid code', () => {
    expect(getGuild('ub').code).toBe('ub')
    expect(getGuild('ub').name).toBe('Dimir')
  })

  it('handles reversed color order: bu → ub', () => {
    expect(getGuild('bu').code).toBe('ub')
  })

  it('returns uppercase input: UB → ub', () => {
    expect(getGuild('UB').code).toBe('ub')
  })

  it('returns a valid fallback guild for an unknown code', () => {
    const guild = getGuild('xx')
    expect(Object.keys(GUILDS)).toContain(guild.code)
  })
})

describe('randomGuildCode', () => {
  it('returns a valid guild code', () => {
    expect(Object.keys(GUILDS)).toContain(randomGuildCode())
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --testPathPattern=colors
```

Expected: FAIL — `Cannot find module '@/lib/colors'`

- [ ] **Step 3: Create src/lib/colors.ts**

```typescript
export type ColorCode = 'w' | 'u' | 'b' | 'r' | 'g'
export type GuildCode = 'wu' | 'wb' | 'wr' | 'wg' | 'ub' | 'ur' | 'ug' | 'br' | 'bg' | 'rg'

export interface Guild {
  code: GuildCode
  name: string
  colors: [ColorCode, ColorCode]
  frameGradient: string
  nameBarColor: string
  textBoxColor: string
  manaColors: [string, string]
  borderColor: string
}

export const GUILDS: Record<GuildCode, Guild> = {
  wu: {
    code: 'wu', name: 'Azorius', colors: ['w', 'u'],
    frameGradient: 'linear-gradient(160deg, #EDE9D0 0%, #B8D4E8 55%, #4A90D9 100%)',
    nameBarColor: '#D4C9A8', textBoxColor: '#EEE8D5',
    manaColors: ['#F0ECE0', '#4A90D9'], borderColor: '#B8A878',
  },
  wb: {
    code: 'wb', name: 'Orzhov', colors: ['w', 'b'],
    frameGradient: 'linear-gradient(160deg, #EDE9D0 0%, #9C9C9C 55%, #2C2C2C 100%)',
    nameBarColor: '#C8C0A8', textBoxColor: '#E8E0D0',
    manaColors: ['#F0ECE0', '#3C3C3C'], borderColor: '#8C8C7C',
  },
  wr: {
    code: 'wr', name: 'Boros', colors: ['w', 'r'],
    frameGradient: 'linear-gradient(160deg, #EDE9D0 0%, #E8A870 55%, #C42B1C 100%)',
    nameBarColor: '#D4B090', textBoxColor: '#F0DCC8',
    manaColors: ['#F0ECE0', '#D4180C'], borderColor: '#C87840',
  },
  wg: {
    code: 'wg', name: 'Selesnya', colors: ['w', 'g'],
    frameGradient: 'linear-gradient(160deg, #EDE9D0 0%, #9CC890 55%, #2D7A40 100%)',
    nameBarColor: '#C8D4A8', textBoxColor: '#E0ECD8',
    manaColors: ['#F0ECE0', '#2D7A40'], borderColor: '#80A840',
  },
  ub: {
    code: 'ub', name: 'Dimir', colors: ['u', 'b'],
    frameGradient: 'linear-gradient(160deg, #2A4870 0%, #1A2A3C 55%, #0D0D0D 100%)',
    nameBarColor: '#1E3448', textBoxColor: '#162435',
    manaColors: ['#4A90D9', '#6C6C6C'], borderColor: '#2A4060',
  },
  ur: {
    code: 'ur', name: 'Izzet', colors: ['u', 'r'],
    frameGradient: 'linear-gradient(160deg, #3A6EA8 0%, #7A4898 55%, #C42B1C 100%)',
    nameBarColor: '#3A5078', textBoxColor: '#2C3C58',
    manaColors: ['#4A90D9', '#D4180C'], borderColor: '#4A5888',
  },
  ug: {
    code: 'ug', name: 'Simic', colors: ['u', 'g'],
    frameGradient: 'linear-gradient(160deg, #2A6090 0%, #2A7858 55%, #1A5030 100%)',
    nameBarColor: '#2A5848', textBoxColor: '#1E4838',
    manaColors: ['#4A90D9', '#2D7A40'], borderColor: '#305850',
  },
  br: {
    code: 'br', name: 'Rakdos', colors: ['b', 'r'],
    frameGradient: 'linear-gradient(160deg, #1C1C1C 0%, #581818 55%, #8B0000 100%)',
    nameBarColor: '#2C1818', textBoxColor: '#201010',
    manaColors: ['#6C6C6C', '#D4180C'], borderColor: '#580808',
  },
  bg: {
    code: 'bg', name: 'Golgari', colors: ['b', 'g'],
    frameGradient: 'linear-gradient(160deg, #1A1A1A 0%, #253018 55%, #1A3820 100%)',
    nameBarColor: '#202818', textBoxColor: '#181E10',
    manaColors: ['#6C6C6C', '#2D7A40'], borderColor: '#303818',
  },
  rg: {
    code: 'rg', name: 'Gruul', colors: ['r', 'g'],
    frameGradient: 'linear-gradient(160deg, #8B2500 0%, #6B4010 55%, #2D5020 100%)',
    nameBarColor: '#703018', textBoxColor: '#583018',
    manaColors: ['#D4180C', '#2D7A40'], borderColor: '#803820',
  },
}

export function getGuild(code: string): Guild {
  const normalized = code.toLowerCase()
  if (GUILDS[normalized as GuildCode]) return GUILDS[normalized as GuildCode]
  const reversed = (normalized[1] + normalized[0]) as GuildCode
  if (GUILDS[reversed]) return GUILDS[reversed]
  const codes = Object.keys(GUILDS) as GuildCode[]
  return GUILDS[codes[Math.floor(Math.random() * codes.length)]]
}

export function randomGuildCode(): GuildCode {
  const codes = Object.keys(GUILDS) as GuildCode[]
  return codes[Math.floor(Math.random() * codes.length)]
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern=colors
```

Expected: PASS — 6 tests passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/colors.ts __tests__/lib/colors.test.ts
git commit -m "feat: add MTG guild color system with 10 guilds"
```

---

### Task 3: Config system

**Files:**
- Create: `config/party.json`
- Create: `src/lib/config.ts`
- Create: `__tests__/lib/config.test.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/lib/config.test.ts`:

```typescript
import { getPartyConfig } from '@/lib/config'

describe('getPartyConfig', () => {
  const originalPartyConfig = process.env.PARTY_CONFIG

  afterEach(() => {
    if (originalPartyConfig === undefined) {
      delete process.env.PARTY_CONFIG
    } else {
      process.env.PARTY_CONFIG = originalPartyConfig
    }
  })

  it('reads from PARTY_CONFIG env var when set', () => {
    process.env.PARTY_CONFIG = JSON.stringify({
      birthday: { name: 'TestUser', age: 1, flavorText: 'Sabor.' },
      party: { date: '2000-01-01', time: '10:00', venue: 'TestVenue', address: 'Calle 1', mapsEmbedUrl: 'https://test.com' },
      card: { artImageUrl: '/test.jpg', setSymbol: '⭐' },
    })
    const config = getPartyConfig()
    expect(config.birthday.name).toBe('TestUser')
    expect(config.party.venue).toBe('TestVenue')
  })

  it('falls back to party.json when PARTY_CONFIG is not set', () => {
    delete process.env.PARTY_CONFIG
    const config = getPartyConfig()
    expect(config.birthday.name).toBeTruthy()
    expect(config.party.venue).toBeTruthy()
    expect(config.card.setSymbol).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --testPathPattern=config
```

Expected: FAIL — `Cannot find module '@/lib/config'`

- [ ] **Step 3: Create config/party.json**

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

- [ ] **Step 4: Create src/lib/config.ts**

```typescript
import partyJson from '../../config/party.json'

export type PartyConfig = typeof partyJson

export function getPartyConfig(): PartyConfig {
  if (process.env.PARTY_CONFIG) {
    return JSON.parse(process.env.PARTY_CONFIG) as PartyConfig
  }
  return partyJson
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test -- --testPathPattern=config
```

Expected: PASS — 2 tests passed.

- [ ] **Step 6: Commit**

```bash
git add config/party.json src/lib/config.ts __tests__/lib/config.test.ts
git commit -m "feat: add config system with PARTY_CONFIG env var override"
```

---

### Task 4: Supabase client and database setup

**Files:**
- Create: `src/lib/supabase.ts`

No unit test — the client is a one-liner wrapper; it gets covered by the RSVP route test via mocking.

- [ ] **Step 1: Create src/lib/supabase.ts**

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)
```

- [ ] **Step 2: Create the rsvps table in Supabase**

In the Supabase dashboard → SQL Editor, run:

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

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase.ts
git commit -m "feat: add Supabase client"
```

---

### Task 5: RSVP API route

**Files:**
- Create: `src/app/api/rsvp/route.ts`
- Create: `__tests__/api/rsvp.test.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/api/rsvp.test.ts`:

```typescript
import { POST } from '@/app/api/rsvp/route'
import { NextRequest } from 'next/server'

const mockInsert = jest.fn().mockResolvedValue({ error: null })
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnValue({ insert: mockInsert }),
  },
}))

function makeRequest(body: object): NextRequest {
  return new NextRequest('http://localhost/api/rsvp', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/rsvp', () => {
  beforeEach(() => {
    mockInsert.mockResolvedValue({ error: null })
  })

  it('returns 201 for a valid request', async () => {
    const res = await POST(makeRequest({ guest_name: 'Alice', attending: true, message: 'Estaré ahí', colors: 'ub' }))
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.success).toBe(true)
  })

  it('returns 400 when guest_name is missing', async () => {
    const res = await POST(makeRequest({ attending: true }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when attending is missing', async () => {
    const res = await POST(makeRequest({ guest_name: 'Alice' }))
    expect(res.status).toBe(400)
  })

  it('returns 500 when Supabase returns an error', async () => {
    mockInsert.mockResolvedValueOnce({ error: new Error('DB error') })
    const res = await POST(makeRequest({ guest_name: 'Alice', attending: false }))
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --testPathPattern=rsvp
```

Expected: FAIL — `Cannot find module '@/app/api/rsvp/route'`

- [ ] **Step 3: Create src/app/api/rsvp/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { guest_name, attending, message, colors } = body

  if (!guest_name || attending === undefined || attending === null) {
    return NextResponse.json(
      { error: 'Faltan campos requeridos.' },
      { status: 400 }
    )
  }

  const { error } = await supabase.from('rsvps').insert({
    guest_name: String(guest_name).trim(),
    attending: Boolean(attending),
    message: message ? String(message).trim() : null,
    colors: colors ? String(colors) : null,
  })

  if (error) {
    return NextResponse.json(
      { error: 'Ocurrió un error. Por favor intenta de nuevo.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern=rsvp
```

Expected: PASS — 4 tests passed.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/rsvp/route.ts __tests__/api/rsvp.test.ts
git commit -m "feat: add RSVP API route with Supabase insert"
```

---

### Task 6: MtgCard component

**Files:**
- Create: `src/components/MtgCard.tsx`
- Create: `__tests__/components/MtgCard.test.tsx`
- Create: `public/images/card-art.jpg` (placeholder)

- [ ] **Step 1: Write failing tests**

Create `__tests__/components/MtgCard.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MtgCard } from '@/components/MtgCard'
import { GUILDS } from '@/lib/colors'
import type { PartyConfig } from '@/lib/config'

const mockConfig: PartyConfig = {
  birthday: { name: 'Brayan', age: 28, flavorText: 'Texto de ambientación.' },
  party: { date: 'Sábado 1', time: '19:00', venue: 'El Lugar', address: 'Calle 123', mapsEmbedUrl: 'https://maps.test' },
  card: { artImageUrl: '/images/card-art.jpg', setSymbol: '🎂' },
}

describe('MtgCard', () => {
  it('renders the birthday person name', () => {
    render(<MtgCard guild={GUILDS.ub} config={mockConfig} />)
    expect(screen.getAllByText(/Brayan/).length).toBeGreaterThan(0)
  })

  it('renders the age', () => {
    render(<MtgCard guild={GUILDS.ub} config={mockConfig} />)
    expect(screen.getByText(/28/)).toBeInTheDocument()
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
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --testPathPattern=MtgCard
```

Expected: FAIL — `Cannot find module '@/components/MtgCard'`

- [ ] **Step 3: Create src/components/MtgCard.tsx**

```tsx
import type { Guild } from '@/lib/colors'
import type { PartyConfig } from '@/lib/config'

interface MtgCardProps {
  guild: Guild
  config: PartyConfig
  guestName?: string
}

export function MtgCard({ guild, config, guestName }: MtgCardProps) {
  const { birthday, party, card } = config

  return (
    <div
      className="relative w-[340px] rounded-2xl p-3 flex flex-col gap-2 select-none"
      style={{
        background: guild.frameGradient,
        border: `4px solid ${guild.borderColor}`,
        boxShadow: `0 0 30px ${guild.manaColors[0]}55, 0 12px 40px rgba(0,0,0,0.7)`,
      }}
    >
      {/* Name bar */}
      <div
        className="flex items-center justify-between rounded-lg px-3 py-1.5 gap-2"
        style={{ backgroundColor: guild.nameBarColor }}
      >
        <span className="font-bold text-xs text-gray-900 leading-tight font-[family-name:var(--font-cinzel)]">
          Celebración del {birthday.age}° Cumpleaños de {birthday.name}
        </span>
        <div className="flex gap-1 shrink-0">
          {guild.manaColors.map((color, i) => (
            <ManaSymbol key={i} color={color} letter={guild.colors[i].toUpperCase()} />
          ))}
        </div>
      </div>

      {/* Art box */}
      <div
        className="w-full h-44 rounded-lg overflow-hidden border-2"
        style={{
          borderColor: guild.borderColor,
          backgroundImage: `url(${card.artImageUrl}), ${guild.frameGradient}`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Type line */}
      <div
        className="flex items-center justify-between rounded-lg px-3 py-1 text-xs"
        style={{ backgroundColor: guild.nameBarColor }}
      >
        <span className="font-semibold text-gray-900 font-[family-name:var(--font-cinzel)]">
          Conjuro Legendario — Celebración
        </span>
        <span className="text-base">{card.setSymbol}</span>
      </div>

      {/* Text box */}
      <div
        className="rounded-lg p-3 space-y-1.5 text-xs font-[family-name:var(--font-im-fell)]"
        style={{ backgroundColor: guild.textBoxColor + 'F0' }}
      >
        <p className="font-semibold text-gray-800">📅 {party.date}</p>
        <p className="font-semibold text-gray-800">⏰ {party.time}</p>
        <p className="font-semibold text-gray-800">📍 {party.venue}</p>
        <p className="text-gray-600 text-[11px]">{party.address}</p>
        {guestName && (
          <p className="mt-2 font-bold text-amber-800">✨ Invitado especial: {guestName}</p>
        )}
        <p className="mt-2 italic text-gray-500 border-t border-gray-400 pt-2 text-[11px]">
          "{birthday.flavorText}"
        </p>
      </div>

      {/* Power/toughness */}
      <div
        className="absolute bottom-5 right-5 px-2 py-0.5 rounded text-xs font-black border-2"
        style={{
          backgroundColor: guild.nameBarColor,
          borderColor: guild.borderColor,
          color: '#1a1a1a',
          fontFamily: 'var(--font-cinzel)',
        }}
      >
        {birthday.age}/∞
      </div>
    </div>
  )
}

function ManaSymbol({ color, letter }: { color: string; letter: string }) {
  return (
    <div
      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border border-gray-500 shadow-sm"
      style={{
        backgroundColor: color,
        color: letter === 'B' ? '#d0d0d0' : '#1a1a1a',
      }}
    >
      {letter}
    </div>
  )
}
```

- [ ] **Step 4: Add a placeholder image**

```bash
mkdir -p public/images
```

Place any square image at `public/images/card-art.jpg`. If you don't have one, create an SVG placeholder:

```bash
cat > public/images/card-art.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e"/>
      <stop offset="100%" style="stop-color:#16213e"/>
    </linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#g)"/>
  <text x="200" y="140" font-family="serif" font-size="48" fill="#c9a84c" text-anchor="middle">✦</text>
  <text x="200" y="180" font-family="serif" font-size="16" fill="#c9a84c" text-anchor="middle">Magic Birthday</text>
</svg>
EOF
```

Then update `config/party.json` to point to the SVG: `"artImageUrl": "/images/card-art.svg"`

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test -- --testPathPattern=MtgCard
```

Expected: PASS — 8 tests passed.

- [ ] **Step 6: Commit**

```bash
git add src/components/MtgCard.tsx public/images/ config/party.json __tests__/components/MtgCard.test.tsx
git commit -m "feat: add MtgCard component with guild-themed styling"
```

---

### Task 7: MapEmbed component

**Files:**
- Create: `src/components/MapEmbed.tsx`
- Create: `__tests__/components/MapEmbed.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `__tests__/components/MapEmbed.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MapEmbed } from '@/components/MapEmbed'

describe('MapEmbed', () => {
  it('renders an iframe with the provided URL', () => {
    render(<MapEmbed url="https://maps.google.com/embed?pb=test" />)
    const iframe = screen.getByTitle('Ubicación de la fiesta')
    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveAttribute('src', 'https://maps.google.com/embed?pb=test')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --testPathPattern=MapEmbed
```

Expected: FAIL

- [ ] **Step 3: Create src/components/MapEmbed.tsx**

```tsx
interface MapEmbedProps {
  url: string
}

export function MapEmbed({ url }: MapEmbedProps) {
  return (
    <div className="w-full rounded-xl overflow-hidden border-2 border-gray-700 shadow-lg">
      <iframe
        src={url}
        width="100%"
        height="250"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Ubicación de la fiesta"
      />
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern=MapEmbed
```

Expected: PASS — 1 test passed.

- [ ] **Step 5: Commit**

```bash
git add src/components/MapEmbed.tsx __tests__/components/MapEmbed.test.tsx
git commit -m "feat: add MapEmbed component"
```

---

### Task 8: RsvpForm component

**Files:**
- Create: `src/components/RsvpForm.tsx`
- Create: `__tests__/components/RsvpForm.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `__tests__/components/RsvpForm.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RsvpForm } from '@/components/RsvpForm'

global.fetch = jest.fn()

function mockFetchSuccess() {
  ;(global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ success: true }),
  })
}

function mockFetchError() {
  ;(global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
    json: async () => ({ error: 'Ocurrió un error. Por favor intenta de nuevo.' }),
  })
}

describe('RsvpForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('pre-fills the guest name from props', () => {
    render(<RsvpForm guestName="Alice" guildCode="ub" />)
    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument()
  })

  it('submit button is disabled when attending is not selected', () => {
    render(<RsvpForm guestName="Alice" guildCode="ub" />)
    expect(screen.getByRole('button', { name: /Confirmar asistencia/ })).toBeDisabled()
  })

  it('submit button is enabled after selecting attending', async () => {
    const user = userEvent.setup()
    render(<RsvpForm guestName="Alice" guildCode="ub" />)
    await user.click(screen.getByRole('button', { name: /Sí, asistiré/ }))
    expect(screen.getByRole('button', { name: /Confirmar asistencia/ })).not.toBeDisabled()
  })

  it('shows success message after successful submission', async () => {
    mockFetchSuccess()
    const user = userEvent.setup()
    render(<RsvpForm guestName="Alice" guildCode="ub" />)
    await user.click(screen.getByRole('button', { name: /Sí, asistiré/ }))
    await user.click(screen.getByRole('button', { name: /Confirmar asistencia/ }))
    await waitFor(() =>
      expect(screen.getByText(/Tu respuesta ha sido registrada/)).toBeInTheDocument()
    )
  })

  it('shows error message after failed submission', async () => {
    mockFetchError()
    const user = userEvent.setup()
    render(<RsvpForm guestName="Alice" guildCode="ub" />)
    await user.click(screen.getByRole('button', { name: /Sí, asistiré/ }))
    await user.click(screen.getByRole('button', { name: /Confirmar asistencia/ }))
    await waitFor(() =>
      expect(screen.getByText(/Ocurrió un error/)).toBeInTheDocument()
    )
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --testPathPattern=RsvpForm
```

Expected: FAIL

- [ ] **Step 3: Create src/components/RsvpForm.tsx**

```tsx
'use client'

import { useState } from 'react'

interface RsvpFormProps {
  guestName: string
  guildCode: string
}

type FormState = 'idle' | 'loading' | 'success' | 'error'

export function RsvpForm({ guestName, guildCode }: RsvpFormProps) {
  const [name, setName] = useState(guestName)
  const [attending, setAttending] = useState<boolean | null>(null)
  const [message, setMessage] = useState('')
  const [state, setState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (attending === null) return
    setState('loading')
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guest_name: name, attending, message, colors: guildCode }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error || 'Ocurrió un error. Por favor intenta de nuevo.')
        setState('error')
      } else {
        setState('success')
      }
    } catch {
      setErrorMsg('Ocurrió un error. Por favor intenta de nuevo.')
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div className="bg-green-950 border border-green-600 rounded-xl p-6 text-center">
        <p className="text-3xl mb-2">🎉</p>
        <p className="text-green-300 font-bold text-lg">¡Tu respuesta ha sido registrada!</p>
        <p className="text-green-400 text-sm mt-1">Nos vemos en la fiesta</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-4">
      <div>
        <label className="block text-amber-300 text-sm font-medium mb-1">
          Tu nombre
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400"
          placeholder="Tu nombre completo"
        />
      </div>

      <div>
        <p className="text-amber-300 text-sm font-medium mb-2">¿Asistirás?</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setAttending(true)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-colors ${
              attending === true
                ? 'bg-green-800 border-green-500 text-white'
                : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-green-600'
            }`}
          >
            ✅ Sí, asistiré
          </button>
          <button
            type="button"
            onClick={() => setAttending(false)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-colors ${
              attending === false
                ? 'bg-red-950 border-red-600 text-white'
                : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-red-700'
            }`}
          >
            ❌ No podré
          </button>
        </div>
      </div>

      <div>
        <label className="block text-amber-300 text-sm font-medium mb-1">
          Mensaje para el festejado{' '}
          <span className="text-gray-500">(opcional)</span>
        </label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={3}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400 resize-none"
          placeholder="Escribe un mensaje..."
        />
      </div>

      {state === 'error' && (
        <p className="text-red-400 text-sm">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={state === 'loading' || attending === null}
        className="w-full py-3 bg-amber-700 hover:bg-amber-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-lg transition-colors"
      >
        {state === 'loading' ? 'Enviando...' : 'Confirmar asistencia'}
      </button>
    </form>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern=RsvpForm
```

Expected: PASS — 5 tests passed.

- [ ] **Step 5: Commit**

```bash
git add src/components/RsvpForm.tsx __tests__/components/RsvpForm.test.tsx
git commit -m "feat: add RsvpForm component with success/error states"
```

---

### Task 9: Invite page

**Files:**
- Create: `src/app/invite/page.tsx`

No dedicated unit test — this page is a thin composition of already-tested components. Verify visually in the browser (Task 11).

- [ ] **Step 1: Create src/app/invite/page.tsx**

```tsx
import { getGuild, randomGuildCode } from '@/lib/colors'
import { getPartyConfig } from '@/lib/config'
import { MtgCard } from '@/components/MtgCard'
import { MapEmbed } from '@/components/MapEmbed'
import { RsvpForm } from '@/components/RsvpForm'

export const dynamic = 'force-dynamic'

interface InvitePageProps {
  searchParams: Promise<{ guest?: string; colors?: string }>
}

export default async function InvitePage({ searchParams }: InvitePageProps) {
  const params = await searchParams
  const guestName = params.guest || ''
  const guildCode = params.colors || randomGuildCode()
  const guild = getGuild(guildCode)
  const config = getPartyConfig()

  return (
    <main
      className="min-h-screen flex flex-col items-center py-12 px-4"
      style={{ background: 'linear-gradient(135deg, #0d0d1a 0%, #1a0d2e 50%, #0d1a0d 100%)' }}
    >
      <h1 className="text-4xl font-black text-amber-400 mb-1 text-center tracking-wide drop-shadow-lg font-[family-name:var(--font-cinzel)]">
        ¡Estás invitado!
      </h1>
      <p className="text-amber-200 mb-8 text-sm text-center font-[family-name:var(--font-im-fell)] italic">
        Una aventura mágica te espera
      </p>

      <MtgCard guild={guild} config={config} guestName={guestName} />

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
        <RsvpForm guestName={guestName} guildCode={guildCode} />
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/invite/page.tsx
git commit -m "feat: add personalized invite page"
```

---

### Task 10: Gallery page

**Files:**
- Create: `src/app/page.tsx` (replaces the default create-next-app page)

- [ ] **Step 1: Replace src/app/page.tsx**

```tsx
import { GUILDS } from '@/lib/colors'
import { getPartyConfig } from '@/lib/config'
import { MtgCard } from '@/components/MtgCard'

export default function GalleryPage() {
  const config = getPartyConfig()

  return (
    <main
      className="min-h-screen py-12 px-4"
      style={{ background: 'linear-gradient(135deg, #0d0d1a 0%, #1a0d2e 50%, #0d1a0d 100%)' }}
    >
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black text-amber-400 text-center mb-1 tracking-wide font-[family-name:var(--font-cinzel)]">
          Magic Birthday Invitation
        </h1>
        <p className="text-amber-200 text-center mb-1 text-sm font-[family-name:var(--font-im-fell)] italic">
          Celebración del {config.birthday.age}° Cumpleaños de {config.birthday.name}
        </p>
        <p className="text-gray-500 text-center mb-10 text-xs">
          Cada invitado recibe un enlace personalizado con su combinación de colores
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
          {Object.values(GUILDS).map(guild => (
            <div key={guild.code} className="flex flex-col items-center gap-2">
              <MtgCard guild={guild} config={config} />
              <p className="text-amber-300 text-xs font-bold font-[family-name:var(--font-cinzel)]">
                {guild.name} ({guild.code.toUpperCase()})
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gray-900 border border-amber-900 rounded-xl p-6 max-w-lg mx-auto">
          <h2 className="text-amber-400 font-bold text-lg mb-3 font-[family-name:var(--font-cinzel)]">
            📨 Generar enlace de invitación
          </h2>
          <p className="text-gray-300 text-sm mb-3">
            Comparte un enlace personalizado con cada invitado:
          </p>
          <code className="block bg-gray-800 rounded-lg p-3 text-amber-300 text-xs break-all">
            /invite?guest=NombreInvitado&amp;colors=ub
          </code>
          <p className="text-gray-500 text-xs mt-2">
            Cambia{' '}
            <span className="text-amber-400">NombreInvitado</span> por el nombre del
            invitado y{' '}
            <span className="text-amber-400">ub</span> por el código de colores de la
            tabla de arriba.
          </p>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add gallery page with all 10 guild previews"
```

---

### Task 11: Layout, fonts, and global styles

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Modify: `next.config.ts`

- [ ] **Step 1: Update src/app/layout.tsx**

```tsx
import type { Metadata } from 'next'
import { Cinzel, IM_Fell_English } from 'next/font/google'
import './globals.css'

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
})

const imFell = IM_Fell_English({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-im-fell',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Invitación Mágica de Cumpleaños',
  description: 'Una celebración al estilo Magic: The Gathering',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${cinzel.variable} ${imFell.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
```

- [ ] **Step 2: Update src/app/globals.css**

Replace the file contents with:

```css
@import "tailwindcss";

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
}
```

- [ ] **Step 3: Update next.config.ts to disable image optimization for local assets**

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
}

export default nextConfig
```

- [ ] **Step 4: Run the full test suite**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 5: Start the dev server and verify visually**

```bash
npm run dev
```

Open `http://localhost:3000` — gallery page should show all 10 guild cards.
Open `http://localhost:3000/invite?guest=Alice&colors=ub` — invite page should show Dimir-themed card with guest name, map, and RSVP form.
Open `http://localhost:3000/invite?guest=Carlos&colors=rg` — should show Gruul-themed card.

- [ ] **Step 6: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css next.config.ts
git commit -m "feat: add layout, Google Fonts (Cinzel + IM Fell), and global styles"
```

---

## Deployment Checklist

After all tasks are complete:

- [ ] Push repo to GitHub
- [ ] Go to [vercel.com](https://vercel.com) → New Project → import the repo
- [ ] Add environment variables in Vercel:
  - `SUPABASE_URL` — from Supabase dashboard → Settings → API → Project URL
  - `SUPABASE_ANON_KEY` — from the same page → anon public key
  - `PARTY_CONFIG` — paste the full contents of your real `config/party.json` as a JSON string with actual party details
- [ ] Deploy — Vercel auto-detects Next.js
- [ ] Verify the live URL shows the gallery and that `/invite?guest=Test&colors=ub` works
- [ ] Share personalized links with guests: `https://your-domain.vercel.app/invite?guest=NombreInvitado&colors=XX`
