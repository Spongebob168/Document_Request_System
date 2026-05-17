const {
    getRequestsByUserId,
    createRequest,
    updateRequest,
    deleteRequest
} = require('../models/request_model')
const { validateRequest } = require('../utility/validators')

// ── GET MY REQUESTS (student) ─────────────────────────────────────────────────
const getMyRequests = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM drs.document_requests WHERE is_deleted = FALSE'
        )
        res.json(result.rows)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
}
// ── SUBMIT REQUEST (student) ──────────────────────────────────────────────────
const submitRequest = async (req, res) => {
    try {
        const errors = validateRequest(req.body)
        if (errors.length > 0) {
            return res.status(400).json({ success: false, errors })
        }

        const {
            documentTypeId,
            purpose,
            quantity = 1
        } = req.body

        const request = await createRequest(
            req.user.userId,   // user_id
            documentTypeId,    // document_type_id
            purpose,           // purpose
            quantity           // quantity
        )

        res.status(201).json({
            success: true,
            message: 'Request submitted successfully',
            request
        })
    } catch (err) {
        console.error('submitRequest error:', err)
        res.status(500).json({ message: 'Server error' })
    }
}

// ── UPDATE STATUS (admin) ─────────────────────────────────────────────────────
const updateStatus = async (req, res) => {
    try {
        const { id } = req.params
        const { status } = req.body

        if (!status) {
            return res.status(400).json({ message: 'Status is required' })
        }

        const updated = await updateRequest(id, status)

        if (!updated) {
            return res.status(404).json({ message: 'Request not found' })
        }

        res.json({ success: true, request: updated })
    } catch (err) {
        console.error('updateStatus error:', err)
        res.status(500).json({ message: 'Server error' })
    }
}

// ── SOFT DELETE (admin) ───────────────────────────────────────────────────────
const softDelete = async (req, res) => {
    try {
        const { id } = req.params
        const deleted = await deleteRequest(id)

        if (!deleted) {
            return res.status(404).json({ message: 'Request not found' })
        }

        res.json({ success: true, message: 'Request deleted', request: deleted })
    } catch (err) {
        console.error('softDelete error:', err)
        res.status(500).json({ message: 'Server error' })
    }
}

module.exports = {
    getMyRequests,
    submitRequest,
    updateStatus,
    softDelete
}