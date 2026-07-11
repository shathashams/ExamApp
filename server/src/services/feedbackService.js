import feedbackPgService from './feedbackService.pg.js'
import feedbackJsonService from './feedbackService.json.js'

const dataMode = process.env.DB_MODE || 'json'

// בחירה דינמית בין המימוש של PostgreSQL ל-JSON
const feedbackService = dataMode.includes('pg') ? feedbackPgService : feedbackJsonService

export default feedbackService
