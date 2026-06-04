import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// נתיב לקובץ מסד הנתונים
const dbPath = path.join(__dirname, 'db', 'db.json')

// Helper functions - קריאה וכתיבה לקובץ ה-JSON
const readDb = () => {
    const data = fs.readFileSync(dbPath, 'utf8')
    return JSON.parse(data)
}

const writeDb = (db) => {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
}

// Middleware - לוג של כל בקשה נכנסת עם שעה, שיטה ונתיב
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`)
    next()
})

// ── Health Check ──────────────────────────────────────────────

app.get('/', (req, res) => {
    res.send('E-Test Server is running')
})

// סיכום מצב ה-DB כדי לראות שהשרת קורא את הנתונים
app.get('/api/status', (req, res) => {
    const db = readDb()
    res.json({
        message: 'Server is connected to db.json',
        examsCount: db.exams.length,
        usersCount: db.users.length,
        scoresCount: db.studentScores.length,
    })
})

// ── Auth Endpoints ────────────────────────────────────────────

// מחזיר את כל המשתמשים ללא סיסמאות
app.get('/api/users', (req, res) => {
    const db = readDb()
    const safeUsers = db.users.map(({ password, ...safeUser }) => safeUser)
    res.json(safeUsers)
})

// התחברות - מחזיר פרטי משתמש ללא סיסמה
app.post('/api/users/login', (req, res) => {
    const { username, password } = req.body
    const db = readDb()
    const user = db.users.find(
        (u) => u.username === username && u.password === password
    )

    if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' })
    }

    const { password: _, ...safeUser } = user
    res.json(safeUser)
})

// הרשמה - יצירת משתמש חדש
app.post('/api/users/register', (req, res) => {
    const { username, password, fullName, role } = req.body

    if (!username || !password || !fullName || !role) {
        return res.status(400).json({ error: 'All fields are required' })
    }

    const db = readDb()
    const validRoles = Object.values(db.roles)
    if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role' })
    }

    const exists = db.users.find((u) => u.username === username)
    if (exists) {
        return res.status(400).json({ error: 'Username already exists' })
    }

    const newUser = {
        id: db.users.length ? Math.max(...db.users.map((u) => u.id)) + 1 : 1,
        username,
        password,
        fullName,
        role,
    }

    db.users.push(newUser)
    writeDb(db)

    const { password: _, ...safeUser } = newUser
    res.status(201).json(safeUser)
})

// קבלת פרופיל משתמש לפי שם משתמש
app.get('/api/users/:username', (req, res) => {
    const db = readDb()
    const user = db.users.find((u) => u.username === req.params.username)

    if (!user) {
        return res.status(404).json({ error: 'User not found' })
    }

    const { password: _, ...safeUser } = user
    res.json(safeUser)
})

// ── Exam CRUD Endpoints ───────────────────────────────────────

// מחזיר את כל המבחנים
app.get('/api/exams', (req, res) => {
    const db = readDb()
    res.json(db.exams)
})

// מחזיר מבחן לפי id
app.get('/api/exams/:id', (req, res) => {
    const db = readDb()
    const exam = db.exams.find((e) => e.id === Number(req.params.id))

    if (!exam) {
        return res.status(404).json({ error: 'Exam not found' })
    }

    res.json(exam)
})

// יצירת מבחן חדש
app.post('/api/exams', (req, res) => {
    const { title, questions } = req.body

    if (!title || !questions) {
        return res.status(400).json({ error: 'Title and questions are required' })
    }

    const db = readDb()
    const newExam = {
        id: db.exams.length ? Math.max(...db.exams.map((e) => e.id)) + 1 : 1,
        title,
        status: req.body.status || 'draft',
        ...req.body,
    }

    db.exams.push(newExam)
    writeDb(db)
    res.status(201).json(newExam)
})

// עדכון מבחן קיים לפי id
app.put('/api/exams/:id', (req, res) => {
    const db = readDb()
    const examId = Number(req.params.id)
    const index = db.exams.findIndex((e) => e.id === examId)

    if (index === -1) {
        return res.status(404).json({ error: 'Exam not found' })
    }

    db.exams[index] = { ...db.exams[index], ...req.body, id: examId }
    writeDb(db)
    res.json(db.exams[index])
})

// מחיקת מבחן לפי id
app.delete('/api/exams/:id', (req, res) => {
    const db = readDb()
    const index = db.exams.findIndex((e) => e.id === Number(req.params.id))

    if (index === -1) {
        return res.status(404).json({ error: 'Exam not found' })
    }

    db.exams.splice(index, 1)
    writeDb(db)
    res.json({ success: true })
})

// ── Student Scores ────────────────────────────────────────────

// מחזיר את כל ציוני התלמידים
app.get('/api/scores', (req, res) => {
    const db = readDb()
    res.json(db.studentScores)
})

// מחזיר ציונים לפי מזהה מבחן
app.get('/api/scores/exam/:examId', (req, res) => {
    const db = readDb()
    const examId = Number(req.params.examId)
    const filtered = db.studentScores.filter((s) => s.examId === examId)
    res.json(filtered)
})

// שמירת ציון תלמיד
app.post('/api/scores', (req, res) => {
    const { studentName, examId, score } = req.body

    if (studentName === undefined || examId === undefined || score === undefined) {
        return res.status(400).json({ error: 'studentName, examId, and score are required' })
    }

    const db = readDb()
    const newScore = {
        id: db.studentScores.length
            ? Math.max(...db.studentScores.map((s) => s.id)) + 1
            : 1,
        studentName,
        examId: Number(examId),
        examTitle: req.body.examTitle || '',
        score: Number(score),
        totalQuestions: Number(req.body.totalQuestions || 0),
        grade: Number(req.body.grade || 0),
        date: req.body.date || new Date().toLocaleDateString(),
    }

    db.studentScores.push(newScore)
    writeDb(db)
    res.status(201).json(newScore)
})

// ── Start Server ──────────────────────────────────────────────

app.listen(PORT, () => {
    console.log('=========================================')
    console.log(`🚀 E-Test Server running on port ${PORT}`)
    console.log('DB file: server/src/db/db.json')
    console.log('=========================================')
})
