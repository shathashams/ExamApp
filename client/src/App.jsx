// הקומפוננטה הראשית של האפליקציה, שמנהלת מעבר בין תצוגת מורה לתצוגת תלמיד

import { useState } from 'react'
import TeacherDashboard from './TeacherDashboard'
import StudentPortal from './StudentPortal'
import './App.css'

function App() {
  // משתנה זה שומר איזה תפקיד מוצג כרגע: מורה או תלמיד
  const [role, setRole] = useState('teacher')

  return (
    <div className="container mt-5">
      <div className="text-center mb-4">
        <h1>E-Test System</h1>
        <p className="text-muted">
          Simple exam system using React, Bootstrap, and Mock API
        </p>

        {/* כפתורים שמדמים בחירת תפקיד במערכת */}
        <div className="btn-group mt-3">
          <button
            className={`btn ${role === 'teacher' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setRole('teacher')}
          >
            Teacher View
          </button>

          <button
            className={`btn ${role === 'student' ? 'btn-success' : 'btn-outline-success'}`}
            onClick={() => setRole('student')}
          >
            Student View
          </button>
        </div>
      </div>

      {/* לפי התפקיד שנבחר, מוצגת הקומפוננטה המתאימה */}
      {role === 'teacher' ? <TeacherDashboard /> : <StudentPortal />}
    </div>
  )
}

export default App