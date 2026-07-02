import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DB_FILE_PATH = path.join(__dirname, 'db.json')

let writeQueue = Promise.resolve()

export async function readDb() {
    try {
        const data = await fs.readFile(DB_FILE_PATH, 'utf8')
        return JSON.parse(data)
    } catch (error) {
        console.error('Error reading JSON DB:', error)
        return { roles: { TEACHER: 'teacher', STUDENT: 'student' }, users: [], exams: [], studentScores: [] }
    }
}

export async function writeDb(data) {
    writeQueue = writeQueue.then(async () => {
        try {
            await fs.writeFile(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf8')
        } catch (error) {
            console.error('Error writing JSON DB:', error)
        }
    })
    return writeQueue
}

export async function getNextId(collectionName) {
    const db = await readDb()
    const collection = db[collectionName] || []
    if (collection.length === 0) return 1
    const ids = collection.map(item => Number(item.id)).filter(id => !isNaN(id))
    return ids.length > 0 ? Math.max(...ids) + 1 : 1
}
