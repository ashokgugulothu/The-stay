
import api from './api'

// Create a new booking.
export async function createBooking(bookingData) {
  const response = await api.post('/bookings', bookingData)
  return response.data
}

// Get all bookings of the logged-in user.
export async function getMyBookings() {
  const response = await api.get('/bookings/my')
  return response.data
}

// Get details of one particular booking.
export async function getBookingById(bookingId) {
  const response = await api.get(`/bookings/${bookingId}`)
  return response.data
}

// Cancel a booking.
export async function cancelBooking(bookingId) {
  const response = await api.patch(
    `/bookings/${bookingId}/cancel`
  )

  return response.data
}


// Verify Razorpay payment with the backend.
export async function verifyPayment(paymentData) {
  const response = await api.post(
    '/bookings/verify-payment',
    paymentData
  )

  return response.data
}
