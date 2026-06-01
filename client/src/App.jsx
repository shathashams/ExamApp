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
import './App.css'

function App() {
  // שומר את המשתמש שמחובר כרגע למערכת
  const [user, setUser] = useState(null)

  // קובע אם להציג למשתמש מסך התחברות או מסך הרשמה
  const [authMode, setAuthMode] = useState('login')

  // שומר איזה דף מוצג כרגע אחרי ההתחברות
  const [activePage, setActivePage] = useState('teacherDashboard')

  // רשימת משתמשים זמנית בזיכרון
  // כרגע זה מדמה שמירת משתמשים, עד שיהיה Backend אמיתי בעתיד
  const [users, setUsers] = useState([])

  // שומר את תוצאות המבחנים שהתלמידים הגישו
  const [studentResults, setStudentResults] = useState([])

  // התחברות למערכת והעברה לדף המתאים לפי התפקיד
  const handleLogin = (userData) => {
    setUser(userData)

    if (userData.role === 'teacher') {
      setActivePage('teacherDashboard')
    } else {
      setActivePage('studentPortal')
    }
  }

  // הרשמה של משתמש חדש והכנסתו למערכת
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
        <CreateExam onExamCreated={() => setActivePage('teacherDashboard')} />
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