import feedbackService from '../services/feedbackService.js'

class FeedbackController {
    // קבלת כל הפידבקים
    async getFeedbacks(req, res, next) {
        try {
            const { id: userId, role } = req.user
            const feedbacks = await feedbackService.getFeedbacks(userId, role)
            res.json(feedbacks)
        } catch (error) {
            next(error)
        }
    }

    // הוספת פידבק חדש על ידי סטודנט
    async submitFeedback(req, res, next) {
        try {
            const { id: studentId, fullName: studentName, role } = req.user
            if (role !== 'student') {
                return res.status(403).json({ error: 'Only students can submit feedback' })
            }

            const { examId, examTitle, message } = req.body
            if (!examId || !message) {
                return res.status(400).json({ error: 'examId and message are required' })
            }

            const feedback = await feedbackService.submitFeedback({
                studentId,
                studentName,
                examId,
                examTitle,
                message
            })

            res.status(201).json(feedback)
        } catch (error) {
            next(error)
        }
    }

    // מענה של מורה לפידבק
    async respondToFeedback(req, res, next) {
        try {
            const { id: teacherId, role } = req.user
            if (role !== 'teacher') {
                return res.status(403).json({ error: 'Only teachers can respond to feedback' })
            }

            const { id } = req.params
            const { responseText } = req.body

            if (!responseText || responseText.trim() === '') {
                return res.status(400).json({ error: 'responseText is required' })
            }

            const feedback = await feedbackService.respondToFeedback(id, responseText, teacherId)
            if (!feedback) {
                return res.status(404).json({ error: 'Feedback not found or unauthorized' })
            }

            res.json(feedback)
        } catch (error) {
            next(error)
        }
    }

    // אישור קבלת מענה על ידי סטודנט (הסרת התראה)
    async acknowledgeFeedback(req, res, next) {
        try {
            const { id: studentId, role } = req.user
            if (role !== 'student') {
                return res.status(403).json({ error: 'Only students can acknowledge feedback' })
            }

            const { id } = req.params
            const feedback = await feedbackService.acknowledgeFeedback(id, studentId)
            if (!feedback) {
                return res.status(404).json({ error: 'Feedback not found' })
            }

            res.json(feedback)
        } catch (error) {
            next(error)
        }
    }
}

export default new FeedbackController()
