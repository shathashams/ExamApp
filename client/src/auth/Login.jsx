// קומפוננטת התחברות למערכת המבחנים
// המשתמש מכניס שם משתמש וסיסמה - התפקיד מגיע מה-DB בצד שרת

import { useState } from 'react'
import ConfigService from '../services/ConfigService'

function Login({ onLogin, onSwitchToRegister }) {
  // שמירת הערכים שהמשתמש מכניס בטופס
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('teacher')

  // שמירת הודעת שגיאה ומצב טעינה
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // במצב שרת התפקיד מגיע מה-DB ולא מבחירת המשתמש
  const serverMode = ConfigService.isServerMode()

  // פונקציה שמופעלת כאשר המשתמש לוחץ על Login
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password.')
      return
    }

    setLoading(true)
    try {
      // שליחת הפרטים לקומפוננטה הראשית - onLogin כעת async
      await onLogin(username, password, role)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
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

          {/* הצגת הודעת שגיאה */}
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

            {/* בחירת תפקיד - מוצגת רק במצב FULLCLIENT */}
            {!serverMode ? (
              <div className="mb-4">
                <label className="form-label">Choose role</label>
                <div className="btn-group w-100">
                  <button
                    type="button"
                    className={`btn ${role === 'teacher' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setRole('teacher')}
                  >
                    Teacher
                  </button>
                  <button
                    type="button"
                    className={`btn ${role === 'student' ? 'btn-success' : 'btn-outline-success'}`}
                    onClick={() => setRole('student')}
                  >
                    Student
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <small className="text-muted">
                  🔒 Your role is determined by your account in the database.
                </small>
              </div>
            )}

            {/* כפתור התחברות */}
            <button
              type="submit"
              className="btn btn-primary btn-lg w-100"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Login'}
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