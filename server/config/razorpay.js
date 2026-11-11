
const Razorpay = require('razorpay')

// Initialize Razorpay using private backend environment variables.
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// Export the configured Razorpay instance.
module.exports = razorpay
