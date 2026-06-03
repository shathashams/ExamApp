// קובץ זה מדמה שירות API מול ה-Mock Client

import { exams } from './mockDb'

// פונקציה זו מדמה זמן המתנה של בקשת רשת באמצעות Promise ו-setTimeout
const delay = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data)
    }, 500)
  })
}

// מחזירה את כל המבחנים הקיימים
export const getAllExams = async () => {
  return delay(exams)
}

// מחזירה מבחן לפי מזהה שהמשתמש הכניס
export const getExamById = async (id) => {
  const exam = exams.find((exam) => exam.id === Number(id))
  return delay(exam)
}

// מוסיפה מבחן חדש למאגר ומחזירה אותו
export const createExam = async (exam) => {
  const newExam = {
    id: exams.length + 1,
    ...exam,
  }

  exams.push(newExam)
  return delay(newExam)
}

// מעדכנת מבחן קיים לפי id
export const updateExam = async (updatedExam) => {
  const examIndex = exams.findIndex((exam) => exam.id === updatedExam.id)

  if (examIndex !== -1) {
    exams[examIndex] = updatedExam
  }

  return delay(updatedExam)
}