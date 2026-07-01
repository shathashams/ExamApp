import express from 'express'
import userController from '../controllers/userController.js'

const router = express.Router()

// קבלת כל המשתמשים
router.get('/', userController.getUsers)

// התחברות
router.post('/login', userController.login)

// הרשמה
router.post('/register', userController.register)

// קבלת משתמש ספציפי לפי username
router.get('/:username', userController.getUser)

export default router
