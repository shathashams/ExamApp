import pool from '../db/connect.js'

class ExamService {
    // קבלת כל המבחנים
    async getAllExams() {
        const result = await pool.query(`
            SELECT
                id,
                title,
                status,
                duration,
                "extraTime",
                "allowedMaterials",
                "teacherAvailable",
                questions
            FROM exams
            ORDER BY id
        `)
        return result.rows
    }

    // קבלת מבחן לפי מזהה
    async getExamById(id) {
        const result = await pool.query(`
            SELECT
                id,
                title,
                status,
                duration,
                "extraTime",
                "allowedMaterials",
                "teacherAvailable",
                questions
            FROM exams
            WHERE id = $1
        `, [id])
        return result.rows[0]
    }

    // יצירת מבחן חדש
    async createExam({
        title,
        status = 'draft',
        duration = 60,
        extraTime = 0,
        allowedMaterials = '',
        teacherAvailable = '',
        questions
    }) {
        const result = await pool.query(`
            INSERT INTO exams (
                title,
                status,
                duration,
                "extraTime",
                "allowedMaterials",
                "teacherAvailable",
                questions
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
            RETURNING
                id,
                title,
                status,
                duration,
                "extraTime",
                "allowedMaterials",
                "teacherAvailable",
                questions
        `, [
            title,
            status,
            Number(duration),
            Number(extraTime),
            allowedMaterials,
            teacherAvailable,
            JSON.stringify(questions)
        ])
        return result.rows[0]
    }

    // עדכון מבחן קיים
    async updateExam(id, examData) {
        const existingExam = await this.getExamById(id)
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
            WHERE id = $8
            RETURNING
                id,
                title,
                status,
                duration,
                "extraTime",
                "allowedMaterials",
                "teacherAvailable",
                questions
        `, [
            updatedExam.title,
            updatedExam.status,
            Number(updatedExam.duration),
            Number(updatedExam.extraTime),
            updatedExam.allowedMaterials,
            updatedExam.teacherAvailable,
            JSON.stringify(updatedExam.questions),
            id
        ])

        return result.rows[0]
    }

    // מחיקת מבחן
    async deleteExam(id) {
        const result = await pool.query(`
            DELETE FROM exams
            WHERE id = $1
            RETURNING id
        `, [id])
        return result.rows[0]
    }
}

export default new ExamService()
