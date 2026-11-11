
const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema(
  {
    // User who made the reservation.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Hotel associated with this reservation.
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },

    // Individual room reserved by the user.
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },

    // Reservation dates.
    checkIn: {
      type: Date,
      required: true,
    },

    checkOut: {
      type: Date,
      required: true,
    },

    guests: {
      type: Number,
      required: true,
      min: 1,
    },

    nights: {
      type: Number,
      required: true,
      min: 1,
    },

    // Price snapshot at the time of booking.
    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // Booking lifecycle.
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'expired'],
      default: 'pending',
    },

    // Payment lifecycle.
    paymentStatus: {
      type: String,
      enum: [
        'not_required',
        'created',
        'paid',
        'failed',
        'refunded',
        'expired',
      ],
      default: 'not_required',
    },

    // Razorpay order created by the backend.
    razorpayOrderId: {
      type: String,
      default: null,
    },

    // Payment details returned by Razorpay.
    razorpayPaymentId: {
      type: String,
      default: null,
    },

    razorpaySignature: {
      type: String,
      default: null,
    },

    // Amount sent to Razorpay, stored in paise.
    paymentAmount: {
      type: Number,
      min: 0,
      default: null,
    },

    currency: {
      type: String,
      default: 'INR',
    },

    // The time until which an unpaid room reservation is held.
    holdExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// Helps retrieve reservations for a particular room.
bookingSchema.index({
  room: 1,
  status: 1,
  checkIn: 1,
  checkOut: 1,
})

// Helps identify pending reservations whose holds have expired.
bookingSchema.index({
  room: 1,
  status: 1,
  holdExpiresAt: 1,
})

// Helps retrieve a user's booking history.
bookingSchema.index({
  user: 1,
  createdAt: -1,
})

// Helps find bookings associated with a Razorpay order.
bookingSchema.index({
  razorpayOrderId: 1,
})

module.exports = mongoose.model('Booking', bookingSchema)
