import api from './api'

export const environmentsAPI = {
  // Get all environments
  getAll() {
    return api.get('/environments')
  },

  // Get a specific environment
  get(filename) {
    return api.get(`/environments/${filename}`)
  },

  // Upload a new environment
  upload(file) {
    const formData = new FormData()
    formData.append('environment', file)
    
    return api.post('/environments/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Update an environment
  update(filename, data) {
    return api.put(`/environments/${filename}`, data)
  },

  // Delete an environment
  delete(filename) {
    return api.delete(`/environments/${filename}`)
  },

  // Clone an environment
  clone(filename) {
    return api.post(`/environments/${filename}/clone`)
  }
}