// קומפוננטת תפריט ניווט ראשי
// מציגה את שם המערכת, המשתמש המחובר, התפקיד וכפתורי ניווט לפי סוג המשתמש

function NavigationMenu({ user, activePage, onNavigate, onLogout }) {
  return (
    <div className="app-header mb-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 className="mb-1">E-Test System</h1>
          <p className="text-muted mb-0">
            Hello, {user.username} 👋 | Role: {user.role}
          </p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
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
                  activePage === 'createExam'
                    ? 'btn-primary'
                    : 'btn-outline-primary'
                }`}
                onClick={() => onNavigate('createExam')}
              >
                Create Exam
              </button>
            </>
          )}

          {user.role === 'student' && (
            <>
              <button
                className={`btn ${
                  activePage === 'studentPortal'
                    ? 'btn-success'
                    : 'btn-outline-success'
                }`}
                onClick={() => onNavigate('studentPortal')}
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
              >
                Results
              </button>
            </>
          )}

          <button className="btn btn-outline-danger" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default NavigationMenu