// קובץ זה מדמה שירות API או קורא לשרת אמיתי לפי מצב ההגדרה

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

// בדיקה האם עובדים מול שרת אמיתי או מול Mock Client
const isServerMode = () => ConfigService.getDataMode() === 'SERVER'

// מחזירה את כל המבחנים הקיימים
export const getAllExams = async () => {
  if (isServerMode()) {
    const response = await fetch(`${ConfigService.getApiBaseUrl()}/exams`)
    return response.json()
  }

  return delay(exams)
}

// מחזירה מבחן לפי מזהה שהמשתמש הכניס
export const getExamById = async (id) => {
  if (isServerMode()) {
    const response = await fetch(`${ConfigService.getApiBaseUrl()}/exams/${id}`)

    if (!response.ok) {
      return null
    }

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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(exam),
    })

    return response.json()
  }

  const newExam = {
    id: exams.length + 1,
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedExam),
      }
    )

    return response.json()
  }

  const examIndex = exams.findIndex((exam) => exam.id === updatedExam.id)

  if (examIndex !== -1) {
    exams[examIndex] = updatedExam
  }

  return delay(updatedExam)
}