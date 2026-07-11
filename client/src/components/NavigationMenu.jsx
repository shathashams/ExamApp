// קומפוננטת תפריט ניווט ראשי
// מציגה את שם המערכת, המשתמש המחובר, התפקיד וכפתורי ניווט לפי סוג המשתמש

function NavigationMenu({ user, activePage, onNavigate, onLogout, theme, onToggleTheme, disabled }) {
  return (
    <div className="app-header mb-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
        {/* אזור שמציג את שם המערכת ופרטי המשתמש המחובר */}
        <div>
          <h1 className="mb-1">E-Test System</h1>
          <p className="text-muted mb-0">
            Hello, {user.username} 👋 | Role: {user.role}
          </p>
        </div>

        {/* אזור כפתורי הניווט וההתנתקות */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* אם המשתמש הוא מורה, מציגים לו ניווט לדפי מורה */}
          {user.role === 'teacher' && (
            <>
              <button
                className={`btn ${
                  activePage === 'teacherDashboard'
                    ? 'btn-primary'
                    : 'btn-outline-primary'
                }`}
                onClick={() => onNavigate('teacherDashboard')}
              >
                Teacher Dashboard
              </button>
              <button
                className={`btn ${
                  activePage === 'teacherStudentResults'
                  ? 'btn-primary'
                  : 'btn-outline-primary'
               }`}
               onClick={() => onNavigate('teacherStudentResults')}
             >
               Student Results
              </button>
              <button
                className={`btn ${
                  activePage === 'createExam'
                    ? 'btn-primary'
                    : 'btn-outline-primary'
                }`}
                onClick={() => onNavigate('createExam')}
              >
                Create Exam
              </button>
              <button
                className={`btn ${
                  activePage === 'liveMonitor'
                    ? 'btn-primary'
                    : 'btn-outline-primary'
                }`}
                onClick={() => onNavigate('liveMonitor')}
              >
                Live Monitor 📡
              </button>
            </>
          )}

          {/* אם המשתמש הוא תלמיד, מציגים לו ניווט לדפי תלמיד */}
          {user.role === 'student' && (
            <>
              <button
                className={`btn ${
                  activePage === 'studentPortal'
                    ? 'btn-success'
                    : 'btn-outline-success'
                }`}
                onClick={() => onNavigate('studentPortal')}
                disabled={disabled}
              >
                Student Portal
              </button>

              <button
                className={`btn ${
                  activePage === 'results'
                    ? 'btn-success'
                    : 'btn-outline-success'
                }`}
                onClick={() => onNavigate('results')}
                disabled={disabled}
              >
                Results
              </button>
            </>
          )}

          {/* כפתור החלפת ערכת נושא */}
          <button
            type="button"
            className="btn btn-outline-secondary d-flex align-items-center justify-content-center p-0 me-1"
            onClick={onToggleTheme}
            disabled={disabled}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            style={{ borderRadius: '50%', width: '38px', height: '38px', border: '1.5px solid #cbd5e1', flexShrink: 0 }}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {/* כפתור יציאה מהמערכת */}
          <button className="btn btn-outline-danger" onClick={onLogout} disabled={disabled}>
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default NavigationMenu