// הקומפוננטה הראשית של האפליקציה
// כאן אנחנו מחליטים אם להציג התחברות, הרשמה, או את מערכת המבחנים

import { useState } from 'react'
import Login from './auth/Login'
import Register from './auth/Register'
import TeacherDashboard from './TeacherDashboard'
import StudentPortal from './StudentPortal'
import './App.css'

function App() {
  // שמירת פרטי המשתמש לאחר התחברות או הרשמה
  const [user, setUser] = useState(null)

  // קובע אם מוצג כרגע מסך Login או Register
  const [authMode, setAuthMode] = useState('login')

  // רשימת משתמשים זמנית בזיכרון, כהכנה למערכת משתמשים אמיתית בעתיד
  const [users, setUsers] = useState([])

  // התחברות למערכת
  const handleLogin = (userData) => {
    setUser(userData)
  }

  // הרשמה: שמירת המשתמש החדש ואז כניסה למערכת
  const handleRegister = (newUser) => {
    setUsers([...users, newUser])

    setUser({
      username: newUser.username,
      role: newUser.role,
    })
  }

  // יציאה מהמערכת וחזרה למסך Login
  const handleLogout = () => {
    setUser(null)
    setAuthMode('login')
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
      {/* אזור עליון שמציג את שם המשתמש, התפקיד וכפתור יציאה */}
      <div className="d-flex justify-content-between align-items-center mb-4 app-header">
        <div>
          <h1 className="mb-1">E-Test System</h1>
          <p className="text-muted mb-0">
            Hello, {user.username} 👋 | Role: {user.role}
          </p>
        </div>

        <button className="btn btn-outline-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* הצגת המסך המתאים לפי תפקיד המשתמש */}
      {user.role === 'teacher' ? <TeacherDashboard /> : <StudentPortal />}
    </div>
  )
}

export default App