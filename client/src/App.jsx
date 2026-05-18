// הקומפוננטה הראשית של האפליקציה
// אחראית על ניהול התחברות, הרשמה, ניווט בין דפים והצגת מסך לפי תפקיד המשתמש

import { useState } from 'react'
import Login from './auth/Login'
import Register from './auth/Register'
import NavigationMenu from './components/NavigationMenu'
import TeacherDashboard from './teacherPages/TeacherDashboard'
import CreateExam from './teacherPages/CreateExam'
import StudentPortal from './studentPages/StudentPortal'
import './App.css'

function App() {
  // שומר את המשתמש שמחובר כרגע למערכת
  const [user, setUser] = useState(null)

  // קובע אם להציג למשתמש מסך התחברות או מסך הרשמה
  const [authMode, setAuthMode] = useState('login')

  // שומר איזה דף מוצג כרגע אחרי ההתחברות
  // לדוגמה: דף מורה, יצירת מבחן, פורטל תלמיד או תוצאות
  const [activePage, setActivePage] = useState('teacherDashboard')

  // רשימת משתמשים זמנית בזיכרון
  // Backendכרגע זה מדמה שמירת משתמשים, עד שיהיה  בעתיד
  const [users, setUsers] = useState([])

  // פונקציה שמטפלת בהתחברות המשתמש למערכת
  // לפי התפקיד שנבחר, היא מעבירה אותו לדף המתאים
  const handleLogin = (userData) => {
    setUser(userData)

    if (userData.role === 'teacher') {
      setActivePage('teacherDashboard')
    } else {
      setActivePage('studentPortal')
    }
  }

  // פונקציה שמטפלת בהרשמה של משתמש חדש
  // היא מוסיפה את המשתמש לרשימה הזמנית ומכניסה אותו למערכת
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

  // פונקציה שמנתקת את המשתמש ומחזירה אותו למסך ההתחברות
  const handleLogout = () => {
    setUser(null)
    setAuthMode('login')
    setActivePage('teacherDashboard')
  }

  // אם אין משתמש מחובר, מציגים את מסכי ההתחברות או ההרשמה
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
        <CreateExam />
      )}

      {/* הצגת פורטל התלמיד */}
      {user.role === 'student' && activePage === 'studentPortal' && (
        <StudentPortal />
      )}

      {/* דף תוצאות עתידי לתלמיד */}
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