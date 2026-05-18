// קומפוננטה זו מציגה למורה את רשימת המבחנים במערכת
// בנוסף, היא מאפשרת למורה להיכנס לדף ניהול של מבחן מסוים

import { useEffect, useState } from 'react'
import { getAllExams } from '../api/examService'
import ExamManagement from './ExamManagement'

function TeacherDashboard() {
  const [exams, setExams] = useState([])
  const [selectedExam, setSelectedExam] = useState(null)

  // בעת טעינת המסך, המערכת מביאה את רשימת המבחנים מהשירות המדומה
  useEffect(() => {
    const loadExams = async () => {
      const data = await getAllExams()
      setExams(data)
    }

    loadExams()
  }, [])

  // אם המורה בחר מבחן, מציגים את דף ניהול המבחן
  if (selectedExam) {
    return (
      <ExamManagement
        exam={selectedExam}
        onBack={() => setSelectedExam(null)}
      />
    )
  }

  // הצגת המבחנים ככרטיסים בעזרת Bootstrap
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
      </div>
    </div>
  )
}

export default TeacherDashboard