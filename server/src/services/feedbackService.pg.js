import pool from '../db/connect.js'

class FeedbackPgService {
    // קבלת פידבקים בהתאם לתפקיד המשתמש
    async getFeedbacks(userId, role) {
        if (role === 'teacher') {
            // מורה רואה פידבקים של מבחנים שהוא יצר
            const result = await pool.query(`
                SELECT f.*
                FROM "studentFeedbacks" f
                JOIN exams e ON f."examId" = e.id
                WHERE e."teacherId" = $1
                ORDER BY f.id DESC
            `, [Number(userId)])
            return result.rows
        } else {
            // סטודנט רואה רק את הפידבקים שלו
            const result = await pool.query(`
                SELECT *
                FROM "studentFeedbacks"
                WHERE "studentId" = $1
                ORDER BY id DESC
            `, [Number(userId)])
            return result.rows
        }
    }

    // הוספת פידבק חדש על ידי סטודנט
    async submitFeedback({ studentId, studentName, examId, examTitle, message }) {
        const result = await pool.query(`
            INSERT INTO "studentFeedbacks" (
                "studentId",
                "studentName",
                "examId",
                "examTitle",
                message
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [
            Number(studentId),
            studentName,
            Number(examId),
            examTitle,
            message
        ])
        return result.rows[0]
    }

    // מענה של מורה לפידבק
    async respondToFeedback(id, responseText, teacherId) {
        // אימות בעלות של המורה על המבחן
        const checkResult = await pool.query(`
            SELECT f.id
            FROM "studentFeedbacks" f
            JOIN exams e ON f."examId" = e.id
            WHERE f.id = $1 AND e."teacherId" = $2
        `, [Number(id), Number(teacherId)])

        if (checkResult.rows.length === 0) {
            return null // לא נמצא או לא מורשה
        }

        const result = await pool.query(`
            UPDATE "studentFeedbacks"
            SET 
                "teacherResponse" = $1,
                status = 'resolved',
                "studentAcknowledged" = FALSE
            WHERE id = $2
            RETURNING *
        `, [responseText, Number(id)])

        return result.rows[0]
    }

    // אישור קבלת מענה על ידי סטודנט (מחיקת התראה)
    async acknowledgeFeedback(id, studentId) {
        const result = await pool.query(`
            UPDATE "studentFeedbacks"
            SET "studentAcknowledged" = TRUE
            WHERE id = $1 AND "studentId" = $2
            RETURNING *
        `, [Number(id), Number(studentId)])

        return result.rows[0] || null
    }
}

export default new FeedbackPgService()
