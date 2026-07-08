// דף תוצאות לתלמיד
// מציג את כל המבחנים שהתלמיד הגיש ואת הציונים שלו

function StudentResults({ results }) {
  // אם עדיין אין תוצאות, מציגים הודעה מתאימה לתלמיד
  if (results.length === 0) {
    return (
      <div className="card shadow-sm">
        <div className="card-body text-center p-4">
          <h2>Student Results</h2>
          <p className="text-muted">
            No exam results yet. Submit an exam to see your grade here.
          </p>
        </div>
      </div>
    )
  }

  // עזר לקבלת הציון הסופי (ידני אם קיים, אחרת הממוחשב)
  const getFinalGrade = (result) =>
    result.manualGrade !== null && result.manualGrade !== undefined
      ? result.manualGrade
      : result.grade

  // חישוב הממוצע של כל המבחנים שהוגשו
  const totalGrades = results.reduce((sum, r) => sum + getFinalGrade(r), 0)
  const averageGrade = Math.round(totalGrades / results.length)

  return (
    <div className="card shadow-sm">
      <div className="card-body p-4">
        <h2 className="mb-1">🎓 Student Results</h2>
        <p className="text-muted mb-4">
          Here you can see the exams you submitted and your grades.
        </p>

        {/* כרטיס ממוצע ציונים בחלק העליון של הדף */}
        <div className="card border-primary-subtle bg-primary-subtle bg-opacity-25 mb-4 shadow-sm">
          <div className="card-body text-center py-4">
            <h5 className="text-primary-emphasis mb-2 fw-bold text-uppercase" style={{ letterSpacing: '0.5px', fontSize: '0.85rem' }}>
              Overall Average Grade
            </h5>
            <h1 className="display-4 fw-black text-primary mb-1">{averageGrade}%</h1>
            <p className="text-muted small mb-0">Calculated from {results.length} assessment(s)</p>
          </div>
        </div>

        <h5 className="fw-bold mb-3">Submitted Assessments</h5>

        {/* רשימת המבחנים בעיצוב מודרני */}
        <div className="list-group">
          {results.map((result) => {
            const finalGrade = getFinalGrade(result)
            const isPassed = finalGrade >= 60
            const hasOverride = result.manualGrade !== null && result.manualGrade !== undefined

            return (
              <div
                key={result.id}
                className="list-group-item p-3 mb-3 rounded border shadow-sm d-flex flex-column text-start"
              >
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 w-100">
                  <div className="d-flex align-items-center flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-bold fs-5">{result.examTitle}</span>
                      <span className="badge bg-primary fs-6 px-3 py-1.5 rounded-pill">
                        {finalGrade}%
                      </span>
                      {hasOverride && (
                        <span className="badge bg-info text-dark rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>
                          Manual Override
                        </span>
                      )}
                      
                      {isPassed ? (
                        <span className="text-success d-flex align-items-center" title="Passed">
                          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle-2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                        </span>
                      ) : (
                        <span className="text-danger d-flex align-items-center" title="Failed">
                          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-circle"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="d-flex gap-3 text-muted small align-items-center">
                    <span>Score: <strong>{result.score}</strong> / {result.totalQuestions} Correct</span>
                    <span className="badge bg-light text-dark border">{result.date || 'Completed'}</span>
                  </div>
                </div>

                {/* משוב המורה במידה וקיים */}
                {result.feedback && (
                  <div className="mt-3 p-3 bg-light border-start border-primary border-4 rounded small text-muted">
                    <strong className="text-dark d-block mb-1">Teacher Feedback:</strong>
                    "{result.feedback}"
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default StudentResults