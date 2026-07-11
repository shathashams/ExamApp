import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import pool from './connect.js'

// Resolve directory paths for ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function runSeed() {
    try {
        console.log('🔄 Reading schema.sql...')
        const schemaPath = path.join(__dirname, 'schema.sql')
        const sql = fs.readFileSync(schemaPath, 'utf8')

        console.log('⏳ Executing schema.sql queries on the database...')
        await pool.query(sql)

        console.log('✅ Database schema created and seeded successfully!')
    } catch (error) {
        console.error('❌ Database seeding failed:', error.message)
    } finally {
        await pool.end()
    }
}

runSeed()