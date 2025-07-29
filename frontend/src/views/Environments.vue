<template>
  <div>
    <div class="row">
      <div class="col-12">
        <h2><i class="bi bi-globe"></i> Environment Variables</h2>
        <hr>
      </div>
    </div>

    <div class="row mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Upload New Environment</h5>
            <div class="mb-3">
              <input 
                type="file" 
                class="form-control" 
                id="environmentFile" 
                accept=".json" 
                @change="handleFileSelect"
                ref="fileInput"
              >
            </div>
            <button 
              class="btn btn-primary" 
              @click="uploadEnvironment" 
              :disabled="!selectedFile"
            >
              <i class="bi bi-upload"></i> Upload Environment
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0">Available Environments</h5>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center">
              <div class="spinner-border text-success" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            
            <div v-else-if="environments.length === 0" class="alert alert-info">
              No environments found. Upload your first environment file to get started!
            </div>
            
            <div v-else class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Variables Count</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="environment in environments" :key="environment.filename">
                    <td>{{ environment.name }}</td>
                    <td>
                      <span class="badge bg-info">{{ environment.values }} variables</span>
                    </td>
                    <td>{{ formatDate(environment.updatedAt) }}</td>
                    <td>
                      <div class="btn-group" role="group">
                        <button 
                          class="btn btn-sm btn-info" 
                          @click="viewEnvironment(environment)"
                          title="View"
                        >
                          <i class="bi bi-eye"></i>
                        </button>
                        <button 
                          class="btn btn-sm btn-warning" 
                          @click="editEnvironment(environment)"
                          title="Edit"
                        >
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button 
                          class="btn btn-sm btn-primary" 
                          @click="cloneEnvironment(environment)"
                          title="Clone"
                        >
                          <i class="bi bi-files"></i>
                        </button>
                        <button 
                          class="btn btn-sm btn-danger" 
                          @click="deleteEnvironment(environment)"
                          title="Delete"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- View/Edit Modal -->
    <div 
      class="modal fade" 
      id="environmentModal" 
      tabindex="-1"
      ref="modalElement"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ modalMode === 'view' ? 'View' : 'Edit' }} Environment</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="modalMode === 'view' && selectedEnvironment">
              <h6>Environment: {{ selectedEnvironment.name }}</h6>
              <div class="table-responsive mt-3">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Key</th>
                      <th>Value</th>
                      <th>Enabled</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="variable in selectedEnvironment.values" :key="variable.key">
                      <td><code>{{ variable.key }}</code></td>
                      <td>
                        <span v-if="variable.type === 'secret'" class="text-muted">
                          <i class="bi bi-lock"></i> [Secret]
                        </span>
                        <span v-else>{{ variable.value }}</span>
                      </td>
                      <td>
                        <i v-if="variable.enabled" class="bi bi-check-circle text-success"></i>
                        <i v-else class="bi bi-x-circle text-danger"></i>
                      </td>
                      <td>{{ variable.type || 'default' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div v-else>
              <div class="alert alert-warning">
                <i class="bi bi-exclamation-triangle"></i> Be careful when editing environment JSON.
              </div>
              <textarea 
                v-model="editedContent" 
                class="form-control font-monospace" 
                rows="15"
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button 
              v-if="modalMode === 'edit'" 
              type="button" 
              class="btn btn-primary" 
              @click="saveEnvironment"
            >
              <i class="bi bi-save"></i> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { environmentsAPI } from '../services/environments'
import { Modal } from 'bootstrap'

const environments = ref([])
const loading = ref(true)
const selectedFile = ref(null)
const selectedEnvironment = ref(null)
const modalMode = ref('view')
const editedContent = ref('')
const currentFilename = ref('')
const fileInput = ref(null)
const modalElement = ref(null)
let environmentModal = null

const loadEnvironments = async () => {
  try {
    const response = await environmentsAPI.getAll()
    environments.value = response.data
  } catch (error) {
    console.error('Error loading environments:', error)
    alert('Failed to load environments')
  } finally {
    loading.value = false
  }
}

const handleFileSelect = (event) => {
  selectedFile.value = event.target.files[0]
}

const uploadEnvironment = async () => {
  if (!selectedFile.value) return
  
  try {
    await environmentsAPI.upload(selectedFile.value)
    alert('Environment uploaded successfully!')
    selectedFile.value = null
    fileInput.value.value = ''
    await loadEnvironments()
  } catch (error) {
    console.error('Error uploading environment:', error)
    alert('Failed to upload environment')
  }
}

const viewEnvironment = async (environment) => {
  try {
    const response = await environmentsAPI.get(environment.filename)
    selectedEnvironment.value = response.data
    modalMode.value = 'view'
    environmentModal.show()
  } catch (error) {
    console.error('Error loading environment:', error)
    alert('Failed to load environment details')
  }
}

const editEnvironment = async (environment) => {
  try {
    const response = await environmentsAPI.get(environment.filename)
    selectedEnvironment.value = response.data
    editedContent.value = JSON.stringify(response.data, null, 2)
    modalMode.value = 'edit'
    currentFilename.value = environment.filename
    environmentModal.show()
  } catch (error) {
    console.error('Error loading environment:', error)
    alert('Failed to load environment for editing')
  }
}

const saveEnvironment = async () => {
  try {
    const parsedContent = JSON.parse(editedContent.value)
    await environmentsAPI.update(currentFilename.value, parsedContent)
    alert('Environment saved successfully!')
    environmentModal.hide()
    await loadEnvironments()
  } catch (error) {
    if (error instanceof SyntaxError) {
      alert('Invalid JSON format. Please check your syntax.')
    } else {
      console.error('Error saving environment:', error)
      alert('Failed to save environment')
    }
  }
}

const deleteEnvironment = async (environment) => {
  if (!confirm(`Are you sure you want to delete "${environment.name}"?`)) return
  
  try {
    await environmentsAPI.delete(environment.filename)
    alert('Environment deleted successfully!')
    await loadEnvironments()
  } catch (error) {
    console.error('Error deleting environment:', error)
    alert('Failed to delete environment')
  }
}

const cloneEnvironment = async (environment) => {
  try {
    const response = await environmentsAPI.clone(environment.filename)
    alert(`Environment cloned successfully as "${response.data.name}"!`)
    await loadEnvironments()
  } catch (error) {
    console.error('Error cloning environment:', error)
    alert('Failed to clone environment')
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString()
}

onMounted(async () => {
  await loadEnvironments()
  await nextTick()
  environmentModal = new Modal(modalElement.value)
})
</script>

<style scoped>
code {
  background-color: #f5f5f5;
  padding: 2px 4px;
  border-radius: 4px;
}

.table td {
  vertical-align: middle;
}

.modal-body textarea {
  font-size: 0.875rem;
}
</style>