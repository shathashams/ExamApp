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

    // התחברות לפי username ו-password
    async loginUser(username, password) {
        const result = await pool.query(`
            SELECT
                id,
                username,
                "fullName",
                role
            FROM users
            WHERE username = $1
              AND password = $2
        `, [username, password])
        return result.rows[0]
    }

    // קבלת משתמש לפי username
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

    // הרשמת משתמש חדש
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
