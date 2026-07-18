// שירות ניהול ציונים — קריאות API מול השרת
import ConfigService from '../utils/ConfigService'
import { getAuthHeaders } from './apiClient'

export const getScores = async () => {
  const response = await fetch(`${ConfigService.getApiBaseUrl()}/scores`, {
    headers: getAuthHeaders(),
  })
  if (!response.ok) throw new Error('Failed to load scores from server')
  return response.json()
}

export const saveScore = async (scoreData) => {
  const response = await fetch(`${ConfigService.getApiBaseUrl()}/scores`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(scoreData),
  })
  if (!response.ok) throw new Error('Failed to save score on server')
  return response.json()
}

export const updateScore = async (id, scoreData) => {
  const response = await fetch(`${ConfigService.getApiBaseUrl()}/scores/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(scoreData),
  })
  if (!response.ok) throw new Error('Failed to update score on server')
  return response.json()
}

export const publishAllScores = async (examId) => {
  const response = await fetch(
    `${ConfigService.getApiBaseUrl()}/scores/exam/${examId}/publish-all`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
    }
  )
  if (!response.ok) throw new Error('Failed to publish all scores on server')
  return response.json()
}

export const applyFactor = async (examId, factor) => {
  const response = await fetch(
    `${ConfigService.getApiBaseUrl()}/scores/exam/${examId}/factor`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ factor: Number(factor) }),
    }
  )
  if (!response.ok) throw new Error('Failed to apply factor on server')
  return response.json()
}
