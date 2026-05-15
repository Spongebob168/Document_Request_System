const pool = require('../config/db')

// ── GET ALL (admin) ───────────────────────────────────────────────────────────
const getAllRequests = async () => {
    const result = await pool.query(`
        SELECT * FROM drs.v_request_details
        ORDER BY request_id DESC
    `)
    return result.rows
}

// ── GET BY USER (student sees own requests only) ──────────────────────────────
// FIX #1: was missing — students had no way to fetch only their requests
const getRequestsByUserId = async (user_id) => {
    const result = await pool.query(
        `
        SELECT
            dr.request_id,
            dt.document_name,
            dr.purpose,
            dr.quantity,
            dr.request_status,
            dr.request_date,
            dr.release_date
        FROM drs.document_requests dr
        JOIN drs.document_types dt
            ON dr.document_type_id = dt.document_type_id
        WHERE dr.user_id = $1
          AND dr.is_deleted = FALSE
        ORDER BY dr.request_id DESC
        `,
        [user_id]
    )
    return result.rows
}

// ── CREATE ────────────────────────────────────────────────────────────────────
const createRequest = async (
    user_id,
    document_type_id,
    purpose,
    quantity
) => {
    const result = await pool.query(
        `
        INSERT INTO drs.document_requests
            (user_id, document_type_id, purpose, quantity)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [user_id, document_type_id, purpose, quantity]
    )
    return result.rows[0]
}

// ── UPDATE STATUS ─────────────────────────────────────────────────────────────
const updateRequest = async (id, status) => {
    const result = await pool.query(
        `
        UPDATE drs.document_requests
        SET request_status = $1
        WHERE request_id   = $2
        RETURNING *
        `,
        [status, id]
    )
    return result.rows[0]
}

// ── SOFT DELETE ───────────────────────────────────────────────────────────────
const deleteRequest = async (id) => {
    const result = await pool.query(
        `
        UPDATE drs.document_requests
        SET is_deleted = TRUE
        WHERE request_id = $1
        RETURNING *
        `,
        [id]
    )
    return result.rows[0]
}

module.exports = {
    getAllRequests,
    getRequestsByUserId,
    createRequest,
    updateRequest,
    deleteRequest
}