export interface Build {
  id: string
  name: string
  role?: string
  content?: string
  difficulty?: string
  costTier?: string
  equipment: {
    mainHand?: string
    offHand?: string
    head?: string
    chest?: string
    shoes?: string
    cape?: string
    food?: string
    potion?: string
    mount?: string
  }
  skills: {
    q?: string
    w?: string
    e?: string
    r?: string
    passive?: string
  }
  instructions: string
}

export interface ClassSection {
  name: string
  builds: Build[]
} 