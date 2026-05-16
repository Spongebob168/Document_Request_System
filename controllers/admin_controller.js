const {
    getAllRequests,
    updateRequest,
    deleteRequest
} = require('../models/request_model')

// GET /api/admin/requests — returns all requests with student + document info
const getAllRequestsAdmin = async (req, res) => {
    try {

        const requests = await getAllRequests()
        res.json(requests)
    } catch (err) {
        console.error('getAllRequestsAdmin error:', err)
        res.status(500).json({ message: err.message })
    }
}

// PUT /api/admin/requests/:id — admin updates any request status
const updateRequestAdmin = async (req, res) => {
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
        console.error('updateRequestAdmin error:', err)
        res.status(500).json({ message: err.message })
    }
}

// DELETE /api/admin/requests/:id — soft delete
const deleteRequestAdmin = async (req, res) => {
    try {
        const deleted = await deleteRequest(req.params.id)
        if (!deleted) {
            return res.status(404).json({ message: 'Request not found' })
        }
        res.json({ success: true, message: 'Request deleted' })
    } catch (err) {
        console.error('deleteRequestAdmin error:', err)
        res.status(500).json({ message: err.message })
    }
}

module.exports = {
    getAllRequestsAdmin,
    updateRequestAdmin,
    deleteRequestAdmin
}