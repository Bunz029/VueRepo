import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'

// Configure axios
axios.defaults.baseURL = 'https://web-production-23886.up.railway.app/api'
axios.defaults.headers.common['Accept'] = 'application/json'
axios.defaults.withCredentials = true

// Attach admin identity headers globally so backend logs correct admin instead of "System"
axios.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('admin_user')
    if (raw) {
      const user = JSON.parse(raw)
      if (user) {
        if (user.name || user.email) {
          config.headers['X-Admin-Name'] = user.name || user.email
        }
        if (user.id || user.admin_id) {
          config.headers['X-Admin-Id'] = user.id || user.admin_id
        }
      }
    }
  } catch (e) { /* ignore header enrichment errors */ }
  
  // Set Content-Type to application/json only if it's not FormData
  // FormData requests should let the browser set multipart/form-data with boundary
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json'
  }
  
  return config
})

// Create Vue app
const app = createApp(App)

// Use router
app.use(router)

// Mount app
app.mount('#app')
