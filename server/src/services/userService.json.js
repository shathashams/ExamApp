import { readDb, writeDb, getNextId } from '../db/dbJsonHelper.js'

class UserJsonService {
    // קבלת כל המשתמשים ללא סיסמאות
    async getAllUsers() {
        const db = await readDb()
        const users = db.users || []
        return users.map(({ id, username, fullName, role }) => ({
            id,
            username,
            fullName,
            role
        })).sort((a, b) => a.id - b.id)
    }

    // שליפת משתמש כולל סיסמה (מוצפנת/במקור) לצורך אימות התחברות
    async getUserWithPassword(username) {
        const db = await readDb()
        const users = db.users || []
        const user = users.find(u => u.username === username)
        if (!user) return null
        return user
    }

    // קבלת משתמש לפי username (ללא סיסמה)
    async getUserByUsername(username) {
        const db = await readDb()
        const users = db.users || []
        const user = users.find(u => u.username === username)
        if (!user) return null
        return {
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            role: user.role
        }
    }

    // הרשמת משתמש חדש
    async registerUser({ username, password, fullName, role }) {
        const db = await readDb()
        db.users = db.users || []

        const nextId = await getNextId('users')
        const newUser = {
            id: nextId,
            username,
            password,
            fullName,
            role
        }

        db.users.push(newUser)
        await writeDb(db)

        return {
            id: newUser.id,
            username: newUser.username,
            fullName: newUser.fullName,
            role: newUser.role
        }
    }
}

export default new UserJsonService()
