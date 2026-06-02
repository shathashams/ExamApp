const express = require('express')
const cors = require('cors')

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// Mock database בצד השרת
let exams = [
  {
    id: 1,
    title: 'Math Exam',
    duration: 60,
    extraTime: 15,
    allowedMaterials: 'Calculator and course notes',
    teacherAvailable: 'First 20 minutes of the exam',
    questions: [
      {
        id: 1,
        text: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        answer: '4',
      },
      {
        id: 2,
        text: 'What is 5 * 3?',
        options: ['10', '15', '20', '25'],
        answer: '15',
      },
    ],
  },
]

// בדיקת חיים לשרת
app.get('/', (req, res) => {
  res.send('E-Test API Server is running')
})

// מחזיר את כל המבחנים
app.get('/api/exams', (req, res) => {
  res.json(exams)
})

// מחזיר מבחן לפי id
app.get('/api/exams/:id', (req, res) => {
  const exam = exams.find((exam) => exam.id === Number(req.params.id))

  if (!exam) {
    return res.status(404).json({ message: 'Exam not found' })
  }

  res.json(exam)
})

// יצירת מבחן חדש
app.post('/api/exams', (req, res) => {
  const newExam = {
    id: exams.length + 1,
    ...req.body,
  }

  exams.push(newExam)
  res.status(201).json(newExam)
})

// עדכון מבחן קיים
app.put('/api/exams/:id', (req, res) => {
  const examId = Number(req.params.id)
  const examIndex = exams.findIndex((exam) => exam.id === examId)

  if (examIndex === -1) {
    return res.status(404).json({ message: 'Exam not found' })
  }

  const updatedExam = {
    ...exams[examIndex],
    ...req.body,
    id: examId,
  }

  exams[examIndex] = updatedExam
  res.json(updatedExam)
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})