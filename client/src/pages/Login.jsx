// קומפוננטת התחברות למערכת המבחנים
// המשתמש מכניס שם משתמש וסיסמה - התפקיד מגיע מה-DB בצד שרת

import { useState } from 'react'
import ConfigService from '../utils/ConfigService'

function Login({ onLogin, onSwitchToRegister }) {
  // שמירת הערכים שהמשתמש מכניס בטופס
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [showPassword, setShowPassword] = useState(false)

  // שמירת הודעת שגיאה ומצב טעינה
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // במצב שרת התפקיד מגיע מה-DB ולא מבחירת המשתמש
  const serverMode = ConfigService.isServerMode()

  const handleAutofillDemo = (demoUsername, demoPassword, demoRole) => {
    setUsername(demoUsername)
    setPassword(demoPassword)
    setRole(demoRole)
  }

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
              <div className="input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control form-control-lg"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ borderRight: 'none' }}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary d-flex align-items-center px-3"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    borderTopLeftRadius: '0',
                    borderBottomLeftRadius: '0',
                    borderLeft: 'none',
                    borderColor: '#e2e8f0',
                    backgroundColor: 'transparent',
                    color: '#64748b'
                  }}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-eye-off" viewBox="0 0 24 24">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-eye" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* בחירת תפקיד במערכת */}
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
          <div className="text-center mt-3 mb-2">
            <button
              className="btn btn-link"
              type="button"
              onClick={onSwitchToRegister}
            >
              Don't have an account? Register
            </button>
          </div>

          <hr className="my-3" />

          {/* כפתורי התחברות מהירה לחשבונות דמו */}
          <div className="demo-accounts-section text-center">
            <h6 className="text-muted mb-2 small fw-bold text-uppercase" style={{ letterSpacing: '0.5px', fontSize: '0.75rem' }}>
              Quick Demo Login
            </h6>
            <div className="d-flex justify-content-center gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() => handleAutofillDemo('teacher1', '123444', 'teacher')}
                style={{ padding: '4px 10px', fontSize: '0.8rem' }}
              >
                Teacher Demo 👨‍🏫
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-success"
                onClick={() => handleAutofillDemo('student1', '1789', 'student')}
                style={{ padding: '4px 10px', fontSize: '0.8rem' }}
              >
                Student Demo 🎓
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login