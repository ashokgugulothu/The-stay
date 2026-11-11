import { useEffect, useState } from 'react'

import { Link } from 'react-router-dom'
import {getMyBookings,cancelBooking,} from '../services/bookingService'

function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [cancellingId, setCancellingId] = useState(null)

  // Fetch bookings belonging to the logged-in user.
  useEffect(() => {
    let isActive = true

    async function fetchBookings() {
      try {
        setLoading(true)
        setError('')

        const data = await getMyBookings()

        if (isActive) {
          setBookings(data.bookings || [])
        }
      } catch (requestError) {
        if (isActive) {
          setError(
            requestError.response?.data?.message ||
              'Unable to load your bookings.',
          )
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    fetchBookings()

    return () => {
      isActive = false
    }
  }, [])

  // Cancel a confirmed booking.
  async function handleCancelBooking(bookingId) {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this booking?',
    )

    if (!confirmed) return

    try {
      setCancellingId(bookingId)
      setActionError('')

      await cancelBooking(bookingId)

      // Update the cancelled booking in the current UI.
      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: 'cancelled' }
            : booking,
        ),
      )
    } catch (requestError) {
      setActionError(
        requestError.response?.data?.message ||
          'Unable to cancel this booking.',
      )
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) {
    return <main className="page-message">Loading your bookings...</main>
  }

  if (error) {
    return <main className="page-message">{error}</main>
  }

  return (
    <main className="my-bookings-page">
      <h1>My Bookings</h1>
      <p>View and manage your hotel reservations.</p>

      {actionError && (
        <p className="booking-error">{actionError}</p>
      )}

      {bookings.length === 0 ? (
        <p className="empty-bookings">
          You haven't made any bookings yet.
        </p>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <article className="booking-card" key={booking._id}>
              <h2>{booking.hotel?.name || 'Hotel'}</h2>

              <p>
                Room: {booking.room?.name || booking.room?.roomType || 'Room'}
              </p>

              <p>
                Check-in:{' '}
                {new Date(booking.checkIn).toLocaleDateString('en-IN')}
              </p>

              <p>
                Check-out:{' '}
                {new Date(booking.checkOut).toLocaleDateString('en-IN')}
              </p>

              <p>
                Total price: ₹
                {Number(booking.totalPrice).toLocaleString('en-IN')}
              </p>

              <p>
                Status: <strong>{booking.status}</strong>
              </p>

              {booking.status === 'confirmed' && (
                <button
                  type="button"
                  className="cancel-booking-button"
                  onClick={() => handleCancelBooking(booking._id)}
                  disabled={cancellingId === booking._id}
                >
                  {cancellingId === booking._id
                    ? 'Cancelling...'
                    : 'Cancel Booking'}
                </button>
                
              )}
              <Link
               to={`/my-bookings/${booking._id}`}
                 className="view-booking-link">View Details
             </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}

export default MyBookings