<template>
  <div>
    <div class="row">
      <div class="col-12">
        <div class="jumbotron bg-light p-5 rounded-3">
          <h1 class="display-4">
            <i class="bi bi-play-circle text-primary"></i> Newman AT
          </h1>
          <p class="lead">Advanced Testing Tool for Postman Collections</p>
          <hr class="my-4">
          <p>Run, manage, and analyze your Postman collections with ease. Upload collections and environment files, execute tests, and view detailed results.</p>
          <div class="d-grid gap-2 d-md-flex">
            <router-link class="btn btn-primary btn-lg" to="/runner" role="button">
              <i class="bi bi-play-fill"></i> Start Testing
            </router-link>
            <router-link class="btn btn-outline-primary btn-lg" to="/collections" role="button">
              <i class="bi bi-collection"></i> Manage Collections
            </router-link>
            <router-link class="btn btn-outline-primary btn-lg" to="/environments" role="button">
              <i class="bi bi-gear"></i> Manage Environments
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-5">
      <div class="col-md-4">
        <div class="card h-100">
          <div class="card-body text-center">
            <i class="bi bi-lightning-fill text-warning display-1"></i>
            <h5 class="card-title mt-3">Fast Execution</h5>
            <p class="card-text">Run your Postman collections quickly with Newman's powerful engine</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card h-100">
          <div class="card-body text-center">
            <i class="bi bi-file-earmark-code text-success display-1"></i>
            <h5 class="card-title mt-3">Easy Management</h5>
            <p class="card-text">Upload, view, and edit your collections and environment files</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card h-100">
          <div class="card-body text-center">
            <i class="bi bi-graph-up text-info display-1"></i>
            <h5 class="card-title mt-3">Detailed Results</h5>
            <p class="card-text">Get comprehensive test results with real-time execution feedback</p>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-5">
      <div class="col-12">
        <div class="card">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0"><i class="bi bi-info-circle"></i> Quick Stats</h5>
          </div>
          <div class="card-body">
            <div class="row text-center">
              <div class="col-md-6">
                <h3 class="text-primary">{{ stats.collections }}</h3>
                <p>Collections Available</p>
              </div>
              <div class="col-md-6">
                <h3 class="text-success">{{ stats.environments }}</h3>
                <p>Environment Files</p>
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
import { collectionsAPI } from '../services/collections'
import { environmentsAPI } from '../services/environments'

const stats = ref({
  collections: 0,
  environments: 0
})

const loadStats = async () => {
  try {
    const [collectionsRes, environmentsRes] = await Promise.all([
      collectionsAPI.getAll(),
      environmentsAPI.getAll()
    ])
    
    stats.value.collections = collectionsRes.data.length
    stats.value.environments = environmentsRes.data.length
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.jumbotron {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  transition: box-shadow 0.3s ease-in-out;
}

.card:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.btn {
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-2px);
}
</style>