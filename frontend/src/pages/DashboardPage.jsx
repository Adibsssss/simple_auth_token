import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const DashboardPage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
    navigate('/login', { replace: true })
  }

  const getInitials = (u) => {
    if (u?.first_name && u?.last_name)
      return `${u.first_name[0]}${u.last_name[0]}`.toUpperCase()
    return u?.username?.[0]?.toUpperCase() || '?'
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* Top navigation bar */}
      <nav
        style={{
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          padding: '0 32px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            style={{
              width: '32px',
              height: '32px',
              border: '1px solid var(--color-accent)',
              borderRadius: '7px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
            }}
          >
            Nexus Portal
          </span>
        </div>

        {/* User + logout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-accent), #a8872e)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#0a0c10',
              }}
            >
              {getInitials(user)}
            </div>
            <div className="hidden sm:block">
              <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                {user?.full_name || user?.username}
              </p>
              {user?.department && (
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {user.department}
                </p>
              )}
            </div>
          </div>

          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--color-border)' }} />

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              backgroundColor: 'transparent',
              color: 'var(--color-text-secondary)',
              fontSize: '0.825rem',
              fontFamily: 'var(--font-body)',
              cursor: loggingOut ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: loggingOut ? 0.6 : 1,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--color-error)'
              e.currentTarget.style.color = 'var(--color-error)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--color-border)'
              e.currentTarget.style.color = 'var(--color-text-secondary)'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {loggingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main style={{ padding: '48px 32px', maxWidth: '1100px', margin: '0 auto' }}>
        {/* Welcome banner */}
        <div
          className="animate-fade-in-up"
          style={{
            background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-2) 100%)',
            border: '1px solid var(--color-border)',
            borderLeft: '3px solid var(--color-accent)',
            borderRadius: '12px',
            padding: '32px 36px',
            marginBottom: '32px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative circle */}
          <div
            style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              border: '1px solid rgba(201,168,76,0.08)',
              pointerEvents: 'none',
            }}
          />

          <p
            style={{
              fontSize: '0.72rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              fontWeight: 500,
              marginBottom: '8px',
            }}
          >
            Access Granted
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.8rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              marginBottom: '8px',
            }}
          >
            Welcome back, {user?.first_name || user?.username}.
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            You are now authenticated and have full access to the system.
          </p>
        </div>

        {/* Stats/info cards */}
        <div
          className="animate-fade-in-up delay-100"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          {[
            {
              label: 'Username',
              value: user?.username || '—',
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              ),
            },
            {
              label: 'Email',
              value: user?.email || 'Not set',
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              ),
            },
            {
              label: 'Department',
              value: user?.department || 'Unassigned',
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2"/>
                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                </svg>
              ),
            },
            {
              label: 'Status',
              value: 'Active',
              valueColor: 'var(--color-success)',
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              ),
            },
          ].map((card, i) => (
            <div
              key={i}
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '10px',
                padding: '20px',
              }}
            >
              <div
                className="flex items-center gap-2"
                style={{ color: 'var(--color-accent)', marginBottom: '12px' }}
              >
                {card.icon}
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {card.label}
                </span>
              </div>
              <p
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  color: card.valueColor || 'var(--color-text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Token info panel */}
        <div
          className="animate-fade-in-up delay-200"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '10px',
            padding: '24px',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
              }}
            >
              Authentication Token
            </h3>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '12px' }}>
            Your Django Simple Token is stored securely and sent with every API request via the{' '}
            <code
              style={{
                backgroundColor: 'var(--color-surface-2)',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '0.8rem',
                color: 'var(--color-accent)',
              }}
            >
              Authorization: Token
            </code>{' '}
            header.
          </p>
          <div
            style={{
              backgroundColor: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '12px 16px',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              color: 'var(--color-text-muted)',
              wordBreak: 'break-all',
            }}
          >
            <span style={{ color: 'var(--color-text-muted)' }}>Authorization: Token </span>
            <span style={{ color: 'var(--color-accent)' }}>
              {localStorage.getItem('auth_token') || '••••••••••••••••••••••••••••••••••••••••'}
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage
