import api from './api'

export const resultsAPI = {
  getAll: () => api.get('/results'),
  getOne: (id) => api.get(`/results/${id}`),
  delete: (id) => api.delete(`/results/${id}`),
  deleteAll: () => api.delete('/results')
}