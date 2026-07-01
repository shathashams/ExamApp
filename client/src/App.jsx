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
import ConfigService from './utils/ConfigService'
import StorageService from './utils/StorageService'
import * as authService from './api/authService'
import * as scoreService from './api/scoreService'
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

  // שומר את מצב מקור הנתונים: FULLCLIENT או SERVER
  const [dataMode, setDataMode] = useState(ConfigService.getDataMode())

  // שומר את מצב העיצוב (ערכת נושא)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')

  // החלת ערכת הנושא בעת שינוי
  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  // שומר את תוצאות המבחנים שהתלמידים הגישו
  const [studentResults, setStudentResults] = useState([])

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

  // שינוי מקור הנתונים של האפליקציה
  const handleDataModeChange = (mode) => {
    ConfigService.setDataMode(mode)
    setDataMode(mode)
    setActivePage('teacherDashboard')
  }

  // בורר מקור הנתונים - מוצג בכל מסך כולל Login
  const renderDataModeSelector = () => (
    <div className="card shadow-sm mb-3">
      <div className="card-body d-flex justify-content-between align-items-center py-2 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-3">
          <div>
            <strong>Data Source:</strong>{' '}
            <span className={dataMode === 'SERVER' ? 'text-success' : 'text-primary'}>
              {dataMode === 'SERVER' ? '🟢 Server API (localhost:5000)' : '🔵 Client Mock DB'}
            </span>
          </div>
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
        <div>
          <button
            id="btn-mode-client"
            className={`btn btn-sm me-2 ${dataMode === 'FULLCLIENT' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleDataModeChange('FULLCLIENT')}
          >
            Client Only
          </button>
          <button
            id="btn-mode-server"
            className={`btn btn-sm ${dataMode === 'SERVER' ? 'btn-success' : 'btn-outline-success'}`}
            onClick={() => handleDataModeChange('SERVER')}
          >
            Server
          </button>
        </div>
      </div>
    </div>
  )

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
          grade: result.grade
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
    StorageService.remove('user')
    setAuthMode('login')
    setActivePage('teacherDashboard')
  }

  // אם אין משתמש מחובר, מציגים Login או Register
  // אם אין משתמש מחובר, מציגים את הבאנר + Login או Register
  if (!user) {
    return (
      <div className="container mt-4">
        {renderDataModeSelector()}

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

      {/* הצגת דף הבית של המורה */}
      {user.role === 'teacher' && activePage === 'teacherDashboard' && (
        <TeacherDashboard />
      )}

      {/* הצגת דף יצירת מבחן למורה */}
      {user.role === 'teacher' && activePage === 'createExam' && (
        <CreateExam onExamCreated={() => setActivePage('teacherDashboard')} />
      )}

      {/* הצגת ציוני תלמידים למורה */}
      {user.role === 'teacher' && activePage === 'teacherStudentResults' && (
        <TeacherStudentResults results={studentResults} />
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
            (result) => result.studentName === user.username
          )}
        />
      )}
    </div>
  )
}

export default App