import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getCurrentUser } from '../../services/authService'

function ProtectedRoute() {
  const location = useLocation()

  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    let isActive = true

    async function verifyUser() {
      const token = localStorage.getItem('token')

      if (!token) {
        if (isActive) {
          setIsAuthenticated(false)
          setIsChecking(false)
        }
        return
      }

      try {
        // Backend verifies the JWT and finds the user
        await getCurrentUser()

        if (isActive) {
          setIsAuthenticated(true)
        }
      } catch (error) {
        // Remove an invalid or expired token
        localStorage.removeItem('token')
        window.dispatchEvent(new Event('auth-change'))

        if (isActive) {
          setIsAuthenticated(false)
        }
      } finally {
        if (isActive) {
          setIsChecking(false)
        }
      }
    }

    verifyUser()

    return () => {
      isActive = false
    }
  }, [])

  // Wait until the backend verifies the token
  if (isChecking) {
    return <p>Checking authentication...</p>
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    )
  }

  return <Outlet />
}

export default ProtectedRoute