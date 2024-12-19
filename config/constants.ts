export const PRICE_THRESHOLDS = {
  LOW: 100_000,
  MEDIUM: 500_000,
  HIGH: 1_000_000,
  VERY_HIGH: 5_000_000,
} as const

export const API_CONFIG = {
  PRICES_URL: 'https://west.albion-online-data.com/api/v2/stats/history/',
  KILLBOARD_URL: 'https://gameinfo.albiononline.com/api/gameinfo/events',
  MAX_URL_LENGTH: 2000,
  CHUNK_SIZE: 100,
  CACHE_TIME: 3600, // 1 hour
  REVALIDATE_TIME: 300 // 5 minutes
} as const

export const ITEM_NAME_OVERRIDES: Record<string, string> = {
  // Armor pieces
  'HEAD': 'Hood',
  'ARMOR': 'Jacket',
  'SHOES': 'Boots',
  // Weapons
  'MAIN_SPEAR': 'Spear',
  'MAIN_AXE': 'Axe',
  'MAIN_SWORD': 'Sword',
  'MAIN_QUARTERSTAFF': 'Quarterstaff',
  'MAIN_DAGGER': 'Dagger',
  'MAIN_HAMMER': 'Hammer',
  'MAIN_MACE': 'Mace',
  'MAIN_CROSSBOW': 'Crossbow',
  'MAIN_BOW': 'Bow',
  'MAIN_FIRE': 'Fire Staff',
  'MAIN_ARCANE': 'Arcane Staff',
  'MAIN_HOLY': 'Holy Staff',
  'MAIN_NATURE': 'Nature Staff',
  'MAIN_FROST': 'Frost Staff',
  'MAIN_CURSE': 'Curse Staff',
  // Off-hands
  'OFF_SHIELD': 'Shield',
  'OFF_TORCH': 'Torch',
  'OFF_HORN': 'Horn',
  'OFF_TOME': 'Tome',
  // Accessories
  'CAPE': 'Cape',
  'BAG': 'Bag',
  // Consumables
  'POTION_HEAL': 'Healing Potion',
  'POTION_ENERGY': 'Energy Potion',
  'MEAL': 'Food'
} as const 