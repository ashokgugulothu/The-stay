const mongoose = require('mongoose')

async function connectDB() {
  try {
    // Connect using the URI stored in .env
    await mongoose.connect(process.env.MONGO_URI)

    console.log('MongoDB connected successfully')
  } catch (error) {
    console.error('MongoDB connection failed:', error.message)

    // Stop the app if the database connection fails
    process.exit(1)
  }
}

module.exports = connectDB