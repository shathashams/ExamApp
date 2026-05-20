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

  return (
    <div className="card shadow-sm">
      <div className="card-body p-4">
        <h2 className="mb-3">Student Results</h2>
        <p className="text-muted">
          Here you can see the exams you submitted and your grades.
        </p>

        {/* טבלה שמציגה את כל התוצאות של התלמיד המחובר */}
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>Exam Name</th>
              <th>Correct Answers</th>
              <th>Total Questions</th>
              <th>Grade</th>
            </tr>
          </thead>

          <tbody>
            {/* מעבר על כל התוצאות והצגת כל תוצאה בשורה נפרדת */}
            {results.map((result) => (
              <tr key={result.id}>
                <td>{result.examTitle}</td>
                <td>{result.score}</td>
                <td>{result.totalQuestions}</td>
                <td>{result.grade}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default StudentResults