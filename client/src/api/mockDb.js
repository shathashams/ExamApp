// קובץ זה מכיל נתונים מדומים של המערכת במקום להשתמש בשרת אמיתי

// מערך של מבחנים לדוגמה, כאשר לכל מבחן יש מזהה, כותרת ורשימת שאלות
export const exams = [
  {
    id: 1,
    title: 'Math Exam',
    questions: [
      { id: 1, text: 'What is 2 + 2?', answer: '4' },
      { id: 2, text: 'What is 5 * 3?', answer: '15' },
    ],
  },
  {
    id: 2,
    title: 'English Exam',
    questions: [
      { id: 1, text: 'What is the opposite of hot?', answer: 'cold' },
      { id: 2, text: 'Complete: I ___ a student.', answer: 'am' },
    ],
  },
  {
    id: 3,
    title: 'Computer Science Exam',
    questions: [
      { id: 1, text: 'What does HTML stand for?', answer: 'HyperText Markup Language' },
      { id: 2, text: 'Which language is used with React?', answer: 'JavaScript' },
    ],
  },
]

// מערך ציונים מדומה של תלמידים, כהכנה לשימוש עתידי במערכת
export const studentScores = [
  { id: 1, studentName: 'Sara', examId: 1, score: 95 },
  { id: 2, studentName: 'Omar', examId: 2, score: 88 },
  { id: 3, studentName: 'Lina', examId: 3, score: 91 },
]