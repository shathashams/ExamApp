import express from 'express'
import scoreController from '../controllers/scoreController.js'

const router = express.Router()

// קבלת כל הציונים
router.get('/', scoreController.getScores)

// קבלת ציונים לפי מבחן
router.get('/exam/:examId', scoreController.getScoresByExam)

// שמירת ציון חדש
router.post('/', scoreController.saveScore)

export default router
