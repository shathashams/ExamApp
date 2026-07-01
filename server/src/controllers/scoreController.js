import scoreService from '../services/scoreService.js'

class ScoreController {
    // קבלת כל הציונים
    async getScores(req, res, next) {
        try {
            const scores = await scoreService.getAllScores()
            res.json(scores)
        } catch (error) {
            next(error)
        }
    }

    // קבלת ציונים לפי מבחן
    async getScoresByExam(req, res, next) {
        try {
            const examId = Number(req.params.examId)
            const scores = await scoreService.getScoresByExamId(examId)
            res.json(scores)
        } catch (error) {
            next(error)
        }
    }

    // שמירת ציון חדש
    async saveScore(req, res, next) {
        try {
            const { studentName, examId, score } = req.body

            if (studentName === undefined || examId === undefined || score === undefined) {
                const err = new Error('studentName, examId and score are required')
                err.status = 400
                throw err
            }

            const newScore = await scoreService.saveScore(req.body)
            res.status(201).json(newScore)
        } catch (error) {
            next(error)
        }
    }
}

export default new ScoreController()
