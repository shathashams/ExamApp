import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

// ─── Database Mode ────────────────────────────────────────────────────────────
// DB_MODE is injected via environment variables.
//   render_pg  → Render.com cloud PostgreSQL (SSL required, uses DATABASE_URL)
//   docker_pg  → Local Docker container      (no SSL,     uses DATABASE_URL)
//   local_pg   → Local PostgreSQL on host    (no SSL,     uses DB_LOCAL_URL)
//   json        → Local JSON file fallback   (no PostgreSQL)
//
// In production: set DB_MODE + DATABASE_URL in Render dashboard env vars.
// In Docker dev: docker-compose.yml injects DB_MODE + DATABASE_URL automatically.
const dbMode = process.env.DB_MODE || 'docker_pg'

let connectionString = ''
let isPgEnabled = true

switch (dbMode) {
    case 'json':
        // מצב JSON מקומי — ללא PostgreSQL
        isPgEnabled = false
        break

    case 'local_pg':
        // PostgreSQL מותקן ישירות על המחשב המקומי (פורט 5432)
        connectionString =
            process.env.DB_LOCAL_URL ||
            'postgresql://postgres:postgres@localhost:5432/exam_app'
        break

    case 'docker_pg':
        // PostgreSQL בתוך Docker — הכתובת מוזנת מ-docker-compose.yml דרך DATABASE_URL
        connectionString = process.env.DATABASE_URL || ''
        break

    case 'render_pg':
    default:
        // Render.com PostgreSQL — הכתובת מוגדרת ב-Environment Variables של Render
        connectionString = process.env.DATABASE_URL || ''
        break
}

// ─── SSL Configuration ────────────────────────────────────────────────────────
// SSL is required only for Render (and any other cloud/production PostgreSQL).
// Docker and local PostgreSQL do NOT use SSL.
const shouldUseSsl = dbMode === 'render_pg' || process.env.NODE_ENV === 'production'

// ─── Create Connection Pool ───────────────────────────────────────────────────
let pool = null

if (isPgEnabled && connectionString) {
    pool = new Pool({
        connectionString,
        ssl: shouldUseSsl
            ? { rejectUnauthorized: false }
            : false,
    })

    // בדיקת חיבור עם אתחול ה-Pool
    // Table creation is handled exclusively by schema.sql (via seed.js or Docker init).
    // Do NOT drop/create tables here — it causes deadlocks when the seeder runs concurrently.
    pool.query('SELECT NOW()', (err, res) => {
        if (err) {
            console.error(`❌ Database connection failed (${dbMode}):`, err.message)
        } else {
            console.log(`✅ Database connected successfully (${dbMode}) at:`, res.rows[0].now)
        }
    })
} else if (dbMode === 'json') {
    console.log('📂 Database mode: Local JSON file (db.json)')
} else {
    console.warn('⚠️ PostgreSQL configured but DATABASE_URL is not set. Check environment variables.')
}

export default pool