// שירות שמירה מקומי
// localStorageמאפשר לשמור ולקרוא מידע מה הדפדפן

class StorageService {
  save(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  }

  get(key) {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : null
  }

  remove(key) {
    localStorage.removeItem(key)
  }

  clear() {
    localStorage.clear()
  }
}

export default new StorageService()