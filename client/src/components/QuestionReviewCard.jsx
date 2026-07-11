
function QuestionReviewCard({ question, index, studentAnswer, totalQuestions, isTeacher }) {
  const q = question
  const studentAns = studentAnswer
  const isOpenQ = q.type === 'open' || !q.options || q.options.length === 0 || (q.options.length === 1 && q.options[0] === '')
  const isCorrect = !isOpenQ && studentAns === q.answer

  let cardClass = 'border-danger-subtle bg-danger-subtle bg-opacity-10'
  let badgeClass = 'bg-danger'
  let statusText = 'Incorrect ✗'

  if (isOpenQ) {
    cardClass = 'border-info-subtle bg-info-subtle bg-opacity-10'
    badgeClass = 'bg-info text-dark'
    statusText = 'Open Text Question'
  } else if (isCorrect) {
    cardClass = 'border-success-subtle bg-success-subtle bg-opacity-10'
    badgeClass = 'bg-success'
    statusText = 'Correct ✓'
  }

  return (
    <div className={`p-3 rounded border ${cardClass}`}>
      <div className="d-flex justify-content-between align-items-start gap-3 mb-2">
        <h6 className="fw-bold mb-0 text-start">
          Question {index + 1}: {q.text}
          <span className="badge bg-secondary-subtle text-secondary-emphasis ms-2 small">
            {q.points !== undefined && Number(q.points) > 0
              ? `${q.points} pts`
              : `${Math.round(100 / totalQuestions)} pts`}
          </span>
        </h6>
        <span className={`badge ${badgeClass} px-2 py-1`}>
          {statusText}
        </span>
      </div>
      <div className="small text-start">
        <div className="mb-1">
          <strong>{isTeacher ? "Student's Answer:" : "Your Answer:"} </strong>
          <span className={isOpenQ ? 'text-dark fw-normal' : (isCorrect ? 'text-success fw-bold' : 'text-danger fw-bold')}>
            {studentAns || '(No Answer)'}
          </span>
        </div>
        <div>
          <strong>{isOpenQ ? 'Reference Answer:' : 'Correct Answer:'} </strong>
          <span className="text-success fw-bold">{q.answer}</span>
        </div>
        {q.options && q.options.length > 0 && !isOpenQ && (
          <div className="text-muted mt-2 pt-2 border-top border-light-subtle">
            <strong>Options: </strong>
            {q.options.join(', ')}
          </div>
        )}
      </div>
    </div>
  )
}

export default QuestionReviewCard
