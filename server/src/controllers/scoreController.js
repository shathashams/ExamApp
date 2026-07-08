import scoreService from '../services/scoreService.js'

class ScoreController {
    // קבלת ציונים - מסונן לפי מורה או תלמיד
    async getScores(req, res, next) {
        try {
            const { id: userId, role } = req.user

            let scores
            if (role === 'teacher') {
                scores = await scoreService.getAllScoresForTeacher(userId)
            } else {
                scores = await scoreService.getAllScoresForStudent(userId)
            }

            res.json(scores)
        } catch (error) {
            next(error)
        }
    }

    // קבלת ציונים לפי מבחן - מורשה למורה בעלים בלבד
    async getScoresByExam(req, res, next) {
        try {
            const examId = Number(req.params.examId)
            const { id: userId, role } = req.user

            if (role !== 'teacher') {
                const err = new Error('Forbidden: Only teachers can check exam scores')
                err.status = 403
                throw err
            }

            const scores = await scoreService.getScoresByExamId(examId, userId)
            res.json(scores)
        } catch (error) {
            next(error)
        }
    }

    // שמירת ציון חדש של תלמיד
    async saveScore(req, res, next) {
        try {
            const { id: userId, role, username } = req.user

            if (role !== 'student') {
                const err = new Error('Forbidden: Only students can submit scores')
                err.status = 403
                throw err
            }

            const { examId, examTitle, score, totalQuestions, grade, answers } = req.body

            if (!examId) {
                const err = new Error('examId is required')
                err.status = 400
                throw err
            }

            const newScore = await scoreService.saveScore({
                studentName: username || req.body.studentName || 'Student',
                studentId: userId,
                examId,
                examTitle,
                score,
                totalQuestions,
                grade,
                answers: answers || {}
            })

            res.status(201).json(newScore)
        } catch (error) {
            next(error)
        }
    }

    // עדכון ציון והוספת משוב ע"י המורה
    async updateScore(req, res, next) {
        try {
            const id = Number(req.params.id)
            const { id: userId, role } = req.user

            if (role !== 'teacher') {
                const err = new Error('Forbidden: Only teachers can update grades and give feedback')
                err.status = 403
                throw err
            }

            const { feedback, manualGrade, isPublished } = req.body

            const updatedScore = await scoreService.updateScore(id, {
                feedback,
                manualGrade: manualGrade !== undefined && manualGrade !== '' && manualGrade !== null ? Number(manualGrade) : null,
                isPublished: isPublished !== undefined ? isPublished : null
            }, userId)

            if (!updatedScore) {
                const err = new Error('Score record not found or unauthorized')
                err.status = 404
                throw err
            }

            res.json(updatedScore)
        } catch (error) {
            next(error)
        }
    }
}

export default new ScoreController()
