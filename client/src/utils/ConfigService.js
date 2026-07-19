// שירות הגדרות מרכזי של האפליקציה
// כתובת השרת נקראת ממשתנה סביבה VITE_API_URL שמוזרק בזמן בנייה

class ConfigService {
  constructor() {
    this.appName = 'E-Test System'
    // כתובת השרת המקומי או בענן (Render) — מוגדרת ב-.env או ב-Render dashboard
    this.apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  }

  getAppName() {
    return this.appName
  }

  getApiBaseUrl() {
    return this.apiBaseUrl
  }
}

export default new ConfigService()