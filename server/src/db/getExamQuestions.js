import pool from './connect.js'

async function getExamQuestions() {
    try {
        console.log('🔍 Fetching one exam with JSONB questions from the database...')

        const result = await pool.query(`
      SELECT id, title, questions
      FROM exams
      WHERE questions IS NOT NULL
      LIMIT 1
    `)

        if (result.rows.length === 0) {
            console.log('⚠️ No exam found in the database.')
            return
        }

        const exam = result.rows[0]

        console.log('\n===== SELECTED EXAM =====')
        console.log(`Exam ID: ${exam.id}`)
        console.log(`Exam Title: ${exam.title}`)

        console.log('\n===== QUESTIONS FROM JSONB COLUMN =====')

        exam.questions.forEach((question, index) => {
            console.log(`\nQuestion ${index + 1}:`)
            console.log(`ID: ${question.id}`)
            console.log(`Text: ${question.text}`)

            if (question.options) {
                console.log('Options:')
                question.options.forEach((option, optionIndex) => {
                    console.log(`  ${optionIndex + 1}. ${option}`)
                })
            }

            if (question.correctAnswer) {
                console.log(`Correct Answer: ${question.correctAnswer}`)
            }

            if (question.answer) {
                console.log(`Answer: ${question.answer}`)
            }

            console.log('----------------------------------')
        })

        console.log('\n✅ Finished reading JSONB questions as JavaScript objects.')
    } catch (error) {
        console.error('❌ Error fetching exam questions:', error.message)
    } finally {
        await pool.end()
    }
}

getExamQuestions()