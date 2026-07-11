import { readDb, writeDb, getNextId } from '../db/dbJsonHelper.js'

class ExamJsonService {
    // קבלת כל המבחנים - עם סינון לפי מורה או סינון מבחנים מפורסמים לתלמידים
    async getAllExams(teacherId = null) {
        const db = await readDb()
        const exams = db.exams || []
        
        if (teacherId !== null) {
            return exams
                .filter(e => e.teacherId === Number(teacherId))
                .sort((a, b) => a.id - b.id)
        }

        return exams
            .filter(e => e.status === 'published')
            .sort((a, b) => a.id - b.id)
    }

    // קבלת מבחן לפי מזהה - עם סינון בעלות למורים
    async getExamById(id, teacherId = null) {
        const db = await readDb()
        const exams = db.exams || []
        const exam = exams.find(e => e.id === Number(id))
        if (!exam) return null

        if (teacherId !== null) {
            return exam.teacherId === Number(teacherId) ? exam : null
        }

        return exam.status === 'published' ? exam : null
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
        const db = await readDb()
        db.exams = db.exams || []

        const nextId = await getNextId('exams')
        const newExam = {
            id: nextId,
            title,
            status,
            duration: Number(duration),
            extraTime: Number(extraTime),
            allowedMaterials,
            teacherAvailable,
            questions: Array.isArray(questions) ? questions : JSON.parse(questions || '[]'),
            teacherId: Number(teacherId)
        }

        db.exams.push(newExam)
        await writeDb(db)

        return newExam
    }

    // עדכון מבחן קיים - מוודא בעלות של המורה
    async updateExam(id, examData, teacherId) {
        const db = await readDb()
        db.exams = db.exams || []
        
        const examIdx = db.exams.findIndex(e => e.id === Number(id) && e.teacherId === Number(teacherId))
        if (examIdx === -1) return null

        const existingExam = db.exams[examIdx]
        const updatedExam = {
            ...existingExam,
            title: examData.title ?? existingExam.title,
            status: examData.status ?? existingExam.status,
            duration: examData.duration !== undefined ? Number(examData.duration) : existingExam.duration,
            extraTime: examData.extraTime !== undefined ? Number(examData.extraTime) : existingExam.extraTime,
            allowedMaterials: examData.allowedMaterials ?? existingExam.allowedMaterials,
            teacherAvailable: examData.teacherAvailable ?? existingExam.teacherAvailable,
            questions: examData.questions !== undefined 
                ? (Array.isArray(examData.questions) ? examData.questions : JSON.parse(examData.questions || '[]'))
                : existingExam.questions,
        }

        db.exams[examIdx] = updatedExam
        await writeDb(db)

        return updatedExam
    }

    // מחיקת מבחן - מוודא בעלות של המורה
    async deleteExam(id, teacherId) {
        const db = await readDb()
        db.exams = db.exams || []

        const examIdx = db.exams.findIndex(e => e.id === Number(id) && e.teacherId === Number(teacherId))
        if (examIdx === -1) return null

        db.exams.splice(examIdx, 1)
        await writeDb(db)

        return { id: Number(id) }
    }
}

export default new ExamJsonService()
