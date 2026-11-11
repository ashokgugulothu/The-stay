import axios from 'axios'

// One shared Axios instance for requests to our backend.
const api = axios.create({
  // The backend API base URL.
  // We can configure this through Vite's environment variables.
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',

  // Allow the browser to send cookies if our authentication
  // strategy later requires them.
  withCredentials: true,

  // Avoid waiting indefinitely for a response.
  timeout: 10000,
})

//export default api

// Automatically attach the saved JWT to API requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api