// דף יצירת מבחן למורה
// מאפשר למורה ליצור מבחן חדש עם כמה שאלות ולשמור אותו במאגר המדומה

import { useState } from 'react'
import { createExam } from '../api/examService'

function CreateExam({ onExamCreated }) {
  // שמירת פרטי המבחן הכלליים
  const [examTitle, setExamTitle] = useState('')
  const [status, setStatus] = useState('draft')
  const [duration, setDuration] = useState(60)
  const [extraTime, setExtraTime] = useState(15)
  const [allowedMaterials, setAllowedMaterials] = useState('')
  const [teacherAvailable, setTeacherAvailable] = useState(
    'First 20 minutes of the exam'
  )
  const [message, setMessage] = useState('')

  // שמירת רשימת השאלות של המבחן החדש (תומך בסוגי שאלות סגורות/פתוחות)
  const [questions, setQuestions] = useState([
    {
      text: '',
      options: '',
      answer: '',
      type: 'closed',
      points: 10,
    },
  ])

  // עדכון שדה של שאלה מסוימת
  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions]
    updatedQuestions[index][field] = value
    setQuestions(updatedQuestions)
  }

  // הוספת שאלה חדשה לטופס
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: '',
        options: '',
        answer: '',
        type: 'closed',
        points: 10,
      },
    ])
  }

  // הסרת שאלה מהטופס
  const handleRemoveQuestion = (index) => {
    if (questions.length === 1) {
      setMessage('Exam must have at least one question.')
      return
    }

    const updatedQuestions = questions.filter((question, i) => i !== index)
    setQuestions(updatedQuestions)
  }

  // שמירת המבחן החדש במאגר המדומה
  const handleSaveExam = async () => {
    if (!examTitle.trim()) {
      setMessage('Please enter exam title.')
      return
    }

    const hasEmptyQuestion = questions.some(
      (question) =>
        !question.text.trim() ||
        ((question.type || 'closed') === 'closed' && !question.options.trim()) ||
        !question.answer.trim()
    )

    if (hasEmptyQuestion) {
      setMessage('Please fill all question fields.')
      return
    }

    const newExam = {
      title: examTitle,
      status,
      duration: Number(duration),
      extraTime: Number(extraTime),
      allowedMaterials,
      teacherAvailable,
      questions: questions.map((question, index) => ({
        id: index + 1,
        text: question.text,
        type: question.type || 'closed',
        options: (question.type || 'closed') === 'closed'
          ? question.options.split(',').map((option) => option.trim())
          : [],
        answer: question.answer,
        points: Number(question.points) || 0,
      })),
    }

    const savedExam = await createExam(newExam)

    setMessage(`Exam "${savedExam.title}" was created successfully.`)

    setExamTitle('')
    setStatus('draft')
    setDuration(60)
    setExtraTime(15)
    setAllowedMaterials('')
    setTeacherAvailable('First 20 minutes of the exam')
    setQuestions([
      {
        text: '',
        options: '',
        answer: '',
        type: 'closed',
        points: 10,
      },
    ])

    setTimeout(() => {
      if (onExamCreated) {
        onExamCreated()
      }
    }, 800)
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body p-4">
        <h2 className="mb-3">Create New Exam</h2>
        <p className="text-muted">
          The teacher can create a new exam with several questions and save it
          in the database.
        </p>

        {message && <div className="alert alert-info">{message}</div>}

        <div className="row mb-3 text-start">
          <div className="col-md-4">
            <label className="form-label fw-semibold">Exam Title</label>
            <input
              className="form-control"
              placeholder="Example: History Exam"
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label fw-semibold">Status</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">Duration Minutes</label>
            <input
              type="number"
              className="form-control"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">Extra Time Minutes</label>
            <input
              type="number"
              className="form-control"
              value={extraTime}
              onChange={(e) => setExtraTime(e.target.value)}
            />
          </div>
        </div>

        <div className="row mb-3 text-start">
          <div className="col-md-6">
            <label className="form-label fw-semibold">Allowed Materials</label>
            <input
              className="form-control"
              placeholder="Notes, calculator..."
              value={allowedMaterials}
              onChange={(e) => setAllowedMaterials(e.target.value)}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-semibold">Teacher Availability</label>
            <input
              className="form-control"
              placeholder="Example: First 20 minutes of the exam"
              value={teacherAvailable}
              onChange={(e) => setTeacherAvailable(e.target.value)}
            />
          </div>
        </div>

        <hr />

        {(() => {
          const totalPoints = questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0)
          return (
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0 fw-bold">
                Exam Questions <span className="badge bg-primary-subtle text-primary ms-2" style={{ fontSize: '0.9rem' }}>Total Points: {totalPoints}</span>
              </h4>
    
              <button className="btn btn-outline-primary" onClick={handleAddQuestion}>
                Add Question
              </button>
            </div>
          )
        })()}

        {questions.map((question, index) => (
          <div className="card mb-3 border-light shadow-sm" key={index}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                <h5 className="mb-0 fw-bold text-primary">Question {index + 1}</h5>

                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleRemoveQuestion(index)}
                >
                  Remove
                </button>
              </div>

              <div className="row g-3 mb-3 text-start">
                <div className="col-md-8">
                  <label className="form-label fw-semibold small text-muted">Question Type</label>
                  <select
                    className="form-select form-select-sm"
                    value={question.type || 'closed'}
                    onChange={(e) =>
                      handleQuestionChange(index, 'type', e.target.value)
                    }
                  >
                    <option value="closed">Multiple Choice (Closed Question)</option>
                    <option value="open">Open Text Question</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold small text-muted">Points</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    min="0"
                    placeholder="e.g. 10"
                    value={question.points !== undefined ? question.points : ''}
                    onChange={(e) =>
                      handleQuestionChange(index, 'points', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="mb-3 text-start">
                <label className="form-label fw-semibold">Question Text</label>
                <input
                  className="form-control"
                  placeholder="Enter question text"
                  value={question.text}
                  onChange={(e) =>
                    handleQuestionChange(index, 'text', e.target.value)
                  }
                />
              </div>

              {(question.type || 'closed') === 'closed' ? (
                <div className="mb-3 text-start">
                  <label className="form-label fw-semibold">Answer Options</label>
                  <input
                    className="form-control"
                    placeholder="Write options separated by commas"
                    value={question.options}
                    onChange={(e) =>
                      handleQuestionChange(index, 'options', e.target.value)
                    }
                  />
                  <small className="text-muted">Example: 3, 4, 5, 6</small>
                </div>
              ) : null}

              <div className="mb-3 text-start">
                <label className="form-label fw-semibold">
                  {(question.type || 'closed') === 'closed'
                    ? 'Correct Answer'
                    : 'Reference / Sample Answer'}
                </label>
                <input
                  className="form-control"
                  placeholder={
                    (question.type || 'closed') === 'closed'
                      ? 'Enter correct answer'
                      : 'Enter reference answer / keywords'
                  }
                  value={question.answer}
                  onChange={(e) =>
                    handleQuestionChange(index, 'answer', e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        ))}

        <div className="text-end mt-4">
          <button className="btn btn-success px-5 fw-bold" onClick={handleSaveExam}>
            Save Exam
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateExam