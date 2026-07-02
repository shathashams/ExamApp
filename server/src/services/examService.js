import dotenv from 'dotenv'
import pgExamService from './examService.pg.js'
import jsonExamService from './examService.json.js'

dotenv.config()

const isJsonMode = process.env.DB_MODE === 'json'
const examService = isJsonMode ? jsonExamService : pgExamService

export default examService
