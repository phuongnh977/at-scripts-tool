import api from './api'

export const settingsAPI = {
  get: () => api.get('/settings'),
  setDefaultCollection: (collectionFile) => api.put('/settings/default-collection', { collectionFile })
}