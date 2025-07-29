<template>
  <div>
    <div class="row">
      <div class="col-12">
        <h2><i class="bi bi-play-fill"></i> Collection Runner</h2>
        <hr>
      </div>
    </div>

    <div class="row">
      <div class="col-md-4">
        <div class="card">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">Configuration</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">Select Collection</label>
              <select v-model="selectedCollection" class="form-select">
                <option value="">Choose a collection...</option>
                <option 
                  v-for="collection in collections" 
                  :key="collection.filename" 
                  :value="collection.filename"
                >
                  {{ collection.name }}
                </option>
              </select>
            </div>
            
            <div class="mb-3">
              <label class="form-label">Select Environment (Optional)</label>
              <select v-model="selectedEnvironment" class="form-select">
                <option value="">No environment</option>
                <option 
                  v-for="environment in environments" 
                  :key="environment.filename" 
                  :value="environment.filename"
                >
                  {{ environment.name }}
                </option>
              </select>
            </div>
            
            <div class="mb-3">
              <label class="form-label">Iterations</label>
              <input 
                type="number" 
                v-model="iterations" 
                class="form-control" 
                min="1" 
                max="100"
              >
            </div>
            
            <div class="d-grid">
              <button 
                class="btn btn-success btn-lg" 
                @click="runCollection" 
                :disabled="!selectedCollection || isRunning"
              >
                <span v-if="isRunning">
                  <span class="spinner-border spinner-border-sm me-2"></span>
                  Running...
                </span>
                <span v-else>
                  <i class="bi bi-play-circle"></i> Run Collection
                </span>
              </button>
            </div>
          </div>
        </div>
        
        <div class="card mt-3" v-if="lastRun">
          <div class="card-header bg-info text-white">
            <h5 class="mb-0">Last Run Summary</h5>
          </div>
          <div class="card-body">
            <div class="row text-center">
              <div class="col-4">
                <h4 class="text-success">{{ lastRun.passed }}</h4>
                <small>Passed</small>
              </div>
              <div class="col-4">
                <h4 class="text-danger">{{ lastRun.failed }}</h4>
                <small>Failed</small>
              </div>
              <div class="col-4">
                <h4 class="text-primary">{{ lastRun.total }}</h4>
                <small>Total</small>
              </div>
            </div>
            <div class="mt-3">
              <small class="text-muted">Duration: {{ lastRun.duration }}ms</small>
            </div>
            <div class="d-grid mt-3" v-if="lastResultId">
              <button 
                class="btn btn-primary" 
                @click="router.push('/results')"
              >
                <i class="bi bi-file-earmark-bar-graph"></i> View Detailed Results
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-8">
        <div class="card">
          <div class="card-header bg-dark text-white">
            <h5 class="mb-0">
              <i class="bi bi-terminal"></i> Execution Log
              <button 
                v-if="logs.length > 0" 
                class="btn btn-sm btn-light float-end" 
                @click="clearLogs"
              >
                <i class="bi bi-trash"></i> Clear
              </button>
            </h5>
          </div>
          <div class="card-body bg-dark text-light log-container">
            <div v-if="logs.length === 0" class="text-muted text-center mt-5">
              <i class="bi bi-info-circle"></i> Execution logs will appear here...
            </div>
            <div v-else>
              <div v-for="(log, index) in logs" :key="index" class="mb-2 log-entry">
                <div v-if="log.type === 'start'" class="text-info">
                  <i class="bi bi-play-circle"></i> {{ log.message }}
                </div>
                <div v-else-if="log.type === 'request'" class="text-warning">
                  <i class="bi bi-arrow-right"></i> 
                  <strong>{{ log.method }}</strong> {{ log.name }}
                  <div class="ms-4 text-muted small">{{ log.url }}</div>
                </div>
                <div 
                  v-else-if="log.type === 'assertion'" 
                  :class="log.passed ? 'text-success' : 'text-danger'"
                >
                  <i :class="log.passed ? 'bi bi-check-circle' : 'bi bi-x-circle'"></i>
                  {{ log.assertion }}
                  <span v-if="log.error" class="ms-2 small">{{ log.error }}</span>
                </div>
                <div v-else-if="log.type === 'error'" class="text-danger">
                  <i class="bi bi-exclamation-triangle"></i> Error: {{ log.message }}
                </div>
                <div v-else-if="log.type === 'complete'" class="text-primary mt-3">
                  <i class="bi bi-check-square"></i> <strong>Run Complete!</strong>
                  <div class="ms-4 mt-2">
                    <div>Duration: {{ log.duration }}ms</div>
                    <div>Iterations: {{ log.stats.iterations.total }}</div>
                    <div>Requests: {{ log.stats.requests.total }}</div>
                    <div>Tests: {{ log.stats.tests.total }}</div>
                    <div>Assertions: {{ log.stats.assertions.total }}</div>
                    <div v-if="log.failures.length > 0" class="text-danger mt-2">
                      Failures: {{ log.failures.length }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { collectionsAPI } from '../services/collections'
import { environmentsAPI } from '../services/environments'
import { settingsAPI } from '../services/settings'
import api from '../services/api'

const router = useRouter()

const collections = ref([])
const environments = ref([])
const selectedCollection = ref('')
const selectedEnvironment = ref('')
const iterations = ref(1)
const isRunning = ref(false)
const logs = ref([])
const lastRun = ref(null)
const lastResultId = ref(null)

const loadData = async () => {
  try {
    const [collectionsRes, environmentsRes, settingsRes] = await Promise.all([
      collectionsAPI.getAll(),
      environmentsAPI.getAll(),
      settingsAPI.get()
    ])
    
    collections.value = collectionsRes.data
    environments.value = environmentsRes.data
    
    // Auto-select default collection if set
    if (settingsRes.data.defaultCollection && !selectedCollection.value) {
      selectedCollection.value = settingsRes.data.defaultCollection
    }
  } catch (error) {
    console.error('Error loading data:', error)
  }
}

const runCollection = async () => {
  if (!selectedCollection.value || isRunning.value) return
  
  isRunning.value = true
  logs.value = []
  lastRun.value = null
  lastResultId.value = null
  
  try {
    console.log('Running collection:', {
      collectionFile: selectedCollection.value,
      environmentFile: selectedEnvironment.value,
      iterationCount: iterations.value
    })
    
    const response = await fetch(`${api.defaults.baseURL}/newman/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collectionFile: selectedCollection.value,
        environmentFile: selectedEnvironment.value,
        iterationCount: iterations.value
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      
      for (const line of lines) {
        const trimmedLine = line.trim()
        if (trimmedLine.startsWith('data: ')) {
          try {
            const jsonStr = trimmedLine.slice(6)
            if (jsonStr) {
              const data = JSON.parse(jsonStr)
              console.log('Received data:', data)
              logs.value.push(data)
              
              if (data.type === 'complete') {
                lastRun.value = {
                  passed: data.testResults.passed,
                  failed: data.testResults.failed,
                  total: data.testResults.total,
                  duration: data.duration
                }
                lastResultId.value = data.resultId
              }
              
              // Auto-scroll to bottom
              await nextTick()
              const logContainer = document.querySelector('.log-container')
              if (logContainer) {
                logContainer.scrollTop = logContainer.scrollHeight
              }
            }
          } catch (e) {
            console.error('Error parsing SSE data:', e, 'Line:', trimmedLine)
          }
        }
      }
    }
  } catch (error) {
    console.error('Error running collection:', error)
    logs.value.push({
      type: 'error',
      message: 'Failed to run collection: ' + error.message
    })
  } finally {
    isRunning.value = false
  }
}

const clearLogs = () => {
  logs.value = []
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.log-container {
  height: 600px;
  overflow-y: auto;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
}

.bg-dark {
  background-color: #1a1a1a !important;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.log-entry {
  word-wrap: break-word;
}
</style>