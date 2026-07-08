import fs from 'fs/promises'
import path from 'path'

const dbPath = path.resolve(process.cwd(), 'src/db/db.json')

async function readDb() {
    const data = await fs.readFile(dbPath, 'utf8')
    return JSON.parse(data)
}

async function writeDb(data) {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf8')
}

class FeedbackJsonService {
    // קבלת פידבקים בהתאם לתפקיד המשתמש
    async getFeedbacks(userId, role) {
        const db = await readDb()
        const feedbacks = db.studentFeedbacks || []
        const exams = db.exams || []

        if (role === 'teacher') {
            // מורה רואה פידבקים של מבחנים שהוא יצר
            const teacherExamIds = new Set(
                exams.filter((e) => e.teacherId === Number(userId)).map((e) => e.id)
            )
            return feedbacks
                .filter((f) => teacherExamIds.has(f.examId))
                .sort((a, b) => b.id - a.id)
        } else {
            // סטודנט רואה רק את הפידבקים שלו
            return feedbacks
                .filter((f) => f.studentId === Number(userId))
                .sort((a, b) => b.id - a.id)
        }
    }

    // הוספת פידבק חדש על ידי סטודנט
    async submitFeedback({ studentId, studentName, examId, examTitle, message }) {
        const db = await readDb()
        db.studentFeedbacks = db.studentFeedbacks || []

        const newId = db.studentFeedbacks.length > 0 
            ? Math.max(...db.studentFeedbacks.map(f => f.id)) + 1 
            : 1

        const newFeedback = {
            id: newId,
            studentId: Number(studentId),
            studentName,
            examId: Number(examId),
            examTitle,
            message,
            teacherResponse: null,
            status: 'pending',
            studentAcknowledged: false,
            createdAt: new Date().toISOString()
        }

        db.studentFeedbacks.push(newFeedback)
        await writeDb(db)
        return newFeedback
    }

    // מענה של מורה לפידבק
    async respondToFeedback(id, responseText, teacherId) {
        const db = await readDb()
        db.studentFeedbacks = db.studentFeedbacks || []
        const exams = db.exams || []

        const feedbackIndex = db.studentFeedbacks.findIndex(f => f.id === Number(id))
        if (feedbackIndex === -1) return null

        const feedback = db.studentFeedbacks[feedbackIndex]
        const exam = exams.find(e => e.id === feedback.examId)

        // אימות בעלות של המורה
        if (!exam || exam.teacherId !== Number(teacherId)) {
            return null
        }

        feedback.teacherResponse = responseText
        feedback.status = 'resolved'
        feedback.studentAcknowledged = false

        db.studentFeedbacks[feedbackIndex] = feedback
        await writeDb(db)
        return feedback
    }

    // אישור קבלת מענה על ידי סטודנט (מחיקת התראה)
    async acknowledgeFeedback(id, studentId) {
        const db = await readDb()
        db.studentFeedbacks = db.studentFeedbacks || []

        const feedbackIndex = db.studentFeedbacks.findIndex(
            f => f.id === Number(id) && f.studentId === Number(studentId)
        )
        if (feedbackIndex === -1) return null

        const feedback = db.studentFeedbacks[feedbackIndex]
        feedback.studentAcknowledged = true

        db.studentFeedbacks[feedbackIndex] = feedback
        await writeDb(db)
        return feedback
    }
}

export default new FeedbackJsonService()
