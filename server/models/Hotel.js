const mongoose = require('mongoose')

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    address: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: '',
    },

    starRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },

    images: {
      type: [String],
      default: [],
    },

    amenities: {
      type: [String],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// Search hotels by city
hotelSchema.index({ city: 1, isActive: 1 })

module.exports = mongoose.model('Hotel', hotelSchema)