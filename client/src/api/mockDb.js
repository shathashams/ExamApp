// קובץ זה מכיל נתונים מדומים של המערכת במקום להשתמש בשרת אמיתי

// מערך של מבחנים לדוגמה, כאשר לכל מבחן יש מזהה, כותרת ורשימת שאלות עם אפשרויות תשובה
export const exams = [
  {
    id: 1,
    title: 'Math Exam',
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
      {
        id: 3,
        text: 'What is 10 - 7?',
        options: ['1', '2', '3', '4'],
        answer: '3',
      },
    ],
  },
  {
    id: 2,
    title: 'English Exam',
    questions: [
      {
        id: 1,
        text: 'What is the opposite of hot?',
        options: ['cold', 'warm', 'big', 'fast'],
        answer: 'cold',
      },
      {
        id: 2,
        text: 'Complete: I ___ a student.',
        options: ['is', 'are', 'am', 'be'],
        answer: 'am',
      },
      {
        id: 3,
        text: 'Choose the correct word: She ___ to school.',
        options: ['go', 'goes', 'going', 'gone'],
        answer: 'goes',
      },
    ],
  },
  {
    id: 3,
    title: 'Computer Science Exam',
    questions: [
      {
        id: 1,
        text: 'What does HTML stand for?',
        options: [
          'HyperText Markup Language',
          'HighText Machine Language',
          'HyperTool Multi Language',
          'HomeText Markup Language',
        ],
        answer: 'HyperText Markup Language',
      },
      {
        id: 2,
        text: 'Which language is used with React?',
        options: ['Python', 'JavaScript', 'C', 'SQL'],
        answer: 'JavaScript',
      },
      {
        id: 3,
        text: 'What does CSS control?',
        options: ['Database', 'Page style', 'Server', 'Git history'],
        answer: 'Page style',
      },
    ],
  },
]

// מערך ציונים מדומה של תלמידים, כהכנה לשימוש עתידי במערכת
export const studentScores = [
  { id: 1, studentName: 'Sara', examId: 1, score: 95 },
  { id: 2, studentName: 'Omar', examId: 2, score: 88 },
  { id: 3, studentName: 'Lina', examId: 3, score: 91 },
]