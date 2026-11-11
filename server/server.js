require('dotenv').config()

const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const hotelRoutes = require('./routes/hotelRoutes')
const bookingRoutes = require('./routes/bookingRoutes')
const app = express()

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
)


// Middleware
app.use(express.json())

// Mount authentication endpoints under this prefix
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/hotels', hotelRoutes)
app.use('/api/v1/bookings', bookingRoutes)

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'StayEase backend is running',
  })
})

const PORT = process.env.PORT || 5000

// Connect to MongoDB first, then start Express
async function startServer() {
  await connectDB()

  app.listen(PORT, () => {
    console.log(`The Stay server running at http://localhost:${PORT}`)
  })
}

startServer()