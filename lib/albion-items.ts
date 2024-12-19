export interface AlbionItem {
  id: string;
  name: string;
  tier: number;
  itemType: string;
  slot?: string;
}

export const albionItems: AlbionItem[] = [
  { id: "T4_HEAD_CLOTH_SET1", name: "Scholar Cowl", tier: 4, itemType: "HEAD_CLOTH_SET1", slot: "head" },
  { id: "T4_HEAD_LEATHER_SET1", name: "Mercenary Hood", tier: 4, itemType: "HEAD_LEATHER_SET1", slot: "head" },
  { id: "T4_HEAD_PLATE_SET1", name: "Soldier Helmet", tier: 4, itemType: "HEAD_PLATE_SET1", slot: "head" },
  { id: "T4_ARMOR_CLOTH_SET1", name: "Scholar Robe", tier: 4, itemType: "ARMOR_CLOTH_SET1", slot: "chest" },
  { id: "T4_ARMOR_LEATHER_SET1", name: "Mercenary Jacket", tier: 4, itemType: "ARMOR_LEATHER_SET1", slot: "chest" },
  { id: "T4_ARMOR_PLATE_SET1", name: "Soldier Armor", tier: 4, itemType: "ARMOR_PLATE_SET1", slot: "chest" },
  { id: "T4_SHOES_CLOTH_SET1", name: "Scholar Sandals", tier: 4, itemType: "SHOES_CLOTH_SET1", slot: "shoes" },
  { id: "T4_SHOES_LEATHER_SET1", name: "Mercenary Shoes", tier: 4, itemType: "SHOES_LEATHER_SET1", slot: "shoes" },
  { id: "T4_SHOES_PLATE_SET1", name: "Soldier Boots", tier: 4, itemType: "SHOES_PLATE_SET1", slot: "shoes" },
  { id: "T4_MAIN_ARCANESTAFF", name: "Great Arcane Staff", tier: 4, itemType: "MAIN_ARCANESTAFF", slot: "mainHand" },
  { id: "T4_2H_ARCANESTAFF", name: "Great Arcane Staff", tier: 4, itemType: "2H_ARCANESTAFF", slot: "mainHand" },
  { id: "T4_2H_ENIGMATICSTAFF", name: "Enigmatic Staff", tier: 4, itemType: "2H_ENIGMATICSTAFF", slot: "mainHand" },
  { id: "T4_MAIN_CURSEDSTAFF", name: "Cursed Staff", tier: 4, itemType: "MAIN_CURSEDSTAFF", slot: "mainHand" },
  { id: "T4_2H_CURSEDSTAFF", name: "Great Cursed Staff", tier: 4, itemType: "2H_CURSEDSTAFF", slot: "mainHand" },
  { id: "T4_2H_DEMONICSTAFF", name: "Demonic Staff", tier: 4, itemType: "2H_DEMONICSTAFF", slot: "mainHand" },
  { id: "T4_OFF_BOOK", name: "Tome of Spells", tier: 4, itemType: "OFF_BOOK", slot: "offHand" },
  { id: "T4_HEAD_CLOTH_KEEPER", name: "Druid Cowl", tier: 4, itemType: "HEAD_CLOTH_KEEPER", slot: "head" },
  { id: "T4_ARMOR_CLOTH_KEEPER", name: "Druid Robe", tier: 4, itemType: "ARMOR_CLOTH_KEEPER", slot: "chest" },
  { id: "T4_SHOES_CLOTH_KEEPER", name: "Druid Sandals", tier: 4, itemType: "SHOES_CLOTH_KEEPER", slot: "shoes" },
  { id: "T4_MAIN_NATURESTAFF", name: "Nature Staff", tier: 4, itemType: "MAIN_NATURESTAFF", slot: "mainHand" },
  { id: "T4_2H_WILDSTAFF", name: "Great Nature Staff", tier: 4, itemType: "2H_WILDSTAFF", slot: "mainHand" },
  { id: "T4_2H_NATURESTAFF", name: "Wild Staff", tier: 4, itemType: "2H_NATURESTAFF", slot: "mainHand" },
  { id: "T4_CAPE", name: "Cape", tier: 4, itemType: "CAPE", slot: "cape" },
  { id: "T4_POTION_HEAL", name: "Healing Potion", tier: 4, itemType: "POTION_HEAL", slot: "potion" },
  { id: "T4_MEAL_STEW", name: "Stew", tier: 4, itemType: "MEAL_STEW", slot: "food" },
  { id: "T4_MOUNT_HORSE", name: "Armored Horse", tier: 4, itemType: "MOUNT_HORSE", slot: "mount" },
];

