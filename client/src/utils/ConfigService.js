// שירות הגדרות מרכזי של האפליקציה
// כאן נשמור ערכים קבועים שמשמשים בכמה מקומות במערכת

class ConfigService {
  constructor() {
    this.appName = 'E-Test System'
    this.defaultExamTimeMinutes = 60
    this.extraTimeMinutes = 15
    this.teacherAvailableMinutes = 20

    // כתובת השרת המקומי
    this.apiBaseUrl = 'http://localhost:5000/api'

    // מצב ברירת המחדל: SERVER = עבודה מול שרת
    this.defaultDataMode = 'SERVER'
  }

  getAppName() {
    return this.appName
  }

  getDefaultExamTime() {
    return this.defaultExamTimeMinutes
  }

  getExtraTime() {
    return this.extraTimeMinutes
  }

  getTeacherAvailableTime() {
    return this.teacherAvailableMinutes
  }

  getApiBaseUrl() {
    return this.apiBaseUrl
  }

  // מחזיר את מצב העבודה הנוכחי מ-localStorage, או ברירת המחדל
  getDataMode() {
    return 'SERVER'
  }

  // שומר את מצב העבודה ב-localStorage
  setDataMode(mode) {
    localStorage.setItem('dataMode', 'SERVER')
  }

  // האם עובדים מול שרת אמיתי?
  isServerMode() {
    return true
  }

  // האם עובדים מול Mock Client בלבד?
  isFullClientMode() {
    return false
  }
}

export default new ConfigService()