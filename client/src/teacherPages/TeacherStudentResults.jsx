// דף ציוני תלמידים למורה
// מאפשר למורה לבחור מבחן ולראות ציונים, ממוצע וגרף קווי של התפלגות הציונים

import { useState, useEffect } from 'react'
import { getAllExams } from '../api/examService'
import { updateScore, publishAllScores, applyFactor } from '../api/scoreService'
import QuestionReviewCard from '../components/QuestionReviewCard'

// קומפוננטת מודל להצגת תשובות ועריכת הציון והמשוב של הסטודנט
function SubmissionReviewModal({ submission, currentExamData, onSave, onClose }) {
  const [manualGradeVal, setManualGradeVal] = useState(
    submission.manualGrade !== null && submission.manualGrade !== undefined
      ? String(submission.manualGrade)
      : ''
  )
  const [feedbackVal, setFeedbackVal] = useState(submission.feedback || '')
  const [isPublishedVal, setIsPublishedVal] = useState(submission.isPublished !== false)
  const [savingGrading, setSavingGrading] = useState(false)
  const [gradingError, setGradingError] = useState('')
  const [gradingSuccess, setGradingSuccess] = useState(false)

  const handleSaveGrading = async () => {
    setGradingError('')
    setGradingSuccess(false)
    setSavingGrading(true)
    try {
      await onSave({
        feedback: feedbackVal,
        manualGrade: manualGradeVal !== '' ? Number(manualGradeVal) : null,
        isPublished: isPublishedVal,
      })
      setGradingSuccess(true)
      setTimeout(() => setGradingSuccess(false), 3000)
    } catch (err) {
      console.error(err)
      setGradingError('Failed to save manual grade and feedback. Please try again.')
    } finally {
      setSavingGrading(false)
    }
  }

  const getFinalGrade = (sub) =>
    sub.manualGrade !== null && sub.manualGrade !== undefined
      ? sub.manualGrade
      : sub.grade

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content shadow-lg">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              Review Submission — {submission.studentName}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body p-4">
            {/* Grade Override Card */}
            <div className="card mb-4 border-primary">
              <div className="card-header bg-primary bg-opacity-10 text-primary fw-bold">
                Grade Override & Feedback
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-4 text-start">
                    <label className="form-label fw-semibold small">Manual Grade Override</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 85"
                      min="0"
                      max="100"
                      value={manualGradeVal}
                      onChange={(e) => setManualGradeVal(e.target.value)}
                    />
                    <small className="text-muted">
                      Leave empty to use auto grade ({submission.grade}%)
                    </small>
                  </div>
                  <div className="col-md-8 text-start">
                    <label className="form-label fw-semibold small">Teacher Feedback / Notes</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Write constructive feedback for the student..."
                      value={feedbackVal}
                      onChange={(e) => setFeedbackVal(e.target.value)}
                    ></textarea>
                    
                    <div className="form-check form-switch mt-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="publishGradeSwitch"
                        checked={isPublishedVal}
                        onChange={(e) => setIsPublishedVal(e.target.checked)}
                      />
                      <label className="form-check-label fw-semibold small text-dark" htmlFor="publishGradeSwitch">
                        Publish Grade & Feedback to Student Portal
                      </label>
                    </div>
                  </div>
                </div>
                <div className="text-end">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm px-4"
                    onClick={handleSaveGrading}
                    disabled={savingGrading}
                  >
                    {savingGrading ? 'Saving Changes...' : 'Save Grade & Feedback'}
                  </button>
                </div>
                {gradingError && <div className="alert alert-danger mt-2 py-2 px-3 small">{gradingError}</div>}
                {gradingSuccess && <div className="alert alert-success mt-2 py-2 px-3 small text-start">Changes saved successfully!</div>}
              </div>
            </div>

            <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2 pb-3 border-bottom">
              <div className="text-start">
                <h6 className="text-muted mb-1">Assessment</h6>
                <h5 className="fw-bold mb-0">{submission.examTitle}</h5>
              </div>
              <div className="text-end">
                <span className="fs-5 fw-bold me-3">Final Grade: {getFinalGrade(submission)}%</span>
                <span className="badge bg-light text-dark border p-2">
                  {submission.score} / {submission.totalQuestions} Correct
                </span>
              </div>
            </div>

            {/* מיפוי השאלות ותשובות התלמיד */}
            {currentExamData ? (
              <div className="d-flex flex-column gap-3">
                {currentExamData.questions.map((q, idx) => {
                  const studentAns = submission.answers ? submission.answers[q.id] || submission.answers[String(q.id)] : null
                  return (
                    <QuestionReviewCard
                      key={q.id || idx}
                      question={q}
                      index={idx}
                      studentAnswer={studentAns}
                      totalQuestions={currentExamData.questions.length}
                      isTeacher={true}
                    />
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
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function TeacherStudentResults({ results, onScoreUpdated }) {
  // יצירת רשימת שמות מבחנים ייחודית מתוך כל התוצאות
  const examNames = [...new Set(results.map((result) => result.examTitle))]

  // שמירת המבחן שנבחר להצגה
  const [selectedExam, setSelectedExam] = useState('')

  // המבחן שנבחר בפועל (במידה ולא נבחר כלום, ברירת המחדל היא הראשון ברשימה)
  const activeExam = selectedExam || examNames[0] || ''

  // סינון התוצאות לפי המבחן שנבחר (מחשב את הציון הסופי עם העקפה הידנית והפקטור)
  const getFinalGrade = (result) => {
    const base = result.manualGrade !== null && result.manualGrade !== undefined
      ? result.manualGrade
      : result.grade
    const factor = result.factor || 0
    return Math.min(100, base + factor)
  }

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

  const handleTogglePublish = async (result) => {
    try {
      const updated = await updateScore(result.id, {
        feedback: result.feedback,
        manualGrade: result.manualGrade,
        isPublished: result.isPublished === false
      })
      if (onScoreUpdated) {
        onScoreUpdated(updated)
      }
    } catch (err) {
      console.error('Failed to toggle publish status:', err)
    }
  }

  const [factorVal, setFactorVal] = useState(() => {
    const defaultExam = examNames[0] || ''
    const examFilter = results.filter(r => r.examTitle === defaultExam)
    return examFilter.length > 0 ? String(examFilter[0].factor || 0) : '0'
  })
  const [bulkSuccess, setBulkSuccess] = useState('')
  const [bulkError, setBulkError] = useState('')
  const [processingBulk, setProcessingBulk] = useState(false)

  const handlePublishAll = async () => {
    if (filteredResults.length === 0) {
      setBulkError('No student submissions found to publish.')
      return
    }

    const examId = filteredResults[0].examId
    if (!examId) return

    setProcessingBulk(true)
    setBulkError('')
    setBulkSuccess('')
    try {
      const updatedList = await publishAllScores(examId)
      setBulkSuccess('All grades for this exam have been successfully published!')
      if (onScoreUpdated) {
        updatedList.forEach(score => onScoreUpdated(score))
      }
    } catch (err) {
      console.error(err)
      setBulkError('Failed to publish all grades. Please try again.')
    } finally {
      setProcessingBulk(false)
    }
  }

  const handleApplyFactor = async () => {
    if (filteredResults.length === 0) {
      setBulkError('No student submissions found to apply factor to.')
      return
    }

    const examId = filteredResults[0].examId
    if (!examId) return

    const factorNum = Number(factorVal)
    if (isNaN(factorNum)) {
      setBulkError('Please enter a valid number for the factor.')
      return
    }

    setProcessingBulk(true)
    setBulkError('')
    setBulkSuccess('')
    try {
      const updatedList = await applyFactor(examId, factorNum)
      setBulkSuccess(`Factor of +${factorNum} points successfully applied to all grades!`)
      if (onScoreUpdated) {
        updatedList.forEach(score => onScoreUpdated(score))
      }
    } catch (err) {
      console.error(err)
      setBulkError('Failed to apply factor. Please try again.')
    } finally {
      setProcessingBulk(false)
    }
  }

  // מיון הציונים מהגבוה לנמוך כדי ליצור גרף כמו התפלגות ציונים (ציון סופי)
  const sortedGrades = filteredResults
    .map((result) => getFinalGrade(result))
    .sort((a, b) => b - a)

  // חישוב ממוצע ציונים
  const averageGrade =
    filteredResults.length > 0
      ? Math.round(
          filteredResults.reduce((sum, result) => sum + getFinalGrade(result), 0) /
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
            onChange={(e) => {
              const nextExam = e.target.value
              setSelectedExam(nextExam)
              const examFilter = results.filter(r => r.examTitle === nextExam)
              setFactorVal(examFilter.length > 0 ? String(examFilter[0].factor || 0) : '0')
              setBulkSuccess('')
              setBulkError('')
            }}
          >
            {examNames.map((examName) => (
              <option key={examName} value={examName}>
                {examName}
              </option>
            ))}
          </select>
        </div>

        {/* כלי ניהול ציונים מרוכזים (פרסום והחלת פקטור) */}
        {filteredResults.length > 0 && (
          <div className="card mb-4 border-light-subtle shadow-sm bg-light">
            <div className="card-body p-3">
              <h6 className="fw-bold mb-3 text-secondary text-start text-uppercase small" style={{ letterSpacing: '0.5px' }}>
                🔧 Exam Grade Management Tools
              </h6>
              <div className="row g-3 align-items-end">
                {/* עמודת פרסום כללי */}
                <div className="col-md-5 text-start">
                  <label className="form-label fw-semibold small text-muted">Grade Release</label>
                  <div>
                    <button
                      className="btn btn-success fw-bold w-100 shadow-sm"
                      onClick={handlePublishAll}
                      disabled={processingBulk}
                    >
                      📢 Publish All Marks
                    </button>
                  </div>
                </div>

                {/* מחיצה דקורטיבית */}
                <div className="col-md-1 d-none d-md-block text-center text-muted fw-light">
                  |
                </div>

                {/* עמודת החלת פקטור */}
                <div className="col-md-6 text-start">
                  <label className="form-label fw-semibold small text-muted" htmlFor="factorInputField">
                    Apply Factor Curve (Points)
                  </label>
                  <div className="input-group">
                    <input
                      id="factorInputField"
                      type="number"
                      className="form-control"
                      placeholder="e.g. +5 or -5"
                      value={factorVal}
                      onChange={(e) => setFactorVal(e.target.value)}
                    />
                    <button
                      className="btn btn-primary fw-bold px-4"
                      onClick={handleApplyFactor}
                      disabled={processingBulk}
                    >
                      Apply Factor
                    </button>
                  </div>
                </div>
              </div>

              {/* הודעות הצלחה או שגיאה של פעולות Bulk */}
              {bulkSuccess && (
                <div className="alert alert-success mt-3 mb-0 py-2 px-3 small text-start shadow-sm border-success-subtle">
                  🎉 {bulkSuccess}
                </div>
              )}
              {bulkError && (
                <div className="alert alert-danger mt-3 mb-0 py-2 px-3 small text-start shadow-sm border-danger-subtle">
                  ⚠️ {bulkError}
                </div>
              )}
            </div>
          </div>
        )}

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

        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>Student Name</th>
                <th>Exam Name</th>
                <th>Correct Answers</th>
                <th>Total Questions</th>
                <th>Final Grade</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredResults.map((result) => {
                const finalGrade = getFinalGrade(result)
                const hasOverride = result.manualGrade !== null && result.manualGrade !== undefined
                const isPublished = result.isPublished !== false

                return (
                  <tr key={result.id}>
                    <td>{result.studentName}</td>
                    <td>{result.examTitle}</td>
                    <td>{result.score}</td>
                    <td>{result.totalQuestions}</td>
                    <td>
                      <span className="fw-bold">{finalGrade}%</span>
                      {hasOverride && (
                        <span className="badge bg-info text-dark ms-2" style={{ fontSize: '0.7rem' }}>
                          Overridden
                        </span>
                      )}
                      {result.factor > 0 && (
                        <span className="badge bg-primary text-white ms-2" style={{ fontSize: '0.7rem' }}>
                          +{result.factor} Factor
                        </span>
                      )}
                      {result.factor < 0 && (
                        <span className="badge bg-danger text-white ms-2" style={{ fontSize: '0.7rem' }}>
                          {result.factor} Factor
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${isPublished ? 'bg-success' : 'bg-warning text-dark'}`}>
                        {isPublished ? 'Published' : 'Unpublished'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setSelectedSubmission(result)}
                      >
                        View & Grade
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ms-2 ${isPublished ? 'btn-outline-warning' : 'btn-outline-success'}`}
                        onClick={() => handleTogglePublish(result)}
                      >
                        {isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* מודל להצגת התשובות ועריכת הציון והמשוב */}
        {selectedSubmission && (
          <SubmissionReviewModal
            submission={selectedSubmission}
            currentExamData={currentExamData}
            onClose={() => setSelectedSubmission(null)}
            onSave={async (scoreData) => {
              const updated = await updateScore(selectedSubmission.id, scoreData)
              if (onScoreUpdated) {
                onScoreUpdated(updated)
              }
              // עדכון ההגשה המקומית בטופס כדי לשקף את הנתונים החדשים
              setSelectedSubmission(updated)
            }}
          />
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