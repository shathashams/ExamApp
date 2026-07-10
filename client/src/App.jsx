// הקומפוננטה הראשית של האפליקציה
// אחראית על ניהול התחברות, הרשמה, ניווט בין דפים והצגת מסך לפי תפקיד המשתמש

import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import NavigationMenu from './components/NavigationMenu'
import TeacherDashboard from './teacherPages/TeacherDashboard'
import CreateExam from './teacherPages/CreateExam'
import StudentPortal from './studentPages/StudentPortal'
import StudentResults from './studentPages/StudentResults'
import TeacherStudentResults from './teacherPages/TeacherStudentResults'
import LiveMonitor from './teacherPages/LiveMonitor'
import StorageService from './utils/StorageService'
import * as authService from './api/authService'
import * as scoreService from './api/scoreService'
import { getFeedbacks, acknowledgeFeedback } from './api/feedbackService'
import './App.css'

function App() {
  // שומר את המשתמש שמחובר כרגע למערכת
  const [user, setUser] = useState(() => StorageService.get('user'))

  // קובע אם להציג למשתמש מסך התחברות או מסך הרשמה
  const [authMode, setAuthMode] = useState('login')

  // שומר איזה דף מוצג כרגע אחרי ההתחברות
  const [activePage, setActivePage] = useState(() => {
    const savedUser = StorageService.get('user')
    return savedUser && savedUser.role === 'student' ? 'studentPortal' : 'teacherDashboard'
  })

  // מצב מקור הנתונים קבוע כעת ל-SERVER
  const dataMode = 'SERVER'

  // שומר את מצב העיצוב (ערכת נושא)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')

  // שומר את כל ציוני התלמידים (בשביל דף ציונים של מורה ותלמידים)
  const [studentResults, setStudentResults] = useState([])

  // שומר את פידבקי/שאלות התלמידים למורה והמענים להם
  const [feedbacks, setFeedbacks] = useState([])

  // החלת ערכת הנושא בעת שינוי
  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  // טעינת ציונים מהשרת/זיכרון מקומי
  useEffect(() => {
    const fetchScores = async () => {
      if (user) {
        try {
          const scores = await scoreService.getScores(user.id, user.role, user.username)
          setStudentResults(scores)
        } catch (err) {
          console.error('Failed to fetch scores:', err)
        }
      }
    }
    fetchScores()
  }, [user, dataMode])

  // טעינת פידבקים מהשרת בעת התחברות משתמש
  useEffect(() => {
    const fetchFeedbacks = async () => {
      if (user) {
        try {
          const fb = await getFeedbacks()
          setFeedbacks(fb)
        } catch (err) {
          console.error('Failed to fetch feedbacks:', err)
        }
      }
    }
    fetchFeedbacks()
  }, [user])

  // טיפול בעדכון רשימת הפידבקים לאחר הגשת פידבק חדש על ידי סטודנט
  const handleFeedbackSubmitted = (newFeedback) => {
    setFeedbacks((prev) => [newFeedback, ...prev])
  }

  // טיפול בעדכון רשימת הפידבקים לאחר מענה של מורה
  const handleRespondToFeedback = (updatedFeedback) => {
    setFeedbacks((prev) =>
      prev.map((f) => (f.id === updatedFeedback.id ? updatedFeedback : f))
    )
  }

  // אישור קבלת מענה על ידי סטודנט (מחיקת באנר התראה מהמסך שלו)
  const handleDismissFeedbackAlert = async (feedbackId) => {
    try {
      await acknowledgeFeedback(feedbackId)
      setFeedbacks((prev) =>
        prev.map((f) => (f.id === feedbackId ? { ...f, studentAcknowledged: true } : f))
      )
    } catch (err) {
      console.error('Failed to acknowledge feedback:', err)
    }
  }

  // התחברות - קריאה ל-authService שמנתב ל-Server או ל-Mock לפי המצב
  const handleLogin = async (username, password, role) => {
    const userData = await authService.login(username, password, role)
    setUser(userData)
    StorageService.save('user', userData)
    setActivePage(userData.role === 'teacher' ? 'teacherDashboard' : 'studentPortal')
  }

  // הרשמה - קריאה ל-authService שמנתב ל-Server או ל-Mock לפי המצב
  const handleRegister = async (username, password, fullName, role) => {
    const userData = await authService.register(username, password, fullName, role)
    setUser(userData)
    StorageService.save('user', userData)
    setActivePage(userData.role === 'teacher' ? 'teacherDashboard' : 'studentPortal')
  }

  // שמירת תוצאה חדשה אחרי שהתלמיד מגיש מבחן
  const handleSaveResult = async (result) => {
    if (user) {
      try {
        const scoreData = {
          examId: result.examId,
          examTitle: result.examTitle,
          score: result.score,
          totalQuestions: result.totalQuestions,
          grade: result.grade,
          answers: result.answers
        }
        const savedScore = await scoreService.saveScore(scoreData, user.id, user.role, user.username)
        setStudentResults([...studentResults, savedScore])
      } catch (err) {
        console.error('Failed to save score:', err)
      }
    }
  }

  // יציאה מהמערכת וחזרה למסך ההתחברות
  const handleLogout = () => {
    setUser(null)
    setFeedbacks([])
    StorageService.remove('user')
    setAuthMode('login')
    setActivePage('teacherDashboard')
  }

  // בורר ערכת נושא בלבד כשאין משתמש מחובר
  const renderThemeToggle = () => (
    <div className="d-flex justify-content-end mb-3">
      <button
        type="button"
        className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center p-0"
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        style={{ borderRadius: '50%', width: '32px', height: '32px', border: '1.5px solid #cbd5e1' }}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </div>
  )

  // אם אין משתמש מחובר, מציגים Login או Register
  if (!user) {
    return (
      <div className="container mt-4">
        {renderThemeToggle()}

        {authMode === 'register' ? (
          <Register
            onRegister={handleRegister}
            onSwitchToLogin={() => setAuthMode('login')}
          />
        ) : (
          <Login
            onLogin={handleLogin}
            onSwitchToRegister={() => setAuthMode('register')}
          />
        )}
      </div>
    )
  }

  return (
    <div className="container mt-4">
      {/* תפריט ניווט שמציג כפתורים לפי תפקיד המשתמש */}
      <NavigationMenu
        user={user}
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      />

      {/* התראות מענה של מורה שמופיעות לסטודנט בדשבורד שלו */}
      {user.role === 'student' && (
        <div className="student-alerts-container mb-3 text-start">
          {feedbacks
            .filter((f) => f.teacherResponse && !f.studentAcknowledged)
            .map((f) => (
              <div key={f.id} className="alert alert-info alert-dismissible fade show shadow-sm d-flex justify-content-between align-items-center flex-wrap gap-2" role="alert">
                <div style={{ flex: '1 1 auto' }}>
                  <h6 className="alert-heading fw-bold mb-1">📢 Teacher responded to your feedback!</h6>
                  <p className="mb-0 small">
                    <strong>Exam:</strong> {f.examTitle}<br />
                    <strong>Your Question:</strong> "{f.message}"<br />
                    <strong>Teacher's Reply:</strong> <span className="fw-semibold text-primary">"{f.teacherResponse}"</span>
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-outline-info btn-sm fw-bold px-3 shadow-sm"
                  onClick={() => handleDismissFeedbackAlert(f.id)}
                >
                  Understood, Dismiss Alert
                </button>
              </div>
            ))}
        </div>
      )}

      {/* הצגת דף הבית של המורה */}
      {user.role === 'teacher' && activePage === 'teacherDashboard' && (
        <TeacherDashboard
          feedbacks={feedbacks}
          onRespondToFeedback={handleRespondToFeedback}
        />
      )}

      {/* הצגת דף יצירת מבחן למורה */}
      {user.role === 'teacher' && activePage === 'createExam' && (
        <CreateExam onExamCreated={() => setActivePage('teacherDashboard')} />
      )}

      {/* הצגת ציוני תלמידים למורה */}
      {user.role === 'teacher' && activePage === 'teacherStudentResults' && (
        <TeacherStudentResults
          results={studentResults}
          onScoreUpdated={(updatedScore) => {
            setStudentResults((prev) =>
              prev.map((s) => (s.id === updatedScore.id ? updatedScore : s))
            )
          }}
        />
      )}

      {/* תצוגת מעקב חי למורה */}
      {user.role === 'teacher' && activePage === 'liveMonitor' && (
        <LiveMonitor />
      )}

      {/* הצגת פורטל התלמיד ושליחת פונקציה לשמירת הציון */}
      {user.role === 'student' && activePage === 'studentPortal' && (
        <StudentPortal
          username={user.username}
          onSaveResult={handleSaveResult}
        />
      )}

      {/* הצגת תוצאות המבחנים של התלמיד המחובר בלבד */}
      {user.role === 'student' && activePage === 'results' && (
        <StudentResults
          results={studentResults.filter(
            (result) =>
              result.isPublished !== false &&
              (result.studentId === user.id ||
                result.studentName === user.fullName ||
                result.studentName === user.username)
          )}
          feedbacks={feedbacks}
          onFeedbackSubmitted={handleFeedbackSubmitted}
        />
      )}
    </div>
  )
}

export default App