import pool from './connect.js'

async function runQueries() {
    try {
        console.log('🔍 Querying users from the database...')
        const usersResult = await pool.query(`
      SELECT id, username, role, "fullName"
      FROM "users"
      ORDER BY id DESC
    `)

        console.log('\n===== USERS =====')
        usersResult.rows.forEach((user, index) => {
            console.log(`${index + 1}. ${user.fullName}`)
            console.log(`   Username: ${user.username}`)
            console.log(`   Role: ${user.role}`)
            console.log(`   ID: ${user.id}`)
            console.log('----------------------------------')
        })

        console.log('\n🔍 Querying exams from the database...')
        const examsResult = await pool.query(`
      SELECT id, title, duration
      FROM "exams"
      ORDER BY id DESC
    `)

        console.log('\n===== EXAMS =====')
        examsResult.rows.forEach((exam, index) => {
            console.log(`${index + 1}. ${exam.title}`)
            console.log(`   Duration: ${exam.duration} minutes`)
            console.log(`   ID: ${exam.id}`)
            console.log('----------------------------------')
        })
    } catch (error) {
        console.error('❌ Error running database queries:', error.message)
    } finally {
        await pool.end()
    }
}

runQueries()