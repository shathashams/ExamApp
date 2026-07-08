import ConfigService from '../utils/ConfigService'
import StorageService from '../utils/StorageService'

// שירות לניהול ציונים מול השרת או זיכרון מקומי
const isServerMode = () => ConfigService.isServerMode()

// רשימת ציונים זמנית בזיכרון עבור מצב FULLCLIENT (בדומה ל-mockDb)
const mockScores = [
  { id: 1, studentName: 'Noor Ahmed', examId: 1, examTitle: 'Math Exam', score: 3, totalQuestions: 3, grade: 100, date: '2026-06-02' },
  { id: 2, studentName: 'Lina Mansour', examId: 1, examTitle: 'Math Exam', score: 2, totalQuestions: 3, grade: 67, date: '2026-06-02' },
  { id: 3, studentName: 'Adam Saleh', examId: 2, examTitle: 'English Exam', score: 2, totalQuestions: 4, grade: 50, date: '2026-06-02' },
  { id: 4, studentName: 'Noor Ahmed', examId: 2, examTitle: 'English Exam', score: 4, totalQuestions: 4, grade: 100, date: '2026-06-03' },
  { id: 5, studentName: 'Lina Mansour', examId: 2, examTitle: 'English Exam', score: 3, totalQuestions: 4, grade: 75, date: '2026-06-03' },
  { id: 6, studentName: 'Adam Saleh', examId: 1, examTitle: 'Math Exam', score: 3, totalQuestions: 3, grade: 100, date: '2026-06-04' },
  { id: 7, studentName: 'Noor Ahmed', examId: 3, examTitle: 'Computer Science Exam', score: 2, totalQuestions: 3, grade: 67, date: '2026-06-04' },
]

const getAuthHeaders = () => {
  const user = StorageService.get('user')
  const headers = { 'Content-Type': 'application/json' }
  if (user && user.token) {
    headers['Authorization'] = `Bearer ${user.token}`
  }
  return headers
}

export const getScores = async (userId, userRole, username) => {
  if (isServerMode()) {
    const response = await fetch(`${ConfigService.getApiBaseUrl()}/scores`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error('Failed to load scores from server')
    return response.json()
  }

  // FULLCLIENT: סינון לפי תפקיד מקומי
  if (userRole === 'teacher') {
    return mockScores
  }
  return mockScores.filter((score) => score.studentName === username)
}

export const saveScore = async (scoreData, userId, userRole, username) => {
  if (isServerMode()) {
    const response = await fetch(`${ConfigService.getApiBaseUrl()}/scores`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(scoreData),
    })
    if (!response.ok) throw new Error('Failed to save score on server')
    return response.json()
  }

  // FULLCLIENT: שמירה מקומית בלבד
  const newScore = {
    id: Date.now(),
    studentName: username,
    ...scoreData,
    date: new Date().toISOString().split('T')[0],
  }
  mockScores.push(newScore)
  return newScore
}

export const updateScore = async (id, scoreData) => {
  if (isServerMode()) {
    const response = await fetch(`${ConfigService.getApiBaseUrl()}/scores/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(scoreData),
    })
    if (!response.ok) throw new Error('Failed to update score on server')
    return response.json()
  }

  // FULLCLIENT: שמירה מקומית בלבד
  const scoreIndex = mockScores.findIndex((s) => s.id === Number(id))
  if (scoreIndex !== -1) {
    mockScores[scoreIndex] = {
      ...mockScores[scoreIndex],
      feedback: scoreData.feedback,
      manualGrade: scoreData.manualGrade !== undefined && scoreData.manualGrade !== null && scoreData.manualGrade !== '' ? Number(scoreData.manualGrade) : null
    }
    return mockScores[scoreIndex]
  }
  return null
}
