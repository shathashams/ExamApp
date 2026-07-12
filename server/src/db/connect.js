import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

const dbMode = process.env.DB_MODE || 'docker_pg'

let connectionString = ''
let isPgEnabled = true

switch (dbMode) {
    case 'json':
        isPgEnabled = false
        break
    case 'local_pg':
        connectionString = process.env.DB_LOCAL_URL || 'postgresql://postgres:postgres@localhost:5432/exam_app'
        break
    case 'docker_pg':
        connectionString = process.env.DB_DOCKER_URL || 'postgresql://postgres:postgres@localhost:5435/exam_app'
        break
    case 'render_pg':
    default:
        connectionString = process.env.DATABASE_URL
        break
}

let pool = null

if (isPgEnabled && connectionString) {
    // Enable SSL automatically for Render or production databases.
    // This prevents ECONNRESET errors when Render requires SSL.
    const shouldUseSsl =
        connectionString.includes('ssl=true') ||
        connectionString.includes('render.com') ||
        process.env.NODE_ENV === 'production'

    pool = new Pool({
        connectionString,
        ssl: shouldUseSsl
            ? {
                rejectUnauthorized: false,
            }
            : false,
    })

    // Verify connection on pool initialization
    pool.query('SELECT NOW()', async (err, res) => {
        if (err) {
            console.error(`❌ Database connection failed (${dbMode}):`, err.message)
        } else {
            console.log(`✅ Database connected successfully (${dbMode}) at:`, res.rows[0].now)
            try {
                // Drop and recreate table on startup to ensure TIMESTAMPTZ column updates are applied
                await pool.query(`DROP TABLE IF EXISTS "activeSessions" CASCADE`)
                await pool.query(`
                    CREATE TABLE "activeSessions" (
                        "id" SERIAL PRIMARY KEY,
                        "studentName" VARCHAR(100) NOT NULL,
                        "studentId" INTEGER REFERENCES "users"("id") ON DELETE CASCADE NOT NULL,
                        "examId" INTEGER REFERENCES "exams"("id") ON DELETE CASCADE NOT NULL,
                        "examTitle" VARCHAR(150) NOT NULL,
                        "startTime" TIMESTAMPTZ DEFAULT NOW(),
                        "lastActive" TIMESTAMPTZ DEFAULT NOW(),
                        CONSTRAINT "unique_student_exam_session" UNIQUE ("studentId", "examId")
                    )
                `)
                console.log('✅ Ensure "activeSessions" table exists with TIMESTAMPTZ')
            } catch (createErr) {
                console.error('❌ Failed to ensure "activeSessions" table exists:', createErr.message)
            }
        }
    })
} else if (dbMode === 'json') {
    console.log('📂 Database mode: Local JSON file (db.json)')
} else {
    console.warn('⚠️ PostgreSQL is configured but no connection string is available. Please check environment variables.')
}

export default pool