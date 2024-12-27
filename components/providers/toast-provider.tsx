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
        }
      }}
    />
  )
} 