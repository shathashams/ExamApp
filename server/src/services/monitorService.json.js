import { readDb, writeDb, getNextId } from '../db/dbJsonHelper.js'

class MonitorJsonService {
    // Start or update active student session in JSON DB
    async startActiveSession(studentId, studentName, examId, examTitle) {
        const db = await readDb()
        db.activeSessions = db.activeSessions || []

        const sessionIndex = db.activeSessions.findIndex(
            s => s.studentId === Number(studentId) && s.examId === Number(examId)
        )

        const nowStr = new Date().toISOString()

        let session
        if (sessionIndex !== -1) {
            session = {
                ...db.activeSessions[sessionIndex],
                studentName,
                examTitle,
                lastActive: nowStr
            }
            db.activeSessions[sessionIndex] = session
        } else {
            const nextId = await getNextId('activeSessions')
            session = {
                id: nextId,
                studentId: Number(studentId),
                studentName,
                examId: Number(examId),
                examTitle,
                startTime: nowStr,
                lastActive: nowStr
            }
            db.activeSessions.push(session)
        }

        await writeDb(db)
        return session
    }

    // Refresh heartbeat in JSON DB
    async updateHeartbeat(studentId, examId) {
        const db = await readDb()
        db.activeSessions = db.activeSessions || []

        const sessionIndex = db.activeSessions.findIndex(
            s => s.studentId === Number(studentId) && s.examId === Number(examId)
        )

        if (sessionIndex === -1) return null

        const nowStr = new Date().toISOString()
        const session = {
            ...db.activeSessions[sessionIndex],
            lastActive: nowStr
        }

        db.activeSessions[sessionIndex] = session
        await writeDb(db)
        return session
    }

    // End active session in JSON DB
    async endActiveSession(studentId, examId) {
        const db = await readDb()
        db.activeSessions = db.activeSessions || []

        const beforeCount = db.activeSessions.length
        db.activeSessions = db.activeSessions.filter(
            s => !(s.studentId === Number(studentId) && s.examId === Number(examId))
        )

        await writeDb(db)
        return db.activeSessions.length < beforeCount
    }

    // Get active sessions for teacher's exams in JSON DB
    async getAllActiveSessionsForTeacher(teacherId) {
        const db = await readDb()
        const activeSessions = db.activeSessions || []
        const exams = db.exams || []

        const teacherExams = exams.filter(e => e.teacherId === Number(teacherId))
        const teacherExamIds = new Set(teacherExams.map(e => e.id))

        return activeSessions
            .filter(s => teacherExamIds.has(s.examId))
            .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
    }
}

export default new MonitorJsonService()
