const express = require('express')
const cors = require('cors')
require('dotenv').config()

const errorMiddleware = require('./middleware/error_middleware')

const authRoutes = require('./routes/auth_routes')
const requestRoutes = require('./routes/request_routes')
const adminRoutes = require('./routes/admin_routes')
const documentRoutes = require('./routes/document_routes')

const app = express()

app.use(cors())
app.use(express.json())

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)     // register, login, me
app.use('/api/requests', requestRoutes)  // student CRUD
app.use('/api/admin', adminRoutes)    // admin operations
app.use('/api/documents', documentRoutes) // document types

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorMiddleware)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})