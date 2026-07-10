// דף תוצאות לתלמיד
// מציג את כל המבחנים שהתלמיד הגיש ואת הציונים שלו, ומאפשר לשלוח פידבק למורה ולראות פירוט תשובות

import { useState, useEffect } from 'react'
import { submitFeedback } from '../api/feedbackService'
import { getAllExams } from '../api/examService'

// קומפוננטת מודל המאפשרת לסטודנט לראות את תשובותיו מול התשובות הנכונות לאחר פרסום הציונים
function StudentSubmissionReviewModal({ submission, examData, onClose }) {
  const getFinalGrade = (sub) => {
    const base = sub.manualGrade !== null && sub.manualGrade !== undefined
      ? sub.manualGrade
      : sub.grade
    return Math.min(100, base + (sub.factor || 0))
  }

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1050 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content shadow-lg">
          <div className="modal-header bg-dark text-white p-3">
            <h5 className="modal-title fw-bold">
              Review Your Answers — {submission.examTitle}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body p-4 bg-light">
            {/* מידע כללי על הציון */}
            <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2 pb-3 border-bottom border-secondary-subtle">
              <div className="text-start">
                <h6 className="text-muted mb-1 small text-uppercase fw-bold">Assessment Date</h6>
                <h5 className="fw-bold mb-0">{submission.date || 'Completed'}</h5>
              </div>
              <div className="text-end">
                <span className="fs-5 fw-bold me-3 text-primary">Your Grade: {getFinalGrade(submission)}%</span>
                <span className="badge bg-primary px-3 py-2 rounded-pill">
                  {submission.score} / {submission.totalQuestions} Correct
                </span>
              </div>
            </div>

            {/* מיפוי השאלות ותשובות התלמיד */}
            {examData ? (
              <div className="d-flex flex-column gap-3">
                {examData.questions.map((q, idx) => {
                  const studentAns = submission.answers ? submission.answers[q.id] || submission.answers[String(q.id)] : null
                  const isOpenQ = q.type === 'open' || !q.options || q.options.length === 0 || (q.options.length === 1 && q.options[0] === '')
                  const isCorrect = !isOpenQ && studentAns === q.answer

                  let cardClass = 'border-danger-subtle bg-danger-subtle bg-opacity-10'
                  let badgeClass = 'bg-danger'
                  let statusText = 'Incorrect ✗'

                  if (isOpenQ) {
                    cardClass = 'border-info-subtle bg-info-subtle bg-opacity-10'
                    badgeClass = 'bg-info text-dark'
                    statusText = 'Open Text Question'
                  } else if (isCorrect) {
                    cardClass = 'border-success-subtle bg-success-subtle bg-opacity-10'
                    badgeClass = 'bg-success'
                    statusText = 'Correct ✓'
                  }

                  return (
                    <div
                      key={q.id || idx}
                      className={`p-3 rounded border ${cardClass}`}
                    >
                      <div className="d-flex justify-content-between align-items-start gap-3 mb-2">
                        <h6 className="fw-bold mb-0 text-start">
                          Question {idx + 1}: {q.text}
                          <span className="badge bg-secondary-subtle text-secondary-emphasis ms-2 small">
                            {q.points !== undefined && Number(q.points) > 0
                              ? `${q.points} pts`
                              : `${Math.round(100 / examData.questions.length)} pts`}
                          </span>
                        </h6>
                        <span className={`badge ${badgeClass} px-2 py-1`}>
                          {statusText}
                        </span>
                      </div>
                      <div className="small text-start">
                        <div className="mb-1">
                          <strong>Your Answer: </strong>
                          <span className={isOpenQ ? 'text-dark fw-normal' : (isCorrect ? 'text-success fw-bold' : 'text-danger fw-bold')}>
                            {studentAns || '(No Answer)'}
                          </span>
                        </div>
                        <div>
                          <strong>{isOpenQ ? 'Reference Answer:' : 'Correct Answer:'} </strong>
                          <span className="text-success fw-bold">{q.answer}</span>
                        </div>
                        {q.options && q.options.length > 0 && !isOpenQ && (
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
          <div className="modal-footer bg-light p-2">
            <button
              type="button"
              className="btn btn-secondary px-4 fw-bold"
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

function StudentResults({ results, feedbacks = [], onFeedbackSubmitted }) {
  const [activeFeedbackExamId, setActiveFeedbackExamId] = useState(null)
  const [feedbackMsg, setFeedbackMsg] = useState('')
  const [submittingFeedback, setSubmittingFeedback] = useState(false)
  const [submitError, setSubmitError] = useState('')
  
  // שמירת רשימת מבחנים ותצוגת הגשה שנבחרה
  const [exams, setExams] = useState([])
  const [selectedSubmission, setSelectedSubmission] = useState(null)

  // טעינת רשימת המבחנים לצורך תצוגת תשובות נכונות
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await getAllExams()
        setExams(data)
      } catch (err) {
        console.error('Failed to load exams inside student results view:', err)
      }
    }
    fetchExams()
  }, [])

  // שליחת פידבק חדש לשרת
  const handleSendFeedback = async (examId, examTitle) => {
    if (!feedbackMsg.trim()) {
      setSubmitError('Please enter a message.')
      return
    }

    setSubmittingFeedback(true)
    setSubmitError('')
    try {
      const newFb = await submitFeedback({
        examId,
        examTitle,
        message: feedbackMsg,
      })
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted(newFb)
      }
      setActiveFeedbackExamId(null)
      setFeedbackMsg('')
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit feedback')
    } finally {
      setSubmittingFeedback(false)
    }
  }

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

  // עזר לקבלת הציון הסופי (ידני אם קיים, אחרת הממוחשב) בתוספת פקטור
  const getFinalGrade = (result) => {
    const base = result.manualGrade !== null && result.manualGrade !== undefined
      ? result.manualGrade
      : result.grade
    return Math.min(100, base + (result.factor || 0))
  }

  // חישוב הממוצע של כל המבחנים שהוגשו
  const totalGrades = results.reduce((sum, r) => sum + getFinalGrade(r), 0)
  const averageGrade = Math.round(totalGrades / results.length)

  return (
    <div className="card shadow-sm">
      <div className="card-body p-4">
        <h2 className="mb-1 text-start">🎓 Student Results</h2>
        <p className="text-muted mb-4 text-start">
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

        <h5 className="fw-bold mb-3 text-start">Submitted Assessments</h5>

        {/* רשימת המבחנים בעיצוב מודרני */}
        <div className="list-group">
          {results.map((result) => {
            const finalGrade = getFinalGrade(result)
            const isPassed = finalGrade >= 60
            const hasOverride = result.manualGrade !== null && result.manualGrade !== undefined
            
            // סינון פידבקים קודמים שנשלחו על ידי הסטודנט למבחן זה
            const examFeedbacks = feedbacks.filter(
              (f) => f.examId === result.examId
            )

            return (
              <div
                key={result.id}
                className="list-group-item p-3 mb-3 rounded border shadow-sm d-flex flex-column text-start"
              >
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 w-100 border-bottom pb-2 mb-2">
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
                    <button
                      className="btn btn-sm btn-outline-primary px-3 fw-bold shadow-sm"
                      onClick={() => setSelectedSubmission(result)}
                    >
                      🔍 View Details
                    </button>
                  </div>
                </div>

                {/* משוב המורה במידה וקיים */}
                {result.feedback && (
                  <div className="mt-3 p-3 bg-light border-start border-primary border-4 rounded small text-muted">
                    <strong className="text-dark d-block mb-1">Teacher Exam Feedback:</strong>
                    "{result.feedback}"
                  </div>
                )}

                {/* היסטוריית שאלות/פידבקים שהסטודנט שלח */}
                {examFeedbacks.length > 0 && (
                  <div className="mt-3">
                    <strong className="text-muted d-block small mb-1">Questions / Feedback sent:</strong>
                    {examFeedbacks.map((f) => (
                      <div key={f.id} className="p-2 mb-2 bg-light border-start border-info border-3 rounded small text-start">
                        <strong>Your question:</strong> "{f.message}"
                        {f.teacherResponse ? (
                          <div className="mt-1 text-primary">
                            <strong>Teacher response:</strong> "{f.teacherResponse}"
                          </div>
                        ) : (
                          <div className="mt-1 text-muted">
                            <em>Waiting for teacher's reply...</em>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* טופס שליחת פידבק inline */}
                {activeFeedbackExamId === result.examId ? (
                  <div className="mt-3 p-3 bg-light border rounded text-start">
                    <h6 className="fw-bold mb-2 small text-primary">Send Feedback or Ask Question</h6>
                    <textarea
                      className="form-control form-control-sm mb-2"
                      rows="2"
                      placeholder="Ask the teacher a question or write your feedback about this exam..."
                      value={feedbackMsg}
                      onChange={(e) => setFeedbackMsg(e.target.value)}
                    ></textarea>
                    <div className="d-flex gap-2 justify-content-end">
                      <button
                        className="btn btn-light btn-sm"
                        onClick={() => setActiveFeedbackExamId(null)}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary btn-sm px-3"
                        disabled={submittingFeedback}
                        onClick={() => handleSendFeedback(result.examId, result.examTitle)}
                      >
                        {submittingFeedback ? 'Sending...' : 'Send Message'}
                      </button>
                    </div>
                    {submitError && <div className="text-danger small mt-1">{submitError}</div>}
                  </div>
                ) : (
                  <div className="mt-3 text-start">
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => {
                        setActiveFeedbackExamId(result.examId)
                        setFeedbackMsg('')
                        setSubmitError('')
                      }}
                    >
                      💬 Ask a Question / Give Feedback
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* מודל להצגת תשובות ועריכת הציון והמשוב של הסטודנט */}
        {selectedSubmission && (
          <StudentSubmissionReviewModal
            submission={selectedSubmission}
            examData={exams.find((e) => e.id === selectedSubmission.examId)}
            onClose={() => setSelectedSubmission(null)}
          />
        )}
      </div>
    </div>
  )
}

export default StudentResults