// קובץ זה עובד או מול mockDb מקומי או מול Server לפי ConfigService
// הקומפוננטות לא יודעות מאיפה מגיעים הנתונים - הכל מנוהל כאן

import { exams } from './mockDb'
import ConfigService from '../services/ConfigService'

// פונקציה זו מדמה זמן המתנה של בקשת רשת באמצעות Promise ו-setTimeout
const delay = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data)
    }, 500)
  })
}

// בודק האם לעבוד מול Server או מול Mock Client
const isServerMode = () => ConfigService.isServerMode()

// מחזירה את כל המבחנים הקיימים
export const getAllExams = async () => {
  if (isServerMode()) {
    const response = await fetch(`${ConfigService.getApiBaseUrl()}/exams`)
    if (!response.ok) throw new Error('Failed to load exams from server')
    return response.json()
  }
  return delay(exams)
}

// מחזירה מבחן לפי מזהה שהמשתמש הכניס
export const getExamById = async (id) => {
  if (isServerMode()) {
    const response = await fetch(`${ConfigService.getApiBaseUrl()}/exams/${id}`)
    if (!response.ok) throw new Error('Exam not found on server')
    return response.json()
  }
  const exam = exams.find((exam) => exam.id === Number(id))
  return delay(exam)
}

// מוסיפה מבחן חדש למאגר ומחזירה אותו
export const createExam = async (exam) => {
  if (isServerMode()) {
    const response = await fetch(`${ConfigService.getApiBaseUrl()}/exams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exam),
    })
    if (!response.ok) throw new Error('Failed to create exam on server')
    return response.json()
  }

  const newExam = {
    id: exams.length ? Math.max(...exams.map((e) => e.id)) + 1 : 1,
    ...exam,
  }
  exams.push(newExam)
  return delay(newExam)
}

// מעדכנת מבחן קיים לפי id
export const updateExam = async (updatedExam) => {
  if (isServerMode()) {
    const response = await fetch(
      `${ConfigService.getApiBaseUrl()}/exams/${updatedExam.id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedExam),
      }
    )
    if (!response.ok) throw new Error('Failed to update exam on server')
    return response.json()
  }

  const examIndex = exams.findIndex((exam) => exam.id === updatedExam.id)
  if (examIndex !== -1) {
    exams[examIndex] = updatedExam
  }
  return delay(updatedExam)
}