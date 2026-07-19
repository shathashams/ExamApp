// שירות ניטור מבחנים חיים — קריאות API מול השרת
import ConfigService from '../utils/ConfigService'
import { getAuthHeaders } from './apiClient'

export const startLiveSession = async (examId, examTitle) => {
  const response = await fetch(`${ConfigService.getApiBaseUrl()}/monitor/start`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ examId, examTitle }),
  })
  if (!response.ok) throw new Error('Failed to start monitor session')
  return response.json()
}

export const sendLiveHeartbeat = async (examId) => {
  const response = await fetch(`${ConfigService.getApiBaseUrl()}/monitor/heartbeat`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ examId }),
  })
  if (!response.ok) throw new Error('Failed to send heartbeat')
  return response.json()
}

export const endLiveSession = async (examId) => {
  const response = await fetch(
    `${ConfigService.getApiBaseUrl()}/monitor/end/${examId}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }
  )
  if (!response.ok) throw new Error('Failed to end monitor session')
  return response.json()
}

export const getLiveSessions = async () => {
  const response = await fetch(`${ConfigService.getApiBaseUrl()}/monitor`, {
    headers: getAuthHeaders(),
  })
  if (!response.ok) throw new Error('Failed to load live sessions')
  return response.json()
}
