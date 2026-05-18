// דף ניהול מבחן למורה
// מציג פרטי מבחן, מידע כללי, שאלות, תשובות וכפתורי ניהול בסיסיים

import { useState } from 'react'

function ExamManagement({ exam, onBack }) {
  const [showAddQuestion, setShowAddQuestion] = useState(false)
  const [editingQuestionId, setEditingQuestionId] = useState(null)

  if (!exam) {
    return (
      <div className="card shadow-sm">
        <div className="card-body text-center">
          <h2>No exam selected</h2>
          <button className="btn btn-secondary mt-3" onClick={onBack}>
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const examDuration = 60
  const extraTime = 15
  const openQuestions = 0
  const closedQuestions = exam.questions.length
  const allowedMaterials = 'Calculator and course notes'
  const teacherAvailable = 'First 20 minutes of the exam'

  return (
    <div className="card shadow-sm">
      <div className="card-body p-4">
        <button className="btn btn-outline-secondary mb-3" onClick={onBack}>
          ← Back to Dashboard
        </button>

        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h2 className="fw-bold mb-1">{exam.title}</h2>
            <p className="text-muted mb-0">
              Manage exam details, questions, answers, and exam settings.
            </p>
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-outline-primary">
              Edit Exam Info
            </button>

            <button
              className="btn btn-primary"
              onClick={() => setShowAddQuestion(!showAddQuestion)}
            >
              Add Question
            </button>
          </div>
        </div>

        {/* פרטי המבחן */}
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="card h-100 border-primary">
              <div className="card-body text-center">
                <h6 className="text-muted">Exam Duration</h6>
                <h4>{examDuration} min</h4>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card h-100 border-success">
              <div className="card-body text-center">
                <h6 className="text-muted">Extra Time</h6>
                <h4>{extraTime} min</h4>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card h-100 border-warning">
              <div className="card-body text-center">
                <h6 className="text-muted">Closed Questions</h6>
                <h4>{closedQuestions}</h4>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card h-100 border-info">
              <div className="card-body text-center">
                <h6 className="text-muted">Open Questions</h6>
                <h4>{openQuestions}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="alert alert-info">
          <strong>Allowed Materials:</strong> {allowedMaterials}
          <br />
          <strong>Teacher Availability:</strong> {teacherAvailable}
        </div>

        {/* אזור הוספת שאלה */}
        {showAddQuestion && (
          <div className="card border-primary mb-4">
            <div className="card-body">
              <h4>Add New Question</h4>
              <p className="text-muted">
                This is a preparation area for adding a new question in the future.
              </p>

              <input
                className="form-control mb-2"
                placeholder="Question text"
              />

              <input
                className="form-control mb-2"
                placeholder="Answer options"
              />

              <input
                className="form-control mb-3"
                placeholder="Correct answer"
              />

              <button className="btn btn-success me-2">
                Save Question
              </button>

              <button
                className="btn btn-outline-secondary"
                onClick={() => setShowAddQuestion(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* רשימת שאלות */}
        <h4 className="mb-3">Exam Questions</h4>

        <div className="list-group">
          {exam.questions.map((question, index) => (
            <div className="list-group-item mb-3 rounded" key={question.id}>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5>
                    Question {index + 1}: {question.text}
                  </h5>

                  <p className="mb-1">
                    <strong>Correct Answer:</strong> {question.answer}
                  </p>

                  {question.options && (
                    <p className="text-muted mb-0">
                      Options: {question.options.join(', ')}
                    </p>
                  )}
                </div>

                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() =>
                    setEditingQuestionId(
                      editingQuestionId === question.id ? null : question.id
                    )
                  }
                >
                  Edit
                </button>
              </div>

              {editingQuestionId === question.id && (
                <div className="mt-3 border-top pt-3">
                  <h6>Edit Question</h6>

                  <input
                    className="form-control mb-2"
                    defaultValue={question.text}
                  />

                  <input
                    className="form-control mb-2"
                    defaultValue={question.options?.join(', ')}
                  />

                  <input
                    className="form-control mb-3"
                    defaultValue={question.answer}
                  />

                  <button className="btn btn-success btn-sm me-2">
                    Save Changes
                  </button>

                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setEditingQuestionId(null)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ExamManagement