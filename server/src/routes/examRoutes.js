import express from 'express'
import examController from '../controllers/examController.js'
import { checkAuth } from '../middleware/auth.js'

const router = express.Router()

// החלת מידלוור אימות על כל נתיבי המבחנים
router.use(checkAuth)

// קבלת כל המבחנים (מסונן לפי תפקיד בעלים/תלמיד)
router.get('/', examController.getExams)

// קבלת מבחן לפי מזהה
router.get('/:id', examController.getExam)

// יצירת מבחן חדש (מורים בלבד)
router.post('/', examController.createExam)

// עדכון מבחן קיים (מורים בעלים בלבד)
router.put('/:id', examController.updateExam)

// מחיקת מבחן (מורים בעלים בלבד)
router.delete('/:id', examController.deleteExam)

export default router
