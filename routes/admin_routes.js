const express = require('express')
const router = express.Router()

const { protect, authorizeRoles } = require('../middleware/auth_middleware')

const {
    getAllRequestsAdmin,
    updateRequestAdmin,
    deleteRequestAdmin
} = require('../controllers/admin_controller')

// GET    /api/admin/requests      — all requests (admin only)
router.get('/requests', protect, authorizeRoles('admin'), getAllRequestsAdmin)

// PUT    /api/admin/requests/:id  — update status (admin only)
router.put('/requests/:id', protect, authorizeRoles('admin'), updateRequestAdmin)

// DELETE /api/admin/requests/:id  — soft delete (admin only)
router.delete('/requests/:id', protect, authorizeRoles('admin'), deleteRequestAdmin)

module.exports = router