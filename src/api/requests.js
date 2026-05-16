import axios from 'axios'

const API_URL = 'http://localhost:5000/api'

// FIX #2: every request needs the JWT token in the Authorization header
// without it the backend returns 401 Unauthorized
const authHeader = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
    }
})

// GET — student sees only their own requests
export const getRequests = async () => {
    const response = await axios.get(`${API_URL}/requests`, authHeader())
    return response.data
}

// GET — admin sees all requests
export const getAllRequests = async () => {
    const response = await axios.get(`${API_URL}/admin/requests`, authHeader())
    return response.data
}

// GET — document types for the request form dropdown
export const getDocumentTypes = async () => {
    const response = await axios.get(`${API_URL}/documents`, authHeader())
    return response.data
}

// CREATE — student submits a request
export const createRequest = async (requestData) => {
    const response = await axios.post(`${API_URL}/requests`, requestData, authHeader())
    return response.data
}

// UPDATE — admin updates status
export const updateRequest = async (id, updatedData) => {
    const response = await axios.put(
        `${API_URL}/admin/requests/${id}`,
        updatedData,
        authHeader()
    )
    return response.data
}

// DELETE — admin soft deletes
export const deleteRequest = async (id) => {
    const response = await axios.delete(
        `${API_URL}/admin/requests/${id}`,
        authHeader()
    )
    return response.data
}