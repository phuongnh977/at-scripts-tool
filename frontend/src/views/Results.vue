<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>
        <i class="bi bi-file-earmark-bar-graph text-primary"></i> Test Results
      </h1>
      <button v-if="results.length > 0" @click="clearAllResults" class="btn btn-danger">
        <i class="bi bi-trash"></i> Clear All Results
      </button>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle-fill"></i> {{ error }}
    </div>

    <div v-else-if="results.length === 0" class="alert alert-info" role="alert">
      <i class="bi bi-info-circle"></i> No test results available. Run some tests first!
    </div>

    <div v-else>
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Test Run</th>
              <th>Collection</th>
              <th>Environment</th>
              <th>Status</th>
              <th>Tests</th>
              <th>Duration</th>
              <th>Run Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="result in results" :key="result.id" :class="getRowClass(result)">
              <td>{{ result.id }}</td>
              <td>{{ result.collection }}</td>
              <td>{{ result.environment || 'None' }}</td>
              <td>
                <span :class="getStatusBadgeClass(result)">
                  {{ result.stats.tests.failed > 0 ? 'Failed' : 'Passed' }}
                </span>
              </td>
              <td>
                <span class="text-success">{{ result.stats.tests.passed }}</span> /
                <span class="text-danger">{{ result.stats.tests.failed }}</span>
              </td>
              <td>{{ formatDuration(result.stats.duration) }}</td>
              <td>{{ formatDate(result.timestamp) }}</td>
              <td>
                <button @click="viewDetails(result.id)" class="btn btn-sm btn-primary me-1">
                  <i class="bi bi-eye"></i> View
                </button>
                <button @click="deleteResult(result.id)" class="btn btn-sm btn-danger">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Result Details Modal -->
    <div class="modal fade" id="resultModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Test Result Details</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="selectedResult">
            <div class="result-summary mb-4">
              <h6>Summary</h6>
              <div class="row">
                <div class="col-md-3">
                  <div class="stat-card bg-primary text-white">
                    <div class="stat-value">{{ selectedResult.stats.tests.total }}</div>
                    <div class="stat-label">Total Tests</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="stat-card bg-success text-white">
                    <div class="stat-value">{{ selectedResult.stats.tests.passed }}</div>
                    <div class="stat-label">Passed</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="stat-card bg-danger text-white">
                    <div class="stat-value">{{ selectedResult.stats.tests.failed }}</div>
                    <div class="stat-label">Failed</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="stat-card bg-info text-white">
                    <div class="stat-value">{{ formatDuration(selectedResult.stats.duration) }}</div>
                    <div class="stat-label">Duration</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="result-details">
              <h6>Test Details</h6>
              <div class="accordion" id="testAccordion">
                <div v-for="(item, index) in selectedResult.executions" :key="index" class="accordion-item">
                  <h2 class="accordion-header">
                    <button 
                      class="accordion-button" 
                      :class="{ collapsed: index !== 0 }"
                      type="button" 
                      data-bs-toggle="collapse" 
                      :data-bs-target="'#collapse' + index"
                      :aria-expanded="index === 0"
                    >
                      <span :class="getTestStatusClass(item)">
                        <i :class="getTestStatusIcon(item)"></i> {{ item.item.name }}
                      </span>
                      <span class="ms-auto me-2 text-muted">{{ item.response.responseTime }}ms</span>
                    </button>
                  </h2>
                  <div 
                    :id="'collapse' + index" 
                    class="accordion-collapse collapse"
                    :class="{ show: index === 0 }"
                    data-bs-parent="#testAccordion"
                  >
                    <div class="accordion-body">
                      <div class="mb-3">
                        <strong>Request:</strong>
                        <code>{{ item.item.request.method }} {{ item.item.request.url }}</code>
                      </div>
                      
                      <div class="mb-3">
                        <strong>Response:</strong>
                        <span class="badge" :class="getStatusCodeBadgeClass(item.response.code)">
                          {{ item.response.code }} {{ item.response.status }}
                        </span>
                      </div>

                      <div v-if="item.assertions && item.assertions.length > 0" class="mb-3">
                        <strong>Assertions:</strong>
                        <ul class="list-unstyled mt-2">
                          <li v-for="(assertion, aIndex) in item.assertions" :key="aIndex">
                            <i :class="assertion.error ? 'bi-x-circle text-danger' : 'bi-check-circle text-success'"></i>
                            {{ assertion.assertion }}
                            <span v-if="assertion.error" class="text-danger d-block ms-4">
                              {{ assertion.error.message }}
                            </span>
                          </li>
                        </ul>
                      </div>

                      <div v-if="item.response.body" class="mb-3">
                        <strong>Response Body:</strong>
                        <pre class="bg-light p-2 rounded"><code>{{ formatJson(item.response.body) }}</code></pre>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Modal } from 'bootstrap'
import { resultsAPI } from '../services/results'

const results = ref([])
const selectedResult = ref(null)
const loading = ref(false)
const error = ref(null)
let resultModal = null

const loadResults = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await resultsAPI.getAll()
    results.value = response.data
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load results'
  } finally {
    loading.value = false
  }
}

const viewDetails = async (resultId) => {
  try {
    const response = await resultsAPI.getOne(resultId)
    selectedResult.value = response.data
    resultModal.show()
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load result details'
  }
}

const deleteResult = async (resultId) => {
  if (!confirm('Are you sure you want to delete this result?')) return
  
  try {
    await resultsAPI.delete(resultId)
    results.value = results.value.filter(r => r.id !== resultId)
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to delete result'
  }
}

const clearAllResults = async () => {
  if (!confirm('Are you sure you want to delete all results?')) return
  
  try {
    await resultsAPI.deleteAll()
    results.value = []
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to clear results'
  }
}

const getRowClass = (result) => {
  return result.stats.tests.failed > 0 ? 'table-danger' : 'table-success'
}

const getStatusBadgeClass = (result) => {
  return result.stats.tests.failed > 0 ? 'badge bg-danger' : 'badge bg-success'
}

const getTestStatusClass = (item) => {
  const hasFailed = item.assertions?.some(a => a.error)
  return hasFailed ? 'text-danger' : 'text-success'
}

const getTestStatusIcon = (item) => {
  const hasFailed = item.assertions?.some(a => a.error)
  return hasFailed ? 'bi-x-circle-fill' : 'bi-check-circle-fill'
}

const getStatusCodeBadgeClass = (code) => {
  if (code >= 200 && code < 300) return 'bg-success'
  if (code >= 300 && code < 400) return 'bg-warning'
  if (code >= 400 && code < 500) return 'bg-danger'
  if (code >= 500) return 'bg-dark'
  return 'bg-secondary'
}

const formatDuration = (ms) => {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleString()
}

const formatJson = (body) => {
  try {
    const parsed = typeof body === 'string' ? JSON.parse(body) : body
    return JSON.stringify(parsed, null, 2)
  } catch {
    return body
  }
}

onMounted(() => {
  resultModal = new Modal(document.getElementById('resultModal'))
  loadResults()
})
</script>

<style scoped>
.stat-card {
  padding: 1rem;
  border-radius: 0.5rem;
  text-align: center;
  margin-bottom: 1rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.9;
}

.table td {
  vertical-align: middle;
}

pre {
  max-height: 300px;
  overflow-y: auto;
}

.accordion-button {
  font-weight: 500;
}

.accordion-button:not(.collapsed) {
  background-color: #f8f9fa;
}
</style>