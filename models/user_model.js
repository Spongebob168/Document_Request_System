const pool = require('../config/db')

const getUserByEmail = async (email) => {
    const result = await pool.query(
        `SELECT * FROM drs.users
     WHERE email = $1 AND is_deleted = FALSE`,
        [email]
    )
    return result.rows[0]
}

const getUserById = async (userId) => {
    const result = await pool.query(
        `SELECT user_id, student_number, first_name, last_name, email, role, created_at, updated_at
     FROM drs.users
     WHERE user_id = $1 AND is_deleted = FALSE`,
        [userId]
    )
    return result.rows[0]
}

const createUser = async ({
    student_number,
    first_name,
    last_name,
    email,
    password,
    role
}) => {
    const result = await pool.query(
        `INSERT INTO drs.users
      (student_number, first_name, last_name, email, password, role)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING user_id, student_number, first_name, last_name, email, role, created_at`,
        [student_number, first_name, last_name, email, password, role]
    )
    return result.rows[0]
}

module.exports = {
    getUserByEmail,
    getUserById,
    createUser
}