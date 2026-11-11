const jwt = require('jsonwebtoken')
const User = require('../models/user')


async function protect(req, res, next) {
  try {
    // Read the Authorization header
    const authHeader = req.headers.authorization

    // Check whether the token was provided
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Token is missing.',
      })
    }

    // Extract the token after "Bearer "
    const token = authHeader.split(' ')[1]

    // Verify the token's signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Find the user associated with this token
    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists. Please log in again.',
      })
    }

    // Make the authenticated user available to the next middleware or route
    req.user = user

    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message:
        error.name === 'TokenExpiredError'
          ? 'Token has expired. Please log in again.'
          : 'Invalid token. Please log in again.',
    })
  }
}

module.exports = protect