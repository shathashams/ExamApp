// קומפוננטה זו מציגה למורה את רשימת המבחנים במערכת, ומנהלת התראות פידבקים של סטודנטים
import { useEffect, useState } from 'react'
import { getAllExams } from '../api/examService'
import { respondToFeedback } from '../api/feedbackService'
import ExamManagement from './ExamManagement'

function TeacherDashboard({ feedbacks = [], onRespondToFeedback }) {
  const [exams, setExams] = useState([])
  const [selectedExam, setSelectedExam] = useState(null)
  
  // ניהול מודל פידבקים של סטודנטים
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [replyText, setReplyText] = useState({}) // { [feedbackId]: '' }
  const [submittingReply, setSubmittingReply] = useState({}) // { [feedbackId]: boolean }
  const [replyError, setReplyError] = useState({}) // { [feedbackId]: string }

  // טעינת רשימת המבחנים מהשירות
  const loadExams = async () => {
    const data = await getAllExams()
    setExams(data)
  }

  // בעת טעינת המסך, המערכת מביאה את רשימת המבחנים
  useEffect(() => {
    const fetchExams = async () => {
      await loadExams()
    }
    fetchExams()
  }, [])

  // חזרה ממסך ניהול מבחן לדשבורד וטעינה מחדש של המידע
  const handleBackToDashboard = async () => {
    setSelectedExam(null)
    await loadExams()
  }

  // שליחת מענה לפידבק של סטודנט
  const handleSendReply = async (feedbackId) => {
    const text = replyText[feedbackId]
    if (!text || text.trim() === '') {
      setReplyError((prev) => ({ ...prev, [feedbackId]: 'Please write a response.' }))
      return
    }

    setSubmittingReply((prev) => ({ ...prev, [feedbackId]: true }))
    setReplyError((prev) => ({ ...prev, [feedbackId]: '' }))

    try {
      const updatedFeedback = await respondToFeedback(feedbackId, text)
      if (onRespondToFeedback) {
        onRespondToFeedback(updatedFeedback)
      }
      setReplyText((prev) => ({ ...prev, [feedbackId]: '' }))
    } catch (err) {
      setReplyError((prev) => ({ ...prev, [feedbackId]: err.message || 'Failed to submit response' }))
    } finally {
      setSubmittingReply((prev) => ({ ...prev, [feedbackId]: false }))
    }
  }

  const pendingFeedbacks = feedbacks.filter((f) => !f.teacherResponse)

  if (selectedExam) {
    return (
      <ExamManagement
        exam={selectedExam}
        onBack={handleBackToDashboard}
      />
    )
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        {/* התראת פידבקים לסטודנטים */}
        {pendingFeedbacks.length > 0 && (
          <div className="alert alert-warning d-flex justify-content-between align-items-center mb-4 text-start shadow-sm animate__animated animate__pulse">
            <div>
              <strong>📢 Student Feedbacks Alert!</strong> You have <strong>{pendingFeedbacks.length}</strong> pending student question(s)/feedback to respond to.
            </div>
            <button
              className="btn btn-warning btn-sm fw-bold px-3 py-1.5 shadow-sm"
              onClick={() => setShowFeedbackModal(true)}
            >
              Review Feedbacks
            </button>
          </div>
        )}

        {/* באנר הסבר כשאין פידבקים פתוחים אבל המורה רוצה לראות היסטוריה */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="card-title mb-0">Teacher Dashboard</h2>
          <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setShowFeedbackModal(true)}
          >
            💬 View Feedbacks History ({feedbacks.length})
          </button>
        </div>
        <p className="text-muted text-start">List of available exams:</p>

        <div className="row">
          {exams.map((exam) => {
            const status = exam.status || (exam.id <= 2 ? 'published' : 'draft')
            return (
              <div className="col-md-4 mb-3" key={exam.id}>
                <div className="card h-100">
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex justify-content-between align-items-start mb-2 gap-2">
                        <h5 className="card-title mb-0">{exam.title}</h5>
                        <span className={`badge ${status === 'published' ? 'bg-success' : 'bg-warning text-dark'}`}>
                          {status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </div>

                      <p className="card-text mb-1 text-start">
                        Questions: {exam.questions.length}
                      </p>

                      <p className="text-muted mb-3 text-start">
                        Duration: {exam.duration || 60} min
                      </p>
                    </div>

                    <button
                      className="btn btn-primary w-100"
                      onClick={() => setSelectedExam(exam)}
                    >
                      Manage Exam
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {exams.length === 0 && (
          <div className="alert alert-warning">
            No exams found.
          </div>
        )}

        {/* מודל ניהול פידבקים של סטודנטים */}
        {showFeedbackModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header bg-dark text-white p-3">
                  <h5 className="modal-title fw-bold">💬 Student Feedbacks & Questions</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowFeedbackModal(false)}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body p-4 bg-light">
                  {feedbacks.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <h5>No feedbacks or questions submitted by students yet.</h5>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {feedbacks.map((f) => {
                        const isPending = !f.teacherResponse
                        return (
                          <div key={f.id} className={`card shadow-sm border-0 ${isPending ? 'border-start border-warning border-4' : 'border-start border-success border-4'}`}>
                            <div className="card-body p-3">
                              <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-1">
                                <span className="fw-bold text-dark fs-6">{f.studentName}</span>
                                <span className={`badge ${isPending ? 'bg-warning text-dark' : 'bg-success'}`}>
                                  {isPending ? 'Pending Action' : 'Replied'}
                                </span>
                              </div>
                              
                              <div className="mb-2 text-start small">
                                <span className="text-muted">Exam: </span>
                                <strong>{f.examTitle}</strong>
                              </div>

                              <div className="p-3 bg-light rounded text-start mb-3 border">
                                <strong className="small text-muted d-block mb-1">Student's Message:</strong>
                                "{f.message}"
                              </div>

                              {isPending ? (
                                <div className="text-start">
                                  <label className="form-label fw-bold small text-muted">Write your Response:</label>
                                  <textarea
                                    className="form-control mb-2"
                                    rows="2"
                                    placeholder="Enter your response/explanation..."
                                    value={replyText[f.id] || ''}
                                    onChange={(e) =>
                                      setReplyText((prev) => ({ ...prev, [f.id]: e.target.value }))
                                    }
                                  ></textarea>
                                  <div className="text-end">
                                    <button
                                      className="btn btn-warning btn-sm px-4 fw-bold shadow-sm"
                                      disabled={submittingReply[f.id]}
                                      onClick={() => handleSendReply(f.id)}
                                    >
                                      {submittingReply[f.id] ? 'Sending...' : 'Send Response'}
                                    </button>
                                  </div>
                                  {replyError[f.id] && (
                                    <div className="text-danger small mt-1">{replyError[f.id]}</div>
                                  )}
                                </div>
                              ) : (
                                <div className="p-3 bg-primary-subtle bg-opacity-25 rounded border-start border-primary border-3 text-start small text-primary-emphasis">
                                  <strong className="d-block mb-1">Your Response:</strong>
                                  "{f.teacherResponse}"
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
                <div className="modal-footer bg-light p-2">
                  <button
                    type="button"
                    className="btn btn-secondary px-4 fw-bold"
                    onClick={() => setShowFeedbackModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TeacherDashboard