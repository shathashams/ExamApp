// קומפוננטה זו מציגה למורה את רשימת המבחנים במערכת
// המידע נטען מה-Mock API

import { useEffect, useState } from 'react'
import { getAllExams } from '../api/examService'
import ExamManagement from './ExamManagement'

function TeacherDashboard() {
  const [exams, setExams] = useState([])
  const [selectedExam, setSelectedExam] = useState(null)

  // טעינת רשימת המבחנים מהשירות
  const loadExams = async () => {
    const data = await getAllExams()
    setExams(data)
  }

  // בעת טעינת המסך, המערכת מביאה את רשימת המבחנים
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
        <h2 className="card-title mb-3">Teacher Dashboard</h2>
        <p className="text-muted">List of available exams:</p>

        <div className="row">
          {exams.map((exam) => (
            <div className="col-md-4 mb-3" key={exam.id}>
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{exam.title}</h5>

                  <p className="card-text">
                    Questions: {exam.questions.length}
                  </p>

                  <p className="text-muted mb-2">
                    Duration: {exam.duration || 60} min
                  </p>

                  <button
                    className="btn btn-primary"
                    onClick={() => setSelectedExam(exam)}
                  >
                    Manage Exam
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {exams.length === 0 && (
          <div className="alert alert-warning">
            No exams found.
          </div>
        )}
      </div>
    </div>
  )
}

export default TeacherDashboard