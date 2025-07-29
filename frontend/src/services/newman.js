import api from './api'

export const newmanAPI = {
  // Run a collection
  run(collectionFile, environmentFile = null, iterationCount = 1) {
    return api.post('/newman/run', {
      collectionFile,
      environmentFile,
      iterationCount
    }, {
      responseType: 'stream'
    })
  }
}

// Helper function to handle SSE for real-time updates
export function createEventSource(collectionFile, environmentFile, iterationCount) {
  const params = new URLSearchParams({
    collectionFile,
    iterationCount
  })
  
  if (environmentFile) {
    params.append('environmentFile', environmentFile)
  }
  
  const baseURL = import.meta.env.DEV ? 'http://localhost:3000' : ''
  return new EventSource(`${baseURL}/api/newman/run?${params}`);
}