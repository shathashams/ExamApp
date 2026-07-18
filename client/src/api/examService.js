// שירות מבחנים — קריאות API מול השרת
import ConfigService from '../utils/ConfigService'
import { getAuthHeaders } from './apiClient'

// מחזירה את כל המבחנים הקיימים
export const getAllExams = async () => {
  const response = await fetch(`${ConfigService.getApiBaseUrl()}/exams`, {
    headers: getAuthHeaders(),
  })
  if (!response.ok) throw new Error('Failed to load exams from server')
  return response.json()
}

// מחזירה מבחן לפי מזהה שהמשתמש הכניס
export const getExamById = async (id) => {
  const response = await fetch(`${ConfigService.getApiBaseUrl()}/exams/${id}`, {
    headers: getAuthHeaders(),
  })
  if (!response.ok) throw new Error('Exam not found on server')
  return response.json()
}

// מוסיפה מבחן חדש ומחזירה אותו
export const createExam = async (exam) => {
  const response = await fetch(`${ConfigService.getApiBaseUrl()}/exams`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(exam),
  })
  if (!response.ok) throw new Error('Failed to create exam on server')
  return response.json()
}

// מעדכנת מבחן קיים לפי id
export const updateExam = async (updatedExam) => {
  const response = await fetch(
    `${ConfigService.getApiBaseUrl()}/exams/${updatedExam.id}`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updatedExam),
    }
  )
  if (!response.ok) throw new Error('Failed to update exam on server')
  return response.json()
}