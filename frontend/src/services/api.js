import axios from 'axios'

// Every API call goes through this instance, so the base URL, headers, and
// eventual auth/error handling live in one place.
//
// `baseURL` is a bare path on purpose: the Vite dev server proxies /api to
// Django (see vite.config.js), which keeps requests same-origin in development
// and needs no change when both are served from one origin in production.
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

export default api
