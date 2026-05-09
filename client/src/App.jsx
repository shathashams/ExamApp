// הקומפוננטה הראשית של האפליקציה
// כאן אנחנו מחליטים אם להציג את מסך ההתחברות או את מערכת המבחנים

import { useState } from 'react'
import Login from './Login'
import TeacherDashboard from './TeacherDashboard'
import StudentPortal from './StudentPortal'
import './App.css'

function App() {
  // שמירת פרטי המשתמש לאחר התחברות
  const [user, setUser] = useState(null)

  // פונקציה שמקבלת את פרטי המשתמש ממסך ההתחברות
  const handleLogin = (userData) => {
    setUser(userData)
  }

  // פונקציה שמנתקת את המשתמש ומחזירה למסך Login
  const handleLogout = () => {
    setUser(null)
  }

  // אם אין משתמש מחובר, מציגים את מסך ההתחברות
  if (!user) {
    return <Login onLogin={handleLogin} />
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

      {/* הצגת המסך המתאים לפי התפקיד שנבחר ב-Login */}
      {user.role === 'teacher' ? <TeacherDashboard /> : <StudentPortal />}
    </div>
  )
}

export default App