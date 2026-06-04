import pool from './connect.js'

async function getFirstExam() {
    try {
        console.log('🔍 Querying the database for the first exam...')
        const result = await pool.query('SELECT * FROM "exams" ORDER BY id ASC LIMIT 1')

        if (result.rows.length === 0) {
            console.log('⚠️ No exams found in the database. Please run the seed script first.')
        } else {
            const exam = result.rows[0]

            console.log('✅ Exam retrieved successfully')
            console.log('--------------------------------------------------')
            console.log(`ID:            ${exam.id}`)
            console.log(`Title:         ${exam.title}`)
            console.log(`Duration:      ${exam.duration} minutes`)

            console.log('\nNested Questions (JSONB parsed automatically by pg):')
            console.dir(exam.questions, { depth: null })
            console.log('--------------------------------------------------')
        }
    } catch (error) {
        console.error('❌ Error fetching exam:', error.message)
    } finally {
        await pool.end()
    }
}

getFirstExam()