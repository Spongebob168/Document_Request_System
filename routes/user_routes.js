const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth_middleware')
const { getUserById } = require('../models/user_model')

// GET /api/users/profile — get own profile
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await getUserById(req.user.userId)
        if (!user) return res.status(404).json({ message: 'User not found' })
        res.json(user)
    } catch (err) {
        res.status(500).json({ message: 'Server error' })
    }
})

module.exports = router