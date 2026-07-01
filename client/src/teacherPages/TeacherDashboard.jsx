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
          {exams.map((exam) => {
            const status = exam.status || (exam.id <= 2 ? 'published' : 'draft');
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

                      <p className="card-text mb-1">
                        Questions: {exam.questions.length}
                      </p>

                      <p className="text-muted mb-3">
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
            );
          })}
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