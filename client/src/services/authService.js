import api from './api'

// Register a new user.
export async function registerUser(userData) {
  const response = await api.post('/auth/register', userData)
  return response.data
}

// Authenticate an existing user.
export async function loginUser(credentials) {
  const response = await api.post('/auth/login', credentials)
  return response.data
}

// Get the currently authenticated user
export async function getCurrentUser() {
  const response = await api.get('/users/me')
  return response.data
}