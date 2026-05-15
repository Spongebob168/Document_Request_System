const express = require('express')
const router = express.Router()

const { protect, authorizeRoles } = require('../middleware/auth_middleware')
const {
  getMyRequests,
  submitRequest,
  updateStatus,
  softDelete
} = require('../controllers/request_controller')

// FIX #5: was using "let requests = []" in-memory array — total data loss on restart.
//         Now wired to the real PostgreSQL database via the controller.

// GET  /api/requests       — student sees their own requests only
router.get('/', protect, authorizeRoles('student', 'admin'), getMyRequests)

// POST /api/requests       — student submits a new request
router.post('/', protect, authorizeRoles('student'), submitRequest)

// PUT  /api/requests/:id   — admin updates request status
router.put('/:id', protect, authorizeRoles('admin'), updateStatus)

// DELETE /api/requests/:id — admin soft deletes a request
router.delete('/:id', protect, authorizeRoles('admin'), softDelete)

module.exports = router