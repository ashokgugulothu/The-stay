
const express = require('express')
const mongoose = require('mongoose')

const Hotel = require('../models/Hotel')
const Room = require('../models/Room')
const Booking = require('../models/Booking')

const router = express.Router()

// Convert YYYY-MM-DD into a validated UTC date.
function parseDateOnly(value) {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
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

// Validate optional search dates and guest count.
function validateSearch(query) {
  const { checkIn, checkOut } = query

  const guests =
    query.guests === undefined ? 1 : Number(query.guests)

  if (!Number.isInteger(guests) || guests < 1) {
    return { error: 'Guests must be a positive whole number.' }
  }

  // Both dates must be provided together, or both omitted.
  if (Boolean(checkIn) !== Boolean(checkOut)) {
    return {
      error: 'Please provide both check-in and check-out dates.',
    }
  }

  if (!checkIn && !checkOut) {
    return { guests, checkIn: null, checkOut: null }
  }

  const startDate = parseDateOnly(checkIn)
  const endDate = parseDateOnly(checkOut)

  if (!startDate || !endDate) {
    return {
      error: 'Please provide valid dates in YYYY-MM-DD format.',
    }
  }

  if (endDate <= startDate) {
    return { error: 'Check-out must be after check-in.' }
  }

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  if (startDate < today) {
    return { error: 'Check-in cannot be in the past.' }
  }

  return {
    guests,
    checkIn: startDate,
    checkOut: endDate,
  }
}

// Find rooms that are unavailable because of:
// 1. A confirmed booking.
// 2. A pending booking whose payment hold has not expired.
async function getUnavailableRoomIds(checkIn, checkOut) {
  const now = new Date()

  return Booking.distinct('room', {
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },

    $or: [
      {
        status: 'confirmed',
      },
      {
        status: 'pending',
        holdExpiresAt: { $gt: now },
      },
    ],
  })
}

// GET /api/v1/hotels
// Search hotels and return the cheapest available room price.
router.get('/', async (req, res) => {
  try {
    const { destination } = req.query
    const search = validateSearch(req.query)

    if (search.error) {
      return res.status(400).json({
        success: false,
        message: search.error,
      })
    }

    const hotelFilter = { isActive: true }

    // Search both hotel name and city.
    if (destination && destination.trim()) {
      const safeDestination = destination
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

      const destinationRegex = new RegExp(safeDestination, 'i')

      hotelFilter.$or = [
        { name: destinationRegex },
        { city: destinationRegex },
      ]
    }

    const hotels = await Hotel.find(hotelFilter).lean()

    if (hotels.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        hotels: [],
      })
    }

    const hotelIds = hotels.map((hotel) => hotel._id)

    // Find active rooms that can accommodate the requested guests.
    const roomFilter = {
      hotel: { $in: hotelIds },
      isActive: true,
      capacity: { $gte: search.guests },
    }

    // Exclude rooms with overlapping confirmed or active pending bookings.
    if (search.checkIn && search.checkOut) {
      const unavailableRoomIds = await getUnavailableRoomIds(
        search.checkIn,
        search.checkOut
      )

      roomFilter._id = { $nin: unavailableRoomIds }
    }

    const rooms = await Room.find(roomFilter).lean()

    // Group rooms by hotel and calculate the cheapest available price.
    const hotelsWithPrices = hotels
      .map((hotel) => {
        const hotelRooms = rooms.filter(
          (room) =>
            room.hotel.toString() === hotel._id.toString()
        )

        if (hotelRooms.length === 0) {
          return null
        }

        const cheapestPrice = Math.min(
          ...hotelRooms.map((room) => room.pricePerNight)
        )

        return {
          ...hotel,
          cheapestPrice,
        }
      })
      .filter(Boolean)

    return res.status(200).json({
      success: true,
      count: hotelsWithPrices.length,
      hotels: hotelsWithPrices,
    })
  } catch (error) {
    console.error('Hotel search error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to search hotels.',
    })
  }
})

// GET /api/v1/hotels/:hotelId
// Return hotel information and its available rooms.
router.get('/:hotelId', async (req, res) => {
  try {
    const { hotelId } = req.params
    const search = validateSearch(req.query)

    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid hotel ID.',
      })
    }

    if (search.error) {
      return res.status(400).json({
        success: false,
        message: search.error,
      })
    }

    const hotel = await Hotel.findOne({
      _id: hotelId,
      isActive: true,
    }).lean()

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found.',
      })
    }

    const roomFilter = {
      hotel: hotelId,
      isActive: true,
      capacity: { $gte: search.guests },
    }

    // Apply the same availability rules to hotel details.
    if (search.checkIn && search.checkOut) {
      const unavailableRoomIds = await getUnavailableRoomIds(
        search.checkIn,
        search.checkOut
      )

      roomFilter._id = { $nin: unavailableRoomIds }
    }

    const rooms = await Room.find(roomFilter)
      .sort({ pricePerNight: 1 })
      .lean()

    return res.status(200).json({
      success: true,
      hotel,
      rooms,
    })
  } catch (error) {
    console.error('Hotel details error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve hotel details.',
    })
  }
})

module.exports = router
