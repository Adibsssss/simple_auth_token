import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Attach token to every request if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Handle 401 globally - clear token and redirect
// BUT skip the redirect if the request was to the login endpoint itself,
// otherwise the modal never shows (the redirect fires before catch runs).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login/')
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
