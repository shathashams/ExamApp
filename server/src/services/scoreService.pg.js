import pool from '../db/connect.js'

class ScoreService {
    // קבלת כל הציונים עבור מורה - רק של מבחנים שהוא יצר
    async getAllScoresForTeacher(teacherId) {
        const result = await pool.query(`
            SELECT
                s.id,
                s."studentName",
                s."studentId",
                s."examId",
                s."examTitle",
                s.score,
                s."totalQuestions",
                s.grade,
                s.date,
                s.answers
            FROM "studentScores" s
            JOIN exams e ON s."examId" = e.id
            WHERE e."teacherId" = $1
            ORDER BY s.id
        `, [teacherId])
        return result.rows
    }

    // קבלת כל הציונים עבור תלמיד ספציפי - רק שלו
    async getAllScoresForStudent(studentId) {
        const result = await pool.query(`
            SELECT
                id,
                "studentName",
                "studentId",
                "examId",
                "examTitle",
                score,
                "totalQuestions",
                grade,
                date,
                answers
            FROM "studentScores"
            WHERE "studentId" = $1
            ORDER BY id
        `, [studentId])
        return result.rows
    }

    // קבלת ציונים לפי מבחן - רק אם המורה הוא הבעלים של המבחן
    async getScoresByExamId(examId, teacherId) {
        const result = await pool.query(`
            SELECT
                s.id,
                s."studentName",
                s."studentId",
                s."examId",
                s."examTitle",
                s.score,
                s."totalQuestions",
                s.grade,
                s.date,
                s.answers
            FROM "studentScores" s
            JOIN exams e ON s."examId" = e.id
            WHERE s."examId" = $1 AND e."teacherId" = $2
            ORDER BY s.id
        `, [Number(examId), teacherId])
        return result.rows
    }

    // שמירת ציון חדש משויך לתלמיד ולמבחן
    async saveScore({
        studentName,
        studentId,
        examId,
        examTitle = '',
        score,
        totalQuestions = 0,
        grade = 0,
        date = new Date().toISOString().split('T')[0], // yyyy-mm-dd format
        answers = {}
    }) {
        const result = await pool.query(`
            INSERT INTO "studentScores" (
                "studentName",
                "studentId",
                "examId",
                "examTitle",
                score,
                "totalQuestions",
                grade,
                date,
                answers
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `, [
            studentName,
            Number(studentId),
            Number(examId),
            examTitle,
            Number(score),
            Number(totalQuestions),
            Number(grade),
            date,
            typeof answers === 'string' ? answers : JSON.stringify(answers)
        ])
        return result.rows[0]
    }
}

export default new ScoreService()
