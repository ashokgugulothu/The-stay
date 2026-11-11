const crypto = require('crypto')

const razorpay = require('../config/razorpay')
const express = require('express')
const mongoose = require('mongoose')

const Hotel = require('../models/Hotel')
const Room = require('../models/Room')
const Booking = require('../models/Booking')
const protect = require('../middleware/authMiddleware')

const router = express.Router()

// Convert a YYYY-MM-DD string into a validated UTC date.
function parseDateOnly(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null
  }

  const date = new Date(`${value}T00:00:00.000Z`)

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    return null
  }

  return date
}

// POST /api/v1/bookings
// Create a confirmed booking for the logged-in user.

// POST /api/v1/bookings
// Create a pending booking and its Razorpay payment order.
router.post('/', protect, async (req, res) => {
  const { hotelId, roomId, checkIn, checkOut, guests } = req.body

  // 1. Validate MongoDB IDs.
  if (
    !mongoose.Types.ObjectId.isValid(hotelId) ||
    !mongoose.Types.ObjectId.isValid(roomId)
  ) {
    return res.status(400).json({
      success: false,
      message: 'Invalid hotel ID or room ID.',
    })
  }

  // 2. Validate guest count.
  const guestCount = Number(guests)

  if (!Number.isInteger(guestCount) || guestCount < 1) {
    return res.status(400).json({
      success: false,
      message: 'Guests must be a positive whole number.',
    })
  }

  // 3. Validate booking dates.
  const startDate = parseDateOnly(checkIn)
  const endDate = parseDateOnly(checkOut)

  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'Provide valid check-in and check-out dates.',
    })
  }

  if (endDate <= startDate) {
    return res.status(400).json({
      success: false,
      message: 'Check-out must be after check-in.',
    })
  }

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  if (startDate < today) {
    return res.status(400).json({
      success: false,
      message: 'Check-in cannot be in the past.',
    })
  }

  // Calculate the number of nights.
  const millisecondsPerDay = 24 * 60 * 60 * 1000
  const nights = (endDate - startDate) / millisecondsPerDay

  // Hold the room for 10 minutes while the customer pays.
  const holdExpiresAt = new Date(Date.now() + 10 * 60 * 1000)

  const session = await mongoose.startSession()

  let createdBooking

  try {
    // 4. Create a pending reservation inside a transaction.
    await session.withTransaction(async () => {
      // Update a shared room document to protect against
      // concurrent booking attempts.
      const room = await Room.findOneAndUpdate(
        {
          _id: roomId,
          hotel: hotelId,
          isActive: true,
        },
        {
          $inc: { availabilityVersion: 1 },
        },
        {
          returnDocument: 'after',
          session,
        }
      )

      if (!room) {
        const error = new Error('Room not found or unavailable.')
        error.statusCode = 404
        throw error
      }

      // Check whether the hotel is active.
      const hotel = await Hotel.findOne({
        _id: hotelId,
        isActive: true,
      }).session(session)

      if (!hotel) {
        const error = new Error('Hotel not found.')
        error.statusCode = 404
        throw error
      }

      // Check room capacity.
      if (room.capacity < guestCount) {
        const error = new Error(
          `This room can accommodate a maximum of ${room.capacity} guests.`
        )
        error.statusCode = 400
        throw error
      }

      // Check for overlapping confirmed bookings
      // or pending bookings with an active payment hold.
      const existingBooking = await Booking.findOne({
        room: roomId,
        $or: [
          { status: 'confirmed' },
          {
            status: 'pending',
            holdExpiresAt: { $gt: new Date() },
          },
        ],
        checkIn: { $lt: endDate },
        checkOut: { $gt: startDate },
      }).session(session)

      if (existingBooking) {
        const error = new Error(
          'This room is already booked or temporarily reserved for the selected dates.'
        )
        error.statusCode = 409
        throw error
      }

      // Calculate the price using the database value.
      const pricePerNight = room.pricePerNight

      const totalPrice = Math.round(
        pricePerNight * nights * 100
      ) / 100

      // Razorpay requires the amount in paise.
      const paymentAmount = Math.round(totalPrice * 100)

      if (!Number.isSafeInteger(paymentAmount) || paymentAmount <= 0) {
        const error = new Error('Invalid booking payment amount.')
        error.statusCode = 400
        throw error
      }

      // Create the booking as pending, not confirmed.
      const bookings = await Booking.create(
        [
          {
            user: req.user._id,
            hotel: hotel._id,
            room: room._id,
            checkIn: startDate,
            checkOut: endDate,
            guests: guestCount,
            nights,
            pricePerNight,
            totalPrice,
            status: 'pending',
            paymentStatus: 'created',
            paymentAmount,
            currency: 'INR',
            holdExpiresAt,
          },
        ],
        { session }
      )

      createdBooking = bookings[0]
    })

    // 5. Create the Razorpay order AFTER the database transaction.
    // External API calls should not run inside a transaction callback,
    // because MongoDB may retry that callback.
    const order = await razorpay.orders.create({
      amount: createdBooking.paymentAmount,
      currency: createdBooking.currency,
      receipt: `stay_${createdBooking._id}`,
      notes: {
        bookingId: createdBooking._id.toString(),
        userId: req.user._id.toString(),
      },
    })

    // 6. Save the Razorpay order ID against the booking.
    const updatedBooking = await Booking.findOneAndUpdate(
      {
        _id: createdBooking._id,
        status: 'pending',
        holdExpiresAt: { $gt: new Date() },
      },
      {
        $set: {
          razorpayOrderId: order.id,
        },
      },
      {
        returnDocument: 'after',
        runValidators: true,
      }
    )

    if (!updatedBooking) {
      const error = new Error(
        'The reservation hold expired. Please try booking again.'
      )
      error.statusCode = 409
      throw error
    }

    // 7. Return the order details to the React frontend.
    return res.status(201).json({
      success: true,
      message: 'Payment order created. Complete payment to confirm your booking.',
      keyId: process.env.RAZORPAY_KEY_ID,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      booking: updatedBooking,
    })
  } catch (error) {
    console.error('Booking/order creation error:', error.message)

    // If a booking was created but order creation failed,
    // release its room hold.
    if (createdBooking?._id) {
      try {
        await Booking.updateOne(
          {
            _id: createdBooking._id,
            status: 'pending',
            paymentStatus: 'created',
          },
          {
            $set: {
              status: 'expired',
              paymentStatus: 'failed',
            },
          }
        )
      } catch (cleanupError) {
        console.error(
          'Booking cleanup error:',
          cleanupError.message
        )
      }
    }

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : 'Unable to create payment order. Please try again.',
    })
  } finally {
    await session.endSession()
  }
})



// Verify Razorpay payment and confirm the booking.
router.post('/verify-payment', protect, async (req, res) => {
  try {
    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body

    // Validate required fields.
    if (
      !bookingId ||
      !mongoose.Types.ObjectId.isValid(bookingId) ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: 'All payment verification fields are required.',
      })
    }

    // Find this booking belonging to the logged-in user.
    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user._id,
    })

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      })
    }

    // Make repeated verification requests safe.
    if (
      booking.status === 'confirmed' &&
      booking.razorpayPaymentId === razorpay_payment_id
    ) {
      return res.status(200).json({
        success: true,
        message: 'Payment already verified. Booking is confirmed.',
        booking,
      })
    }

    // Only pending bookings with a valid payment order can be verified.
    if (
      booking.status !== 'pending' ||
      booking.razorpayOrderId !== razorpay_order_id ||
      !booking.holdExpiresAt ||
      booking.holdExpiresAt <= new Date()
    ) {
      return res.status(409).json({
        success: false,
        message: 'Booking reservation has expired or is no longer valid.',
      })
    }

    // Validate the signature format before comparing it.
    if (!/^[a-f0-9]{64}$/i.test(razorpay_signature)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature format.',
      })
    }

    // Generate the expected signature using the order ID stored in MongoDB.
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${booking.razorpayOrderId}|${razorpay_payment_id}`)
      .digest('hex')

    // Compare signatures safely.
    const expectedBuffer = Buffer.from(expectedSignature, 'hex')
    const receivedBuffer = Buffer.from(razorpay_signature, 'hex')

    if (!crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) {
      return res.status(400).json({
        success: false,
        message: 'Payment signature verification failed.',
      })
    }

    // Fetch the actual payment details directly from Razorpay.
    const payment = await razorpay.payments.fetch(razorpay_payment_id)

    // Verify that this payment belongs to our order.
    if (
      payment.order_id !== booking.razorpayOrderId ||
      payment.amount !== booking.paymentAmount ||
      payment.currency !== booking.currency
    ) {
      return res.status(400).json({
        success: false,
        message: 'Payment details do not match the booking.',
      })
    }

    // Only captured payments can confirm a booking.
    if (payment.status !== 'captured') {
      return res.status(409).json({
        success: false,
        message: `Payment is not captured yet. Current status: ${payment.status}`,
      })
    }

    // Atomically confirm the booking only if its reservation is still valid.
    const confirmedBooking = await Booking.findOneAndUpdate(
      {
        _id: booking._id,
        user: req.user._id,
        status: 'pending',
        paymentStatus: 'created',
        razorpayOrderId: booking.razorpayOrderId,
        holdExpiresAt: { $gt: new Date() },
      },
      {
        $set: {
          status: 'confirmed',
          paymentStatus: 'paid',
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        },
      },
      { new: true }
    )

    if (!confirmedBooking) {
      // Check whether another verification request already confirmed it.
      const latestBooking = await Booking.findById(booking._id)

      if (
        latestBooking &&
        latestBooking.status === 'confirmed' &&
        latestBooking.razorpayPaymentId === razorpay_payment_id
      ) {
        return res.status(200).json({
          success: true,
          message: 'Payment already verified. Booking is confirmed.',
          booking: latestBooking,
        })
      }

      return res.status(409).json({
        success: false,
        message: 'Booking could not be confirmed. Please contact support.',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully. Booking confirmed!',
      booking: confirmedBooking,
    })
  } catch (error) {
    console.error('Payment verification error:', error)

    return res.status(500).json({
      success: false,
      message: 'Payment verification failed. Please try again.',
    })
  }
})




// GET /api/v1/bookings/my
// Retrieve all bookings belonging to the logged-in user.
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user._id,
    })
      .populate('hotel', 'name city address images')
      .populate('room', 'name roomType capacity pricePerNight')
      .sort({ createdAt: -1 })
      .lean()

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    })
  } catch (error) {
    console.error('My bookings error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve your bookings.',
    })
  }
})


// GET /api/v1/bookings/:bookingId
// Retrieve one booking belonging to the logged-in user.
router.get('/:bookingId', protect, async (req, res) => {
  try {
    const { bookingId } = req.params

    // Validate MongoDB booking ID.
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID.',
      })
    }

    // Find the booking and verify ownership.
    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user._id,
    })
      .populate('hotel', 'name city address images')
      .populate('room', 'name roomType capacity pricePerNight')
      .lean()

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      })
    }

    return res.status(200).json({
      success: true,
      booking,
    })
  } catch (error) {
    console.error('Booking details error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve booking details.',
    })
  }
})


// PATCH /api/v1/bookings/:bookingId/cancel
// Cancel a confirmed booking belonging to the logged-in user.
router.patch('/:bookingId/cancel', protect, async (req, res) => {
  try {
    const { bookingId } = req.params

    // Validate MongoDB booking ID.
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID.',
      })
    }

    // Update only if the booking belongs to this user
    // and is currently confirmed.
    const booking = await Booking.findOneAndUpdate(
      {
        _id: bookingId,
        user: req.user._id,
        status: 'confirmed',
      },
      {
        $set: { status: 'cancelled' },
      },
      {
        returnDocument: 'after',
        runValidators: true,
      }
    )
      .populate('hotel', 'name city address images')
      .populate('room', 'name roomType capacity pricePerNight')

    if (!booking) {
      // Check whether the booking exists and belongs to this user.
      const existingBooking = await Booking.findOne({
        _id: bookingId,
        user: req.user._id,
      })

      if (!existingBooking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found.',
        })
      }

      if (existingBooking.status === 'cancelled') {
        return res.status(409).json({
          success: false,
          message: 'This booking has already been cancelled.',
        })
      }

      return res.status(409).json({
        success: false,
        message: 'This booking cannot be cancelled.',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.',
      booking,
    })
  } catch (error) {
    console.error('Booking cancellation error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to cancel booking.',
    })
  }
})


module.exports = router
