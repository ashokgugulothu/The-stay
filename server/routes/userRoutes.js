const express = require('express')
const protect = require('../middleware/authMiddleware')

const router = express.Router()

// GET /api/v1/users/me
// Only authenticated users can access this route
router.get('/me', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authenticated user details fetched successfully',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  })
})

module.exports = router