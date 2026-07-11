import ConfigService from '../utils/ConfigService'
import { getAuthHeaders } from './apiClient'
import StorageService from '../utils/StorageService'

const isServerMode = () => ConfigService.isServerMode()

// Local in-memory sessions cache for client-only mock mode
const mockSessions = []

export const startLiveSession = async (examId, examTitle) => {
  if (isServerMode()) {
    const response = await fetch(`${ConfigService.getApiBaseUrl()}/monitor/start`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ examId, examTitle }),
    })
    if (!response.ok) throw new Error('Failed to start monitor session')
    return response.json()
  }

  // Mock mode:
  const user = StorageService.get('user') || { id: 99, username: 'student_mock' }
  const nowStr = new Date().toISOString()
  const existingIdx = mockSessions.findIndex(
    s => s.studentId === user.id && s.examId === Number(examId)
  )

  const session = {
    id: Date.now(),
    studentId: user.id,
    studentName: user.fullName || user.username || 'Student',
    examId: Number(examId),
    examTitle,
    startTime: nowStr,
    lastActive: nowStr
  }

  if (existingIdx !== -1) {
    mockSessions[existingIdx] = session
  } else {
    mockSessions.push(session)
  }

  return session
}

export const sendLiveHeartbeat = async (examId) => {
  if (isServerMode()) {
    const response = await fetch(`${ConfigService.getApiBaseUrl()}/monitor/heartbeat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ examId }),
    })
    if (!response.ok) throw new Error('Failed to send heartbeat')
    return response.json()
  }

  // Mock mode:
  const user = StorageService.get('user') || { id: 99, username: 'student_mock' }
  const session = mockSessions.find(
    s => s.studentId === user.id && s.examId === Number(examId)
  )
  if (session) {
    session.lastActive = new Date().toISOString()
  }
  return { success: true, session }
}

export const endLiveSession = async (examId) => {
  if (isServerMode()) {
    const response = await fetch(`${ConfigService.getApiBaseUrl()}/monitor/end/${examId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error('Failed to end monitor session')
    return response.json()
  }

  // Mock mode:
  const user = StorageService.get('user') || { id: 99, username: 'student_mock' }
  const idx = mockSessions.findIndex(
    s => s.studentId === user.id && s.examId === Number(examId)
  )
  if (idx !== -1) {
    mockSessions.splice(idx, 1)
  }
  return { success: true }
}

export const getLiveSessions = async () => {
  if (isServerMode()) {
    const response = await fetch(`${ConfigService.getApiBaseUrl()}/monitor`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error('Failed to load live sessions')
    return response.json()
  }

  return mockSessions
}
