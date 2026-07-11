import dotenv from 'dotenv'
import pgScoreService from './scoreService.pg.js'
import jsonScoreService from './scoreService.json.js'

dotenv.config()

const isJsonMode = process.env.DB_MODE === 'json'
const scoreService = isJsonMode ? jsonScoreService : pgScoreService

export default scoreService
