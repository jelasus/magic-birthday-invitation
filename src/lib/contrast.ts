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
