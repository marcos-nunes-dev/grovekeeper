export interface Build {
  id: string
  name: string
  role?: string
  content?: string
  difficulty?: string
  costTier?: string
  instructions?: string
  equipment: {
    head?: string
    cape?: string
    mainHand?: string
    offHand?: string
    chest?: string
    shoes?: string
    potion?: string
    food?: string
    mount?: string
  }
  spells: {
    [itemId: string]: {
      activeSpells: number[]
      passiveSpells: number[]
    }
  }
}

export interface ClassSection {
  name: string
  builds: Build[]
}

export interface AlbionSpell {
  spellType: 'active' | 'passive'
  uniqueName: string
  localizedNames: {
    [key: string]: string
  }
  uiSprite: string
}

export interface ItemData {
  activeSpellSlots: number
  passiveSpellSlots: number
  activeSlots: {
    [key: number]: AlbionSpell[]
  }
  passiveSlots: {
    [key: number]: AlbionSpell[]
  }
} 