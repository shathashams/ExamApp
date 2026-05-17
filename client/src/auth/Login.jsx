// קומפוננטת התחברות למערכת המבחנים
// המשתמש מכניס שם, סיסמה ובוחר תפקיד: מורה או תלמיד

import { useState } from 'react'

function Login({ onLogin, onSwitchToRegister }) {
  // שמירת הערכים שהמשתמש מכניס בטופס
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('teacher')

  // שמירת הודעת שגיאה במקרה שהמשתמש לא מילא פרטים
  const [error, setError] = useState('')

  // פונקציה שמופעלת כאשר המשתמש לוחץ על Login
  const handleSubmit = (e) => {
    e.preventDefault()

    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password.')
      return
    }

    // שליחת פרטי המשתמש לקומפוננטה הראשית App
    onLogin({
      username,
      role,
    })
  }

  return (
    <div className="login-page d-flex align-items-center justify-content-center">
      <div className="card login-card shadow-lg">
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <div className="login-icon mb-2">📝</div>
            <h1 className="fw-bold">E-Test Login</h1>
            <p className="text-muted mb-0">
              Sign in to continue to the exam system
            </p>
          </div>

          {/* הצגת הודעת שגיאה אם המשתמש לא מילא שם או סיסמה */}
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* שדה להכנסת שם משתמש */}
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* שדה להכנסת סיסמה */}
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control form-control-lg"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* בחירת תפקיד המשתמש במערכת */}
            <div className="mb-4">
              <label className="form-label">Choose role</label>

              <div className="btn-group w-100">
                <button
                  type="button"
                  className={`btn ${
                    role === 'teacher' ? 'btn-primary' : 'btn-outline-primary'
                  }`}
                  onClick={() => setRole('teacher')}
                >
                  Teacher
                </button>

                <button
                  type="button"
                  className={`btn ${
                    role === 'student' ? 'btn-success' : 'btn-outline-success'
                  }`}
                  onClick={() => setRole('student')}
                >
                  Student
                </button>
              </div>
            </div>

            {/* כפתור התחברות */}
            <button type="submit" className="btn btn-primary btn-lg w-100">
              Login
            </button>
          </form>

          {/* מעבר למסך Register */}
          <div className="text-center mt-3">
            <button
              className="btn btn-link"
              type="button"
              onClick={onSwitchToRegister}
            >
              Don't have an account? Register
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login