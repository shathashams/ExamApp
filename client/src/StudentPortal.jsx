// קומפוננטה זו מאפשרת לתלמיד להכניס מזהה מבחן ולהציג את השאלות שלו

import { useState } from 'react'
import { getExamById } from './api/examService'

function StudentPortal() {
  const [examId, setExamId] = useState('')
  const [exam, setExam] = useState(null)
  const [message, setMessage] = useState('')

  const handleStartExam = async () => {
    if (!examId) {
      setMessage('Please enter an exam ID.')
      setExam(null)
      return
    }

    const data = await getExamById(examId)

    if (!data) {
      setMessage('Exam not found.')
      setExam(null)
      return
    }

    setExam(data)
    setMessage('')
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h2 className="card-title mb-3">Student Portal</h2>
        <p className="text-muted">Enter an exam ID to start.</p>

        <div className="input-group mb-3">
          <input
            type="number"
            className="form-control"
            placeholder="Enter Exam ID to Start"
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
          />
          <button className="btn btn-success" onClick={handleStartExam}>
            Start
          </button>
        </div>

        {/* הצגת הודעת שגיאה אם לא הוזן מזהה או אם המבחן לא נמצא */}
        {message && <div className="alert alert-warning">{message}</div>}

        {/* אם נמצא מבחן מתאים, מציגים את שם המבחן ואת רשימת השאלות */}
        {exam && (
          <div className="mt-4">
            <h4>{exam.title}</h4>
            <ul className="list-group">
              {exam.questions.map((question) => (
                <li className="list-group-item" key={question.id}>
                  {question.text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentPortal