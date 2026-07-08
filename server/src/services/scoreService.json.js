import { readDb, writeDb, getNextId } from '../db/dbJsonHelper.js'

class ScoreJsonService {
    // קבלת כל הציונים עבור מורה - רק של מבחנים שהוא יצר
    async getAllScoresForTeacher(teacherId) {
        const db = await readDb()
        const scores = db.studentScores || []
        const exams = db.exams || []
        
        const teacherExams = exams.filter(e => e.teacherId === Number(teacherId))
        const teacherExamIds = new Set(teacherExams.map(e => e.id))

        return scores
            .filter(s => teacherExamIds.has(s.examId))
            .sort((a, b) => a.id - b.id)
    }

    // קבלת כל הציונים עבור תלמיד ספציפי - רק שלו
    async getAllScoresForStudent(studentId) {
        const db = await readDb()
        const scores = db.studentScores || []

        return scores
            .filter(s => s.studentId === Number(studentId))
            .sort((a, b) => a.id - b.id)
    }

    // קבלת ציונים לפי מבחן - רק אם המורה הוא הבעלים של המבחן
    async getScoresByExamId(examId, teacherId) {
        const db = await readDb()
        const scores = db.studentScores || []
        const exams = db.exams || []

        const exam = exams.find(e => e.id === Number(examId))
        if (!exam || exam.teacherId !== Number(teacherId)) {
            return []
        }

        return scores
            .filter(s => s.examId === Number(examId))
            .sort((a, b) => a.id - b.id)
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
        date = new Date().toISOString().split('T')[0],
        answers = {}
    }) {
        const db = await readDb()
        db.studentScores = db.studentScores || []

        const nextId = await getNextId('studentScores')
        const newScore = {
            id: nextId,
            studentName,
            studentId: Number(studentId),
            examId: Number(examId),
            examTitle,
            score: Number(score),
            totalQuestions: Number(totalQuestions),
            grade: Number(grade),
            date,
            answers: typeof answers === 'string' ? JSON.parse(answers) : answers
        }

        db.studentScores.push(newScore)
        await writeDb(db)

        return newScore
    }
}

export default new ScoreJsonService()
