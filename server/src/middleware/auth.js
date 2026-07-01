// Middleware to validate user authorization headers and set req.user context
export const checkAuth = (req, res, next) => {
    const userId = req.headers['x-user-id']
    const userRole = req.headers['x-user-role']
    const userUsername = req.headers['x-user-username']

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: User ID is required' })
    }

    req.user = {
        id: Number(userId),
        role: userRole,
        username: userUsername || ''
    }
    next()
}
