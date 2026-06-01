// דף ציוני תלמידים למורה
// מאפשר למורה לבחור מבחן ולראות ציונים, ממוצע וגרף קווי של התפלגות הציונים

import { useState } from 'react'

function TeacherStudentResults({ results }) {
  // יצירת רשימת שמות מבחנים ייחודית מתוך כל התוצאות
  const examNames = [...new Set(results.map((result) => result.examTitle))]

  // שמירת המבחן שנבחר להצגה
  const [selectedExam, setSelectedExam] = useState(examNames[0] || '')

  // סינון התוצאות לפי המבחן שנבחר
  const filteredResults = results.filter(
    (result) => result.examTitle === selectedExam
  )

  // מיון הציונים מהגבוה לנמוך כדי ליצור גרף כמו התפלגות ציונים
  const sortedGrades = filteredResults
    .map((result) => result.grade)
    .sort((a, b) => b - a)

  // חישוב ממוצע ציונים
  const averageGrade =
    filteredResults.length > 0
      ? Math.round(
          filteredResults.reduce((sum, result) => sum + result.grade, 0) /
            filteredResults.length
        )
      : 0

  // ציון עובר לדוגמה
  const passingGrade = 60

  // הגדרות בסיסיות לגרף
  const chartWidth = 700
  const chartHeight = 300
  const padding = 40

  // המרת ציון לנקודה על ציר Y
  const getY = (grade) => {
    return chartHeight - padding - (grade / 100) * (chartHeight - padding * 2)
  }

  // המרת מיקום סטודנט לנקודה על ציר X
  const getX = (index) => {
    if (sortedGrades.length === 1) {
      return padding
    }

    return (
      padding +
      (index / (sortedGrades.length - 1)) * (chartWidth - padding * 2)
    )
  }

  // יצירת נקודות הקו האדום של הציונים
  const gradeLinePoints = sortedGrades
    .map((grade, index) => `${getX(index)},${getY(grade)}`)
    .join(' ')

  if (results.length === 0) {
    return (
      <div className="card shadow-sm">
        <div className="card-body text-center p-4">
          <h2>Student Results</h2>
          <p className="text-muted">
            No student results yet. Results will appear here after students
            submit exams.
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
          Choose an exam to view only the grades of students who submitted that
          exam.
        </p>

        {/* בחירת מבחן להצגת הציונים שלו בלבד */}
        <div className="mb-4">
          <label className="form-label">Choose Exam</label>
          <select
            className="form-select"
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
          >
            {examNames.map((examName) => (
              <option key={examName} value={examName}>
                {examName}
              </option>
            ))}
          </select>
        </div>

        {/* כרטיסים עם מידע כללי */}
        <div className="row mb-4">
          <div className="col-md-4 mb-3">
            <div className="card border-primary h-100">
              <div className="card-body text-center">
                <h6 className="text-muted">Selected Exam</h6>
                <h4>{selectedExam}</h4>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className="card border-success h-100">
              <div className="card-body text-center">
                <h6 className="text-muted">Students Submitted</h6>
                <h4>{filteredResults.length}</h4>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className="card border-warning h-100">
              <div className="card-body text-center">
                <h6 className="text-muted">Average Grade</h6>
                <h4>{averageGrade}%</h4>
              </div>
            </div>
          </div>
        </div>

        {/* טבלת ציונים */}
        <h4 className="mb-3">Grades Table</h4>

        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>Student Name</th>
              <th>Exam Name</th>
              <th>Correct Answers</th>
              <th>Total Questions</th>
              <th>Grade</th>
            </tr>
          </thead>

          <tbody>
            {filteredResults.map((result) => (
              <tr key={result.id}>
                <td>{result.studentName}</td>
                <td>{result.examTitle}</td>
                <td>{result.score}</td>
                <td>{result.totalQuestions}</td>
                <td>{result.grade}%</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* גרף קווי של ציוני הסטודנטים */}
        <h4 className="mt-4 mb-3">Grade Line Chart</h4>

        {filteredResults.length === 0 ? (
          <div className="alert alert-warning">
            No results for the selected exam.
          </div>
        ) : (
          <div className="card border-light">
            <div className="card-body">
              <svg
                width="100%"
                height={chartHeight}
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                role="img"
                aria-label="Student grades line chart"
              >
                {/* קווי רקע של הגרף */}
                {[0, 20, 40, 60, 80, 100].map((grade) => (
                  <g key={grade}>
                    <line
                      x1={padding}
                      y1={getY(grade)}
                      x2={chartWidth - padding}
                      y2={getY(grade)}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                    />
                    <text
                      x={chartWidth - padding + 8}
                      y={getY(grade) + 4}
                      fontSize="11"
                      fill="#6b7280"
                    >
                      {grade}
                    </text>
                  </g>
                ))}

                {/* קו ציון עובר */}
                <line
                  x1={padding}
                  y1={getY(passingGrade)}
                  x2={chartWidth - padding}
                  y2={getY(passingGrade)}
                  stroke="#2563eb"
                  strokeWidth="2"
                />

                {/* קו ממוצע */}
                <line
                  x1={padding}
                  y1={getY(averageGrade)}
                  x2={chartWidth - padding}
                  y2={getY(averageGrade)}
                  stroke="#15803d"
                  strokeWidth="2"
                />

                {/* קו הציונים של הסטודנטים */}
                <polyline
                  points={gradeLinePoints}
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="3"
                />

                {/* נקודות על הקו */}
                {sortedGrades.map((grade, index) => (
                  <circle
                    key={`${grade}-${index}`}
                    cx={getX(index)}
                    cy={getY(grade)}
                    r="4"
                    fill="#dc2626"
                  />
                ))}
              </svg>

              {/* מקרא לגרף */}
              <div className="d-flex gap-4 justify-content-center mt-3 flex-wrap">
                <div>
                  <span className="badge bg-danger me-2"> </span>
                  Student grades
                </div>

                <div>
                  <span className="badge bg-success me-2"> </span>
                  Average grade: {averageGrade}%
                </div>

                <div>
                  <span className="badge bg-primary me-2"> </span>
                  Passing grade: {passingGrade}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TeacherStudentResults