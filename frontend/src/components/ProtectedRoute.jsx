import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height: '100vh', backgroundColor: 'var(--color-bg)' }}
      >
        <div
          className="animate-spin-custom"
          style={{
            width: '32px',
            height: '32px',
            border: '2px solid var(--color-border)',
            borderTopColor: 'var(--color-accent)',
            borderRadius: '50%',
          }}
        />
      </div>
    )
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export default ProtectedRoute
