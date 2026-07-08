import express from 'express'
import scoreController from '../controllers/scoreController.js'
import { checkAuth } from '../middleware/auth.js'

const router = express.Router()

// החלת מידלוור אימות על כל נתיבי הציונים
router.use(checkAuth)

// קבלת כל הציונים (מסונן למורים לפי מבחנים שבבעלותם, או לתלמידים לפי המזהה שלהם)
router.get('/', scoreController.getScores)

// קבלת ציונים לפי מבחן (מורים בלבד)
router.get('/exam/:examId', scoreController.getScoresByExam)

// שמירת ציון חדש (תלמידים בלבד)
router.post('/', scoreController.saveScore)

// עדכון ציון והוספת משוב (מורים בלבד)
router.put('/:id', scoreController.updateScore)

export default router
