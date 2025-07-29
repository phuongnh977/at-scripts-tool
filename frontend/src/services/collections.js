import api from './api'

export const collectionsAPI = {
  // Get all collections
  getAll() {
    return api.get('/collections')
  },

  // Get a specific collection
  get(filename) {
    return api.get(`/collections/${filename}`)
  },

  // Upload a new collection
  upload(file) {
    const formData = new FormData()
    formData.append('collection', file)
    
    return api.post('/collections/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Update a collection
  update(filename, data) {
    return api.put(`/collections/${filename}`, data)
  },

  // Delete a collection
  delete(filename) {
    return api.delete(`/collections/${filename}`)
  },

  // Clone a collection
  clone(filename) {
    return api.post(`/collections/${filename}/clone`)
  }
}