const ALBION_KILLBOARD_REGEX = /https?:\/\/(?:www\.)?albiononline\.com\/killboard\/kill\/(\d+)/i

export function extractKillIds(input: string): string[] {
  const matches = input.match(new RegExp(ALBION_KILLBOARD_REGEX, 'gi')) || []
  return matches.map(url => {
    const match = url.match(ALBION_KILLBOARD_REGEX)
    return match?.[1] || ''
  }).filter(Boolean)
}

export function isValidKillboardUrl(url: string): boolean {
  return ALBION_KILLBOARD_REGEX.test(url)
}

export function extractKillId(url: string): string | null {
  const match = url.match(ALBION_KILLBOARD_REGEX)
  return match?.[1] || null
} 