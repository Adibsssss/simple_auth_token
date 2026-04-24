import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import AccessDeniedModal from '../components/AccessDeniedModal'

const LoginPage = () => {
  const navigate  = useNavigate()
  const { login } = useAuth()

  const [formData, setFormData] = useState({ username: '', password: '' })
  const [loading, setLoading]   = useState(false)
  const [showModal, setShowModal]       = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [showPass, setShowPass]         = useState(false)
  const [fieldErrors, setFieldErrors]   = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const errors = {}
    if (!formData.username.trim()) errors.username = 'Username is required.'
    if (!formData.password)        errors.password = 'Password is required.'
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length) { setFieldErrors(errors); return }

    setLoading(true)
    try {
      const data = await loginUser(formData.username, formData.password)
      login(data.token, data.user)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      let msg = 'Invalid credentials. You do not have access.'
      if (err.response) {
        msg =
          err.response.data?.message ||
          err.response.data?.non_field_errors?.[0] ||
          err.response.data?.detail ||
          msg
      } else if (!err.response) {
        msg = 'Unable to reach the server. Please make sure the backend is running.'
      }
      setModalMessage(msg)
      setShowModal(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="relative flex min-h-screen"
      style={{ backgroundColor: 'var(--color-bg)', overflow: 'hidden' }}
    >
      {/* Background decorative elements */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,168,76,0.03) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Left decorative panel (hidden on small screens) */}
      <div
        className="hidden lg:flex flex-col justify-between"
        style={{
          width: '42%',
          minHeight: '100vh',
          backgroundColor: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          padding: '52px 56px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Diagonal accent lines */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }}
          preserveAspectRatio="none"
        >
          {[...Array(10)].map((_, i) => (
            <line
              key={i}
              x1={`${i * 15 - 50}%`} y1="0"
              x2={`${i * 15 + 50}%`} y2="100%"
              stroke="var(--color-accent)" strokeWidth="1"
            />
          ))}
        </svg>

        {/* Bottom corner geometric accent */}
        <div
          style={{
            position: 'absolute',
            bottom: '-60px',
            right: '-60px',
            width: '260px',
            height: '260px',
            border: '1px solid rgba(201,168,76,0.1)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-20px',
            right: '-20px',
            width: '160px',
            height: '160px',
            border: '1px solid rgba(201,168,76,0.08)',
            borderRadius: '50%',
          }}
        />

        {/* Logo area */}
        <div className="animate-fade-in-up" style={{ position: 'relative', zIndex: 1 }}>
          <div className="flex items-center gap-3 mb-12">
            <div
              style={{
                width: '38px',
                height: '38px',
                border: '1px solid var(--color-accent)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                letterSpacing: '0.02em',
              }}
            >
              Nexus Portal
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.6rem',
              fontWeight: 700,
              lineHeight: 1.2,
              color: 'var(--color-text-primary)',
              marginBottom: '20px',
            }}
          >
            Secure Access
            <br />
            <span className="text-shimmer">Management</span>
          </h1>

          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '320px' }}>
            Enterprise-grade authentication for authorized personnel. All access is monitored and logged.
          </p>
        </div>

        {/* Feature list */}
        <div
          className="animate-fade-in-up delay-200"
          style={{ position: 'relative', zIndex: 1 }}
        >
          {[
            { icon: '⚿', label: 'Token-based authentication' },
            { icon: '◈', label: 'Role-based access control' },
            { icon: '◎', label: 'Session activity logging' },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 mb-4"
            >
              <span style={{ color: 'var(--color-accent)', fontSize: '1rem' }}>{item.icon}</span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div
          className="animate-fade-in-up delay-300"
          style={{
            position: 'relative',
            zIndex: 1,
            paddingTop: '24px',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>
            © {new Date().getFullYear()} Nexus Systems. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right: Login Form */}
      <div
        className="flex flex-1 items-center justify-center"
        style={{ padding: '48px 24px' }}
      >
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
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
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600 }}>
              Nexus Portal
            </span>
          </div>

          {/* Heading */}
          <div className="mb-10 animate-fade-in-up">
            <p
              style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                letterSpacing: '0.12em',
                color: 'var(--color-accent)',
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}
            >
              Authorized Personnel Only
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                marginBottom: '8px',
              }}
            >
              Sign In
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
              Enter your credentials to access the system.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Username field */}
            <div className="animate-fade-in-up delay-100" style={{ marginBottom: '20px' }}>
              <label
                htmlFor="username"
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  letterSpacing: '0.06em',
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: fieldErrors.username ? 'var(--color-error)' : 'var(--color-text-muted)',
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  className="input-glow"
                  style={{
                    width: '100%',
                    padding: '13px 14px 13px 42px',
                    backgroundColor: 'var(--color-surface-2)',
                    border: `1px solid ${fieldErrors.username ? 'var(--color-error)' : 'var(--color-border)'}`,
                    borderRadius: '9px',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.9rem',
                    fontFamily: 'var(--font-body)',
                    outline: 'none',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onFocus={e => {
                    if (!fieldErrors.username) e.target.style.borderColor = 'var(--color-accent)'
                  }}
                  onBlur={e => {
                    if (!fieldErrors.username) e.target.style.borderColor = 'var(--color-border)'
                  }}
                />
              </div>
              {fieldErrors.username && (
                <p style={{ color: 'var(--color-error)', fontSize: '0.78rem', marginTop: '6px' }}>
                  {fieldErrors.username}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="animate-fade-in-up delay-200" style={{ marginBottom: '28px' }}>
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  letterSpacing: '0.06em',
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: fieldErrors.password ? 'var(--color-error)' : 'var(--color-text-muted)',
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="input-glow"
                  style={{
                    width: '100%',
                    padding: '13px 46px 13px 42px',
                    backgroundColor: 'var(--color-surface-2)',
                    border: `1px solid ${fieldErrors.password ? 'var(--color-error)' : 'var(--color-border)'}`,
                    borderRadius: '9px',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.9rem',
                    fontFamily: 'var(--font-body)',
                    outline: 'none',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onFocus={e => {
                    if (!fieldErrors.password) e.target.style.borderColor = 'var(--color-accent)'
                  }}
                  onBlur={e => {
                    if (!fieldErrors.password) e.target.style.borderColor = 'var(--color-border)'
                  }}
                />
                {/* Show/hide toggle */}
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-muted)',
                    padding: '2px',
                    display: 'flex',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
                >
                  {showPass ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p style={{ color: 'var(--color-error)', fontSize: '0.78rem', marginTop: '6px' }}>
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Submit button */}
            <div className="animate-fade-in-up delay-300">
              <button
                type="submit"
                disabled={loading}
                className="btn-lift"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '9px',
                  border: 'none',
                  background: loading
                    ? 'var(--color-border)'
                    : 'linear-gradient(135deg, var(--color-accent) 0%, #a8872e 100%)',
                  color: loading ? 'var(--color-text-muted)' : '#0a0c10',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-body)',
                  letterSpacing: '0.04em',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'background 0.2s ease',
                }}
              >
                {loading ? (
                  <>
                    <div
                      className="animate-spin-custom"
                      style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: 'var(--color-text-muted)',
                        borderRadius: '50%',
                      }}
                    />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <p
            className="animate-fade-in-up delay-400"
            style={{
              marginTop: '36px',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              fontSize: '0.78rem',
              lineHeight: 1.6,
            }}
          >
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 500 }}>
              Register here
            </Link>
          </p>
        </div>
      </div>

      {/* Access Denied Modal */}
      <AccessDeniedModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        message={modalMessage}
      />
    </div>
  )
}

export default LoginPage
