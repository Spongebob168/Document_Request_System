import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:5000/api/auth'
})

export const registerUser = (data) => api.post('/register', data)
export const loginUser = (data) => api.post('/login', data)

export const getMe = (token) =>
    api.get('/me', {
        headers: { Authorization: `Bearer ${token}` }
    })