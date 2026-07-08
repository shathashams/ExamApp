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
            .map(s => ({ ...s, factor: s.factor || 0 }))
            .sort((a, b) => a.id - b.id)
    }

    // קבלת כל הציונים עבור תלמיד ספציפי - רק שלו
    async getAllScoresForStudent(studentId) {
        const db = await readDb()
        const scores = db.studentScores || []

        return scores
            .filter(s => s.studentId === Number(studentId))
            .map(s => ({ ...s, factor: s.factor || 0 }))
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
            .map(s => ({ ...s, factor: s.factor || 0 }))
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
            answers: typeof answers === 'string' ? JSON.parse(answers) : answers,
            feedback: null,
            manualGrade: null,
            isPublished: false,
            factor: 0
        }

        db.studentScores.push(newScore)
        await writeDb(db)

        return newScore
    }

    // עדכון ציון ידני ומשוב - מוודא שהמבחן שייך למורה
    async updateScore(id, { feedback, manualGrade, isPublished }, teacherId) {
        const db = await readDb()
        db.studentScores = db.studentScores || []
        db.exams = db.exams || []

        const scoreIdx = db.studentScores.findIndex(s => s.id === Number(id))
        if (scoreIdx === -1) return null

        const score = db.studentScores[scoreIdx]
        const exam = db.exams.find(e => e.id === score.examId)
        if (!exam || exam.teacherId !== Number(teacherId)) {
            return null
        }

        const publishVal = isPublished === undefined || isPublished === null ? true : isPublished

        const updatedScore = {
            ...score,
            feedback: feedback !== undefined ? feedback : score.feedback,
            manualGrade: manualGrade !== undefined ? manualGrade : score.manualGrade,
            isPublished: publishVal
        }

        db.studentScores[scoreIdx] = updatedScore
        await writeDb(db)

        return updatedScore
    }

    // פרסום כל הציונים עבור מבחן ספציפי בבת אחת
    async publishAllScores(examId, teacherId) {
        const db = await readDb()
        db.studentScores = db.studentScores || []
        db.exams = db.exams || []

        const exam = db.exams.find(e => e.id === Number(examId))
        if (!exam || exam.teacherId !== Number(teacherId)) {
            throw new Error('Forbidden: You do not own this exam')
        }

        const updatedList = []
        db.studentScores = db.studentScores.map(s => {
            if (s.examId === Number(examId)) {
                const updated = { ...s, isPublished: true }
                updatedList.push(updated)
                return updated
            }
            return s
        })

        await writeDb(db)
        return updatedList
    }

    // החלת פקטור (תוספת נקודות) לכל הסטודנטים במבחן ספציפי
    async applyFactorToExam(examId, factor, teacherId) {
        const db = await readDb()
        db.studentScores = db.studentScores || []
        db.exams = db.exams || []

        const exam = db.exams.find(e => e.id === Number(examId))
        if (!exam || exam.teacherId !== Number(teacherId)) {
            throw new Error('Forbidden: You do not own this exam')
        }

        const updatedList = []
        db.studentScores = db.studentScores.map(s => {
            if (s.examId === Number(examId)) {
                const updated = { ...s, factor: Number(factor) }
                updatedList.push(updated)
                return updated
            }
            return s
        })

        await writeDb(db)
        return updatedList
    }
}

export default new ScoreJsonService()
