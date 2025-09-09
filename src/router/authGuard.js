import auth from '../services/authService'

export function requireAuth(to, from, next) {
  if (!auth.isAuthenticated()) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
}

export function redirectIfAuthenticated(to, from, next) {
  if (auth.isAuthenticated()) {
    next({ path: '/maps' })
  } else {
    next()
  }
}


