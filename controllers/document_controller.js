

const { getDocumentTypes } = require('../models/document_model')

const fetchDocumentTypes = async (req, res) => {
    try {
        const types = await getDocumentTypes()
        res.json(types)
    } catch (err) {
        console.error('fetchDocumentTypes error:', err)
        res.status(500).json({ message: 'Server error' })
    }
}

module.exports = { fetchDocumentTypes }