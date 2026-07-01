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

  // שמירת רשימת השאלות של המבחן החדש
  const [questions, setQuestions] = useState([
    {
      text: '',
      options: '',
      answer: '',
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
      },
    ])
  }

  // מחיקת שאלה מהטופס
  const handleRemoveQuestion = (index) => {
    if (questions.length === 1) {
      setMessage('Exam must have at least one question.')
      return
    }

    const updatedQuestions = questions.filter((question, i) => i !== index)
    setQuestions(updatedQuestions)
  }

  // שמירת המבחן החדש במאגר המדומה
  // כאן נשים Breakpoint בזמן סרטון הדיבאג
  const handleSaveExam = async () => {
    if (!examTitle.trim()) {
      setMessage('Please enter exam title.')
      return
    }

    const hasEmptyQuestion = questions.some(
      (question) =>
        !question.text.trim() ||
        !question.options.trim() ||
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
        options: question.options.split(',').map((option) => option.trim()),
        answer: question.answer,
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
          in the mock database.
        </p>

        {message && <div className="alert alert-info">{message}</div>}

        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label">Exam Title</label>
            <input
              className="form-control"
              placeholder="Example: History Exam"
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Status</label>
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
            <label className="form-label">Duration Minutes</label>
            <input
              type="number"
              className="form-control"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Extra Time Minutes</label>
            <input
              type="number"
              className="form-control"
              value={extraTime}
              onChange={(e) => setExtraTime(e.target.value)}
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Allowed Materials</label>
            <input
              className="form-control"
              placeholder="Notes, calculator..."
              value={allowedMaterials}
              onChange={(e) => setAllowedMaterials(e.target.value)}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Teacher Availability</label>
            <input
              className="form-control"
              placeholder="Example: First 20 minutes of the exam"
              value={teacherAvailable}
              onChange={(e) => setTeacherAvailable(e.target.value)}
            />
          </div>
        </div>

        <hr />

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Exam Questions</h4>

          <button className="btn btn-outline-primary" onClick={handleAddQuestion}>
            Add Question
          </button>
        </div>

        {questions.map((question, index) => (
          <div className="card mb-3" key={index}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Question {index + 1}</h5>

                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleRemoveQuestion(index)}
                >
                  Remove
                </button>
              </div>

              <div className="mb-3">
                <label className="form-label">Question Text</label>
                <input
                  className="form-control"
                  placeholder="Enter question text"
                  value={question.text}
                  onChange={(e) =>
                    handleQuestionChange(index, 'text', e.target.value)
                  }
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Answer Options</label>
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

              <div className="mb-3">
                <label className="form-label">Correct Answer</label>
                <input
                  className="form-control"
                  placeholder="Enter correct answer"
                  value={question.answer}
                  onChange={(e) =>
                    handleQuestionChange(index, 'answer', e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        ))}

        <button className="btn btn-success" onClick={handleSaveExam}>
          Save Exam
        </button>
      </div>
    </div>
  )
}

export default CreateExam