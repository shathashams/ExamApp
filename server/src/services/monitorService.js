import dotenv from 'dotenv'
import pgMonitorService from './monitorService.pg.js'
import jsonMonitorService from './monitorService.json.js'

dotenv.config()

const isJsonMode = process.env.DB_MODE === 'json'
const monitorService = isJsonMode ? jsonMonitorService : pgMonitorService

export default monitorService
