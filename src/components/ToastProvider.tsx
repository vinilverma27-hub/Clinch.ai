'use client'
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((type: ToastType, message: string, duration = 3000) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast container */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none'
      }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: '10px',
              background: toast.type === 'success'
                ? '#1C1410'
                : toast.type === 'error'
                ? '#EF4444'
                : toast.type === 'warning'
                ? '#F59E0B'
                : '#3B82F6',
              color: 'white',
              fontSize: '14px',
              fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif',
              fontWeight: 500,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              minWidth: '260px',
              maxWidth: '400px',
              pointerEvents: 'auto',
              animation: 'slideIn 0.2s ease'
            }}
          >
            <span style={{fontSize: '16px'}}>
              {toast.type === 'success' ? '✓'
                : toast.type === 'error' ? '✕'
                : toast.type === 'warning' ? '⚠'
                : 'ℹ'}
            </span>
            {toast.message}
          </div>
        ))}
      </div>
      
      <style>{`
        @keyframes slideIn {
          from { 
            opacity: 0; 
            transform: translateX(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateX(0); 
          }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
