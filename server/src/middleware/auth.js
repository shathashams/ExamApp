import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || 'exam-app-default-secret-key'

// Middleware to validate JWT token and set req.user context
export const checkAuth = (req, res, next) => {
    const authHeader = req.headers['authorization']

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Token is required' })
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        req.user = {
            id: decoded.id,
            role: decoded.role,
            username: decoded.username,
            fullName: decoded.fullName
        }
        next()
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' })
    }
}

// Helper function to generate JWT token
export const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            role: user.role,
            username: user.username,
            fullName: user.fullName
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    )
}
