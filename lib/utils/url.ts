const ALBION_KILLBOARD_REGEX = /albiononline\.com\/killboard\/kill\/(\d+)/i

export function extractKillIds(input: string): string[] {
  const matches = []
  let match
  const regex = new RegExp(ALBION_KILLBOARD_REGEX.source, 'gi')
  
  while ((match = regex.exec(input)) !== null) {
    if (match[1]) {
      matches.push(match[1])
    }
  }
  
  return matches
}

export function isValidKillboardUrl(url: string): boolean {
  return ALBION_KILLBOARD_REGEX.test(url)
}

export function extractKillId(url: string): string | null {
  const match = url.match(ALBION_KILLBOARD_REGEX)
  return match?.[1] || null
} 