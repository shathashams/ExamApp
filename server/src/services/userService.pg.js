import pool from '../db/connect.js'

class UserService {
    // קבלת כל המשתמשים ללא סיסמאות
    async getAllUsers() {
        const result = await pool.query(`
            SELECT
                id,
                username,
                "fullName",
                role
            FROM users
            ORDER BY id
        `)
        return result.rows
    }

    // שליפת משתמש כולל סיסמה מוצפנת לצורך אימות התחברות
    async getUserWithPassword(username) {
        const result = await pool.query(`
            SELECT
                id,
                username,
                password,
                "fullName",
                role
            FROM users
            WHERE username = $1
        `, [username])
        return result.rows[0]
    }

    // קבלת משתמש לפי username (ללא סיסמה)
    async getUserByUsername(username) {
        const result = await pool.query(`
            SELECT
                id,
                username,
                "fullName",
                role
            FROM users
            WHERE username = $1
        `, [username])
        return result.rows[0]
    }

    // הרשמת משתמש חדש (הסיסמה כבר מוצפנת ע"י הקונטרולר)
    async registerUser({ username, password, fullName, role }) {
        const result = await pool.query(`
            INSERT INTO users (
                username,
                password,
                "fullName",
                role
            )
            VALUES ($1, $2, $3, $4)
            RETURNING
                id,
                username,
                "fullName",
                role
        `, [username, password, fullName, role])
        return result.rows[0]
    }
}

export default new UserService()
