import axios from 'axios'

const API_BASE = process.env.VUE_APP_API_BASE || 'https://web-production-23886.up.railway.app/api'
const TOKEN_KEY = 'admin_token'
const USER_KEY = 'admin_user'

// Attach token to axios when present
const instance = axios.create({ baseURL: API_BASE })
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // Propagate admin identity for activity logs
  try {
    const rawUser = localStorage.getItem(USER_KEY)
    if (rawUser) {
      const user = JSON.parse(rawUser)
      if (user && (user.name || user.email)) {
        config.headers['X-Admin-Name'] = user.name || user.email
      }
      if (user && (user.id || user.admin_id)) {
        config.headers['X-Admin-Id'] = user.id || user.admin_id
      }
    }
  } catch (_) { /* ignore header enrichment errors */ }
  return config
})

export default {
  async login({ email, password }) {
    const { data } = await instance.post('/auth/login', { email, password })
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    return data
  },
  async me() {
    const { data } = await instance.get('/auth/me')
    localStorage.setItem(USER_KEY, JSON.stringify(data))
    return data
  },
  async logout() {
    try { await instance.post('/auth/logout') } catch (e) { /* ignore */ }
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
  isAuthenticated() {
    return !!localStorage.getItem(TOKEN_KEY)
  },
  getUser() {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  }
}


