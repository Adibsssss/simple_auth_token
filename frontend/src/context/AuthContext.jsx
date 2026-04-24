import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { verifyToken, logoutUser } from '../api/auth'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount: restore session from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser  = localStorage.getItem('auth_user')

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      // Optionally verify token is still valid on the server
      verifyToken()
        .then((data) => {
          if (data.valid) {
            setUser(data.user)
          } else {
            clearSession()
          }
        })
        .catch(() => clearSession())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const clearSession = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setToken(null)
    setUser(null)
  }

  const login = useCallback((tokenValue, userData) => {
    localStorage.setItem('auth_token', tokenValue)
    localStorage.setItem('auth_user', JSON.stringify(userData))
    setToken(tokenValue)
    setUser(userData)
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutUser()
    } catch (_) {
      // Silently ignore — token may already be invalid
    } finally {
      clearSession()
    }
  }, [])

  const isAuthenticated = Boolean(token && user)

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
