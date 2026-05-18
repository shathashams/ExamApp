// דף עריכת מבחן
// כרגע זהו דף הכנה לעריכת מבחנים קיימים

function EditExam() {
  return (
    <div className="card shadow-sm">
      <div className="card-body p-4">
        <h2>Edit Exam</h2>
        <p className="text-muted">
          This page will allow the teacher to edit exam details and questions.
        </p>

        <div className="alert alert-secondary">
          Feature preparation: update title, questions, options, and correct answers.
        </div>
      </div>
    </div>
  )
}

export default EditExam