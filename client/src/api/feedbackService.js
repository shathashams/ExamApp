import ConfigService from '../utils/ConfigService'
import { getAuthHeaders } from './apiClient'

export const getFeedbacks = async () => {
  const response = await fetch(`${ConfigService.getApiBaseUrl()}/feedbacks`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch feedbacks')
  }

  return response.json()
}

export const submitFeedback = async ({ examId, examTitle, message }) => {
  const response = await fetch(`${ConfigService.getApiBaseUrl()}/feedbacks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ examId, examTitle, message }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || 'Failed to submit feedback')
  }

  return response.json()
}

export const respondToFeedback = async (id, responseText) => {
  const response = await fetch(`${ConfigService.getApiBaseUrl()}/feedbacks/${id}/respond`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ responseText }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || 'Failed to submit response')
  }

  return response.json()
}

export const acknowledgeFeedback = async (id) => {
  const response = await fetch(`${ConfigService.getApiBaseUrl()}/feedbacks/${id}/acknowledge`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error('Failed to acknowledge feedback')
  }

  return response.json()
}
