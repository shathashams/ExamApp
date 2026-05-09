// קומפוננטת פורטל תלמיד משופרת
// מאפשרת לתלמיד להתחיל מבחן, לבחור תשובות, לעבור בין שאלות ולראות התקדמות

import { useState } from 'react'
import { getExamById } from './api/examService'

function StudentPortal() {
  const [examId, setExamId] = useState('')
  const [exam, setExam] = useState(null)
  const [message, setMessage] = useState('')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})

  // התחלת מבחן לפי מזהה שהמשתמש מכניס
  const handleStartExam = async () => {
    if (!examId) {
      setMessage('Please enter an exam ID.')
      setExam(null)
      return
    }

    const data = await getExamById(examId)

    if (!data) {
      setMessage('Exam not found.')
      setExam(null)
      return
    }

    setExam(data)
    setMessage('')
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
  }

  // יציאה מהמבחן וחזרה למסך התחלה
  const handleExitExam = () => {
    setExam(null)
    setExamId('')
    setMessage('')
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
  }

  // שמירת התשובה שנבחרה עבור שאלה מסוימת
  const handleSelectAnswer = (questionId, option) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: option,
    })
  }

  // מעבר לשאלה הבאה
  const handleNextQuestion = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  // חזרה לשאלה הקודמת
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  // מסך התחלה לפני טעינת מבחן
  if (!exam) {
    return (
      <div className="card shadow-sm">
        <div className="card-body text-center p-4">
          <h2 className="card-title mb-3">Student Portal</h2>
          <p className="text-muted">Enter an exam ID to start.</p>

          <div className="input-group mb-3">
            <input
              type="number"
              className="form-control"
              placeholder="Enter Exam ID to Start"
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
            />
            <button className="btn btn-success" onClick={handleStartExam}>
              Start
            </button>
          </div>

          {message && <div className="alert alert-warning">{message}</div>}

          <div className="text-muted small">
            Try exam IDs: 1, 2, or 3
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = exam.questions[currentQuestionIndex]
  const progressPercent =
    ((currentQuestionIndex + 1) / exam.questions.length) * 100

  return (
    <div className="student-exam-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">🎓 Student Portal</h2>
          <p className="text-muted mb-0">Welcome to your online assessment center</p>
        </div>

        <button className="btn btn-outline-secondary" onClick={handleExitExam}>
          Exit Exam
        </button>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body p-4">
          <span className="badge rounded-pill bg-primary-subtle text-primary mb-3">
            Active Assessment
          </span>

          <h3 className="fw-bold">{exam.title}</h3>

          <div className="d-flex gap-3 text-muted small">
            <span> May 9, 2026</span>
            <span> {exam.questions.length} Questions</span>
          </div>
        </div>
      </div>

      <div className="card shadow-sm question-card mb-4">
        <div className="card-body p-4">
          <div className="d-flex align-items-start gap-3 mb-3">
            <span className="question-number">
              {currentQuestionIndex + 1}
            </span>

            <h5 className="fw-bold mb-0">{currentQuestion.text}</h5>
          </div>

          <div className="answer-options">
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                type="button"
                className={`answer-option ${
                  selectedAnswers[currentQuestion.id] === option
                    ? 'answer-option-selected'
                    : ''
                }`}
                onClick={() => handleSelectAnswer(currentQuestion.id, option)}
              >
                <span className="answer-circle"></span>
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <span className="text-muted">
              Question {currentQuestionIndex + 1} of {exam.questions.length}
            </span>

            <div className="progress exam-progress">
              <div
                className="progress-bar"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-primary"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </button>

            <button
              className="btn btn-primary"
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === exam.questions.length - 1}
            >
              Next Question →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentPortal