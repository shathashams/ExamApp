// הקומפוננטה הראשית של האפליקציה
// כאן אנחנו מחליטים אם להציג התחברות, הרשמה, או את מערכת המבחנים

import { useState } from 'react'
import Login from './auth/Login'
import Register from './auth/Register'
import NavigationMenu from './components/NavigationMenu'
import TeacherDashboard from './teacherPages/TeacherDashboard'
import CreateExam from './teacherPages/CreateExam'
import StudentPortal from './studentPages/StudentPortal'
import './App.css'

function App() {
  // שמירת פרטי המשתמש לאחר התחברות או הרשמה
  const [user, setUser] = useState(null)

  // קובע אם מוצג כרגע מסך Login או Register
  const [authMode, setAuthMode] = useState('login')

  // קובע איזה דף מוצג אחרי התחברות
  const [activePage, setActivePage] = useState('teacherDashboard')

  // רשימת משתמשים זמנית בזיכרון, כהכנה למערכת משתמשים אמיתית בעתיד
  const [users, setUsers] = useState([])

  // התחברות למערכת
  const handleLogin = (userData) => {
    setUser(userData)

    if (userData.role === 'teacher') {
      setActivePage('teacherDashboard')
    } else {
      setActivePage('studentPortal')
    }
  }

  // הרשמה: שמירת המשתמש החדש ואז כניסה למערכת
  const handleRegister = (newUser) => {
    setUsers([...users, newUser])

    const loggedUser = {
      username: newUser.username,
      role: newUser.role,
    }

    setUser(loggedUser)

    if (newUser.role === 'teacher') {
      setActivePage('teacherDashboard')
    } else {
      setActivePage('studentPortal')
    }
  }

  // יציאה מהמערכת וחזרה למסך Login
  const handleLogout = () => {
    setUser(null)
    setAuthMode('login')
    setActivePage('teacherDashboard')
  }

  // אם אין משתמש מחובר, מציגים Login או Register
  if (!user) {
    if (authMode === 'register') {
      return (
        <Register
          onRegister={handleRegister}
          onSwitchToLogin={() => setAuthMode('login')}
        />
      )
    }

    return (
      <Login
        onLogin={handleLogin}
        onSwitchToRegister={() => setAuthMode('register')}
      />
    )
  }

  return (
    <div className="container mt-4">
      <NavigationMenu
        user={user}
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={handleLogout}
      />

      {user.role === 'teacher' && activePage === 'teacherDashboard' && (
        <TeacherDashboard />
      )}

      {user.role === 'teacher' && activePage === 'createExam' && (
        <CreateExam />
      )}

      {user.role === 'student' && activePage === 'studentPortal' && (
        <StudentPortal />
      )}

      {user.role === 'student' && activePage === 'results' && (
        <div className="card shadow-sm">
          <div className="card-body text-center p-4">
            <h2>Student Results</h2>
            <p className="text-muted">
              This page will show previous exam results in the future.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App