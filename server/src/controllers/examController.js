import examService from '../services/examService.js'

class ExamController {
    // קבלת כל המבחנים - מסונן לפי מורה או מציג רק מפורסמים לתלמידים
    async getExams(req, res, next) {
        try {
            const { id: userId, role } = req.user
            const isTeacher = role === 'teacher'
            const exams = await examService.getAllExams(isTeacher ? userId : null)
            res.json(exams)
        } catch (error) {
            next(error)
        }
    }

    // קבלת מבחן לפי מזהה - מורשה למורה בעלים או לתלמיד עבור מבחן מפורסם
    async getExam(req, res, next) {
        try {
            const id = Number(req.params.id)
            const { id: userId, role } = req.user
            const isTeacher = role === 'teacher'

            const exam = await examService.getExamById(id, isTeacher ? userId : null)

            if (!exam) {
                const err = new Error('Exam not found or unauthorized')
                err.status = 404
                throw err
            }

            res.json(exam)
        } catch (error) {
            next(error)
        }
    }

    // יצירת מבחן חדש משויך למורה היוצר
    async createExam(req, res, next) {
        try {
            const { id: userId, role } = req.user
            if (role !== 'teacher') {
                const err = new Error('Forbidden: Only teachers can create exams')
                err.status = 403
                throw err
            }

            const { title, questions } = req.body

            if (!title || !Array.isArray(questions)) {
                const err = new Error('Title and questions are required')
                err.status = 400
                throw err
            }

            const newExam = await examService.createExam(req.body, userId)
            res.status(201).json(newExam)
        } catch (error) {
            next(error)
        }
    }

    // עדכון מבחן קיים - מוגבל למורה היוצר בלבד
    async updateExam(req, res, next) {
        try {
            const id = Number(req.params.id)
            const { id: userId, role } = req.user
            if (role !== 'teacher') {
                const err = new Error('Forbidden: Only teachers can update exams')
                err.status = 403
                throw err
            }

            const updatedExam = await examService.updateExam(id, req.body, userId)

            if (!updatedExam) {
                const err = new Error('Exam not found or unauthorized')
                err.status = 404
                throw err
            }

            res.json(updatedExam)
        } catch (error) {
            next(error)
        }
    }

    // מחיקת מבחן - מוגבל למורה היוצר בלבד
    async deleteExam(req, res, next) {
        try {
            const id = Number(req.params.id)
            const { id: userId, role } = req.user
            if (role !== 'teacher') {
                const err = new Error('Forbidden: Only teachers can delete exams')
                err.status = 403
                throw err
            }

            const deleted = await examService.deleteExam(id, userId)

            if (!deleted) {
                const err = new Error('Exam not found or unauthorized')
                err.status = 404
                throw err
            }

            res.json({
                success: true,
                deletedExamId: id,
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new ExamController()
