import api from './axios'

/**
 * POST /api/auth/login/
 * Returns { token, user } on success
 */
export const loginUser = async (username, password) => {
  const response = await api.post('/auth/login/', { username, password })
  return response.data
}

/**
 * POST /api/auth/logout/
 * Deletes the server-side token
 */
export const logoutUser = async () => {
  const response = await api.post('/auth/logout/')
  return response.data
}

/**
 * GET /api/auth/profile/
 * Returns current user profile
 */
export const getUserProfile = async () => {
  const response = await api.get('/auth/profile/')
  return response.data
}

/**
 * GET /api/auth/verify/
 * Verifies if the stored token is still valid
 */
export const verifyToken = async () => {
  const response = await api.get('/auth/verify/')
  return response.data
}
