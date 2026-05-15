const bcrypt = require('bcryptjs')
const {
    getUserByEmail,
    getUserById,
    createUser
} = require('../models/user_model')
const generateToken = require('../utility/generate_token')

const register = async (req, res) => {
    try {
        const { student_number, first_name, last_name, email, password, role } = req.body

        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ message: 'Please fill in all required fields' })
        }

        const existingUser = await getUserByEmail(email)
        if (existingUser) {
            return res.status(409).json({ message: 'Email already exists' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await createUser({
            student_number: student_number || null,
            first_name,
            last_name,
            email,
            password: hashedPassword,
            role: role || 'student'
        })

        const token = generateToken(newUser)

        res.status(201).json({
            message: 'Account created successfully',
            user: newUser,
            token
        })
    } catch (error) {
        // FIX: catch duplicate key errors from PostgreSQL
        if (error.code === '23505') {
            if (error.constraint === 'users_student_number_key') {
                return res.status(409).json({ message: 'Student number already exists' })
            }
            if (error.constraint === 'users_email_key') {
                return res.status(409).json({ message: 'Email already exists' })
            }
            return res.status(409).json({ message: 'Duplicate entry' })
        }

        console.error('Register error:', error)
        res.status(500).json({ message: 'Server error' })
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' })
        }

        const user = await getUserByEmail(email)
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' })
        }

        const safeUser = await getUserById(user.user_id)
        const token = generateToken(user)

        res.json({
            message: 'Login successful',
            user: safeUser,
            token
        })
    } catch (error) {
        console.error('Login error:', error)
        res.status(500).json({ message: 'Server error' })
    }
}

const me = async (req, res) => {
    try {
        const user = await getUserById(req.user.userId)

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        res.json(user)
    } catch (error) {
        console.error('Me error:', error)
        res.status(500).json({ message: 'Server error' })
    }
}

module.exports = {
    register,
    login,
    me
}