import examService from '../services/examService.js'

class ExamController {
    // קבלת כל המבחנים
    async getExams(req, res, next) {
        try {
            const exams = await examService.getAllExams()
            res.json(exams)
        } catch (error) {
            next(error)
        }
    }

    // קבלת מבחן לפי מזהה
    async getExam(req, res, next) {
        try {
            const id = Number(req.params.id)
            const exam = await examService.getExamById(id)

            if (!exam) {
                const err = new Error('Exam not found')
                err.status = 404
                throw err
            }

            res.json(exam)
        } catch (error) {
            next(error)
        }
    }

    // יצירת מבחן חדש
    async createExam(req, res, next) {
        try {
            const { title, questions } = req.body

            if (!title || !Array.isArray(questions)) {
                const err = new Error('Title and questions are required')
                err.status = 400
                throw err
            }

            const newExam = await examService.createExam(req.body)
            res.status(201).json(newExam)
        } catch (error) {
            next(error)
        }
    }

    // עדכון מבחן קיים
    async updateExam(req, res, next) {
        try {
            const id = Number(req.params.id)
            const updatedExam = await examService.updateExam(id, req.body)

            if (!updatedExam) {
                const err = new Error('Exam not found')
                err.status = 404
                throw err
            }

            res.json(updatedExam)
        } catch (error) {
            next(error)
        }
    }

    // מחיקת מבחן
    async deleteExam(req, res, next) {
        try {
            const id = Number(req.params.id)
            const deleted = await examService.deleteExam(id)

            if (!deleted) {
                const err = new Error('Exam not found')
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
