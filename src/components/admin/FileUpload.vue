<script setup lang="ts">
import { ref, reactive } from 'vue'

// Tipos para TypeScript
type UploadType = 'classification' | 'calendar' | 'matchdays' | 'topScorers'

interface UploadState {
  uploading: boolean
  progress: number
  success: boolean
  error: string | null
}

// Referencias a los inputs de archivos
const classificationInput = ref<HTMLInputElement>()
const calendarInput = ref<HTMLInputElement>()
const matchdaysInput = ref<HTMLInputElement>()
const topScorersInput = ref<HTMLInputElement>()

// Estados reactivos
const dragStates = reactive<Record<UploadType, boolean>>({
  classification: false,
  calendar: false,
  matchdays: false,
  topScorers: false
})

const uploadStates = reactive<Record<UploadType, UploadState>>({
  classification: { uploading: false, progress: 0, success: false, error: null },
  calendar: { uploading: false, progress: 0, success: false, error: null },
  matchdays: { uploading: false, progress: 0, success: false, error: null },
  topScorers: { uploading: false, progress: 0, success: false, error: null }
})

const endpoints: Record<UploadType, string> = {
  classification: '/classification',
  calendar: '/real-tajo/calendar',
  matchdays: '/matchdays',
  topScorers: '/top-scorers'
}

// Métodos
const handleDragOver = (e: DragEvent): void => {
  e.preventDefault()
}

const handleDragEnter = (e: DragEvent): void => {
  e.preventDefault()
  const uploadType = getUploadTypeFromTarget(e.currentTarget as HTMLElement)
  if (uploadType) {
    dragStates[uploadType] = true
  }
}

const handleDragLeave = (e: DragEvent): void => {
  e.preventDefault()
  const uploadType = getUploadTypeFromTarget(e.currentTarget as HTMLElement)
  if (uploadType) {
    dragStates[uploadType] = false
  }
}

const handleDrop = (e: DragEvent, uploadType: UploadType): void => {
  e.preventDefault()
  dragStates[uploadType] = false

  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    processFile(file, uploadType)
  }
}

const handleFileSelect = (e: Event, uploadType: UploadType): void => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) processFile(file, uploadType)
}

const getUploadTypeFromTarget = (target: HTMLElement): UploadType | null => {
  const titleElement = target.querySelector('.upload-content h3')
  if (!titleElement) return null

  const titleText = titleElement.textContent || ''

  if (titleText.includes('Clasificación')) return 'classification'
  if (titleText.includes('Calendario')) return 'calendar'
  if (titleText.includes('Jornadas')) return 'matchdays'
  if (titleText.includes('Goleadores')) return 'topScorers'

  return null
}

const processFile = (file: File, uploadType: UploadType): void => {
  // Validar que sea un PDF o Excel
  if (file.type !== 'application/pdf' && file.type !== 'application/vnd.ms-excel' && file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    uploadStates[uploadType].error = 'Por favor, selecciona un archivo PDF o Excel'
    return
  }

  // Resetear estado
  uploadStates[uploadType] = {
    uploading: false,
    progress: 0,
    success: false,
    error: null
  }

  uploadFile(file, uploadType)
}

const uploadFile = async (file: File, uploadType: UploadType): Promise<void> => {
  const formData = new FormData()
  formData.append('file', file)

  uploadStates[uploadType].uploading = true
  uploadStates[uploadType].progress = 0

  try {
    // Simular progreso de subida
    const progressInterval = setInterval(() => {
      if (uploadStates[uploadType].progress < 90) {
        uploadStates[uploadType].progress += 10
      }
    }, 200)

    const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}${endpoints[uploadType]}`, {
      method: 'PUT',
      body: formData,
      headers: {
        // Agregar headers de autenticación si es necesario
        // 'Authorization': 'Bearer ' + token
      }
    })

    clearInterval(progressInterval)
    uploadStates[uploadType].progress = 100

    if (response.ok) {
      uploadStates[uploadType].success = true
      uploadStates[uploadType].uploading = false

      // Limpiar éxito después de 3 segundos
      setTimeout(() => {
        uploadStates[uploadType].success = false
      }, 3000)
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

  } catch (error) {
    console.error('Error uploading file:', error)
    uploadStates[uploadType].error = (error as Error).message || 'Error al subir el archivo'
    uploadStates[uploadType].uploading = false
    uploadStates[uploadType].progress = 0

    // Limpiar error después de 5 segundos
    setTimeout(() => {
      uploadStates[uploadType].error = null
    }, 5000)
  }
}
</script>

<template>
  <h2 class="mb-6 text-2xl font-bold text-gray-800 text-center">Subir Archivos PDF</h2>

  <div class="file-upload-container">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Classification Upload -->
      <div @drop="handleDrop($event, 'classification')" @dragover="handleDragOver" @dragenter="handleDragEnter"
        @dragleave="handleDragLeave" :class="['file-upload-area', { 'drag-over': dragStates.classification }]">
        <div class="upload-content">
          <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12">
            </path>
          </svg>
          <h3 class="upload-title">Clasificación</h3>
          <p class="upload-text">Arrastra el PDF de clasificación aquí</p>
          <input type="file" ref="classificationInput" @change="handleFileSelect($event, 'classification')"
            accept=".pdf" class="hidden">
          <button @click="classificationInput?.click()" class="upload-button">
            Seleccionar archivo
          </button>
        </div>
        <div v-if="uploadStates.classification.uploading" class="upload-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: uploadStates.classification.progress + '%' }"></div>
          </div>
          <span class="progress-text">{{ uploadStates.classification.progress }}%</span>
        </div>
        <div v-if="uploadStates.classification.success" class="upload-success">
          ✅ Archivo subido correctamente
        </div>
        <div v-if="uploadStates.classification.error" class="upload-error">
          ❌ {{ uploadStates.classification.error }}
        </div>
      </div>

      <!-- Calendar Upload -->
      <div @drop="handleDrop($event, 'calendar')" @dragover="handleDragOver" @dragenter="handleDragEnter"
        @dragleave="handleDragLeave" :class="['file-upload-area', { 'drag-over': dragStates.calendar }]">
        <div class="upload-content">
          <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z">
            </path>
          </svg>
          <h3 class="upload-title">Calendario</h3>
          <p class="upload-text">Arrastra el PDF del calendario aquí</p>
          <input type="file" ref="calendarInput" @change="handleFileSelect($event, 'calendar')" accept=".pdf"
            class="hidden">
          <button @click="calendarInput?.click()" class="upload-button">
            Seleccionar archivo
          </button>
        </div>
        <div v-if="uploadStates.calendar.uploading" class="upload-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: uploadStates.calendar.progress + '%' }"></div>
          </div>
          <span class="progress-text">{{ uploadStates.calendar.progress }}%</span>
        </div>
        <div v-if="uploadStates.calendar.success" class="upload-success">
          ✅ Archivo subido correctamente
        </div>
        <div v-if="uploadStates.calendar.error" class="upload-error">
          ❌ {{ uploadStates.calendar.error }}
        </div>
      </div>

      <!-- Matchdays Upload -->
      <div @drop="handleDrop($event, 'matchdays')" @dragover="handleDragOver" @dragenter="handleDragEnter"
        @dragleave="handleDragLeave" :class="['file-upload-area', { 'drag-over': dragStates.matchdays }]">
        <div class="upload-content">
          <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
            </path>
          </svg>
          <h3 class="upload-title">Jornadas</h3>
          <p class="upload-text">Arrastra el PDF de jornadas aquí</p>
          <input type="file" ref="matchdaysInput" @change="handleFileSelect($event, 'matchdays')" accept=".pdf"
            class="hidden">
          <button @click="matchdaysInput?.click()" class="upload-button">
            Seleccionar archivo
          </button>
        </div>
        <div v-if="uploadStates.matchdays.uploading" class="upload-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: uploadStates.matchdays.progress + '%' }"></div>
          </div>
          <span class="progress-text">{{ uploadStates.matchdays.progress }}%</span>
        </div>
        <div v-if="uploadStates.matchdays.success" class="upload-success">
          ✅ Archivo subido correctamente
        </div>
        <div v-if="uploadStates.matchdays.error" class="upload-error">
          ❌ {{ uploadStates.matchdays.error }}
        </div>
      </div>

      <!-- Top Scorers Upload -->
      <div @drop="handleDrop($event, 'topScorers')" @dragover="handleDragOver" @dragenter="handleDragEnter"
        @dragleave="handleDragLeave" :class="['file-upload-area', { 'drag-over': dragStates.topScorers }]">
        <div class="upload-content">
          <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
          <h3 class="upload-title">Goleadores</h3>
          <p class="upload-text">Arrastra el Excel de goleadores aquí</p>
          <input type="file" ref="topScorersInput" @change="handleFileSelect($event, 'topScorers')" accept=".xls"
            class="hidden">
          <button @click="topScorersInput?.click()" class="upload-button">
            Seleccionar archivo
          </button>
        </div>
        <div v-if="uploadStates.topScorers.uploading" class="upload-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: uploadStates.topScorers.progress + '%' }"></div>
          </div>
          <span class="progress-text">{{ uploadStates.topScorers.progress }}%</span>
        </div>
        <div v-if="uploadStates.topScorers.success" class="upload-success">
          ✅ Archivo subido correctamente
        </div>
        <div v-if="uploadStates.topScorers.error" class="upload-error">
          ❌ {{ uploadStates.topScorers.error }}
        </div>
      </div>
    </div>
  </div>
</template>



<style scoped>
.file-upload-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.file-upload-area {
  border: 3px dashed #d1d5db;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  background-color: #f9fafb;
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.file-upload-area:hover {
  border-color: #3b82f6;
  background-color: #eff6ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.file-upload-area.drag-over {
  border-color: #10b981;
  background-color: #ecfdf5;
  transform: scale(1.02);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-icon {
  width: 3rem;
  height: 3rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.upload-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.upload-text {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

.upload-button {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.upload-button:hover {
  background-color: #2563eb;
}

.upload-progress {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background-color: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #3b82f6;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.upload-success {
  margin-top: 1rem;
  color: #10b981;
  font-weight: 500;
  font-size: 0.875rem;
}

.upload-error {
  margin-top: 1rem;
  color: #ef4444;
  font-weight: 500;
  font-size: 0.875rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .file-upload-container {
    padding: 1rem;
  }

  .file-upload-area {
    padding: 1.5rem;
    min-height: 150px;
  }

  .upload-icon {
    width: 2.5rem;
    height: 2.5rem;
  }

  .upload-title {
    font-size: 1.125rem;
  }
}
</style>