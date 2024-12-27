'use client'

import { Toaster } from 'sonner'

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#1C2128',
          border: '1px solid rgba(82, 82, 91, 0.5)',
          color: '#E4E4E7'
        },
        success: {
          style: {
            background: '#042f2e',
            border: '1px solid rgba(20, 184, 166, 0.5)',
            color: '#5eead4'
          }
        },
        error: {
          style: {
            background: '#27272a',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            color: '#fca5a5'
          }
        }
      }}
    />
  )
} 