// API קובץ זה מדמה שירות  שמחזיר נתונים כאילו הם מגיעים משרת

import { exams } from './mockDb'

//  Promise פונקציה זו מדמה זמן המתנה של בקשת רשת באמצעות  ו-
const delay = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data)
    }, 500)
  })
}

// מחזירה את כל המבחנים הקיימים במאגר המדומה
export const getAllExams = async () => {
  return delay(exams)
}

// מחזירה מבחן לפי מזהה שהמשתמש הכניס
export const getExamById = async (id) => {
  const exam = exams.find((exam) => exam.id === Number(id))
  return delay(exam)
}

// מוסיפה מבחן חדש למאגר המדומה ומחזירה אותו
export const createExam = async (exam) => {
  const newExam = {
    id: exams.length + 1,
    ...exam,
  }

  exams.push(newExam)
  return delay(newExam)
}