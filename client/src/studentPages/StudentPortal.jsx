// קומפוננטת פורטל תלמיד משופרת
// מאפשרת לתלמיד להתחיל מבחן, לבחור תשובות, לעבור בין שאלות, להגיש מבחן ולקבל ציון

import { useState, useEffect, useRef, useCallback } from 'react'
import { getExamById, getAllExams } from '../api/examService'
import { startLiveSession, sendLiveHeartbeat, endLiveSession } from '../api/monitorService'

function StudentPortal({ username, onSaveResult }) {
  // Heartbeat tracking for live exam monitoring
  const [heartbeatIntervalId, setHeartbeatIntervalId] = useState(null)

  // Countdown timer state (in seconds)
  const [timeRemaining, setTimeRemaining] = useState(null)
  const timerIntervalRef = useRef(null)

  // שומר את מספר המבחן שהתלמיד מקליד
  const [examId, setExamId] = useState('')

  const [exam, setExam] = useState(null)

  // שומר הודעת שגיאה או הודעה למשתמש
  const [message, setMessage] = useState('')

  // שומר את מספר השאלה הנוכחית שהתלמיד רואה
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  // שומר את התשובות שהתלמיד בחר לכל שאלה
  const [selectedAnswers, setSelectedAnswers] = useState({})

  // קובע אם המבחן כבר הוגש
  const [isSubmitted, setIsSubmitted] = useState(false)

  // שומר את כל המבחנים הזמינים מהמאגר
  const [availableExams, setAvailableExams] = useState([])

  // טעינת רשימת המבחנים הזמינים כדי להציג את המזהים שלהם
  useEffect(() => {
    let active = true
    const fetchExams = async () => {
      try {
        const data = await getAllExams()
        if (active) {
          setAvailableExams(data)
        }
      } catch (err) {
        console.error('Failed to fetch available exams:', err)
      }
    }
    fetchExams()
    return () => {
      active = false
    }
  }, [])

  // Clear heartbeat interval timer on component unmount
  useEffect(() => {
    return () => {
      if (heartbeatIntervalId) {
        clearInterval(heartbeatIntervalId)
      }
    }
  }, [heartbeatIntervalId])

  // Stable reference to handleSubmitExam for auto-submit on timer expiry
  const handleSubmitExamRef = useRef(null)

  // Countdown timer tick effect
  useEffect(() => {
    if (timeRemaining === null || isSubmitted) return

    if (timeRemaining <= 0) {
      // Time is up — auto-submit the exam
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
      if (handleSubmitExamRef.current) {
        handleSubmitExamRef.current()
      }
      return
    }

    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current)
          timerIntervalRef.current = null
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }
  }, [timeRemaining, isSubmitted])

  // Format seconds into MM:SS display string
  const formatTime = (totalSeconds) => {
    if (totalSeconds === null) return '--:--'
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

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

    // Start live exam session tracking
    try {
      await startLiveSession(data.id, data.title)
      const intervalId = setInterval(async () => {
        try {
          await sendLiveHeartbeat(data.id)
        } catch (err) {
          console.error('Failed to send heartbeat:', err)
        }
      }, 10000)
      setHeartbeatIntervalId(intervalId)
    } catch (err) {
      console.error('Failed to notify exam start to monitor:', err)
    }

    // איפוס מצב המבחן בכל התחלה חדשה
    setExam(data)
    setMessage('')
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
    setIsSubmitted(false)

    // Initialize countdown timer from exam duration (minutes → seconds)
    if (data.duration && data.duration > 0) {
      setTimeRemaining(data.duration * 60)
    } else {
      setTimeRemaining(null)
    }
  }

  // יציאה מהמבחן וחזרה למסך ההתחלה של התלמיד
  const handleExitExam = async () => {
    if (heartbeatIntervalId) {
      clearInterval(heartbeatIntervalId)
      setHeartbeatIntervalId(null)
    }
    if (exam) {
      try {
        await endLiveSession(exam.id)
      } catch (err) {
        console.error('Failed to end monitor session:', err)
      }
    }
    // Stop countdown timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    setTimeRemaining(null)
    setExam(null)
    setExamId('')
    setMessage('')
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
    setIsSubmitted(false)
  }

  // שמירת התשובה שנבחרה עבור שאלה מסוימת
  const handleSelectAnswer = (questionId, option) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: option,
    })
  }

  // מעבר לשאלה הבאה, אם זו לא השאלה האחרונה
  const handleNextQuestion = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  // חזרה לשאלה הקודמת, אם זו לא השאלה הראשונה
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmitExam = useCallback(async () => {
    if (heartbeatIntervalId) {
      clearInterval(heartbeatIntervalId)
      setHeartbeatIntervalId(null)
    }
    try {
      await endLiveSession(exam.id)
    } catch (err) {
      console.error('Failed to notify exam end to monitor:', err)
    }

    let correctAnswers = 0

    exam.questions.forEach((question) => {
      if (selectedAnswers[question.id] === question.answer) {
        correctAnswers += 1
      }
    })

    const gradePercent = Math.round(
      (correctAnswers / exam.questions.length) * 100
    )

    setIsSubmitted(true)

    onSaveResult({
      id: Date.now(),
      studentName: username,
      examId: exam.id,
      examTitle: exam.title,
      score: correctAnswers,
      totalQuestions: exam.questions.length,
      grade: gradePercent,
      answers: selectedAnswers,
    })

    // Stop countdown timer on submit
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    setTimeRemaining(null)
  }, [exam, selectedAnswers, heartbeatIntervalId, username, onSaveResult])

  // Keep the ref in sync so the timer auto-submit always calls the latest version
  useEffect(() => {
    handleSubmitExamRef.current = handleSubmitExam
  }, [handleSubmitExam])

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

          {/* הצגת הודעה אם לא הוזן מזהה או אם המבחן לא נמצא */}
          {message && <div className="alert alert-warning">{message}</div>}

          <div className="text-muted small">
            Try exam ID: {availableExams.length > 0 ? availableExams.map((e) => e.id).join(', ') : 'Loading...'}
          </div>
        </div>
      </div>
    )
  }

  // השאלה הנוכחית שמוצגת לתלמיד
  const currentQuestion = exam.questions[currentQuestionIndex]

  // חישוב אחוז ההתקדמות במבחן
  const progressPercent =
    ((currentQuestionIndex + 1) / exam.questions.length) * 100

  // מסך תוצאה אחרי הגשת המבחן
  if (isSubmitted) {
    return (
      <div className="student-exam-page">
        <div className="card shadow-sm">
          <div className="card-body text-center p-5">
            <h2 className="fw-bold mb-3 text-success">Exam Submitted Successfully ✅</h2>
            <p className="text-muted mb-4">
              Your answers have been registered and saved in the system.
            </p>

            {/* הצגת הודעת המתנה לפרסום ציונים ע"י המורה */}
            <div className="alert alert-info py-4 border-info-subtle shadow-sm">
              <h4 className="alert-heading fw-bold mb-2">⏳ Grade Pending Review</h4>
              <p className="mb-0 small">
                The lecturer will review the submissions and publish the final marks. You will be able to view your score and written feedback under the <strong>Results</strong> page once published.
              </p>
            </div>

            <div className="d-flex justify-content-center gap-2 mt-4">
              <button
                className="btn btn-outline-secondary px-4 fw-bold"
                onClick={handleExitExam}
              >
                Exit Exam Portal
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="student-exam-page">
      {/* כותרת אזור המבחן וכפתור יציאה */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">🎓 Student Portal</h2>
          <p className="text-muted mb-0">
            Welcome to your online assessment center
          </p>
        </div>

        <button className="btn btn-outline-secondary" onClick={handleExitExam}>
          Exit Exam
        </button>
      </div>

      {/* פרטי המבחן הפעיל */}
      <div className="card shadow-sm mb-4">
        <div className="card-body p-4">
          <span className="badge rounded-pill bg-primary-subtle text-primary mb-3">
            Active Assessment
          </span>

          <h3 className="fw-bold">{exam.title}</h3>

          <div className="d-flex justify-content-between align-items-center mt-2">
            <div className="d-flex gap-3 text-muted small">
              <span>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              <span>{exam.questions.length} Questions</span>
              {exam.duration && <span>{exam.duration} min</span>}
            </div>

            {/* Countdown Timer Display */}
            {timeRemaining !== null && (
              <div className={`d-flex align-items-center gap-2 fw-bold ${
                timeRemaining <= 60 ? 'text-danger' : timeRemaining <= 300 ? 'text-warning' : 'text-info'
              }`} style={{ fontSize: '1.25rem' }}>
                <span>⏱️</span>
                <span style={{ fontFamily: 'monospace', letterSpacing: '1px' }}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* הצגת השאלה הנוכחית ואפשרויות התשובה */}
      <div className="card shadow-sm question-card mb-4">
        <div className="card-body p-4">
          <div className="d-flex align-items-start gap-3 mb-3">
            <span className="question-number">
              {currentQuestionIndex + 1}
            </span>

            <h5 className="fw-bold mb-0">{currentQuestion.text}</h5>
          </div>

          <div className="answer-options">
            {currentQuestion.options && currentQuestion.options.length > 0 && currentQuestion.type !== 'open' ? (
              currentQuestion.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`answer-option ${selectedAnswers[currentQuestion.id] === option
                    ? 'answer-option-selected'
                    : ''
                    }`}
                  onClick={() => handleSelectAnswer(currentQuestion.id, option)}
                >
                  <span className="answer-circle"></span>
                  {option}
                </button>
              ))
            ) : (
              <div className="text-start">
                <label className="form-label fw-semibold small text-muted">Write your answer below:</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Enter your open text answer here..."
                  value={selectedAnswers[currentQuestion.id] || ''}
                  onChange={(e) => handleSelectAnswer(currentQuestion.id, e.target.value)}
                ></textarea>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* אזור ניווט בין שאלות והצגת התקדמות */}
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

            {/* בשאלה האחרונה  Submit Exam במקום Next Question */}
            {currentQuestionIndex === exam.questions.length - 1 ? (
              <button className="btn btn-success" onClick={handleSubmitExam}>
                Submit Exam
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleNextQuestion}>
                Next Question →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentPortal