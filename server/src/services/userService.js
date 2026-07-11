import dotenv from 'dotenv'
import pgUserService from './userService.pg.js'
import jsonUserService from './userService.json.js'

dotenv.config()

const isJsonMode = process.env.DB_MODE === 'json'
const userService = isJsonMode ? jsonUserService : pgUserService

export default userService
