const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    roomType: {
      type: String,
      enum: ['Standard', 'Deluxe', 'Suite', 'Family'],
      required: true,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      default: '',
    },

    amenities: {
      type: [String],
      default: [],
    },

    images: {
      type: [String],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Used to coordinate concurrent booking attempts
    availabilityVersion: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

roomSchema.index({ hotel: 1, isActive: 1 })

module.exports = mongoose.model('Room', roomSchema)