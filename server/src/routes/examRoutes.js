import express from 'express'
import examController from '../controllers/examController.js'

const router = express.Router()

// קבלת כל המבחנים
router.get('/', examController.getExams)

// קבלת מבחן לפי מזהה
router.get('/:id', examController.getExam)

// יצירת מבחן חדש
router.post('/', examController.createExam)

// עדכון מבחן קיים
router.put('/:id', examController.updateExam)

// מחיקת מבחן
router.delete('/:id', examController.deleteExam)

export default router
