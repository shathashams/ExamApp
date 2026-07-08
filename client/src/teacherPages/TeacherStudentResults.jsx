// דף ציוני תלמידים למורה
// מאפשר למורה לבחור מבחן ולראות ציונים, ממוצע וגרף קווי של התפלגות הציונים

import { useState, useEffect } from 'react'
import { getAllExams } from '../api/examService'

function TeacherStudentResults({ results }) {
  // יצירת רשימת שמות מבחנים ייחודית מתוך כל התוצאות
  const examNames = [...new Set(results.map((result) => result.examTitle))]

  // שמירת המבחן שנבחר להצגה
  const [selectedExam, setSelectedExam] = useState('')

  // המבחן שנבחר בפועל (במידה ולא נבחר כלום, ברירת המחדל היא הראשון ברשימה)
  const activeExam = selectedExam || examNames[0] || ''

  // סינון התוצאות לפי המבחן שנבחר
  const filteredResults = results.filter(
    (result) => result.examTitle === activeExam
  )

  // רשימת המבחנים שנמשכו מהשרת לצורך הצגת השאלות והתשובות
  const [exams, setExams] = useState([])

  // שמירת הפרטים של ההגשה שנבחרה לצורך הצגת התשובות
  const [selectedSubmission, setSelectedSubmission] = useState(null)

  // טעינת רשימת המבחנים לצורך תצוגת תשובות
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await getAllExams()
        setExams(data)
      } catch (err) {
        console.error('Failed to load exams inside results view:', err)
      }
    }
    fetchExams()
  }, [])

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

  // חיפוש המבחן הפעיל כדי למצוא את השאלות שלו
  const currentExamData = exams.find(e => e.title === activeExam)

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
            value={activeExam}
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
                <h4>{activeExam}</h4>
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
              <th>Actions</th>
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
                <td>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setSelectedSubmission(result)}
                  >
                    View Answers
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* מודל להצגת התשובות של הסטודנט */}
        {selectedSubmission && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content shadow-lg">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    Review Submission — {selectedSubmission.studentName}
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setSelectedSubmission(null)}
                  ></button>
                </div>
                <div className="modal-body p-4">
                  <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2 pb-3 border-bottom">
                    <div>
                      <h6 className="text-muted mb-1">Assessment</h6>
                      <h5 className="fw-bold mb-0">{selectedSubmission.examTitle}</h5>
                    </div>
                    <div className="text-end">
                      <span className="fs-5 fw-bold me-3">Grade: {selectedSubmission.grade}%</span>
                      <span className="badge bg-light text-dark border p-2">
                        {selectedSubmission.score} / {selectedSubmission.totalQuestions} Correct
                      </span>
                    </div>
                  </div>

                  {currentExamData ? (
                    <div className="d-flex flex-column gap-3">
                      {currentExamData.questions.map((q, idx) => {
                        const studentAns = selectedSubmission.answers ? selectedSubmission.answers[q.id] || selectedSubmission.answers[String(q.id)] : null;
                        const isCorrect = studentAns === q.answer;
                        return (
                          <div
                            key={q.id || idx}
                            className={`p-3 rounded border ${
                              isCorrect
                                ? 'border-success-subtle bg-success-subtle bg-opacity-10'
                                : 'border-danger-subtle bg-danger-subtle bg-opacity-10'
                            }`}
                          >
                            <div className="d-flex justify-content-between align-items-start gap-3 mb-2">
                              <h6 className="fw-bold mb-0 text-start">
                                Question {idx + 1}: {q.text}
                              </h6>
                              <span className={`badge ${isCorrect ? 'bg-success' : 'bg-danger'} px-2 py-1`}>
                                {isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                              </span>
                            </div>
                            <div className="small text-start">
                              <div className="mb-1">
                                <strong>Student's Answer: </strong>
                                <span className={isCorrect ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                                  {studentAns || '(No Answer)'}
                                </span>
                              </div>
                              <div>
                                <strong>Correct Answer: </strong>
                                <span className="text-success fw-bold">{q.answer}</span>
                              </div>
                              {q.options && q.options.length > 0 && (
                                <div className="text-muted mt-2 pt-2 border-top border-light-subtle">
                                  <strong>Options: </strong>
                                  {q.options.join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="alert alert-warning mb-0">
                      Could not retrieve exam questions from the database to map answers.
                    </div>
                  )}
                </div>
                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-secondary px-4"
                    onClick={() => setSelectedSubmission(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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