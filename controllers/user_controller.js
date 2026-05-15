const {
    getAllRequests,
    createRequest,
    updateRequest
} = require('../models/request_model')

// GET
const getRequests = async (req, res) => {
    try {
        const requests = await getAllRequests()

        res.json(requests)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Server error'
        })
    }
}

// CREATE
const addRequest = async (req, res) => {
    try {
        const {
            student,
            document,
            purpose,
            contact,
            status,
            isDeleted
        } = req.body

        const request = await createRequest(
            student,
            document,
            purpose,
            contact,
            status,
            isDeleted
        )

        res.json(request)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Server error'
        })
    }
}

// UPDATE
const editRequest = async (req, res) => {
    try {

        console.log('PARAMS:', req.params)
        console.log('BODY:', req.body)

        const id = req.params.id

        const { status } = req.body

        const updated = await updateRequest(
            id,
            status
        )

        console.log('UPDATED:', updated)

        res.json(updated)

    } catch (err) {

        console.log(err)

        res.status(500).json({
            message: 'Server error'
        })
    }
}

module.exports = {
    getRequests,
    addRequest,
    editRequest
}