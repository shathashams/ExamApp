// קומפוננטת הרשמה למערכת
// המשתמש יוצר חשבון עם שם מלא, שם משתמש, סיסמה ובחירת תפקיד

import { useState } from 'react'

function Register({ onRegister, onSwitchToLogin }) {
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const role = 'student'

  // שמירת הודעת שגיאה ומצב טעינה
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // פונקציה שמופעלת כאשר המשתמש לוחץ על Register
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!fullName.trim() || !username.trim() || !password.trim()) {
      setError('Please fill in all fields.')
      return
    }

    setLoading(true)
    try {
      await onRegister(username, password, fullName, role)
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
            <div className="login-icon mb-2">🧾</div>
            <h1 className="fw-bold">Create Account</h1>
            <p className="text-muted mb-0">
              Register to use the E-Test System
            </p>
          </div>

          {/* הצגת שגיאה */}
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* שם מלא */}
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            {/* שם משתמש חדש */}
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Choose username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* סיסמה חדשה */}
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control form-control-lg"
                placeholder="Choose password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-success btn-lg w-100"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          {/* מעבר למסך Login */}
          <div className="text-center mt-3">
            <button
              className="btn btn-link"
              type="button"
              onClick={onSwitchToLogin}
            >
              Already have an account? Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register