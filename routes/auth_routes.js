const express = require('express')
const { register, login, me } = require('../controllers/auth_controller')
const { protect } = require('../middleware/auth_middleware')

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', protect, me)

module.exports = router