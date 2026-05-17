// קומפוננטת הרשמה פשוטה למערכת
// המשתמש יוצר חשבון עם שם משתמש, סיסמה ובחירת תפקיד

import { useState } from 'react'

function Register({ onRegister, onSwitchToLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [error, setError] = useState('')

  // פונקציה שמופעלת כאשר המשתמש לוחץ על Register
  const handleSubmit = (e) => {
    e.preventDefault()

    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password.')
      return
    }

    // שליחת פרטי המשתמש החדש לקומפוננטה הראשית
    onRegister({
      username,
      password,
      role,
    })
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

          {/* הצגת שגיאה אם המשתמש לא מילא פרטים */}
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
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

            {/* בחירת תפקיד במערכת */}
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

            <button type="submit" className="btn btn-success btn-lg w-100">
              Register
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