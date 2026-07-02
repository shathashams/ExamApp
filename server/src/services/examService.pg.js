import pool from '../db/connect.js'

class ExamService {
    // קבלת כל המבחנים - עם סינון לפי מורה או סינון מבחנים מפורסמים לתלמידים
    async getAllExams(teacherId = null) {
        if (teacherId !== null) {
            const result = await pool.query(`
                SELECT
                    id,
                    title,
                    status,
                    duration,
                    "extraTime",
                    "allowedMaterials",
                    "teacherAvailable",
                    questions,
                    "teacherId"
                FROM exams
                WHERE "teacherId" = $1
                ORDER BY id
            `, [teacherId])
            return result.rows
        }

        const result = await pool.query(`
            SELECT
                id,
                title,
                status,
                duration,
                "extraTime",
                "allowedMaterials",
                "teacherAvailable",
                questions,
                "teacherId"
            FROM exams
            WHERE status = 'published'
            ORDER BY id
        `)
        return result.rows
    }

    // קבלת מבחן לפי מזהה - עם סינון בעלות למורים
    async getExamById(id, teacherId = null) {
        if (teacherId !== null) {
            const result = await pool.query(`
                SELECT
                    id,
                    title,
                    status,
                    duration,
                    "extraTime",
                    "allowedMaterials",
                    "teacherAvailable",
                    questions,
                    "teacherId"
                FROM exams
                WHERE id = $1 AND "teacherId" = $2
            `, [id, teacherId])
            return result.rows[0]
        }

        const result = await pool.query(`
            SELECT
                id,
                title,
                status,
                duration,
                "extraTime",
                "allowedMaterials",
                "teacherAvailable",
                questions,
                "teacherId"
            FROM exams
            WHERE id = $1 AND status = 'published'
        `, [id])
        return result.rows[0]
    }

    // יצירת מבחן חדש עם מזהה המורה שיצר אותו
    async createExam({
        title,
        status = 'draft',
        duration = 60,
        extraTime = 0,
        allowedMaterials = '',
        teacherAvailable = '',
        questions
    }, teacherId) {
        const result = await pool.query(`
            INSERT INTO exams (
                title,
                status,
                duration,
                "extraTime",
                "allowedMaterials",
                "teacherAvailable",
                questions,
                "teacherId"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)
            RETURNING
                id,
                title,
                status,
                duration,
                "extraTime",
                "allowedMaterials",
                "teacherAvailable",
                questions,
                "teacherId"
        `, [
            title,
            status,
            Number(duration),
            Number(extraTime),
            allowedMaterials,
            teacherAvailable,
            JSON.stringify(questions),
            teacherId
        ])
        return result.rows[0]
    }

    // עדכון מבחן קיים - מוודא בעלות של המורה
    async updateExam(id, examData, teacherId) {
        const existingExam = await this.getExamById(id, teacherId)
        if (!existingExam) {
            return null
        }

        const updatedExam = {
            title: examData.title ?? existingExam.title,
            status: examData.status ?? existingExam.status,
            duration: examData.duration ?? existingExam.duration,
            extraTime: examData.extraTime ?? existingExam.extraTime,
            allowedMaterials: examData.allowedMaterials ?? existingExam.allowedMaterials,
            teacherAvailable: examData.teacherAvailable ?? existingExam.teacherAvailable,
            questions: examData.questions ?? existingExam.questions,
        }

        const result = await pool.query(`
            UPDATE exams
            SET
                title = $1,
                status = $2,
                duration = $3,
                "extraTime" = $4,
                "allowedMaterials" = $5,
                "teacherAvailable" = $6,
                questions = $7::jsonb
            WHERE id = $8 AND "teacherId" = $9
            RETURNING
                id,
                title,
                status,
                duration,
                "extraTime",
                "allowedMaterials",
                "teacherAvailable",
                questions,
                "teacherId"
        `, [
            updatedExam.title,
            updatedExam.status,
            Number(updatedExam.duration),
            Number(updatedExam.extraTime),
            updatedExam.allowedMaterials,
            updatedExam.teacherAvailable,
            JSON.stringify(updatedExam.questions),
            id,
            teacherId
        ])

        return result.rows[0]
    }

    // מחיקת מבחן - מוודא בעלות של המורה
    async deleteExam(id, teacherId) {
        const result = await pool.query(`
            DELETE FROM exams
            WHERE id = $1 AND "teacherId" = $2
            RETURNING id
        `, [id, teacherId])
        return result.rows[0]
    }
}

export default new ExamService()
