// הקומפוננטה הראשית של האפליקציה
// אחראית על ניהול התחברות, הרשמה, ניווט בין דפים והצגת מסך לפי תפקיד המשתמש

import { useState } from 'react'
import Login from './auth/Login'
import Register from './auth/Register'
import NavigationMenu from './components/NavigationMenu'
import TeacherDashboard from './teacherPages/TeacherDashboard'
import CreateExam from './teacherPages/CreateExam'
import StudentPortal from './studentPages/StudentPortal'
import StudentResults from './studentPages/StudentResults'
import TeacherStudentResults from './teacherPages/TeacherStudentResults'
import ConfigService from './services/ConfigService'
import * as authService from './api/authService'
import './App.css'

function App() {
  // שומר את המשתמש שמחובר כרגע למערכת
  const [user, setUser] = useState(null)

  // קובע אם להציג למשתמש מסך התחברות או מסך הרשמה
  const [authMode, setAuthMode] = useState('login')

  // שומר איזה דף מוצג כרגע אחרי ההתחברות
  const [activePage, setActivePage] = useState('teacherDashboard')

  // שומר את מצב מקור הנתונים: FULLCLIENT או SERVER
  const [dataMode, setDataMode] = useState(ConfigService.getDataMode())

  // שומר את תוצאות המבחנים שהתלמידים הגישו
  const [studentResults, setStudentResults] = useState([])

  // שינוי מקור הנתונים של האפליקציה
  const handleDataModeChange = (mode) => {
    ConfigService.setDataMode(mode)
    setDataMode(mode)
    setActivePage('teacherDashboard')
  }

  // בורר מקור הנתונים - מוצג בכל מסך כולל Login
  const renderDataModeSelector = () => (
    <div className="card shadow-sm mb-3">
      <div className="card-body d-flex justify-content-between align-items-center py-2">
        <div>
          <strong>Data Source:</strong>{' '}
          <span className={dataMode === 'SERVER' ? 'text-success' : 'text-primary'}>
            {dataMode === 'SERVER' ? '🟢 Server API (localhost:3001)' : '🔵 Client Mock DB'}
          </span>
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

    if (userData.role === 'teacher') {
      setActivePage('teacherDashboard')
    } else {
      setActivePage('studentPortal')
    }
  }

  // הרשמה - קריאה ל-authService שמנתב ל-Server או ל-Mock לפי המצב
  const handleRegister = async (username, password, fullName, role) => {
    const userData = await authService.register(username, password, fullName, role)
    setUser(userData)

    if (userData.role === 'teacher') {
      setActivePage('teacherDashboard')
    } else {
      setActivePage('studentPortal')
    }
  }

  // שמירת תוצאה חדשה אחרי שהתלמיד מגיש מבחן
  const handleSaveResult = (result) => {
    setStudentResults([...studentResults, result])
  }

  // יציאה מהמערכת וחזרה למסך ההתחברות
  const handleLogout = () => {
    setUser(null)
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