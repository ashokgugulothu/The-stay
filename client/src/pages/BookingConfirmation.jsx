
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import {
  createBooking,
  verifyPayment,
} from '../services/bookingService'

// Load Razorpay's official Checkout script only when needed.
function loadRazorpayScript() {
  return new Promise((resolve) => {
    // Reuse the script if it has already been loaded.
    if (window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement('script')

    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true

    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)

    document.body.appendChild(script)
  })
}

function BookingConfirmation() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const hotelId = searchParams.get('hotelId') || ''
  const roomId = searchParams.get('roomId') || ''
  const checkIn = searchParams.get('checkIn') || ''
  const checkOut = searchParams.get('checkOut') || ''
  const guests = Number(searchParams.get('guests') || 1)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleConfirmBooking() {
    if (!hotelId || !roomId || !checkIn || !checkOut) {
      setError('Booking information is incomplete.')
      return
    }

    try {
      setLoading(true)
      setError('')
      setMessage('Creating your reservation...')

      // Step 1: Prepare booking information.
      const bookingData = {
        hotelId,
        roomId,
        checkIn,
        checkOut,
        guests,
      }

      // Step 2: Create a pending booking and Razorpay order.
      const result = await createBooking(bookingData)

      if (!result.success || !result.order?.id || !result.keyId) {
        throw new Error('Unable to create the payment order.')
      }

      const { booking, order, keyId } = result

      // Step 3: Load Razorpay Checkout.
      setMessage('Opening secure payment checkout...')

      const scriptLoaded = await loadRazorpayScript()

      if (!scriptLoaded) {
        throw new Error(
          'Unable to load Razorpay Checkout. Your reservation may remain pending.',
        )
      }

      // Step 4: Configure the Razorpay Checkout window.
      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'The Stay',
        description: 'Hotel Room Reservation',
        order_id: order.id,

        // Called after Razorpay reports successful payment.
        handler: async function (response) {
          try {
            setLoading(true)
            setError('')
            setMessage('Verifying your payment...')

            // Step 5: Verify payment with our backend.
            const verificationResult = await verifyPayment({
              bookingId: booking._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })

            if (verificationResult.success) {
              setMessage('Payment successful! Your booking is confirmed.')

              // Step 6: Open the user's booking history.
              navigate('/my-bookings')
            }
          } catch (verificationError) {
            setError(
              verificationError.response?.data?.message ||
                'Payment was received, but verification could not be completed. Please check My Bookings before trying again.',
            )
            setMessage('')
          } finally {
            setLoading(false)
          }
        },

        // Display payment failure information.
        modal: {
          ondismiss: function () {
            setLoading(false)
            setMessage(
              'Checkout closed. Your reservation may remain pending until its temporary hold expires.',
            )
          },
        },

        // Handle payment failures reported by Razorpay.
        notes: {
          bookingId: booking._id,
        },

        theme: {
          color: '#2563eb',
        },
      }

      // Step 7: Open the payment window.
      const razorpay = new window.Razorpay(options)

      razorpay.on('payment.failed', function (response) {
        setLoading(false)
        setMessage('')

        setError(
          response.error?.description ||
            'Payment failed. Your booking has not been confirmed.',
        )
      })

      razorpay.open()

      setMessage('')
      setLoading(false)
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          'Unable to complete the booking. Please try again.',
      )
      setMessage('')
      setLoading(false)
    }
  }

  return (
    <main className="booking-confirmation-page">
      <section className="booking-confirmation-card">
        <h1>Confirm your booking</h1>

        <p>Check-in: {checkIn}</p>
        <p>Check-out: {checkOut}</p>

        <p>
          Guests: {guests} {guests === 1 ? 'guest' : 'guests'}
        </p>

        <p>
          Confirm your stay details before proceeding to payment.
        </p>

        {error && <p className="form-error">{error}</p>}

        {message && <p>{message}</p>}

        <button
          className="reserve-button"
          type="button"
          onClick={handleConfirmBooking}
          disabled={loading}
        >
          {loading ? 'Please wait...' : 'Proceed to Payment'}
        </button>
      </section>
    </main>
  )
}

export default BookingConfirmation
