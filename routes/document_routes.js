// FIX #10: No route existed for document types — students had no API
//          endpoint to load the dropdown list when filling a request.

const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth_middleware')
const { fetchDocumentTypes } = require('../controllers/document_controller')

// GET /api/documents — list all active document types (any logged-in user)
router.get('/', protect, fetchDocumentTypes)

module.exports = router