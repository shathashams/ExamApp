import pool from '../db/connect.js'

class ScoreService {
    // קבלת כל הציונים
    async getAllScores() {
        const result = await pool.query(`
            SELECT
                id,
                "studentName",
                "examId",
                "examTitle",
                score,
                "totalQuestions",
                grade,
                date
            FROM "studentScores"
            ORDER BY id
        `)
        return result.rows
    }

    // קבלת ציונים לפי מבחן
    async getScoresByExamId(examId) {
        const result = await pool.query(`
            SELECT
                id,
                "studentName",
                "examId",
                "examTitle",
                score,
                "totalQuestions",
                grade,
                date
            FROM "studentScores"
            WHERE "examId" = $1
            ORDER BY id
        `, [examId])
        return result.rows
    }

    // שמירת ציון חדש
    async saveScore({
        studentName,
        examId,
        examTitle = '',
        score,
        totalQuestions = 0,
        grade = 0,
        date = new Date().toISOString()
    }) {
        const result = await pool.query(`
            INSERT INTO "studentScores" (
                "studentName",
                "examId",
                "examTitle",
                score,
                "totalQuestions",
                grade,
                date
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [
            studentName,
            Number(examId),
            examTitle,
            Number(score),
            Number(totalQuestions),
            Number(grade),
            date
        ])
        return result.rows[0]
    }
}

export default new ScoreService()
