// שירות אימות משתמשים — קריאות API מול השרת
import ConfigService from '../utils/ConfigService'

// ── Login ──────────────────────────────────────────────────────

export const login = async (username, password, role) => {
  const response = await fetch(`${ConfigService.getApiBaseUrl()}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, role }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Invalid username or password')
  }

  // מיזוג הטוקן עם פרטי המשתמש כדי לשמור ב-localStorage
  return {
    token: data.token,
    ...data.user,
  }
}

// ── Register ───────────────────────────────────────────────────

export const register = async (username, password, fullName, role) => {
  const response = await fetch(`${ConfigService.getApiBaseUrl()}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, fullName, role }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Registration failed')
  }

  // מיזוג הטוקן עם פרטי המשתמש החדש
  return {
    token: data.token,
    ...data.user,
  }
}
