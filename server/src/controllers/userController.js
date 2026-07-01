import userService from '../services/userService.js'

class UserController {
    // קבלת כל המשתמשים ללא סיסמאות
    async getUsers(req, res, next) {
        try {
            const users = await userService.getAllUsers()
            res.json(users)
        } catch (error) {
            next(error)
        }
    }

    // התחברות לפי username, password ו-role
    async login(req, res, next) {
        try {
            const { username, password, role } = req.body

            if (!username || !password) {
                const err = new Error('Username and password are required')
                err.status = 400
                throw err
            }

            const user = await userService.loginUser(username, password)

            if (!user) {
                const err = new Error('Invalid username or password')
                err.status = 401
                throw err
            }

            if (role && user.role !== role) {
                const err = new Error(`Unauthorized role access. You are registered as a ${user.role}.`)
                err.status = 403
                throw err
            }

            res.json(user)
        } catch (error) {
            next(error)
        }
    }

    // הרשמת משתמש חדש
    async register(req, res, next) {
        try {
            const { username, password, fullName, role } = req.body

            if (!username || !password || !fullName || !role) {
                const err = new Error('All fields are required')
                err.status = 400
                throw err
            }

            if (!['teacher', 'student'].includes(role)) {
                const err = new Error('Invalid role')
                err.status = 400
                throw err
            }

            if (role !== 'student') {
                const err = new Error('Only student accounts can be registered.')
                err.status = 403
                throw err
            }

            const existingUser = await userService.getUserByUsername(username)

            if (existingUser) {
                const err = new Error('Username already exists')
                err.status = 409
                throw err
            }

            const newUser = await userService.registerUser({
                username,
                password,
                fullName,
                role
            })

            res.status(201).json(newUser)
        } catch (error) {
            next(error)
        }
    }

    // קבלת משתמש לפי username
    async getUser(req, res, next) {
        try {
            const { username } = req.params
            const user = await userService.getUserByUsername(username)

            if (!user) {
                const err = new Error('User not found')
                err.status = 404
                throw err
            }

            res.json(user)
        } catch (error) {
            next(error)
        }
    }
}

export default new UserController()
