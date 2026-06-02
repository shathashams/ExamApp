// שירות הגדרות מרכזי של האפליקציה
// כאן נשמור ערכים קבועים שמשמשים בכמה מקומות במערכת

class ConfigService {
  constructor() {
    this.appName = 'E-Test System'
    this.defaultExamTimeMinutes = 60
    this.extraTimeMinutes = 15
    this.teacherAvailableMinutes = 20

    // מצב עבודה של האפליקציה:
    // FULLCLIENT = עבודה מול mockDb בתוך ה-Client
    // SERVER = עבודה מול שרת API באמצעות fetch
    this.dataMode = 'SERVER'

    // כתובת השרת המקומי
    this.apiBaseUrl = 'http://localhost:3001/api'
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

  getDataMode() {
    return this.dataMode
  }

  getApiBaseUrl() {
    return this.apiBaseUrl
  }
}

export default new ConfigService()