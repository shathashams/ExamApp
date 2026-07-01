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

    // מצב ברירת המחדל: FULLCLIENT = עבודה מול mockDb ללא שרת
    this.defaultDataMode = 'FULLCLIENT'
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
    return localStorage.getItem('dataMode') || this.defaultDataMode
  }

  // שומר את מצב העבודה ב-localStorage
  setDataMode(mode) {
    localStorage.setItem('dataMode', mode)
  }

  // האם עובדים מול שרת אמיתי?
  isServerMode() {
    return this.getDataMode() === 'SERVER'
  }

  // האם עובדים מול Mock Client בלבד?
  isFullClientMode() {
    return this.getDataMode() === 'FULLCLIENT'
  }
}

export default new ConfigService()