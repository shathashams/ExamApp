// שירות לוגים פשוט
// משמש להדפסת פעולות חשובות בקונסול בזמן פיתוח

class LoggerService {
  info(message) {
    console.log(`[INFO]: ${message}`)
  }

  warning(message) {
    console.warn(`[WARNING]: ${message}`)
  }

  error(message) {
    console.error(`[ERROR]: ${message}`)
  }
}

export default new LoggerService()