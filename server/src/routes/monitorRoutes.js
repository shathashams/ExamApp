import express from 'express'
import monitorController from '../controllers/monitorController.js'
import { checkAuth } from '../middleware/auth.js'

const router = express.Router()

// Authenticate all routes
router.use(checkAuth)

// GET active sessions list (Teachers only)
router.get('/', monitorController.getActiveSessions)

// POST start active session (Students only)
router.post('/start', monitorController.startSession)

// POST heartbeat update (Students only)
router.post('/heartbeat', monitorController.sendHeartbeat)

// DELETE end session (Students only)
router.delete('/end/:examId', monitorController.endSession)

export default router
