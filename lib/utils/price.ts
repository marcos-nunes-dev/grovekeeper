export function formatPrice(value: number, showZeroAsQuestionMarks = true) {
  if (value === 0) {
    return showZeroAsQuestionMarks ? '???' : '0'
  }

  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(1) + 'B'
  } else if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1) + 'M'
  } else if (value >= 1_000) {
    return (value / 1_000).toFixed(0) + 'K'
  } else {
    return value.toFixed(0)
  }
}

export function isPriceReliable(priceData: {
  avg_price: number
  min_price: number
  max_price: number
}): boolean {
  if (!priceData.avg_price) return false
  
  // Check if we have enough price variation data
  const priceRange = priceData.max_price - priceData.min_price
  const avgPrice = priceData.avg_price
  const variationPercentage = (priceRange / avgPrice) * 100

  // If price variation is too high (more than 50%), consider it unreliable
  if (variationPercentage > 50) {
    return false
  }

  return true
} 