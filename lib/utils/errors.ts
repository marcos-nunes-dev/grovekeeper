export type ErrorCode = 
  | 'INVALID_URL'
  | 'API_ERROR'
  | 'PRICE_ERROR'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'

export class KillboardError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly status?: number
  ) {
    super(message)
    this.name = 'KillboardError'
  }

  static fromError(error: unknown): KillboardError {
    if (error instanceof KillboardError) return error
    
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        return new KillboardError('Network error occurred', 'NETWORK_ERROR')
      }
      return new KillboardError(error.message, 'API_ERROR')
    }
    
    return new KillboardError('An unknown error occurred', 'API_ERROR')
  }
}

export function getErrorMessage(error: unknown): string {
  const kbError = KillboardError.fromError(error)
  
  switch (kbError.code) {
    case 'INVALID_URL':
      return 'Please check your killboard URL format'
    case 'API_ERROR':
      return `Failed to fetch data: ${kbError.message}`
    case 'PRICE_ERROR':
      return 'Failed to fetch price data'
    case 'NETWORK_ERROR':
      return 'Network error: Please check your connection'
    case 'VALIDATION_ERROR':
      return 'Invalid data received from API'
    default:
      return 'An unexpected error occurred'
  }
} 