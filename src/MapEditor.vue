<template>
  <div class="map-editor">
    <div class="header">
      <h1>Map Management</h1>
      <button class="btn-primary" @click="showAddMapModal = true">
        Add New Map
      </button>
    </div>

    <div class="maps-grid">
      <div v-for="map in maps" :key="map.id" class="map-card">
        <div class="map-preview">
          <img :src="map.image_path" :alt="map.name">
          <div class="map-status" :class="{ active: map.is_active }">
            {{ map.is_active ? 'Active' : 'Inactive' }}
          </div>
        </div>
        
        <div class="map-info">
          <h3>{{ map.name }}</h3>
          <p>Dimensions: {{ map.width }}x{{ map.height }}</p>
        </div>
        
        <div class="map-actions">
          <button class="btn-secondary" @click="editMap(map)">
            Edit
          </button>
          <button 
            class="btn-danger" 
            @click="deleteMap(map.id)"
            :disabled="map.is_active"
          >
            Delete
          </button>
          <button 
            v-if="!map.is_active"
            class="btn-success" 
            @click="activateMap(map.id)"
          >
            Set Active
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Map Modal -->
    <div v-if="showAddMapModal" class="modal">
      <div class="modal-content">
        <h2>{{ editingMap ? 'Edit Map' : 'Add New Map' }}</h2>
        
        <form @submit.prevent="saveMap">
          <div class="form-group">
            <label>Map Name</label>
            <input 
              type="text" 
              v-model="mapForm.name" 
              required
              placeholder="Enter map name"
            >
          </div>

          <div class="form-group">
            <label>Map Image</label>
            <input 
              type="file" 
              accept="image/*"
              :required="!editingMap"
              ref="imageInput"
            >
            <div v-if="mapForm.image_path" class="image-preview">
              <img :src="mapForm.image_path" alt="Preview">
            </div>
          </div>


          <div class="form-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="mapForm.is_active"
              >
              Set as Active Map
            </label>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeModal">
              Cancel
            </button>
            <button type="submit" class="btn-primary">
              {{ editingMap ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'MapEditor',
  data() {
    return {
      maps: [],
      showAddMapModal: false,
      editingMap: null,
      mapForm: {
        name: '',
        image_path: '',
        width: '5500',
        height: '2700',
        is_active: false
      }
    }
  },
  async created() {
    await this.fetchMaps()
  },
  methods: {
    async fetchMaps() {
      try {
        const response = await axios.get('/map')
        this.maps = response.data
      } catch (error) {
        console.error('Error fetching maps:', error)
        alert('Failed to fetch maps. Please try again.')
      }
    },
    editMap(map) {
      this.editingMap = map
      this.mapForm = { ...map }
      this.showAddMapModal = true
    },
    async deleteMap(id) {
      if (!confirm('Are you sure you want to delete this map?')) return

      try {
        await axios.delete(`/map/${id}`)
        await this.fetchMaps()
        alert('Map deleted successfully')
      } catch (error) {
        console.error('Error deleting map:', error)
        alert('Failed to delete map. Please try again.')
      }
    },
    async activateMap(id) {
      try {
        await axios.put(`/map/${id}/activate`)
        await this.fetchMaps()
        alert('Map activated successfully')
      } catch (error) {
        console.error('Error activating map:', error)
        alert('Failed to activate map. Please try again.')
      }
    },
    async handleImageUpload(event) {
      const file = event.target.files[0]
      if (!file) return

      const formData = new FormData()
      formData.append('image', file)
      formData.append('name', this.mapForm.name || 'Temporary Name')
      formData.append('width', this.mapForm.width || 5500)
      formData.append('height', this.mapForm.height || 2700)

      try {
        const response = await axios.post('/map', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        
        
        if (response.data && response.data.data) {
          // Store the image path from the response
          this.mapForm.image_path = response.data.data.image_path
        } else {
          throw new Error('No data received from server')
        }
      } catch (error) {
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        })
        alert('Failed to upload image. Please try again.')
      }
    },
    async saveMap() {
      try {
        if (this.editingMap) {
          await axios.put(`/map/${this.editingMap.id}`, this.mapForm)
        } else {
          await axios.post('/map', this.mapForm)
        }
        await this.fetchMaps()
        this.closeModal()
        alert(this.editingMap ? 'Map updated successfully' : 'Map created successfully')
      } catch (error) {
        console.error('Error saving map:', error)
        alert('Failed to save map. Please try again.')
      }
    },
    closeModal() {
      this.showAddMapModal = false
      this.editingMap = null
      this.mapForm = {
        name: '',
        image_path: '',
        width: '5500',
        height: '2700',
        is_active: false
      }
    }
  }
}
</script>

<style scoped>
.map-editor {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.maps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.map-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.map-preview {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.map-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.map-status {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 0.875rem;
}

.map-status.active {
  background: rgba(40, 167, 69, 0.8);
}

.map-info {
  padding: 1rem;
}

.map-info h3 {
  margin: 0 0 0.5rem 0;
}

.map-actions {
  padding: 1rem;
  display: flex;
  gap: 0.5rem;
  border-top: 1px solid #eee;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}

.form-group input[type="text"],
.form-group input[type="number"] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}


.image-preview {
  margin-top: 1rem;
  max-width: 200px;
}

.image-preview img {
  width: 100%;
  height: auto;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-primary {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-danger {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-success {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>