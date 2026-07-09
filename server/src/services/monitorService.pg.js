import pool from '../db/connect.js'

class MonitorPgService {
    // Start or update active student session
    async startActiveSession(studentId, studentName, examId, examTitle) {
        const result = await pool.query(`
            INSERT INTO "activeSessions" ("studentId", "studentName", "examId", "examTitle", "startTime", "lastActive")
            VALUES ($1, $2, $3, $4, NOW(), NOW())
            ON CONFLICT ("studentId", "examId") DO UPDATE
            SET "lastActive" = NOW(), "studentName" = $2, "examTitle" = $4
            RETURNING *
        `, [Number(studentId), studentName, Number(examId), examTitle])
        return result.rows[0]
    }

    // Refresh active session heartbeat
    async updateHeartbeat(studentId, examId) {
        const result = await pool.query(`
            UPDATE "activeSessions"
            SET "lastActive" = NOW()
            WHERE "studentId" = $1 AND "examId" = $2
            RETURNING *
        `, [Number(studentId), Number(examId)])
        return result.rows[0]
    }

    // End / delete active session
    async endActiveSession(studentId, examId) {
        const result = await pool.query(`
            DELETE FROM "activeSessions"
            WHERE "studentId" = $1 AND "examId" = $2
            RETURNING *
        `, [Number(studentId), Number(examId)])
        return result.rows.length > 0
    }

    // Get all active sessions for teacher's exams
    async getAllActiveSessionsForTeacher(teacherId) {
        const result = await pool.query(`
            SELECT 
                s.id, 
                s."studentName", 
                s."studentId", 
                s."examId", 
                s."examTitle", 
                s."startTime", 
                s."lastActive"
            FROM "activeSessions" s
            JOIN exams e ON s."examId" = e.id
            WHERE e."teacherId" = $1
            ORDER BY s."startTime" DESC
        `, [Number(teacherId)])
        return result.rows
    }
}

export default new MonitorPgService()
