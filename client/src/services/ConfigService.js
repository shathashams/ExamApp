// שירות הגדרות מרכזי של האפליקציה
// כאן נשמור ערכים קבועים שמשמשים בכמה מקומות במערכת

class ConfigService {
  constructor() {
    this.appName = 'E-Test System'
    this.defaultExamTimeMinutes = 60
    this.extraTimeMinutes = 15
    this.teacherAvailableMinutes = 20
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
}

export default new ConfigService()