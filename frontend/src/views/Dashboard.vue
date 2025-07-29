<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>
        <i class="bi bi-speedometer2 text-primary"></i> Test Results Dashboard
      </h1>
      <button @click="refreshData" class="btn btn-primary" :disabled="loading">
        <i class="bi bi-arrow-clockwise"></i> Refresh
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
      <!-- Summary Cards -->
      <div class="row mb-4">
        <div class="col-md-3">
          <div class="card text-white bg-primary">
            <div class="card-body">
              <h5 class="card-title">Total Runs</h5>
              <p class="card-text display-4">{{ results.length }}</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-white bg-success">
            <div class="card-body">
              <h5 class="card-title">Passed Tests</h5>
              <p class="card-text display-4">{{ totalPassed }}</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-white bg-danger">
            <div class="card-body">
              <h5 class="card-title">Failed Tests</h5>
              <p class="card-text display-4">{{ totalFailed }}</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-white bg-info">
            <div class="card-body">
              <h5 class="card-title">Success Rate</h5>
              <p class="card-text display-4">{{ successRate }}%</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="row">
        <!-- Pass/Fail Pie Chart -->
        <div class="col-md-6 mb-4">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Overall Test Results</h5>
            </div>
            <div class="card-body">
              <div class="chart-container">
                <Doughnut :data="passFailChartData" :options="pieChartOptions" />
              </div>
            </div>
          </div>
        </div>

        <!-- Test Runs Over Time -->
        <div class="col-md-6 mb-4">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Test Results Over Time</h5>
            </div>
            <div class="card-body">
              <div class="chart-container">
                <Line :data="timelineChartData" :options="lineChartOptions" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Second Charts Row -->
      <div class="row">
        <!-- Collection Performance -->
        <div class="col-md-6 mb-4">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Collection Performance</h5>
            </div>
            <div class="card-body">
              <div class="chart-container">
                <Bar :data="collectionChartData" :options="barChartOptions" />
              </div>
            </div>
          </div>
        </div>

        <!-- Response Time Distribution -->
        <div class="col-md-6 mb-4">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Average Response Times</h5>
            </div>
            <div class="card-body">
              <div class="chart-container">
                <Bar :data="responseTimeChartData" :options="responseTimeChartOptions" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Test Runs Table -->
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">Recent Test Runs</h5>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Collection</th>
                  <th>Status</th>
                  <th>Tests</th>
                  <th>Duration</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="result in recentResults" :key="result.id">
                  <td>{{ result.collection }}</td>
                  <td>
                    <span :class="result.stats.tests.failed > 0 ? 'badge bg-danger' : 'badge bg-success'">
                      {{ result.stats.tests.failed > 0 ? 'Failed' : 'Passed' }}
                    </span>
                  </td>
                  <td>
                    <span class="text-success">{{ result.stats.tests.passed }}</span> /
                    <span class="text-danger">{{ result.stats.tests.failed }}</span>
                  </td>
                  <td>{{ formatDuration(result.stats.duration) }}</td>
                  <td>{{ formatDate(result.timestamp) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Doughnut, Line, Bar } from 'vue-chartjs'
import { resultsAPI } from '../services/results'

// Register Chart.js components
ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

const results = ref([])
const loading = ref(false)
const error = ref(null)

// Computed properties for summary stats
const totalPassed = computed(() => {
  return results.value.reduce((sum, r) => sum + (r.stats?.tests?.passed || 0), 0)
})

const totalFailed = computed(() => {
  return results.value.reduce((sum, r) => sum + (r.stats?.tests?.failed || 0), 0)
})

const successRate = computed(() => {
  const total = totalPassed.value + totalFailed.value
  return total > 0 ? Math.round((totalPassed.value / total) * 100) : 0
})

const recentResults = computed(() => {
  return results.value.slice(0, 10)
})

// Chart data
const passFailChartData = computed(() => ({
  labels: ['Passed', 'Failed'],
  datasets: [{
    data: [totalPassed.value, totalFailed.value],
    backgroundColor: ['#198754', '#dc3545'],
    borderWidth: 0
  }]
}))

const timelineChartData = computed(() => {
  const sortedResults = [...results.value].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  const last7Days = sortedResults.slice(-7)
  
  return {
    labels: last7Days.map(r => formatDate(r.timestamp, true)),
    datasets: [
      {
        label: 'Passed',
        data: last7Days.map(r => r.stats?.tests?.passed || 0),
        borderColor: '#198754',
        backgroundColor: '#198754',
        tension: 0.1
      },
      {
        label: 'Failed',
        data: last7Days.map(r => r.stats?.tests?.failed || 0),
        borderColor: '#dc3545',
        backgroundColor: '#dc3545',
        tension: 0.1
      }
    ]
  }
})

const collectionChartData = computed(() => {
  const collectionStats = {}
  
  results.value.forEach(result => {
    const collection = result.collection || 'Unknown'
    if (!collectionStats[collection]) {
      collectionStats[collection] = { passed: 0, failed: 0 }
    }
    collectionStats[collection].passed += result.stats?.tests?.passed || 0
    collectionStats[collection].failed += result.stats?.tests?.failed || 0
  })
  
  const labels = Object.keys(collectionStats)
  
  return {
    labels,
    datasets: [
      {
        label: 'Passed',
        data: labels.map(l => collectionStats[l].passed),
        backgroundColor: '#198754'
      },
      {
        label: 'Failed',
        data: labels.map(l => collectionStats[l].failed),
        backgroundColor: '#dc3545'
      }
    ]
  }
})

const responseTimeChartData = computed(() => {
  const collectionTimes = {}
  
  results.value.forEach(result => {
    const collection = result.collection || 'Unknown'
    if (!collectionTimes[collection]) {
      collectionTimes[collection] = []
    }
    collectionTimes[collection].push(result.stats?.duration || 0)
  })
  
  const labels = Object.keys(collectionTimes)
  const avgTimes = labels.map(l => {
    const times = collectionTimes[l]
    return times.reduce((a, b) => a + b, 0) / times.length / 1000 // Convert to seconds
  })
  
  return {
    labels,
    datasets: [{
      label: 'Average Response Time (seconds)',
      data: avgTimes,
      backgroundColor: '#0d6efd'
    }]
  }
})

// Chart options
const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
}

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
}

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  },
  scales: {
    x: {
      stacked: true
    },
    y: {
      stacked: true,
      beginAtZero: true
    }
  }
}

const responseTimeChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
}

// Methods
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

const refreshData = () => {
  loadResults()
}

const formatDuration = (ms) => {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

const formatDate = (timestamp, short = false) => {
  const date = new Date(timestamp)
  if (short) {
    return date.toLocaleDateString()
  }
  return date.toLocaleString()
}

onMounted(() => {
  loadResults()
})
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 300px;
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,0.075);
}

.display-4 {
  font-size: 2.5rem;
}

@media (max-width: 768px) {
  .display-4 {
    font-size: 2rem;
  }
}
</style>