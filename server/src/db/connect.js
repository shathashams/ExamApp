import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

// Database URL configuration.
// If DATABASE_URL exists in .env / Render, use it.
// Otherwise, use local Postgres as fallback.
const connectionString =
    process.env.DATABASE_URL ||
    'postgres://postgres:postgres@localhost:5432/exam_app'

// Enable SSL automatically for Render or production databases.
// This prevents ECONNRESET errors when Render requires SSL.
const shouldUseSsl =
    connectionString.includes('ssl=true') ||
    connectionString.includes('render.com') ||
    process.env.NODE_ENV === 'production'

const pool = new Pool({
    connectionString,
    ssl: shouldUseSsl
        ? {
            rejectUnauthorized: false,
        }
        : false,
})

// Verify connection on pool initialization
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message)
    } else {
        console.log('✅ Database connected successfully at:', res.rows[0].now)
    }
})

export default pool