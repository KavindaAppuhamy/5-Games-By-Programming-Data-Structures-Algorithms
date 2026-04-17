import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: '/api/snake',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Response interceptor
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err.response?.data?.message ||
      err.response?.data?.error ||
      'Network error. Is the server running?'
    toast.error(msg, { duration: 4000 })
    return Promise.reject(err)
  }
)

export const gameApi = {
  /** Start a new game round */
  newGame: (boardSize) =>
    api.post('/new', { boardSize }).then((r) => r.data.data),

  /** Submit a player's answer */
  submitAnswer: (payload) =>
    api.post('/submit', payload).then((r) => r.data.data),

  /** Get leaderboard */
  getLeaderboard: () =>
    api.get('/leaderboard').then((r) => r.data.data),

  /** Get algorithm stats for a round */
  getStats: (roundId) =>
    api.get(`/stats/${roundId}`).then((r) => r.data.data),

  /** Health check */
  health: () =>
    api.get('/health').then((r) => r.data),
}

export default api
