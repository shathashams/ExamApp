import ConfigService from '../utils/ConfigService'
import { getAuthHeaders } from './apiClient'

// שירות לניהול ציונים מול השרת או זיכרון מקומי
const isServerMode = () => ConfigService.isServerMode()

// רשימת ציונים זמנית בזיכרון עבור מצב FULLCLIENT (בדומה ל-mockDb) עם שדה פרסום ציונים
const mockScores = [
  { id: 1, studentName: 'Noor Ahmed', examId: 1, examTitle: 'Math Exam', score: 3, totalQuestions: 3, grade: 100, date: '2026-06-02', isPublished: true },
  { id: 2, studentName: 'Lina Mansour', examId: 1, examTitle: 'Math Exam', score: 2, totalQuestions: 3, grade: 67, date: '2026-06-02', isPublished: true },
  { id: 3, studentName: 'Adam Saleh', examId: 2, examTitle: 'English Exam', score: 2, totalQuestions: 4, grade: 50, date: '2026-06-02', isPublished: true },
  { id: 4, studentName: 'Noor Ahmed', examId: 2, examTitle: 'English Exam', score: 4, totalQuestions: 4, grade: 100, date: '2026-06-03', isPublished: true },
  { id: 5, studentName: 'Lina Mansour', examId: 2, examTitle: 'English Exam', score: 3, totalQuestions: 4, grade: 75, date: '2026-06-03', isPublished: true },
  { id: 6, studentName: 'Adam Saleh', examId: 1, examTitle: 'Math Exam', score: 3, totalQuestions: 3, grade: 100, date: '2026-06-04', isPublished: true },
  { id: 7, studentName: 'Noor Ahmed', examId: 3, examTitle: 'Computer Science Exam', score: 2, totalQuestions: 3, grade: 67, date: '2026-06-04', isPublished: true },
]

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
    isPublished: false
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
      manualGrade: scoreData.manualGrade !== undefined && scoreData.manualGrade !== null && scoreData.manualGrade !== '' ? Number(scoreData.manualGrade) : null,
      isPublished: scoreData.isPublished !== undefined ? scoreData.isPublished : true
    }
    return mockScores[scoreIndex]
  }
  return null
}

export const publishAllScores = async (examId) => {
  if (isServerMode()) {
    const response = await fetch(`${ConfigService.getApiBaseUrl()}/scores/exam/${examId}/publish-all`, {
      method: 'POST',
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error('Failed to publish all scores on server')
    return response.json()
  }

  // FULLCLIENT mode: update mockScores
  mockScores.forEach(s => {
    if (s.examId === Number(examId)) {
      s.isPublished = true
    }
  })
  return mockScores.filter(s => s.examId === Number(examId))
}

export const applyFactor = async (examId, factor) => {
  if (isServerMode()) {
    const response = await fetch(`${ConfigService.getApiBaseUrl()}/scores/exam/${examId}/factor`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ factor: Number(factor) }),
    })
    if (!response.ok) throw new Error('Failed to apply factor on server')
    return response.json()
  }

  // FULLCLIENT mode: update mockScores
  mockScores.forEach(s => {
    if (s.examId === Number(examId)) {
      s.factor = Number(factor)
    }
  })
  return mockScores.filter(s => s.examId === Number(examId))
}
