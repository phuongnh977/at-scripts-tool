<template>
  <div>
    <div class="row">
      <div class="col-12">
        <h2><i class="bi bi-collection"></i> Collections Management</h2>
        <hr>
      </div>
    </div>

    <div class="row mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Upload New Collection</h5>
            <div class="mb-3">
              <input 
                type="file" 
                class="form-control" 
                id="collectionFile" 
                accept=".json" 
                @change="handleFileSelect"
                ref="fileInput"
              >
            </div>
            <button 
              class="btn btn-primary" 
              @click="uploadCollection" 
              :disabled="!selectedFile"
            >
              <i class="bi bi-upload"></i> Upload Collection
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">Available Collections</h5>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            
            <div v-else-if="collections.length === 0" class="alert alert-info">
              No collections found. Upload your first collection to get started!
            </div>
            
            <div v-else class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="collection in collections" :key="collection.filename">
                    <td>
                      {{ collection.name }}
                      <span v-if="collection.filename === defaultCollection" class="badge bg-success ms-2">
                        <i class="bi bi-star-fill"></i> Default
                      </span>
                    </td>
                    <td>{{ collection.description || 'No description' }}</td>
                    <td>{{ formatDate(collection.updatedAt) }}</td>
                    <td>
                      <div class="btn-group" role="group">
                        <button 
                          class="btn btn-sm btn-info" 
                          @click="viewCollection(collection)"
                          title="View"
                        >
                          <i class="bi bi-eye"></i>
                        </button>
                        <button 
                          class="btn btn-sm btn-warning" 
                          @click="editCollection(collection)"
                          title="Edit"
                        >
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button 
                          v-if="collection.filename !== defaultCollection"
                          class="btn btn-sm btn-success" 
                          @click="setAsDefault(collection)"
                          title="Set as Default"
                        >
                          <i class="bi bi-star"></i>
                        </button>
                        <button 
                          v-else
                          class="btn btn-sm btn-secondary" 
                          @click="removeDefault()"
                          title="Remove Default"
                        >
                          <i class="bi bi-star-fill"></i>
                        </button>
                        <button 
                          class="btn btn-sm btn-primary" 
                          @click="cloneCollection(collection)"
                          title="Clone"
                        >
                          <i class="bi bi-files"></i>
                        </button>
                        <button 
                          class="btn btn-sm btn-danger" 
                          @click="deleteCollection(collection)"
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
      id="collectionModal" 
      tabindex="-1"
      ref="modalElement"
    >
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ modalMode === 'view' ? 'View' : 'Edit' }} Collection</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="modalMode === 'view'">
              <pre class="bg-light p-3 rounded">{{ JSON.stringify(selectedCollection, null, 2) }}</pre>
            </div>
            <div v-else>
              <div class="alert alert-warning">
                <i class="bi bi-exclamation-triangle"></i> Be careful when editing collection JSON. Invalid JSON will break the collection.
              </div>
              <textarea 
                v-model="editedContent" 
                class="form-control font-monospace" 
                rows="20"
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button 
              v-if="modalMode === 'edit'" 
              type="button" 
              class="btn btn-primary" 
              @click="saveCollection"
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
import { collectionsAPI } from '../services/collections'
import { settingsAPI } from '../services/settings'
import { Modal } from 'bootstrap'

const collections = ref([])
const loading = ref(true)
const selectedFile = ref(null)
const selectedCollection = ref(null)
const modalMode = ref('view')
const editedContent = ref('')
const currentFilename = ref('')
const fileInput = ref(null)
const modalElement = ref(null)
const defaultCollection = ref(null)
let collectionModal = null

const loadCollections = async () => {
  try {
    const [collectionsRes, settingsRes] = await Promise.all([
      collectionsAPI.getAll(),
      settingsAPI.get()
    ])
    collections.value = collectionsRes.data
    defaultCollection.value = settingsRes.data.defaultCollection
  } catch (error) {
    console.error('Error loading collections:', error)
    alert('Failed to load collections')
  } finally {
    loading.value = false
  }
}

const handleFileSelect = (event) => {
  selectedFile.value = event.target.files[0]
}

const uploadCollection = async () => {
  if (!selectedFile.value) return
  
  try {
    await collectionsAPI.upload(selectedFile.value)
    alert('Collection uploaded successfully!')
    selectedFile.value = null
    fileInput.value.value = ''
    await loadCollections()
  } catch (error) {
    console.error('Error uploading collection:', error)
    alert('Failed to upload collection')
  }
}

const viewCollection = async (collection) => {
  try {
    const response = await collectionsAPI.get(collection.filename)
    selectedCollection.value = response.data
    modalMode.value = 'view'
    collectionModal.show()
  } catch (error) {
    console.error('Error loading collection:', error)
    alert('Failed to load collection details')
  }
}

const editCollection = async (collection) => {
  try {
    const response = await collectionsAPI.get(collection.filename)
    selectedCollection.value = response.data
    editedContent.value = JSON.stringify(response.data, null, 2)
    modalMode.value = 'edit'
    currentFilename.value = collection.filename
    collectionModal.show()
  } catch (error) {
    console.error('Error loading collection:', error)
    alert('Failed to load collection for editing')
  }
}

const saveCollection = async () => {
  try {
    const parsedContent = JSON.parse(editedContent.value)
    await collectionsAPI.update(currentFilename.value, parsedContent)
    alert('Collection saved successfully!')
    collectionModal.hide()
    await loadCollections()
  } catch (error) {
    if (error instanceof SyntaxError) {
      alert('Invalid JSON format. Please check your syntax.')
    } else {
      console.error('Error saving collection:', error)
      alert('Failed to save collection')
    }
  }
}

const deleteCollection = async (collection) => {
  if (!confirm(`Are you sure you want to delete "${collection.name}"?`)) return
  
  try {
    await collectionsAPI.delete(collection.filename)
    alert('Collection deleted successfully!')
    await loadCollections()
  } catch (error) {
    console.error('Error deleting collection:', error)
    alert('Failed to delete collection')
  }
}

const cloneCollection = async (collection) => {
  try {
    const response = await collectionsAPI.clone(collection.filename)
    alert(`Collection cloned successfully as "${response.data.name}"!`)
    await loadCollections()
  } catch (error) {
    console.error('Error cloning collection:', error)
    alert('Failed to clone collection')
  }
}

const setAsDefault = async (collection) => {
  try {
    await settingsAPI.setDefaultCollection(collection.filename)
    defaultCollection.value = collection.filename
    alert(`"${collection.name}" set as default collection!`)
  } catch (error) {
    console.error('Error setting default collection:', error)
    alert('Failed to set default collection')
  }
}

const removeDefault = async () => {
  try {
    await settingsAPI.setDefaultCollection(null)
    defaultCollection.value = null
    alert('Default collection removed!')
  } catch (error) {
    console.error('Error removing default collection:', error)
    alert('Failed to remove default collection')
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString()
}

onMounted(async () => {
  await loadCollections()
  await nextTick()
  collectionModal = new Modal(modalElement.value)
})
</script>

<style scoped>
pre {
  max-height: 500px;
  overflow-y: auto;
}

.table td {
  vertical-align: middle;
}

.modal-body textarea {
  font-size: 0.875rem;
}
</style>