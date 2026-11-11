import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { getBookingById } from '../services/bookingService'

function BookingDetails() {
  const { bookingId } = useParams()

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch the selected booking from the backend.
  useEffect(() => {
    let isActive = true

    async function fetchBookingDetails() {
      try {
        setLoading(true)
        setError('')

        const data = await getBookingById(bookingId)

        if (isActive) {
          setBooking(data.booking)
        }
      } catch (requestError) {
        if (isActive) {
          setError(
            requestError.response?.data?.message ||
              'Unable to load booking details.',
          )
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    fetchBookingDetails()

    return () => {
      isActive = false
    }
  }, [bookingId])

  if (loading) {
    return <main className="page-message">Loading booking details...</main>
  }

  if (error) {
    return (
      <main className="page-message">
        <p>{error}</p>
        <Link to="/my-bookings">Back to My Bookings</Link>
      </main>
    )
  }

  if (!booking) {
    return (
      <main className="page-message">
        <p>Booking not found.</p>
        <Link to="/my-bookings">Back to My Bookings</Link>
      </main>
    )
  }

  const hotel = booking.hotel
  const room = booking.room

  return (
    <main className="booking-details-page">
      <h1>Booking Details</h1>
      <p>Here is the complete information about your reservation.</p>

      <section className="booking-details-card">
        <h2>{hotel?.name || 'Hotel'}</h2>

        <p>
          <strong>Location:</strong>{' '}
          {hotel?.city || 'Not available'}
        </p>

        <p>
          <strong>Address:</strong>{' '}
          {hotel?.address || 'Not available'}
        </p>

        <hr />

        <h3>Room Information</h3>

        <p>
          <strong>Room name:</strong>{' '}
          {room?.name || 'Not available'}
        </p>

        <p>
          <strong>Room type:</strong>{' '}
          {room?.roomType || 'Not available'}
        </p>

        <p>
          <strong>Room capacity:</strong>{' '}
          {room?.capacity ?? 'Not available'}
        </p>

        <hr />

        <h3>Stay Information</h3>

        <p>
          <strong>Check-in:</strong>{' '}
          {new Date(booking.checkIn).toLocaleDateString('en-IN')}
        </p>

        <p>
          <strong>Check-out:</strong>{' '}
          {new Date(booking.checkOut).toLocaleDateString('en-IN')}
        </p>

        <p>
          <strong>Number of nights:</strong> {booking.nights}
        </p>

        <p>
          <strong>Guests:</strong> {booking.guests}
        </p>

        <hr />

        <h3>Payment Summary</h3>

        <p>
          <strong>Price per night:</strong> ₹
          {Number(booking.pricePerNight).toLocaleString('en-IN')}
        </p>

        <p>
          <strong>Total price:</strong> ₹
          {Number(booking.totalPrice).toLocaleString('en-IN')}
        </p>

        <p>
          <strong>Booking status:</strong>{' '}
          <span className={`booking-status ${booking.status}`}>
            {booking.status}
          </span>
        </p>

        <p>
          <strong>Booking ID:</strong> {booking._id}
        </p>
      </section>

      <Link to="/my-bookings" className="back-to-bookings-link">
        ← Back to My Bookings
      </Link>
    </main>
  )
}

export default BookingDetails