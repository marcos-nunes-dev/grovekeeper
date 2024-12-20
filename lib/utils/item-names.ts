import itemNames from './item-names.json'

interface ItemNameData {
  LocalizationNameVariable: string
  LocalizationDescriptionVariable: string
  LocalizedNames: {
    'EN-US': string
    'DE-DE': string
    'FR-FR': string
    'RU-RU': string
    'PL-PL': string
    'ES-ES': string
    'PT-BR': string
    'IT-IT': string
    'ZH-CN': string
    'KO-KR': string
    'JA-JP': string
    'ZH-TW': string
    'ID-ID': string
    'TR-TR': string
    'AR-SA': string
  }
  LocalizedDescriptions: {
    [key: string]: string
  }
  Index: string
  UniqueName: string
}

interface ItemNameDictionary {
  [key: string]: ItemNameData
}

const localizedNames = (itemNames as ItemNameData[]).reduce((acc, item) => {
  acc[item.UniqueName] = item;
  return acc;
}, {} as ItemNameDictionary);

export function getFriendlyItemName(itemId: string): string {
  // Remove tier prefix and any enchantment suffix for matching
  const baseItemId = itemId
    .replace(/^T\d+_/, '') // Remove tier prefix (e.g., T4_)
    .replace(/@\d+$/, '') // Remove enchantment suffix (e.g., @1)

  // Find the item by matching UniqueName
  const itemData = Object.values(localizedNames).find(item => item.UniqueName === itemId)

  if (itemData?.LocalizedNames?.['EN-US']) {
    return itemData.LocalizedNames['EN-US']
  }

  // Fallback: format the ID to be more readable
  return baseItemId
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
} 