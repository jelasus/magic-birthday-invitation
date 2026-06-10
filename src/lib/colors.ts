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
