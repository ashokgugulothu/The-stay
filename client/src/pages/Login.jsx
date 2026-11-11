import { useState } from 'react'
//
import { Link, useLocation, useNavigate, useSearchParams,} from 'react-router-dom'

import { loginUser } from '../services/authService'

function Login() {
    const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Preserve the selected hotel and stay details, if present.
  const hotelId = searchParams.get('hotelId')
  const roomId = searchParams.get('roomId')
  const checkIn = searchParams.get('checkIn') || ''
  const checkOut = searchParams.get('checkOut') || ''
  const guests = searchParams.get('guests') || '2'

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    try {
      setLoading(true)

      const credentials = {
        email: formData.email.trim(),
        password: formData.password,
      }

      const data = await loginUser(credentials)

      // Save the JWT returned by the backend.
      // The backend must return a token for this flow.
      if (!data.token) {
        throw new Error('The login response did not include a token.')
      }

      localStorage.setItem('token', data.token)
      window.dispatchEvent(new Event('auth-change'))

      // If login began during a booking flow, return to that hotel.
      // If login started from a booking, return to the selected hotel.
if (hotelId) {
  const detailsParams = new URLSearchParams({
    checkIn,
    checkOut,
    guests,
  })

  if (roomId) {
    detailsParams.set('roomId', roomId)
  }

  navigate(`/hotels/${hotelId}?${detailsParams.toString()}`)
} else if (location.state?.from) {
  // Return to the protected page the user originally requested.
  const { pathname, search, hash } = location.state.from

  navigate(`${pathname}${search}${hash}`, { replace: true })
} else {
  // Normal login without a previous destination.
  navigate('/')
}
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          'Login failed. Please check your credentials.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Welcome back</h1>

        <p className="auth-subtitle">
          Login to continue with your stay.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>

          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            autoComplete="email"
            required
          />

          <label htmlFor="password">Password</label>

          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />

          {error && <p className="form-error">{error}</p>}

          <button
            className="auth-button"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </section>
    </main>
  )
}

export default Login