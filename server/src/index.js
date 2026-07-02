import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import pool from './db/connect.js'
import requestLogger from './middleware/requestLogger.js'
import errorHandler from './middleware/errorHandler.js'
import userRoutes from './routes/userRoutes.js'
import examRoutes from './routes/examRoutes.js'
import scoreRoutes from './routes/scoreRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// מציג כל בקשה שמגיעה לשרת (רישום בקשות)
app.use(requestLogger)

// בדיקה בסיסית שהשרת עובד
app.get('/', (req, res) => {
    res.send('E-Test Server is running with PostgreSQL')
})

// בדיקת חיבור ומספר הרשומות ב-PostgreSQL או JSON
app.get('/api/status', async (req, res, next) => {
    try {
        if (process.env.DB_MODE === 'json') {
            const { readDb } = await import('./db/dbJsonHelper.js')
            const db = await readDb()
            return res.json({
                message: 'Server is running with local JSON database',
                examsCount: (db.exams || []).length,
                usersCount: (db.users || []).length,
                scoresCount: (db.studentScores || []).length,
            })
        }

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
        next(error)
    }
})

// ניתוב נתיבים של API
app.use('/api/users', userRoutes)
app.use('/api/exams', examRoutes)
app.use('/api/scores', scoreRoutes)

// טיפול מרכזי בשגיאות שרת
app.use(errorHandler)

// הפעלת השרת
app.listen(PORT, () => {
    const dbMode = process.env.DB_MODE || 'render_pg'
    console.log('=========================================')
    console.log(`🚀 E-Test Server running on port ${PORT}`)
    console.log(`📂 Database Mode: ${dbMode}`)
    console.log('=========================================')
})