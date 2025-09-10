<template>
  <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-icon">⚠️</div>
        <div class="header-content">
          <h2 class="modal-title">You're about to publish changes to the active map</h2>
          <p class="modal-subtitle">These changes will reflect in the live app after publishing.</p>
        </div>
      </div>

      <!-- Countdown Timer -->
      <div class="countdown-section">
        <div class="countdown-timer" :class="{ 'countdown-active': countdown > 0 }">
          <div class="countdown-circle">
            <svg class="countdown-svg" viewBox="0 0 36 36">
              <path
                class="countdown-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e5e7eb"
                stroke-width="2"
              />
              <path
                class="countdown-progress"
                :stroke-dasharray="`${circumference} ${circumference}`"
                :stroke-dashoffset="strokeDashoffset"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#10b981"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            <span class="countdown-text">{{ countdown }}</span>
          </div>
          <p class="countdown-message">
            {{ countdown > 0 ? 'Please review the changes below before confirming...' : 'Ready to publish!' }}
          </p>
        </div>
      </div>

      <!-- Changes List -->
      <div class="changes-section">
        <div class="changes-header">
          <h3>Pending Changes</h3>
          <span class="changes-count">{{ totalChanges }} change{{ totalChanges !== 1 ? 's' : '' }}</span>
        </div>

        <div class="changes-list">
          <!-- Buildings Added -->
          <div v-if="changes.added.length > 0" class="change-category">
            <div class="category-header">
              <span class="category-icon">🟢</span>
              <span class="category-title">Buildings Added</span>
              <span class="category-count">{{ changes.added.length }}</span>
            </div>
            <div class="category-items">
              <div v-for="building in changes.added" :key="`added-${building.id}`" class="change-item detailed-item">
                <div class="item-header" @click="toggleItemDetails(`added-${building.id}`)">
                  <div class="item-content">
                    <div class="item-info">
                      <div class="item-title">
                        <div class="item-icon">
                          <img 
                            v-if="building.image_path" 
                            :src="getImageUrl(building.image_path)" 
                            :alt="building.building_name + ' marker'" 
                            class="building-marker-icon"
                          >
                          <span v-else class="default-icon">🏢</span>
                        </div>
                        <span class="item-name">{{ building.building_name }}</span>
                        <span class="item-badge new">NEW</span>
                      </div>
                      <span class="item-details">Position: ({{ building.x_coordinate }}, {{ building.y_coordinate }}) • Size: {{ building.width }}×{{ building.height }}px</span>
                    </div>
                    <div class="item-actions">
                      <button 
                        @click.stop="deleteBuilding(building.id)" 
                        class="action-btn delete-btn"
                        title="Delete Building"
                      >
                        🗑️
                      </button>
                      <button 
                        @click.stop="publishBuilding(building.id)" 
                        class="action-btn publish-btn"
                        title="Publish This Building"
                      >
                        📤
                      </button>
                      <button 
                        @click.stop="toggleItemDetails(`added-${building.id}`)"
                        class="action-btn details-btn"
                        :title="expandedItems[`added-${building.id}`] ? 'Hide Details' : 'Show Details'"
                      >
                        {{ expandedItems[`added-${building.id}`] ? '📖' : '📄' }}
                      </button>
                    </div>
                  </div>
                </div>
                
                <!-- Detailed Information -->
                <div v-if="expandedItems[`added-${building.id}`]" class="item-details-expanded">
                  <div class="details-grid">
                    
                    <!-- Building Properties -->
                    <div class="detail-section">
                      <h4>📋 Building Properties</h4>
                      <div class="property-list">
                        <div class="property-item">
                          <span class="property-label">Name:</span>
                          <span class="property-value">{{ building.building_name }}</span>
                        </div>
                        <div class="property-item" v-if="building.description">
                          <span class="property-label">Description:</span>
                          <span class="property-value">{{ building.description }}</span>
                        </div>
                        <div class="property-item" v-if="building.services">
                          <span class="property-label">Services:</span>
                          <span class="property-value">{{ building.services }}</span>
                        </div>
                        <div class="property-item">
                          <span class="property-label">Position:</span>
                          <span class="property-value">({{ building.x_coordinate }}, {{ building.y_coordinate }})</span>
                        </div>
                        <div class="property-item">
                          <span class="property-label">Size:</span>
                          <span class="property-value">{{ building.width || 30 }}×{{ building.height || 30 }}px</span>
                        </div>
                        <div class="property-item" v-if="building.latitude && building.longitude">
                          <span class="property-label">Coordinates:</span>
                          <span class="property-value">{{ building.latitude }}, {{ building.longitude }}</span>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Building Images -->
                    <div class="detail-section" v-if="building.image_path || building.modal_image_path">
                      <h4>🖼️ Building Images</h4>
                      <div class="image-gallery">
                        <div v-if="building.image_path" class="image-item">
                          <img :src="getImageUrl(building.image_path)" :alt="building.building_name + ' marker'" class="building-image">
                          <p class="image-label">Marker Image</p>
                        </div>
                        <div v-if="building.modal_image_path" class="image-item">
                          <img :src="getImageUrl(building.modal_image_path)" :alt="building.building_name + ' modal'" class="building-image">
                          <p class="image-label">Modal Image</p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Employees -->
                    <div class="detail-section" v-if="building.employees && building.employees.length > 0">
                      <h4>👥 Employees ({{ building.employees.length }})</h4>
                      <div class="employees-list">
                        <div v-for="employee in building.employees" :key="employee.id" class="employee-item">
                          <div class="employee-info">
                            <div class="employee-avatar">
                              <img v-if="employee.employee_image" :src="getImageUrl(employee.employee_image)" :alt="employee.employee_name" class="employee-image">
                              <div v-else class="employee-placeholder">👤</div>
                            </div>
                            <div class="employee-details">
                              <div class="employee-name">{{ employee.employee_name }}</div>
                              <div class="employee-position" v-if="employee.position">{{ employee.position }}</div>
                              <div class="employee-department" v-if="employee.department">{{ employee.department }}</div>
                              <div class="employee-email" v-if="employee.email">{{ employee.email }}</div>
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

          <!-- Items Deleted -->
          <div v-if="changes.deleted.length > 0" class="change-category">
            <div class="category-header">
              <span class="category-icon">🗑️</span>
              <span class="category-title">Items Deleted</span>
              <span class="category-count">{{ changes.deleted.length }}</span>
            </div>
            <div class="category-items">
              <div v-for="item in changes.deleted" :key="`deleted-${item.id}`" class="change-item detailed-item">
                <div class="item-header" @click="toggleItemDetails(`deleted-${item.id}`)">
                  <div class="item-content">
                    <div class="item-info">
                      <div class="item-title">
                        <div class="item-icon">
                          <img 
                            v-if="item.image_path" 
                            :src="getImageUrl(item.image_path)" 
                            :alt="(item.building_name || item.name) + ' marker'" 
                            class="building-marker-icon"
                          >
                          <span v-else class="default-icon">🗑️</span>
                        </div>
                        <span class="item-name">{{ item.building_name || item.name }}</span>
                        <span class="item-badge deleted">DELETED</span>
                      </div>
                      <span class="item-details">Will be permanently removed from the app</span>
                    </div>
                    <div class="item-actions">
                      <button 
                        @click.stop="item.type === 'building' ? restoreBuilding(item.id) : restoreMap(item.id)" 
                        class="action-btn restore-btn"
                        :title="item.type === 'building' ? 'Restore Building' : 'Restore Map'"
                      >
                        ♻️
                      </button>
                      <button 
                        @click.stop="item.type === 'building' ? confirmDeleteBuilding(item.id) : confirmDeleteMap(item.id)" 
                        class="action-btn confirm-delete-btn"
                        title="Confirm Deletion"
                      >
                        ✅
                      </button>
                      <button 
                        @click.stop="toggleItemDetails(`deleted-${item.id}`)"
                        class="action-btn details-btn"
                        :title="expandedItems[`deleted-${item.id}`] ? 'Hide Details' : 'Show Details'"
                      >
                        {{ expandedItems[`deleted-${item.id}`] ? '📖' : '📄' }}
                      </button>
                    </div>
                  </div>
                </div>
                
                <!-- Detailed Information -->
                <div v-if="expandedItems[`deleted-${item.id}`]" class="item-details-expanded">
                  <div class="details-grid">
                    <!-- Building Properties -->
                    <div class="detail-section">
                      <h4>📋 Building Properties</h4>
                      <div class="property-list">
                        <div class="property-item">
                          <span class="property-label">Name:</span>
                          <span class="property-value">{{ building.building_name }}</span>
                        </div>
                        <div class="property-item" v-if="building.description">
                          <span class="property-label">Description:</span>
                          <span class="property-value">{{ building.description }}</span>
                        </div>
                        <div class="property-item" v-if="building.services">
                          <span class="property-label">Services:</span>
                          <span class="property-value">{{ building.services }}</span>
                        </div>
                        <div class="property-item">
                          <span class="property-label">Position:</span>
                          <span class="property-value">({{ building.x_coordinate }}, {{ building.y_coordinate }})</span>
                        </div>
                        <div class="property-item">
                          <span class="property-label">Size:</span>
                          <span class="property-value">{{ building.width || 30 }}×{{ building.height || 30 }}px</span>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Building Images -->
                    <div class="detail-section" v-if="building.image_path || building.modal_image_path">
                      <h4>🖼️ Building Images</h4>
                      <div class="image-gallery">
                        <div v-if="building.image_path" class="image-item">
                          <img :src="getImageUrl(building.image_path)" :alt="building.building_name + ' marker'" class="building-image">
                          <p class="image-label">Marker Image</p>
                        </div>
                        <div v-if="building.modal_image_path" class="image-item">
                          <img :src="getImageUrl(building.modal_image_path)" :alt="building.building_name + ' modal'" class="building-image">
                          <p class="image-label">Modal Image</p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Employees -->
                    <div class="detail-section" v-if="building.employees && building.employees.length > 0">
                      <h4>👥 Employees ({{ building.employees.length }})</h4>
                      <div class="employees-list">
                        <div v-for="employee in building.employees" :key="employee.id" class="employee-item">
                          <div class="employee-info">
                            <div class="employee-avatar">
                              <img v-if="employee.employee_image" :src="getImageUrl(employee.employee_image)" :alt="employee.employee_name" class="employee-image">
                              <div v-else class="employee-placeholder">👤</div>
                            </div>
                            <div class="employee-details">
                              <div class="employee-name">{{ employee.employee_name }}</div>
                              <div class="employee-position" v-if="employee.position">{{ employee.position }}</div>
                              <div class="employee-department" v-if="employee.department">{{ employee.department }}</div>
                              <div class="employee-email" v-if="employee.email">{{ employee.email }}</div>
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

          <!-- Buildings Restored -->
          <div v-if="changes.restored.length > 0" class="change-category">
            <div class="category-header">
              <span class="category-icon">♻️</span>
              <span class="category-title">Buildings Restored</span>
              <span class="category-count">{{ changes.restored.length }}</span>
            </div>
            <div class="category-items">
              <div v-for="building in changes.restored" :key="`restored-${building.id}`" class="change-item detailed-item">
                <div class="item-header" @click="toggleItemDetails(`restored-${building.id}`)">
                  <div class="item-content">
                    <div class="item-info">
                      <div class="item-title">
                        <div class="item-icon">
                          <img 
                            v-if="building.image_path" 
                            :src="getImageUrl(building.image_path)" 
                            :alt="building.building_name + ' marker'" 
                            class="building-marker-icon"
                          >
                          <span v-else class="default-icon">♻️</span>
                        </div>
                        <span class="item-name">{{ building.building_name }}</span>
                        <span class="item-badge restored">RESTORED</span>
                      </div>
                      <span class="item-details">Restored from trash and ready to publish</span>
                    </div>
                    <div class="item-actions">
                      <button 
                        @click.stop="undoRestoreBuilding(building.id)" 
                        class="action-btn undo-btn"
                        title="Undo Restore"
                      >
                        ↩️
                      </button>
                      <button 
                        @click.stop="publishBuilding(building.id)" 
                        class="action-btn publish-btn"
                        title="Publish This Building"
                      >
                        📤
                      </button>
                      <button 
                        @click.stop="toggleItemDetails(`restored-${building.id}`)"
                        class="action-btn details-btn"
                        :title="expandedItems[`restored-${building.id}`] ? 'Hide Details' : 'Show Details'"
                      >
                        {{ expandedItems[`restored-${building.id}`] ? '📖' : '📄' }}
                      </button>
                    </div>
                  </div>
                </div>
                
                <!-- Detailed Information -->
                <div v-if="expandedItems[`restored-${building.id}`]" class="item-details-expanded">
                  <div class="details-grid">
                    <!-- Building Properties -->
                    <div class="detail-section">
                      <h4>📋 Building Properties</h4>
                      <div class="property-list">
                        <div class="property-item">
                          <span class="property-label">Name:</span>
                          <span class="property-value">{{ building.building_name }}</span>
                        </div>
                        <div class="property-item" v-if="building.description">
                          <span class="property-label">Description:</span>
                          <span class="property-value">{{ building.description }}</span>
                        </div>
                        <div class="property-item" v-if="building.services">
                          <span class="property-label">Services:</span>
                          <span class="property-value">{{ building.services }}</span>
                        </div>
                        <div class="property-item">
                          <span class="property-label">Position:</span>
                          <span class="property-value">({{ building.x_coordinate }}, {{ building.y_coordinate }})</span>
                        </div>
                        <div class="property-item">
                          <span class="property-label">Size:</span>
                          <span class="property-value">{{ building.width || 30 }}×{{ building.height || 30 }}px</span>
                        </div>
                      </div>
                    </div>
                    
                    
                    <!-- Building Images -->
                    <div class="detail-section" v-if="building.image_path || building.modal_image_path">
                      <h4>🖼️ Building Images</h4>
                      <div class="image-gallery">
                        <div v-if="building.image_path" class="image-item">
                          <img :src="getImageUrl(building.image_path)" :alt="building.building_name + ' marker'" class="building-image">
                          <p class="image-label">Marker Image</p>
                        </div>
                        <div v-if="building.modal_image_path" class="image-item">
                          <img :src="getImageUrl(building.modal_image_path)" :alt="building.building_name + ' modal'" class="building-image">
                          <p class="image-label">Modal Image</p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Employees -->
                    <div class="detail-section" v-if="building.employees && building.employees.length > 0">
                      <h4>👥 Employees ({{ building.employees.length }})</h4>
                      <div class="employees-list">
                        <div v-for="employee in building.employees" :key="employee.id" class="employee-item">
                          <div class="employee-info">
                            <div class="employee-avatar">
                              <img v-if="employee.employee_image" :src="getImageUrl(employee.employee_image)" :alt="employee.employee_name" class="employee-image">
                              <div v-else class="employee-placeholder">👤</div>
                            </div>
                            <div class="employee-details">
                              <div class="employee-name">{{ employee.employee_name }}</div>
                              <div class="employee-position" v-if="employee.position">{{ employee.position }}</div>
                              <div class="employee-department" v-if="employee.department">{{ employee.department }}</div>
                              <div class="employee-email" v-if="employee.email">{{ employee.email }}</div>
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

          <!-- Buildings Edited -->
          <div v-if="changes.edited.length > 0" class="change-category">
            <div class="category-header">
              <span class="category-icon">✏️</span>
              <span class="category-title">Buildings Edited</span>
              <span class="category-count">{{ changes.edited.length }}</span>
            </div>
            <div class="category-items">
              <div v-for="building in changes.edited" :key="`edited-${building.id}`" class="change-item detailed-item">
                <div class="item-header" @click="toggleItemDetails(`edited-${building.id}`)">
                  <div class="item-content">
                    <div class="item-info">
                      <div class="item-title">
                        <div class="item-icon">
                          <img 
                            v-if="building.image_path" 
                            :src="getImageUrl(building.image_path)" 
                            :alt="building.building_name + ' marker'" 
                            class="building-marker-icon"
                          >
                          <span v-else class="default-icon">✏️</span>
                        </div>
                        <span class="item-name">{{ building.building_name }}</span>
                        <span class="item-badge edited">EDITED</span>
                      </div>
                      <span class="item-details">{{ getPropertyChanges(building).length }} properties changed</span>
                    </div>
                    <div class="item-actions">
                      <button 
                        @click.stop="revertBuilding(building.id)" 
                        class="action-btn revert-btn"
                        title="Revert Changes"
                      >
                        ↩️
                      </button>
                      <button 
                        @click.stop="publishBuilding(building.id)" 
                        class="action-btn publish-btn"
                        title="Publish This Building"
                      >
                        📤
                      </button>
                      <button 
                        @click.stop="toggleItemDetails(`edited-${building.id}`)"
                        class="action-btn details-btn"
                        :title="expandedItems[`edited-${building.id}`] ? 'Hide Details' : 'Show Details'"
                      >
                        {{ expandedItems[`edited-${building.id}`] ? '📖' : '📄' }}
                      </button>
                    </div>
                  </div>
                </div>
                
                <!-- Detailed Changes -->
                <div v-if="expandedItems[`edited-${building.id}`]" class="item-details-expanded">
                  <div class="details-grid">
                    <!-- Property Changes -->
                    <div class="detail-section" v-if="getPropertyChanges(building).length > 0">
                      <h4>📝 Property Changes</h4>
                      <div class="changes-list">
                        <div v-for="change in getPropertyChanges(building)" :key="change.field" class="change-item">
                          <div class="change-field">{{ change.field }}:</div>
                          <div class="change-values">
                            <span class="old-value">{{ change.old || '[empty]' }}</span>
                            <span class="change-arrow">→</span>
                            <span class="new-value">{{ change.new || '[empty]' }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    
                    <!-- Current Images -->
                    <div class="detail-section" v-if="building.image_path || building.modal_image_path">
                      <h4>🖼️ Current Images</h4>
                      <div class="image-gallery">
                        <div v-if="building.image_path" class="image-item">
                          <img :src="getImageUrl(building.image_path)" :alt="building.building_name + ' marker'" class="building-image">
                          <p class="image-label">Current Marker</p>
                        </div>
                        <div v-if="building.modal_image_path" class="image-item">
                          <img :src="getImageUrl(building.modal_image_path)" :alt="building.building_name + ' modal'" class="building-image">
                          <p class="image-label">Current Modal</p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Published Images (if different) -->
                    <div class="detail-section" v-if="building.published_data && (building.image_path !== building.published_data.image_path || building.modal_image_path !== building.published_data.modal_image_path)">
                      <h4>📖 Published Images</h4>
                      <div class="image-gallery">
                        <div v-if="building.published_data.image_path" class="image-item">
                          <img :src="getImageUrl(building.published_data.image_path)" :alt="building.building_name + ' published marker'" class="building-image">
                          <p class="image-label">Published Marker</p>
                        </div>
                        <div v-if="building.published_data.modal_image_path" class="image-item">
                          <img :src="getImageUrl(building.published_data.modal_image_path)" :alt="building.building_name + ' published modal'" class="building-image">
                          <p class="image-label">Published Modal</p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Employee Changes -->
                    <div class="detail-section" v-if="building.employees && building.employees.length > 0">
                      <h4>👥 Current Employees ({{ building.employees.length }})</h4>
                      <div class="employees-list">
                        <div v-for="employee in building.employees" :key="employee.id" class="employee-item">
                          <div class="employee-info">
                            <div class="employee-avatar">
                              <img v-if="employee.employee_image" :src="getImageUrl(employee.employee_image)" :alt="employee.employee_name" class="employee-image">
                              <div v-else class="employee-placeholder">👤</div>
                            </div>
                            <div class="employee-details">
                              <div class="employee-name">{{ employee.employee_name }}</div>
                              <div class="employee-position" v-if="employee.position">{{ employee.position }}</div>
                              <div class="employee-department" v-if="employee.department">{{ employee.department }}</div>
                              <div class="employee-email" v-if="employee.email">{{ employee.email }}</div>
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

          <!-- Map Changes -->
          <div v-if="changes.mapChanges.length > 0" class="change-category">
            <div class="category-header">
              <span class="category-icon">🗺️</span>
              <span class="category-title">Map Changes</span>
              <span class="category-count">{{ changes.mapChanges.length }}</span>
            </div>
            <div class="category-items">
              <div v-for="change in changes.mapChanges" :key="`map-${change.id}`" class="change-item">
                <div class="item-content">
                  <div class="item-info">
                    <span class="item-name">{{ change.description }}</span>
                    <span class="item-details">{{ change.details }}</span>
                  </div>
                  <div class="item-actions">
                    <button 
                      @click="revertMapChange(change.id)" 
                      class="action-btn revert-btn"
                      title="Revert Map Change"
                    >
                      ↩️
                    </button>
                    <button 
                      @click="deleteMapChange(change.id)" 
                      class="action-btn delete-btn"
                      title="Delete Map"
                    >
                      🗑️
                    </button>
                    <button 
                      @click="publishMapChange(change.id)" 
                      class="action-btn publish-btn"
                      title="Publish This Map Change"
                    >
                      📤
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Rooms Added -->
          <div v-if="changes.rooms.length > 0" class="change-category">
            <div class="category-header">
              <span class="category-icon">🏠</span>
              <span class="category-title">Rooms Added</span>
              <span class="category-count">{{ changes.rooms.length }}</span>
            </div>
            <div class="category-items">
              <div v-for="room in changes.rooms" :key="`room-${room.id}`" class="change-item">
                <div class="item-content">
                  <div class="item-info">
                    <div class="item-title">
                      <div class="item-icon">
                        <img 
                          v-if="room.thumbnail_path" 
                          :src="getImageUrl(room.thumbnail_path)" 
                          :alt="room.name + ' thumbnail'" 
                          class="room-thumbnail-icon"
                        >
                        <span v-else class="default-icon">🏠</span>
                      </div>
                      <span class="item-name">{{ room.name }}</span>
                      <span class="item-badge new">NEW</span>
                    </div>
                    <span class="item-details">{{ room.description || 'No description' }} • Building: {{ room.building?.building_name || 'Unknown' }}</span>
                  </div>
                  <div class="item-actions">
                    <button 
                      @click="revertRoom(room.id)" 
                      class="action-btn revert-btn"
                      title="Revert Room Changes"
                    >
                      ↩️
                    </button>
                    <button 
                      @click="publishRoom(room.id)" 
                      class="action-btn publish-btn"
                      title="Publish This Room"
                    >
                      📤
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- No Changes -->
          <div v-if="totalChanges === 0" class="no-changes">
            <div class="no-changes-icon">✅</div>
            <p>No pending changes to publish</p>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <button @click="handleCancel" class="btn btn-cancel">
          Cancel
        </button>
        <button 
          @click="handleConfirm" 
          :disabled="countdown > 0 || isPublishing"
          :class="['btn', 'btn-confirm', { 'btn-disabled': countdown > 0 || isPublishing }]"
        >
          <span v-if="isPublishing" class="btn-loading">
            <span class="spinner"></span>
            Publishing...
          </span>
          <span v-else>Confirm Publish</span>
        </button>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showConfirmModal" class="confirm-modal-overlay" @click="closeConfirmModal">
      <div class="confirm-modal" @click.stop>
        <div class="confirm-header">
          <div class="confirm-icon" :class="`confirm-${confirmData.type}`">
            <span v-if="confirmData.type === 'warning'">⚠️</span>
            <span v-else-if="confirmData.type === 'danger'">🗑️</span>
            <span v-else-if="confirmData.type === 'info'">ℹ️</span>
            <span v-else>❓</span>
          </div>
          <h3 class="confirm-title">{{ confirmData.title }}</h3>
        </div>
        <div class="confirm-body">
          <p class="confirm-message">{{ confirmData.message }}</p>
        </div>
        <div class="confirm-footer">
          <button @click="closeConfirmModal" class="btn btn-cancel">
            {{ confirmData.cancelText }}
          </button>
          <button @click="handleConfirmAction" class="btn btn-confirm" :class="`btn-${confirmData.type}`">
            {{ confirmData.confirmText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'PublishChangesModal',
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      countdown: 5,
      countdownInterval: null,
      isPublishing: false,
      changes: {
        added: [],
        deleted: [],
        restored: [],
        edited: [],
        mapChanges: [],
        rooms: []
      },
      circumference: 2 * Math.PI * 16, // radius = 16
      expandedItems: {}, // Track which items are expanded
      showConfirmModal: false,
      confirmData: {
        title: '',
        message: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        onConfirm: null,
        type: 'warning'
      }
    }
  },
  computed: {
    totalChanges() {
      return this.changes.added.length + 
             this.changes.deleted.length + 
             this.changes.restored.length + 
             this.changes.edited.length + 
             this.changes.mapChanges.length +
             this.changes.rooms.length
    },
    strokeDashoffset() {
      const progress = (5 - this.countdown) / 5
      return this.circumference - (progress * this.circumference)
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.startCountdown()
        this.loadPendingChanges()
      } else {
        this.stopCountdown()
      }
    }
  },
  methods: {
    startCountdown() {
      this.countdown = 5
      this.countdownInterval = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          this.stopCountdown()
        }
      }, 1000)
    },
    stopCountdown() {
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval)
        this.countdownInterval = null
      }
    },
    async loadPendingChanges() {
      try {
        const response = await axios.get('/publish/unpublished')
        this.categorizeChanges(response.data)
      } catch (error) {
        console.error('Error loading pending changes:', error)
        this.$emit('error', 'Failed to load pending changes')
      }
    },
    categorizeChanges(data) {
      // Reset changes
      this.changes = {
        added: [],
        deleted: [],
        restored: [],
        edited: [],
        mapChanges: [],
        rooms: []
      }

      // Categorize buildings
      if (data.buildings) {
        data.buildings.forEach(building => {
          if (building.pending_deletion) {
            this.changes.deleted.push({
              ...building,
              type: 'building'
            })
          } else if (!building.is_published && !building.published_data) {
            // New building (never published)
            this.changes.added.push(building)
          } else if (building.published_data) {
            // Check if it's a restoration (was deleted but now restored)
            if (building.published_data.pending_deletion && !building.pending_deletion) {
              this.changes.restored.push(building)
            } else {
              // Regular edit
              this.changes.edited.push(building)
            }
          }
        })
      }

      // Categorize maps
      if (data.maps) {
        data.maps.forEach(map => {
          if (map.pending_deletion) {
            // Map marked for deletion - add to deleted section like buildings
            this.changes.deleted.push({
              ...map,
              type: 'map'
            })
          } else if (map.published_data) {
            const currentData = {
              name: map.name,
              image_path: map.image_path,
              width: map.width,
              height: map.height,
              is_active: map.is_active
            }
            
            // Check for specific changes
            if (currentData.is_active !== map.published_data.is_active) {
              this.changes.mapChanges.push({
                id: map.id,
                description: currentData.is_active ? 'Map Activated' : 'Map Deactivated',
                details: `"${map.name}" is now ${currentData.is_active ? 'active' : 'inactive'}`
              })
            } else if (JSON.stringify(currentData) !== JSON.stringify(map.published_data)) {
              this.changes.mapChanges.push({
                id: map.id,
                description: 'Map Properties Updated',
                details: `"${map.name}" has been modified`
              })
            }
          } else if (!map.is_published) {
            // New map
            this.changes.mapChanges.push({
              id: map.id,
              description: 'New Map Added',
              details: `"${map.name}" is ready to be published`
            })
          }
        })
      }

      // Categorize rooms
      if (data.rooms) {
        data.rooms.forEach(room => {
          this.changes.rooms.push(room)
        })
      }
    },
    handleOverlayClick() {
      if (this.countdown <= 0 && !this.isPublishing) {
        this.handleCancel()
      }
    },
    handleCancel() {
      this.$emit('cancel')
    },
    async handleConfirm() {
      if (this.countdown > 0 || this.isPublishing) return

      this.isPublishing = true
      try {
        const response = await axios.post('/publish/all')
        this.$emit('success', response.data)
      } catch (error) {
        console.error('Error publishing changes:', error)
        this.$emit('error', 'Failed to publish changes')
      } finally {
        this.isPublishing = false
      }
    },
    
    // Individual change management methods
    async deleteBuilding(buildingId) {
      this.showConfirmation(
        'Delete Building',
        'Are you sure you want to permanently delete this building? This action cannot be undone.',
        async () => {
          try {
            await axios.delete(`/buildings/${buildingId}`)
            this.$emit('change-processed', { type: 'building-deleted', id: buildingId })
            this.loadPendingChanges() // Refresh the changes list
          } catch (error) {
            console.error('Error deleting building:', error)
            this.$emit('error', 'Failed to delete building')
          }
        },
        'danger',
        'Delete',
        'Cancel'
      )
    },
    
    async restoreBuilding(buildingId) {
      try {
        // For buildings marked for deletion, we need to unmark the pending_deletion flag
        await axios.put(`/buildings/${buildingId}`, {
          pending_deletion: false
        })
        this.$emit('change-processed', { type: 'building-restored', id: buildingId })
        this.loadPendingChanges() // Refresh the changes list
      } catch (error) {
        console.error('Error restoring building:', error)
        this.$emit('error', 'Failed to restore building')
      }
    },
    
    async undoRestoreBuilding(buildingId) {
      this.showConfirmation(
        'Undo Restore',
        'Are you sure you want to undo the restore and delete this building again?',
        async () => {
          try {
            await axios.delete(`/buildings/${buildingId}`)
            this.$emit('change-processed', { type: 'building-deleted', id: buildingId })
            this.loadPendingChanges() // Refresh the changes list
          } catch (error) {
            console.error('Error undoing restore:', error)
            this.$emit('error', 'Failed to undo restore')
          }
        },
        'warning',
        'Delete',
        'Cancel'
      )
    },
    
    async revertBuilding(buildingId) {
      this.showConfirmation(
        'Revert Changes',
        'Are you sure you want to revert all changes to this building? This will restore it to its last published state.',
        async () => {
          try {
            await axios.post(`/publish/revert/building/${buildingId}`)
            this.$emit('change-processed', { type: 'building-reverted', id: buildingId })
            this.loadPendingChanges() // Refresh the changes list
          } catch (error) {
            console.error('Error reverting building:', error)
            this.$emit('error', 'Failed to revert building changes')
          }
        },
        'warning',
        'Revert',
        'Cancel'
      )
    },
    
    async confirmDeleteBuilding(buildingId) {
      this.showConfirmation(
        'Confirm Building Deletion',
        'Are you sure you want to permanently delete this building? This action cannot be undone and will remove the building from the app.',
        async () => {
          try {
            await axios.post(`/publish/building/${buildingId}`)
            this.$emit('change-processed', { type: 'building-deletion-published', id: buildingId })
            this.loadPendingChanges() // Refresh the changes list
          } catch (error) {
            console.error('Error confirming building deletion:', error)
            this.$emit('error', 'Failed to confirm building deletion')
          }
        },
        'danger',
        'Delete Building',
        'Cancel'
      )
    },
    
    async publishBuilding(buildingId) {
      try {
        await axios.post(`/publish/building/${buildingId}`)
        this.$emit('change-processed', { type: 'building-published', id: buildingId })
        this.loadPendingChanges() // Refresh the changes list
      } catch (error) {
        console.error('Error publishing building:', error)
        this.$emit('error', 'Failed to publish building')
      }
    },
    
    async restoreMap(mapId) {
      try {
        // For maps marked for deletion, we need to unmark the pending_deletion flag
        await axios.put(`/map/${mapId}`, {
          pending_deletion: false
        })
        this.$emit('change-processed', { type: 'map-restored', id: mapId })
        this.loadPendingChanges() // Refresh the changes list
      } catch (error) {
        console.error('Error restoring map:', error)
        this.$emit('error', 'Failed to restore map')
      }
    },
    
    async confirmDeleteMap(mapId) {
      this.showConfirmation(
        'Confirm Map Deletion',
        'Are you sure you want to permanently delete this map? This action cannot be undone and will remove the map from the app.',
        async () => {
          try {
            await axios.post(`/publish/map/${mapId}`)
            this.$emit('change-processed', { type: 'map-deletion-published', id: mapId })
            this.loadPendingChanges() // Refresh the changes list
          } catch (error) {
            console.error('Error confirming map deletion:', error)
            this.$emit('error', 'Failed to confirm map deletion')
          }
        },
        'danger',
        'Delete Map',
        'Cancel'
      )
    },
    
    async revertMapChange(mapId) {
      this.showConfirmation(
        'Revert Map Changes',
        'Are you sure you want to revert all changes to this map? This will restore it to its last published state.',
        async () => {
          try {
            await axios.post(`/publish/revert/map/${mapId}`)
            this.$emit('change-processed', { type: 'map-reverted', id: mapId })
            this.loadPendingChanges() // Refresh the changes list
          } catch (error) {
            console.error('Error reverting map:', error)
            this.$emit('error', 'Failed to revert map changes')
          }
        },
        'warning',
        'Revert',
        'Cancel'
      )
    },
    
    async deleteMapChange(mapId) {
      this.showConfirmation(
        'Delete Map',
        'Are you sure you want to permanently delete this map? This action cannot be undone.',
        async () => {
          try {
            await axios.delete(`/map/${mapId}`)
            this.$emit('change-processed', { type: 'map-deleted', id: mapId })
            this.loadPendingChanges() // Refresh the changes list
          } catch (error) {
            console.error('Error deleting map:', error)
            this.$emit('error', 'Failed to delete map')
          }
        },
        'danger',
        'Delete Map',
        'Cancel'
      )
    },
    
    async publishMapChange(mapId) {
      try {
        await axios.post(`/publish/map/${mapId}`)
        this.$emit('change-processed', { type: 'map-published', id: mapId })
        this.loadPendingChanges() // Refresh the changes list
      } catch (error) {
        console.error('Error publishing map:', error)
        this.$emit('error', 'Failed to publish map changes')
      }
    },
    
    async publishRoom(roomId) {
      try {
        await axios.post(`/publish/room/${roomId}`)
        this.$emit('change-processed', { type: 'room-published', id: roomId })
        this.loadPendingChanges() // Refresh the changes list
        this.$emit('show-toast', 'Room Published', 'Room has been published successfully', 'success')
      } catch (error) {
        console.error('Error publishing room:', error)
        this.$emit('error', 'Failed to publish room')
        this.$emit('show-toast', 'Publish Failed', 'Failed to publish room', 'error')
      }
    },
    
    async revertRoom(roomId) {
      this.showConfirmation(
        'Revert Room Changes',
        'Are you sure you want to revert this room? This will restore it to its last published state, or delete it if it was never published.',
        async () => {
          try {
            const response = await axios.post(`/publish/revert/room/${roomId}`)
            const action = response.data.action || 'reverted'
            
            if (action === 'deleted') {
              this.$emit('change-processed', { type: 'room-deleted', id: roomId })
              this.$emit('show-toast', 'Room Deleted', 'New room has been deleted successfully', 'success')
            } else {
              this.$emit('change-processed', { type: 'room-reverted', id: roomId })
              this.$emit('show-toast', 'Room Reverted', 'Room has been reverted to published state', 'success')
            }
            
            this.loadPendingChanges() // Refresh the changes list
          } catch (error) {
            console.error('Error reverting room:', error)
            this.$emit('error', 'Failed to revert room changes')
            this.$emit('show-toast', 'Revert Failed', 'Failed to revert room changes', 'error')
          }
        },
        'warning',
        'Revert',
        'Cancel'
      )
    },
    
    // Confirmation modal methods
    showConfirmation(title, message, onConfirm, type = 'warning', confirmText = 'Confirm', cancelText = 'Cancel') {
      this.confirmData = {
        title,
        message,
        confirmText,
        cancelText,
        onConfirm,
        type
      }
      this.showConfirmModal = true
    },
    
    closeConfirmModal() {
      this.showConfirmModal = false
      this.confirmData = {
        title: '',
        message: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        onConfirm: null,
        type: 'warning'
      }
    },
    
    handleConfirmAction() {
      if (this.confirmData.onConfirm) {
        this.confirmData.onConfirm()
      }
      this.closeConfirmModal()
    },

    // UI helper methods
    toggleItemDetails(itemKey) {
      this.expandedItems[itemKey] = !this.expandedItems[itemKey]
    },
    
    getImageUrl(imagePath) {
      if (!imagePath) return null
      // Handle both relative and absolute paths
      if (imagePath.startsWith('http')) {
        return imagePath
      }
      return `https://web-production-23886.up.railway.app/storage/${imagePath}`
    },
    
    getPropertyChanges(building) {
      if (!building.published_data) return []
      
      const changes = []
      const current = building
      const published = building.published_data
      
      const fields = [
        { key: 'building_name', label: 'Name' },
        { key: 'description', label: 'Description' },
        { key: 'services', label: 'Services' },
        { key: 'x_coordinate', label: 'X Position' },
        { key: 'y_coordinate', label: 'Y Position' },
        { key: 'width', label: 'Width' },
        { key: 'height', label: 'Height' },
        { key: 'latitude', label: 'Latitude' },
        { key: 'longitude', label: 'Longitude' }
      ]
      
      fields.forEach(field => {
        if (current[field.key] !== published[field.key]) {
          changes.push({
            field: field.label,
            old: published[field.key],
            new: current[field.key]
          })
        }
      })
      
      return changes
    }
  },
  beforeUnmount() {
    this.stopCountdown()
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(4px);
  font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
}

.modal-container {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  animation: modalSlideIn 0.3s ease-out;
  display: flex;
  flex-direction: column;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.header-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.header-content {
  flex: 1;
}

.modal-title {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.3;
}

.modal-subtitle {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
}

.countdown-section {
  padding: 20px 24px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  text-align: center;
}

.countdown-timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.countdown-circle {
  position: relative;
  width: 40px;
  height: 40px;
}

.countdown-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.countdown-progress {
  transition: stroke-dashoffset 1s linear;
}

.countdown-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 16px;
  font-weight: 600;
  color: #10b981;
}

.countdown-message {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.changes-section {
  padding: 20px 24px;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.changes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.changes-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.changes-count {
  background: #e5e7eb;
  color: #374151;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.changes-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.change-category {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.category-header {
  background: #f9fafb;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.category-icon {
  font-size: 16px;
}

.category-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  flex: 1;
}

.category-count {
  background: #d1d5db;
  color: #374151;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
}

.category-items {
  padding: 8px 0;
}

.change-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
}

.change-item:last-child {
  border-bottom: none;
}

.item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.item-details {
  font-size: 12px;
  color: #6b7280;
}

.item-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s ease;
  background: #f3f4f6;
  color: #374151;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.delete-btn {
  background: #fee2e2;
  color: #dc2626;
}

.delete-btn:hover {
  background: #fecaca;
  color: #b91c1c;
}

.restore-btn {
  background: #d1fae5;
  color: #059669;
}

.restore-btn:hover {
  background: #a7f3d0;
  color: #047857;
}

.undo-btn, .revert-btn {
  background: #fef3c7;
  color: #d97706;
}

.undo-btn:hover, .revert-btn:hover {
  background: #fde68a;
  color: #b45309;
}

.publish-btn {
  background: #dbeafe;
  color: #2563eb;
}

.publish-btn:hover {
  background: #bfdbfe;
  color: #1d4ed8;
}

.confirm-delete-btn {
  background: #fecaca;
  color: #dc2626;
}

.confirm-delete-btn:hover {
  background: #fca5a5;
  color: #b91c1c;
}

.details-btn {
  background: #e0e7ff;
  color: #3730a3;
}

.details-btn:hover {
  background: #c7d2fe;
  color: #312e81;
}

/* Detailed Item Styles */
.detailed-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 8px;
  overflow: hidden;
}

.item-header {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.item-header:hover {
  background: #f9fafb;
}

.item-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.item-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.building-marker-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.room-thumbnail-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.default-icon {
  font-size: 16px;
}

.item-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.item-badge.new {
  background: #d1fae5;
  color: #065f46;
}

.item-badge.edited {
  background: #fef3c7;
  color: #92400e;
}

.item-badge.deleted {
  background: #fee2e2;
  color: #991b1b;
}

.item-badge.restored {
  background: #dbeafe;
  color: #1e40af;
}

/* Expanded Details */
.item-details-expanded {
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
  padding: 16px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.detail-section {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
}

.detail-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Marker Preview */
.marker-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.building-marker {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.marker-icon {
  font-size: 14px;
}

.marker-info {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

/* Property List */
.property-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.property-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px solid #f3f4f6;
}

.property-item:last-child {
  border-bottom: none;
}

.property-label {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  min-width: 80px;
}

.property-value {
  font-size: 12px;
  color: #1f2937;
  text-align: right;
  flex: 1;
  margin-left: 8px;
}

/* Image Gallery */
.image-gallery {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.image-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.building-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.image-label {
  font-size: 10px;
  color: #6b7280;
  margin: 0;
  text-align: center;
}

/* Changes List */
.changes-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.change-item {
  padding: 8px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.change-field {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
}

.change-values {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.old-value {
  background: #fee2e2;
  color: #991b1b;
  padding: 2px 6px;
  border-radius: 4px;
  text-decoration: line-through;
}

.change-arrow {
  color: #6b7280;
  font-weight: bold;
}

.new-value {
  background: #d1fae5;
  color: #065f46;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

/* Employees List */
.employees-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.employee-item {
  padding: 8px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.employee-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.employee-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.employee-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.employee-placeholder {
  width: 100%;
  height: 100%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #6b7280;
}

.employee-details {
  flex: 1;
}

.employee-name {
  font-size: 12px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
}

.employee-position,
.employee-department,
.employee-email {
  font-size: 11px;
  color: #6b7280;
  margin-bottom: 1px;
}

.employee-email {
  font-family: monospace;
}

.no-changes {
  text-align: center;
  padding: 32px 16px;
  color: #6b7280;
}

.no-changes-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.no-changes p {
  margin: 0;
  font-size: 14px;
}

.modal-footer {
  padding: 16px 24px 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 100px;
  justify-content: center;
}

.btn-cancel {
  background: #6b7280;
  color: white;
}

.btn-cancel:hover {
  background: #4b5563;
}

.btn-confirm {
  background: #10b981;
  color: white;
}

.btn-confirm:hover:not(.btn-disabled) {
  background: #059669;
}

.btn-disabled {
  background: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
}

.btn-loading {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Scrollbar styling */
.changes-section::-webkit-scrollbar {
  width: 6px;
}

.changes-section::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.changes-section::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.changes-section::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Confirmation Modal Styles */
.confirm-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  backdrop-filter: blur(4px);
}

.confirm-modal {
  background: white;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: confirmSlideIn 0.2s ease-out;
}

@keyframes confirmSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.confirm-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.confirm-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.confirm-warning {
  background: #fef3c7;
  color: #d97706;
}

.confirm-danger {
  background: #fee2e2;
  color: #dc2626;
}

.confirm-info {
  background: #dbeafe;
  color: #2563eb;
}

.confirm-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.confirm-body {
  padding: 16px 24px;
}

.confirm-message {
  margin: 0;
  color: #6b7280;
  line-height: 1.5;
  font-size: 14px;
}

.confirm-footer {
  padding: 16px 24px 20px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.btn-danger {
  background: #dc2626;
  color: white;
}

.btn-danger:hover {
  background: #b91c1c;
}

.btn-warning {
  background: #d97706;
  color: white;
}

.btn-warning:hover {
  background: #b45309;
}
</style>
