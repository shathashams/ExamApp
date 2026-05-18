// דף ניהול מבחן למורה
// מאפשר צפייה בפרטי מבחן, עריכת שאלות, הוספת שאלה ועריכת מידע בסיסי של המבחן

import { useState } from 'react'

function ExamManagement({ exam, onBack }) {
  // שומר עותק מקומי של המבחן כדי לאפשר שינויים במסך בלי לשנות את ה-DB המדומה ישירות
  const [localExam, setLocalExam] = useState(exam)

  // קובע אם להציג את טופס הוספת השאלה
  const [showAddQuestion, setShowAddQuestion] = useState(false)

  // קובע אם להציג את טופס עריכת פרטי המבחן
  const [showEditInfo, setShowEditInfo] = useState(false)

  // שומר איזו שאלה נמצאת כרגע במצב עריכה
  const [editingQuestionId, setEditingQuestionId] = useState(null)

  // שמירת פרטי המבחן הכלליים שמוצגים למורה
  const [examInfo, setExamInfo] = useState({
    title: exam?.title || '',
    duration: 60,
    extraTime: 15,
    allowedMaterials: 'Calculator and course notes',
    teacherAvailable: 'First 20 minutes of the exam',
  })

  // שמירת הערכים שהמורה מכניס בטופס הוספת שאלה חדשה
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    options: '',
    answer: '',
  })

  // שמירת הערכים של השאלה שנמצאת כרגע בעריכה
  const [editQuestion, setEditQuestion] = useState({
    text: '',
    options: '',
    answer: '',
  })

  // אם לא נבחר מבחן, מציגים הודעה וכפתור חזרה
  if (!localExam) {
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

  const openQuestions = 0
  const closedQuestions = localExam.questions.length

  // פתיחת טופס עריכת שאלה עם הערכים הקיימים שלה
  const startEditQuestion = (question) => {
    setEditingQuestionId(question.id)
    setEditQuestion({
      text: question.text,
      options: question.options?.join(', ') || '',
      answer: question.answer,
    })
  }

  // שמירת שינויי שאלה בתוך local state
  const saveQuestionChanges = (questionId) => {
    const updatedQuestions = localExam.questions.map((question) => {
      if (question.id !== questionId) {
        return question
      }

      return {
        ...question,
        text: editQuestion.text,
        options: editQuestion.options.split(',').map((option) => option.trim()),
        answer: editQuestion.answer,
      }
    })

    setLocalExam({
      ...localExam,
      questions: updatedQuestions,
    })

    setEditingQuestionId(null)
  }

  // הוספת שאלה חדשה למבחן אחרי בדיקה שכל השדות מולאו
  const handleAddQuestion = () => {
    if (!newQuestion.text || !newQuestion.options || !newQuestion.answer) {
      alert('Please fill all question fields.')
      return
    }

    const questionToAdd = {
      id: Date.now(),
      text: newQuestion.text,
      options: newQuestion.options.split(',').map((option) => option.trim()),
      answer: newQuestion.answer,
    }

    setLocalExam({
      ...localExam,
      questions: [...localExam.questions, questionToAdd],
    })

    setNewQuestion({
      text: '',
      options: '',
      answer: '',
    })

    setShowAddQuestion(false)
  }

  // שמירת מידע כללי של המבחן, כמו שם המבחן, זמן וחומר עזר
  const handleSaveExamInfo = () => {
    setLocalExam({
      ...localExam,
      title: examInfo.title,
    })

    setShowEditInfo(false)
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body p-4">
        <button className="btn btn-outline-secondary mb-3" onClick={onBack}>
          ← Back to Dashboard
        </button>

        {/* כותרת הדף וכפתורי הניהול המרכזיים */}
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h2 className="fw-bold mb-1">{localExam.title}</h2>
            <p className="text-muted mb-0">
              Manage exam details, questions, answers, and exam settings.
            </p>
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-primary"
              onClick={() => setShowEditInfo(!showEditInfo)}
            >
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

        {/* טופס לעריכת מידע כללי של המבחן */}
        {showEditInfo && (
          <div className="card border-primary mb-4">
            <div className="card-body">
              <h4>Edit Exam Info</h4>

              <input
                className="form-control mb-2"
                placeholder="Exam title"
                value={examInfo.title}
                onChange={(e) =>
                  setExamInfo({ ...examInfo, title: e.target.value })
                }
              />

              <input
                type="number"
                className="form-control mb-2"
                placeholder="Duration in minutes"
                value={examInfo.duration}
                onChange={(e) =>
                  setExamInfo({ ...examInfo, duration: e.target.value })
                }
              />

              <input
                type="number"
                className="form-control mb-2"
                placeholder="Extra time in minutes"
                value={examInfo.extraTime}
                onChange={(e) =>
                  setExamInfo({ ...examInfo, extraTime: e.target.value })
                }
              />

              <input
                className="form-control mb-2"
                placeholder="Allowed materials"
                value={examInfo.allowedMaterials}
                onChange={(e) =>
                  setExamInfo({
                    ...examInfo,
                    allowedMaterials: e.target.value,
                  })
                }
              />

              <input
                className="form-control mb-3"
                placeholder="Teacher availability"
                value={examInfo.teacherAvailable}
                onChange={(e) =>
                  setExamInfo({
                    ...examInfo,
                    teacherAvailable: e.target.value,
                  })
                }
              />

              <button
                className="btn btn-success me-2"
                onClick={handleSaveExamInfo}
              >
                Save Exam Info
              </button>

              <button
                className="btn btn-outline-secondary"
                onClick={() => setShowEditInfo(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* כרטיסים המציגים מידע כללי על המבחן */}
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="card h-100 border-primary">
              <div className="card-body text-center">
                <h6 className="text-muted">Exam Duration</h6>
                <h4>{examInfo.duration} min</h4>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card h-100 border-success">
              <div className="card-body text-center">
                <h6 className="text-muted">Extra Time</h6>
                <h4>{examInfo.extraTime} min</h4>
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

        {/* מידע נוסף למורה על חומר עזר וזמינות בזמן הבחינה */}
        <div className="alert alert-info">
          <strong>Allowed Materials:</strong> {examInfo.allowedMaterials}
          <br />
          <strong>Teacher Availability:</strong> {examInfo.teacherAvailable}
        </div>

        {/* טופס להוספת שאלה חדשה למבחן */}
        {showAddQuestion && (
          <div className="card border-primary mb-4">
            <div className="card-body">
              <h4>Add New Question</h4>

              <input
                className="form-control mb-2"
                placeholder="Question text"
                value={newQuestion.text}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, text: e.target.value })
                }
              />

              <input
                className="form-control mb-2"
                placeholder="Answer options separated by commas"
                value={newQuestion.options}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, options: e.target.value })
                }
              />

              <input
                className="form-control mb-3"
                placeholder="Correct answer"
                value={newQuestion.answer}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, answer: e.target.value })
                }
              />

              <button
                className="btn btn-success me-2"
                onClick={handleAddQuestion}
              >
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

        <h4 className="mb-3">Exam Questions</h4>

        <div className="list-group">
          {/* הצגת כל השאלות של המבחן עם אפשרות עריכה */}
          {localExam.questions.map((question, index) => (
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
                  onClick={() => startEditQuestion(question)}
                >
                  Edit
                </button>
              </div>

              {/* טופס עריכת שאלה שמופיע רק עבור השאלה שנבחרה */}
              {editingQuestionId === question.id && (
                <div className="mt-3 border-top pt-3">
                  <h6>Edit Question</h6>

                  <input
                    className="form-control mb-2"
                    value={editQuestion.text}
                    onChange={(e) =>
                      setEditQuestion({
                        ...editQuestion,
                        text: e.target.value,
                      })
                    }
                  />

                  <input
                    className="form-control mb-2"
                    value={editQuestion.options}
                    onChange={(e) =>
                      setEditQuestion({
                        ...editQuestion,
                        options: e.target.value,
                      })
                    }
                  />

                  <input
                    className="form-control mb-3"
                    value={editQuestion.answer}
                    onChange={(e) =>
                      setEditQuestion({
                        ...editQuestion,
                        answer: e.target.value,
                      })
                    }
                  />

                  <button
                    className="btn btn-success btn-sm me-2"
                    onClick={() => saveQuestionChanges(question.id)}
                  >
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