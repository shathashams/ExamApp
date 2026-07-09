// דף ניהול מבחן למורה
// מאפשר צפייה בפרטי מבחן, עריכת שאלות, הוספת שאלה ועריכת מידע בסיסי של המבחן
// תומך בסוגי שאלות: MCQ (בחירה מרובה) ו-Open Text (תשובה פתוחה)

import { useState } from 'react'
import { updateExam } from '../api/examService'

function ExamManagement({ exam, onBack }) {
  // שומר עותק מקומי של המבחן כדי לאפשר שינויים במסך
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
    status: exam?.status || 'draft',
    duration: exam?.duration || 60,
    extraTime: exam?.extraTime || 15,
    allowedMaterials: exam?.allowedMaterials || 'No materials',
    teacherAvailable: exam?.teacherAvailable || 'First 20 minutes of the exam',
  })

  // שמירת הערכים שהמורה מכניס בטופס הוספת שאלה חדשה
  // type: 'mcq' = שאלה סגורה (בחירה מרובה), 'open' = שאלה פתוחה (תשובה חופשית)
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    type: 'mcq',
    options: '',
    answer: '',
  })

  // שמירת הערכים של השאלה שנמצאת כרגע בעריכה
  const [editQuestion, setEditQuestion] = useState({
    text: '',
    type: 'mcq',
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

  // פונקציית עזר: קבלת סוג שאלה — תומכת בשאלות ישנות שאין להן שדה type
  const getQuestionType = (question) =>
    question.type ||
    (!question.options || question.options.length === 0 ||
      (question.options.length === 1 && question.options[0] === '')
      ? 'open'
      : 'mcq')

  // ספירת שאלות פתוחות וסגורות
  const openQuestions = localExam.questions.filter(
    (q) => getQuestionType(q) === 'open'
  ).length
  const closedQuestions = localExam.questions.length - openQuestions

  // פתיחת טופס עריכת שאלה עם הערכים הקיימים שלה
  const startEditQuestion = (question) => {
    setEditingQuestionId(question.id)
    const qType = getQuestionType(question)
    setEditQuestion({
      text: question.text,
      type: qType,
      options: qType === 'mcq' ? (question.options?.join(', ') || '') : '',
      answer: question.answer,
    })
  }

  // שמירת שינויי שאלה ועדכון המבחן במאגר
  const saveQuestionChanges = async (questionId) => {
    const updatedQuestions = localExam.questions.map((question) => {
      if (question.id !== questionId) return question

      if (editQuestion.type === 'open') {
        return {
          ...question,
          text: editQuestion.text,
          type: 'open',
          options: [],
          answer: editQuestion.answer,
        }
      }

      return {
        ...question,
        text: editQuestion.text,
        type: 'mcq',
        options: editQuestion.options.split(',').map((o) => o.trim()),
        answer: editQuestion.answer,
      }
    })

    const updatedExam = { ...localExam, questions: updatedQuestions }
    await updateExam(updatedExam)
    setLocalExam(updatedExam)
    setEditingQuestionId(null)
  }

  // הוספת שאלה חדשה למבחן ועדכון המאגר
  const handleAddQuestion = async () => {
    if (!newQuestion.text || !newQuestion.answer) {
      alert('Please fill in the question text and answer.')
      return
    }
    if (newQuestion.type === 'mcq' && !newQuestion.options) {
      alert('Please fill in the answer options for a multiple choice question.')
      return
    }

    const questionToAdd = {
      id: Date.now(),
      text: newQuestion.text,
      type: newQuestion.type,
      options: newQuestion.type === 'open'
        ? []
        : newQuestion.options.split(',').map((o) => o.trim()),
      answer: newQuestion.answer,
    }

    const updatedExam = {
      ...localExam,
      questions: [...localExam.questions, questionToAdd],
    }

    await updateExam(updatedExam)
    setLocalExam(updatedExam)
    setNewQuestion({ text: '', type: 'mcq', options: '', answer: '' })
    setShowAddQuestion(false)
  }

  // שמירת מידע כללי של המבחן ועדכון המאגר
  const handleSaveExamInfo = async () => {
    const updatedExam = {
      ...localExam,
      title: examInfo.title,
      status: examInfo.status,
      duration: Number(examInfo.duration),
      extraTime: Number(examInfo.extraTime),
      allowedMaterials: examInfo.allowedMaterials,
      teacherAvailable: examInfo.teacherAvailable,
    }
    await updateExam(updatedExam)
    setLocalExam(updatedExam)
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
            <div className="d-flex align-items-center gap-2">
              <h2 className="fw-bold mb-1">{localExam.title}</h2>
              <span className={`badge ${localExam.status === 'published' ? 'bg-success' : 'bg-warning text-dark'}`}>
                {localExam.status === 'published' ? 'Published' : 'Draft'}
              </span>
            </div>
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

              <div className="row mb-2">
                <div className="col-md-8">
                  <label className="form-label small mb-1 text-muted">Exam Title</label>
                  <input
                    className="form-control"
                    placeholder="Exam title"
                    value={examInfo.title}
                    onChange={(e) =>
                      setExamInfo({ ...examInfo, title: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small mb-1 text-muted">Status</label>
                  <select
                    className="form-select"
                    value={examInfo.status}
                    onChange={(e) =>
                      setExamInfo({ ...examInfo, status: e.target.value })
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-md-4">
                  <label className="form-label small mb-1 text-muted">Duration (min)</label>
                  <input
                    className="form-control"
                    type="number"
                    value={examInfo.duration}
                    onChange={(e) =>
                      setExamInfo({ ...examInfo, duration: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small mb-1 text-muted">Extra Time (min)</label>
                  <input
                    className="form-control"
                    type="number"
                    value={examInfo.extraTime}
                    onChange={(e) =>
                      setExamInfo({ ...examInfo, extraTime: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small mb-1 text-muted">Allowed Materials</label>
                  <input
                    className="form-control"
                    placeholder="e.g. Calculator"
                    value={examInfo.allowedMaterials}
                    onChange={(e) =>
                      setExamInfo({ ...examInfo, allowedMaterials: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small mb-1 text-muted">Teacher Availability</label>
                <input
                  className="form-control"
                  placeholder="e.g. First 20 minutes of the exam"
                  value={examInfo.teacherAvailable}
                  onChange={(e) =>
                    setExamInfo({ ...examInfo, teacherAvailable: e.target.value })
                  }
                />
              </div>

              <button className="btn btn-success me-2" onClick={handleSaveExamInfo}>
                Save Info
              </button>
              <button className="btn btn-outline-secondary" onClick={() => setShowEditInfo(false)}>
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

              {/* בחירת סוג השאלה: MCQ או Open Text */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted d-block">
                  Question Type
                </label>
                <div className="btn-group" role="group" aria-label="Question type">
                  <button
                    type="button"
                    className={`btn ${newQuestion.type === 'mcq' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setNewQuestion({ ...newQuestion, type: 'mcq', options: '' })}
                  >
                    ☑ Multiple Choice (MCQ)
                  </button>
                  <button
                    type="button"
                    className={`btn ${newQuestion.type === 'open' ? 'btn-info' : 'btn-outline-info'}`}
                    onClick={() => setNewQuestion({ ...newQuestion, type: 'open', options: '' })}
                  >
                    ✏️ Open Text
                  </button>
                </div>
                {newQuestion.type === 'open' && (
                  <p className="text-muted small mt-2 mb-0">
                    Students type a free-text answer. Auto-score is 0 — use manual grade to score.
                  </p>
                )}
              </div>

              <input
                className="form-control mb-2"
                placeholder="Question text"
                value={newQuestion.text}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, text: e.target.value })
                }
              />

              {/* שדה אפשרויות תשובה — מוצג רק בשאלה סגורה */}
              {newQuestion.type === 'mcq' && (
                <input
                  className="form-control mb-2"
                  placeholder="Answer options separated by commas (e.g. Yes, No, Maybe)"
                  value={newQuestion.options}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, options: e.target.value })
                  }
                />
              )}

              <input
                className="form-control mb-3"
                placeholder={
                  newQuestion.type === 'open'
                    ? 'Model answer (for teacher reference — not shown to student)'
                    : 'Correct answer (must match one option exactly)'
                }
                value={newQuestion.answer}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, answer: e.target.value })
                }
              />

              <button className="btn btn-success me-2" onClick={handleAddQuestion}>
                Save Question
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setShowAddQuestion(false)
                  setNewQuestion({ text: '', type: 'mcq', options: '', answer: '' })
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <h4 className="mb-3">Exam Questions</h4>

        <div className="list-group">
          {/* הצגת כל השאלות של המבחן עם אפשרות עריכה */}
          {localExam.questions.map((question, index) => {
            const qType = getQuestionType(question)

            return (
              <div className="list-group-item mb-3 rounded" key={question.id}>
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <h5 className="mb-0">
                        Question {index + 1}: {question.text}
                      </h5>
                      {/* תג המציין את סוג השאלה */}
                      {qType === 'open' ? (
                        <span className="badge bg-info text-dark" style={{ fontSize: '0.7rem' }}>
                          Open Text
                        </span>
                      ) : (
                        <span className="badge bg-secondary" style={{ fontSize: '0.7rem' }}>
                          MCQ
                        </span>
                      )}
                    </div>

                    <p className="mb-1">
                      <strong>
                        {qType === 'open' ? 'Model Answer:' : 'Correct Answer:'}
                      </strong>{' '}
                      {question.answer}
                    </p>

                    {qType === 'mcq' && question.options && question.options.length > 0 && (
                      <p className="text-muted mb-0">
                        Options: {question.options.join(', ')}
                      </p>
                    )}
                  </div>

                  <button
                    className="btn btn-outline-primary btn-sm ms-2"
                    onClick={() => startEditQuestion(question)}
                  >
                    Edit
                  </button>
                </div>

                {/* טופס עריכת שאלה שמופיע רק עבור השאלה שנבחרה */}
                {editingQuestionId === question.id && (
                  <div className="mt-3 border-top pt-3">
                    <h6>Edit Question</h6>

                    {/* בחירת סוג השאלה בטופס עריכה */}
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-muted d-block">
                        Question Type
                      </label>
                      <div className="btn-group" role="group">
                        <button
                          type="button"
                          className={`btn btn-sm ${editQuestion.type === 'mcq' ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => setEditQuestion({ ...editQuestion, type: 'mcq' })}
                        >
                          ☑ Multiple Choice (MCQ)
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${editQuestion.type === 'open' ? 'btn-info' : 'btn-outline-info'}`}
                          onClick={() => setEditQuestion({ ...editQuestion, type: 'open', options: '' })}
                        >
                          ✏️ Open Text
                        </button>
                      </div>
                    </div>

                    <input
                      className="form-control mb-2"
                      placeholder="Question text"
                      value={editQuestion.text}
                      onChange={(e) =>
                        setEditQuestion({ ...editQuestion, text: e.target.value })
                      }
                    />

                    {/* שדה אפשרויות תשובה בעריכה — רק לשאלה סגורה */}
                    {editQuestion.type === 'mcq' && (
                      <input
                        className="form-control mb-2"
                        placeholder="Answer options separated by commas"
                        value={editQuestion.options}
                        onChange={(e) =>
                          setEditQuestion({ ...editQuestion, options: e.target.value })
                        }
                      />
                    )}

                    <input
                      className="form-control mb-3"
                      placeholder={
                        editQuestion.type === 'open'
                          ? 'Model answer (for teacher reference only)'
                          : 'Correct answer'
                      }
                      value={editQuestion.answer}
                      onChange={(e) =>
                        setEditQuestion({ ...editQuestion, answer: e.target.value })
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
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ExamManagement