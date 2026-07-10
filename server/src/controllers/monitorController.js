import monitorService from '../services/monitorService.js'

class MonitorController {
    // Start active session (for students)
    async startSession(req, res, next) {
        try {
            const { id: studentId, role, username } = req.user
            const { examId, examTitle } = req.body

            if (role !== 'student') {
                const err = new Error('Forbidden: Only students can start test-taking sessions')
                err.status = 403
                throw err
            }

            if (!examId || !examTitle) {
                const err = new Error('examId and examTitle are required')
                err.status = 400
                throw err
            }

            const session = await monitorService.startActiveSession(
                studentId,
                username || 'Student',
                examId,
                examTitle
            )

            res.status(201).json(session)
        } catch (error) {
            next(error)
        }
    }

    // Refresh student heartbeat (for students)
    async sendHeartbeat(req, res, next) {
        try {
            const { id: studentId, role } = req.user
            const { examId } = req.body

            if (role !== 'student') {
                const err = new Error('Forbidden: Only students can send heartbeats')
                err.status = 403
                throw err
            }

            if (!examId) {
                const err = new Error('examId is required')
                err.status = 400
                throw err
            }

            const session = await monitorService.updateHeartbeat(studentId, examId)
            if (!session) {
                const err = new Error('Active session not found or expired')
                err.status = 404
                throw err
            }

            res.json({ success: true, session })
        } catch (error) {
            next(error)
        }
    }

    // End active session (for students)
    async endSession(req, res, next) {
        try {
            const { id: studentId, role } = req.user
            const examId = Number(req.params.examId)

            if (role !== 'student') {
                const err = new Error('Forbidden: Only students can end sessions')
                err.status = 403
                throw err
            }

            if (!examId) {
                const err = new Error('examId is required')
                err.status = 400
                throw err
            }

            const deleted = await monitorService.endActiveSession(studentId, examId)
            res.json({ success: true, deleted })
        } catch (error) {
            next(error)
        }
    }

    // Get all active sessions for teacher's exams (for teachers)
    async getActiveSessions(req, res, next) {
        try {
            const { id: teacherId, role } = req.user

            if (role !== 'teacher') {
                const err = new Error('Forbidden: Only teachers can view live monitors')
                err.status = 403
                throw err
            }

            const sessions = await monitorService.getAllActiveSessionsForTeacher(teacherId)
            res.json(sessions)
        } catch (error) {
            next(error)
        }
    }
}

export default new MonitorController()
