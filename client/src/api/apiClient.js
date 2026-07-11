import StorageService from '../utils/StorageService'

// Helper function to dynamically compile headers with JWT authorization token
export const getAuthHeaders = () => {
  const user = StorageService.get('user')
  const headers = { 'Content-Type': 'application/json' }
  if (user && user.token) {
    headers['Authorization'] = `Bearer ${user.token}`
  }
  return headers
}
