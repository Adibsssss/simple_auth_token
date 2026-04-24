import { useEffect } from 'react'

const AccessDeniedModal = ({ isOpen, onClose, message }) => {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative animate-scale-in mx-4"
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-error)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(224,82,82,0.15), 0 0 0 1px rgba(224,82,82,0.08)',
        }}
      >
        {/* Red top bar */}
        <div style={{ height: '3px', background: 'linear-gradient(90deg, var(--color-error), transparent)' }} />

        <div className="p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div
              className="relative flex items-center justify-center"
              style={{ width: '64px', height: '64px' }}
            >
              {/* Pulse rings */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  backgroundColor: 'var(--color-error-dim)',
                  animation: 'pulse-ring 1.5s ease-out infinite',
                }}
              />
              <div
                className="absolute inset-2 rounded-full"
                style={{
                  backgroundColor: 'var(--color-error-dim)',
                  animation: 'pulse-ring 1.5s ease-out infinite',
                  animationDelay: '0.4s',
                }}
              />
              <div
                className="relative flex items-center justify-center rounded-full"
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: 'rgba(224,82,82,0.15)',
                  border: '1px solid rgba(224,82,82,0.3)',
                }}
              >
                {/* Shield icon */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Title */}
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.4rem',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              textAlign: 'center',
              marginBottom: '8px',
            }}
          >
            Access Denied
          </h2>

          {/* Subtitle */}
          <p
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: '0.875rem',
              textAlign: 'center',
              lineHeight: 1.6,
              marginBottom: '6px',
            }}
          >
            {message || 'The credentials you entered are incorrect. You do not have access to this system.'}
          </p>

          <p
            style={{
              color: 'var(--color-text-muted)',
              fontSize: '0.78rem',
              textAlign: 'center',
              marginBottom: '28px',
            }}
          >
            Please verify your username and password and try again.
          </p>

          {/* Divider */}
          <div style={{ height: '1px', backgroundColor: 'var(--color-border)', marginBottom: '24px' }} />

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '11px 20px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'transparent',
                color: 'var(--color-text-secondary)',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--color-border-hover)'
                e.currentTarget.style.color = 'var(--color-text-primary)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--color-border)'
                e.currentTarget.style.color = 'var(--color-text-secondary)'
              }}
            >
              Dismiss
            </button>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '11px 20px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, var(--color-accent), #a8872e)',
                color: '#0a0c10',
                fontSize: '0.875rem',
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.88' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccessDeniedModal
