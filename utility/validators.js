const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

const validatePassword = (v) => v && v.length >= 8

const validatePhone = (v) => /^(09|\+639)\d{9}$/.test(v)

const validateRequest = ({ documentTypeId, purpose, quantity }) => {
    const errors = []

    if (!documentTypeId)
        errors.push('Document type is required')

    if (!purpose || purpose.trim().length < 5)
        errors.push('Purpose must be at least 5 characters')

    // quantity defaults to 1 in DB, so treat as optional here
    if (quantity !== undefined && (isNaN(quantity) || quantity < 1))
        errors.push('Quantity must be at least 1')

    return errors
}

module.exports = {
    validateEmail,
    validatePassword,
    validatePhone,
    validateRequest
}