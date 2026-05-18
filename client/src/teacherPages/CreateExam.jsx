// דף יצירת מבחן חדש למורה
// כרגע זהו דף הכנה לפיצ'ר עתידי של יצירת מבחנים

function CreateExam() {
  return (
    <div className="card shadow-sm">
      <div className="card-body p-4">
        <h2>Create Exam</h2>
        <p className="text-muted">
          This page will allow the teacher to create a new exam in the future.
        </p>

        <div className="alert alert-secondary">
          Feature preparation: exam title, questions, answers, and exam settings.
        </div>
      </div>
    </div>
  )
}

export default CreateExam