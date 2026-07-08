import express from 'express'
import feedbackController from '../controllers/feedbackController.js'
import { checkAuth } from '../middleware/auth.js'

const router = express.Router()

// החלת מידלוור אימות על כל הנתיבים
router.use(checkAuth)

// קבלת רשימת פידבקים (מורים רואים של המבחנים שלהם, סטודנטים רואים את שלהם)
router.get('/', feedbackController.getFeedbacks)

// שליחת פידבק חדש על ידי סטודנט
router.post('/', feedbackController.submitFeedback)

// מענה של מורה לפידבק
router.put('/:id/respond', feedbackController.respondToFeedback)

// אישור קבלת מענה על ידי סטודנט (מחיקת התראה)
router.put('/:id/acknowledge', feedbackController.acknowledgeFeedback)

export default router
