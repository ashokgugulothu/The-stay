const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true, // Prevent duplicate accounts
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false, // Do not return password hash by default
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
)

module.exports = mongoose.model('User', userSchema)