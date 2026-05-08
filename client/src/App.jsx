import './App.css'

function App() {
  const exams = [
    { id: 1, title: 'Math Exam', students: 25 },
    { id: 2, title: 'English Exam', students: 18 },
    { id: 3, title: 'Computer Science Exam', students: 32 },
  ]

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Exam Manager</h1>

      <div className="row">
        {exams.map((exam) => (
          <div className="col-md-4 mb-3" key={exam.id}>
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{exam.title}</h5>
                <p className="card-text">
                  Number of students: {exam.students}
                </p>
                <button className="btn btn-primary">View Details</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App