import express from 'express'
import cors from 'cors'
import pool from './db/connect.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// מציג כל בקשה שמגיעה לשרת
app.use((req, res, next) => {
    console.log(
        `[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`
    )
    next()
})

// בדיקה בסיסית שהשרת עובד
app.get('/', (req, res) => {
    res.send('E-Test Server is running with PostgreSQL')
})

// בדיקת חיבור ומספר הרשומות ב-PostgreSQL
app.get('/api/status', async (req, res) => {
    try {
        const [examsResult, usersResult, scoresResult] = await Promise.all([
            pool.query('SELECT COUNT(*) FROM exams'),
            pool.query('SELECT COUNT(*) FROM users'),
            pool.query('SELECT COUNT(*) FROM "studentScores"'),
        ])

        res.json({
            message: 'Server is connected to PostgreSQL',
            examsCount: Number(examsResult.rows[0].count),
            usersCount: Number(usersResult.rows[0].count),
            scoresCount: Number(scoresResult.rows[0].count),
        })
    } catch (error) {
        console.error('Status query failed:', error.message)

        res.status(500).json({
            error: 'Database connection failed',
        })
    }
})

// ─────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────

// קבלת כל המשתמשים ללא סיסמאות
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT
        id,
        username,
        "fullName",
        role
      FROM users
      ORDER BY id
    `)

        res.json(result.rows)
    } catch (error) {
        console.error('Get users failed:', error.message)
        res.status(500).json({ error: 'Failed to load users' })
    }
})

// התחברות לפי username ו-password
app.post('/api/users/login', async (req, res) => {
    try {
        const { username, password } = req.body

        if (!username || !password) {
            return res.status(400).json({
                error: 'Username and password are required',
            })
        }

        const result = await pool.query(
            `
        SELECT
          id,
          username,
          "fullName",
          role
        FROM users
        WHERE username = $1
          AND password = $2
      `,
            [username, password]
        )

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: 'Invalid username or password',
            })
        }

        res.json(result.rows[0])
    } catch (error) {
        console.error('Login failed:', error.message)
        res.status(500).json({ error: 'Login failed' })
    }
})

// הרשמת משתמש חדש
app.post('/api/users/register', async (req, res) => {
    try {
        const { username, password, fullName, role } = req.body

        if (!username || !password || !fullName || !role) {
            return res.status(400).json({
                error: 'All fields are required',
            })
        }

        if (!['teacher', 'student'].includes(role)) {
            return res.status(400).json({
                error: 'Invalid role',
            })
        }

        const existingUser = await pool.query(
            'SELECT id FROM users WHERE username = $1',
            [username]
        )

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                error: 'Username already exists',
            })
        }

        const result = await pool.query(
            `
        INSERT INTO users (
          username,
          password,
          "fullName",
          role
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
          id,
          username,
          "fullName",
          role
      `,
            [username, password, fullName, role]
        )

        res.status(201).json(result.rows[0])
    } catch (error) {
        console.error('Register failed:', error.message)
        res.status(500).json({ error: 'Registration failed' })
    }
})

// קבלת משתמש לפי username
app.get('/api/users/:username', async (req, res) => {
    try {
        const result = await pool.query(
            `
        SELECT
          id,
          username,
          "fullName",
          role
        FROM users
        WHERE username = $1
      `,
            [req.params.username]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found',
            })
        }

        res.json(result.rows[0])
    } catch (error) {
        console.error('Get user failed:', error.message)
        res.status(500).json({ error: 'Failed to load user' })
    }
})

// ─────────────────────────────────────────────
// Exams CRUD
// ─────────────────────────────────────────────

// קבלת כל המבחנים
app.get('/api/exams', async (req, res) => {
    try {
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

        res.json(result.rows)
    } catch (error) {
        console.error('Get exams failed:', error.message)
        res.status(500).json({ error: 'Failed to load exams' })
    }
})

// קבלת מבחן לפי id
app.get('/api/exams/:id', async (req, res) => {
    try {
        const examId = Number(req.params.id)

        const result = await pool.query(
            `
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
      `,
            [examId]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Exam not found',
            })
        }

        res.json(result.rows[0])
    } catch (error) {
        console.error('Get exam failed:', error.message)
        res.status(500).json({ error: 'Failed to load exam' })
    }
})

// יצירת מבחן חדש
app.post('/api/exams', async (req, res) => {
    try {
        const {
            title,
            status = 'draft',
            duration = 60,
            extraTime = 0,
            allowedMaterials = '',
            teacherAvailable = '',
            questions,
        } = req.body

        if (!title || !Array.isArray(questions)) {
            return res.status(400).json({
                error: 'Title and questions are required',
            })
        }

        const result = await pool.query(
            `
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
      `,
            [
                title,
                status,
                Number(duration),
                Number(extraTime),
                allowedMaterials,
                teacherAvailable,
                JSON.stringify(questions),
            ]
        )

        res.status(201).json(result.rows[0])
    } catch (error) {
        console.error('Create exam failed:', error.message)
        res.status(500).json({ error: 'Failed to create exam' })
    }
})

// עדכון מבחן קיים
app.put('/api/exams/:id', async (req, res) => {
    try {
        const examId = Number(req.params.id)

        const existingResult = await pool.query(
            'SELECT * FROM exams WHERE id = $1',
            [examId]
        )

        if (existingResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Exam not found',
            })
        }

        const existingExam = existingResult.rows[0]

        const updatedExam = {
            title: req.body.title ?? existingExam.title,
            status: req.body.status ?? existingExam.status,
            duration: req.body.duration ?? existingExam.duration,
            extraTime: req.body.extraTime ?? existingExam.extraTime,
            allowedMaterials:
                req.body.allowedMaterials ?? existingExam.allowedMaterials,
            teacherAvailable:
                req.body.teacherAvailable ?? existingExam.teacherAvailable,
            questions: req.body.questions ?? existingExam.questions,
        }

        const result = await pool.query(
            `
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
      `,
            [
                updatedExam.title,
                updatedExam.status,
                Number(updatedExam.duration),
                Number(updatedExam.extraTime),
                updatedExam.allowedMaterials,
                updatedExam.teacherAvailable,
                JSON.stringify(updatedExam.questions),
                examId,
            ]
        )

        res.json(result.rows[0])
    } catch (error) {
        console.error('Update exam failed:', error.message)
        res.status(500).json({ error: 'Failed to update exam' })
    }
})

// מחיקת מבחן
app.delete('/api/exams/:id', async (req, res) => {
    try {
        const examId = Number(req.params.id)

        const result = await pool.query(
            `
        DELETE FROM exams
        WHERE id = $1
        RETURNING id
      `,
            [examId]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Exam not found',
            })
        }

        res.json({
            success: true,
            deletedExamId: examId,
        })
    } catch (error) {
        console.error('Delete exam failed:', error.message)
        res.status(500).json({ error: 'Failed to delete exam' })
    }
})

// ─────────────────────────────────────────────
// Student Scores
// ─────────────────────────────────────────────

// קבלת כל הציונים
app.get('/api/scores', async (req, res) => {
    try {
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

        res.json(result.rows)
    } catch (error) {
        console.error('Get scores failed:', error.message)
        res.status(500).json({ error: 'Failed to load scores' })
    }
})

// קבלת ציונים לפי מבחן
app.get('/api/scores/exam/:examId', async (req, res) => {
    try {
        const examId = Number(req.params.examId)

        const result = await pool.query(
            `
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
      `,
            [examId]
        )

        res.json(result.rows)
    } catch (error) {
        console.error('Get exam scores failed:', error.message)
        res.status(500).json({ error: 'Failed to load exam scores' })
    }
})

// שמירת ציון חדש
app.post('/api/scores', async (req, res) => {
    try {
        const {
            studentName,
            examId,
            examTitle = '',
            score,
            totalQuestions = 0,
            grade = 0,
            date = new Date().toISOString(),
        } = req.body

        if (
            studentName === undefined ||
            examId === undefined ||
            score === undefined
        ) {
            return res.status(400).json({
                error: 'studentName, examId and score are required',
            })
        }

        const result = await pool.query(
            `
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
      `,
            [
                studentName,
                Number(examId),
                examTitle,
                Number(score),
                Number(totalQuestions),
                Number(grade),
                date,
            ]
        )

        res.status(201).json(result.rows[0])
    } catch (error) {
        console.error('Save score failed:', error.message)
        res.status(500).json({ error: 'Failed to save score' })
    }
})

// הפעלת השרת
app.listen(PORT, () => {
    console.log('=========================================')
    console.log(`🚀 E-Test Server running on port ${PORT}`)
    console.log('🐘 Database: PostgreSQL')
    console.log('=========================================')
})