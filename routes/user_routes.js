// FIX #8: was importing { register } from '../controllers/user_controller'
//         but user_controller.js exports { getRequests, addRequest, editRequest }
//         There is NO register function there — that lives in auth_controller.
//         user_routes is now removed in favor of auth_routes for registration.
//
// If you still want a separate /api/users route for profile management,
// keep this file and add profile endpoints here.

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