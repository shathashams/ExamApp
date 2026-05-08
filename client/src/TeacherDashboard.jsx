// קומפוננטה זו מציגה למורה את רשימת המבחנים במערכת

import { useEffect, useState } from 'react'
import { getAllExams } from './api/examService'

function TeacherDashboard() {
  const [exams, setExams] = useState([])

  // בעת טעינת המסך, המערכת מביאה את רשימת המבחנים מהשירות המדומה
  useEffect(() => {
    const loadExams = async () => {
      const data = await getAllExams()
      setExams(data)
    }

    loadExams()
  }, [])

  // Bootstrap הצגת המבחנים ככרטיסים בעזרת 
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
                  <button className="btn btn-primary">Manage Exam</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard