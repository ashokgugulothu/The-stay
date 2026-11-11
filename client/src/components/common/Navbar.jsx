
import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()

  const [isLoggedIn, setIsLoggedIn] = useState(
    () => Boolean(localStorage.getItem('token')),
  )

  useEffect(() => {
    function updateAuthStatus() {
      setIsLoggedIn(Boolean(localStorage.getItem('token')))
    }

    window.addEventListener('auth-change', updateAuthStatus)

    return () => {
      window.removeEventListener('auth-change', updateAuthStatus)
    }
  }, [])

  function handleLogout() {
    localStorage.removeItem('token')
    window.dispatchEvent(new Event('auth-change'))
    navigate('/login')
  }

  return (
    <header className="stay-navbar">
      <div className="stay-navbar-container">
        <Link to="/" className="stay-brand">
          <span className="stay-brand-icon">S</span>
          <span>The Stay</span>
        </Link>

        <nav className="stay-nav-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/hotels">Hotels</NavLink>

          {isLoggedIn ? (
            <>
              <NavLink to="/my-bookings">My Bookings</NavLink>
              <button
                type="button"
                className="stay-nav-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <Link to="/register" className="stay-register-button">
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
