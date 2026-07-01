// שירות אימות משתמשים
// תומך במצב FULLCLIENT (ללא שרת) ו-SERVER (מול db.json דרך API)

import ConfigService from '../utils/ConfigService'

// בדיקה האם עובדים מול שרת
const isServerMode = () => ConfigService.isServerMode()

// ── Login ──────────────────────────────────────────────────────

export const login = async (username, password, role) => {
  if (isServerMode()) {
    const response = await fetch(`${ConfigService.getApiBaseUrl()}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Invalid username or password')
    }

    return data
  }

  // FULLCLIENT: קבלת כל שם משתמש + סיסמה, התפקיד מהכפתור
  return { username, role }
}

// ── Register ───────────────────────────────────────────────────

// רשימת משתמשים זמנית בזיכרון עבור מצב FULLCLIENT
const mockUsers = []

export const register = async (username, password, fullName, role) => {
  if (isServerMode()) {
    const response = await fetch(`${ConfigService.getApiBaseUrl()}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, fullName, role }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed')
    }

    return data
  }

  // FULLCLIENT: בדיקת שם משתמש כפול ברשימה המקומית
  const exists = mockUsers.find((u) => u.username === username)
  if (exists) {
    throw new Error('Username already exists')
  }

  const newUser = {
    id: mockUsers.length + 1,
    username,
    password,
    fullName: fullName || username,
    role,
  }

  mockUsers.push(newUser)
  const safeUser = { ...newUser }
  delete safeUser.password
  return safeUser
}
