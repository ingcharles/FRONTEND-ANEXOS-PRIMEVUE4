<template>
  <div class="lienzo-disenador h-full relative overflow-auto bg-surface-100 dark:bg-surface-950">
    <!-- Grilla de fondo -->
    <div
      v-if="store.currentForm.settings.showGrid"
      class="grilla-fondo absolute inset-0 pointer-events-none"
      :style="estilosGrilla"
    ></div>

    <!-- Contenedor principal del formulario -->
    <div
      class="contenedor-formulario relative min-h-full p-4"
      @drop="manejarDrop"
      @dragover="manejarDragOver"
      @dragenter="manejarDragEnter"
      @dragleave="manejarDragLeave"
      @click="deseleccionarElementos"
    >
      <!-- Información del formulario -->
      <div class="informacion-formulario mb-6 p-4 bg-surface-0 dark:bg-surface-900 rounded-lg shadow-sm border border-surface-200 dark:border-surface-700">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-xl font-semibold text-surface-800 dark:text-surface-200">
            {{ store.currentForm.title }}
          </h2>
          <div class="flex items-center space-x-2 text-sm text-surface-500 dark:text-surface-400">
            <span>Página {{ store.currentPageIndex + 1 }} de {{ store.totalPages }}</span>
          </div>
        </div>
        <p v-if="store.currentForm.description" class="text-surface-600 dark:text-surface-400 text-sm">
          {{ store.currentForm.description }}
        </p>
      </div>

      <!-- Navegación entre páginas -->
      <div v-if="store.totalPages > 1" class="navegacion-paginas mb-4">
        <div class="flex items-center justify-center space-x-2">
          <Button
            v-for="(page, index) in store.currentForm.pages"
            :key="page.id"
            :label="`${index + 1}`"
            :outlined="index !== store.currentPageIndex"
            :severity="index === store.currentPageIndex ? 'primary' : 'secondary'"
            size="small"
            @click="store.cambiarPagina(index)"
          />
          <Button
            icon="pi pi-plus"
            size="small"
            outlined
            @click="store.agregarPagina()"
          />
        </div>
      </div>

      <!-- Área de diseño principal -->
      <div
        class="area-diseno relative bg-white rounded-lg border min-h-96 p-4"
        :class="{ 'drop-zone-active': estaArrastrando }"
        @click.stop="manejarClickArea"
      >
        <!-- Marcador de zona de drop -->
        <div
          v-if="estaArrastrando && !hayElementos"
          class="marcador-drop-zone flex items-center justify-center h-full border-2 border-dashed border-blue-400 rounded-lg"
        >
          <div class="text-center text-blue-600">
            <i class="pi pi-plus-circle text-4xl mb-2"></i>
            <p class="text-lg font-medium">Suelta aquí el componente</p>
            <p class="text-sm opacity-75">Arrastra componentes desde la paleta</p>
          </div>
        </div>

        <!-- Elementos del formulario -->
        <TransitionGroup name="elemento" tag="div">
          <ElementoFormulario
            v-for="elemento in store.currentPage.fields"
            :key="elemento.id"
            :elemento="elemento"
            @selected="store.seleccionarElemento"
            @moved="manejarMovimientoElemento"
            @resized="manejarRedimensionElemento"
            @duplicated="store.duplicarElemento"
            @deleted="store.eliminarElemento"
          />
        </TransitionGroup>

        <!-- Indicador de posición durante drag -->
        <div
          v-if="store.dragContext.isDragging && posicionPreview"
          class="indicador-posicion absolute pointer-events-none bg-primary-200 dark:bg-primary-800 border-2 border-primary-400 rounded opacity-75"
          :style="estilosIndicadorPosicion"
        ></div>
      </div>

      <!-- Herramientas flotantes -->
      <div class="herramientas-flotantes fixed bottom-4 right-4 flex flex-col space-y-2">
        <!-- Controles de zoom -->
        <div class="controles-zoom bg-surface-0 dark:bg-surface-900 rounded-lg shadow-lg border border-surface-200 dark:border-surface-700 p-2">
          <div class="flex items-center space-x-2">
            <Button
              icon="pi pi-minus"
              size="small"
              outlined
              @click="ajustarZoom(-0.1)"
            />
            <span class="text-sm min-w-12 text-center text-surface-700 dark:text-surface-300">{{ Math.round(zoom * 100) }}%</span>
            <Button
              icon="pi pi-plus"
              size="small"
              outlined
              @click="ajustarZoom(0.1)"
            />
          </div>
        </div>

        <!-- Controles de grilla -->
        <div class="controles-grilla bg-surface-0 dark:bg-surface-900 rounded-lg shadow-lg border border-surface-200 dark:border-surface-700 p-2">
          <div class="flex items-center space-x-2">
            <Button
              :icon="store.currentForm.settings.showGrid ? 'pi pi-eye' : 'pi pi-eye-slash'"
              :severity="store.currentForm.settings.showGrid ? 'primary' : 'secondary'"
              size="small"
              outlined
              @click="store.alternarGrilla()"
            />
            <Button
              icon="pi pi-th-large"
              :severity="store.currentForm.settings.snapToGrid ? 'primary' : 'secondary'"
              size="small"
              outlined
              @click="store.alternarSnapGrilla()"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted, onUnmounted } from 'vue'
import { useDisenadorStore } from '@/stores/disenador'
import { useDragDrop } from '@/composables/useDragDrop'
import type { Position, PaletteItem } from '@/types/disenador'
import Button from 'primevue/button'
import ElementoFormulario from './ElementoFormulario.vue'

// Store
const store = inject('disenadorStore') as ReturnType<typeof useDisenadorStore> || useDisenadorStore()

// Composables
const { snapPositionToGrid } = useDragDrop()

// Estado local
const zoom = ref(1)
const estaArrastrando = ref(false)
const posicionPreview = ref<Position | null>(null)

// Computed
const hayElementos = computed(() => store.currentPage.fields.length > 0)

const estilosGrilla = computed(() => {
  const size = store.currentForm.settings.gridSize * zoom.value
  return {
    backgroundImage: `
      linear-gradient(to right, #e5e7eb 1px, transparent 1px),
      linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
    `,
    backgroundSize: `${size}px ${size}px`
  }
})

const estilosIndicadorPosicion = computed(() => {
  if (!posicionPreview.value || !store.dragContext.draggedElement) return {}

  const element = store.dragContext.draggedElement
  return {
    left: `${posicionPreview.value.x}px`,
    top: `${posicionPreview.value.y}px`,
    width: `${element.size?.width || 200}px`,
    height: `${element.size?.height || 40}px`
  }
})

// Funciones de drag and drop
function manejarDragOver(event: DragEvent): void {
  event.preventDefault()
  event.dataTransfer!.dropEffect = 'copy'

  // Actualizar posición de preview
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const position = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }

  if (store.currentForm.settings.snapToGrid) {
    posicionPreview.value = snapPositionToGrid(position)
  } else {
    posicionPreview.value = position
  }
}

function manejarDragEnter(event: DragEvent): void {
  event.preventDefault()
  estaArrastrando.value = true
}

function manejarDragLeave(event: DragEvent): void {
  // Solo ocultar si realmente salimos del contenedor
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const x = event.clientX
  const y = event.clientY

  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    estaArrastrando.value = false
    posicionPreview.value = null
  }
}

function manejarDrop(event: DragEvent): void {
  event.preventDefault()
  estaArrastrando.value = false
  posicionPreview.value = null

  try {
    const data = event.dataTransfer?.getData('application/json')
    if (!data) return

    const item = JSON.parse(data) as PaletteItem

    // Calcular posición relativa al contenedor
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    let position = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }

    // Aplicar snap to grid si está habilitado
    if (store.currentForm.settings.snapToGrid) {
      position = snapPositionToGrid(position)
    }

    // Crear y agregar elemento
    const elemento = store.crearElementoDesdeItem(item, position)
    store.agregarElemento(elemento)

    // Seleccionar el nuevo elemento
    store.seleccionarElemento(elemento.id)

  } catch (error) {
    console.error('Error al procesar drop:', error)
  }
}

// Funciones de interacción
function manejarClickArea(event: MouseEvent): void {
  // Si se hace clic en el área vacía, deseleccionar
  if (event.target === event.currentTarget) {
    deseleccionarElementos()
  }
}

function deseleccionarElementos(): void {
  store.deseleccionarElementos()
}

function manejarMovimientoElemento(elementoId: string, nuevaPosicion: Position): void {
  if (store.currentForm.settings.snapToGrid) {
    nuevaPosicion = snapPositionToGrid(nuevaPosicion)
  }
  store.moverElemento(elementoId, nuevaPosicion)
}

function manejarRedimensionElemento(elementoId: string, nuevoTamano: { width: number; height: number }): void {
  store.redimensionarElemento(elementoId, nuevoTamano)
}

// Funciones de zoom
function ajustarZoom(delta: number): void {
  zoom.value = Math.max(0.25, Math.min(2, zoom.value + delta))
}

// Manejo de eventos de teclado
function manejarTeclado(event: KeyboardEvent): void {
  // Solo manejar si no estamos editando texto
  const activeElement = document.activeElement
  if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
    return
  }

  switch (event.key) {
    case 'Delete':
    case 'Backspace':
      if (store.selectedElement) {
        event.preventDefault()
        store.eliminarElemento(store.selectedElement.id)
      }
      break

    case 'Escape':
      event.preventDefault()
      store.deseleccionarElementos()
      break

    case '+':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        ajustarZoom(0.1)
      }
      break

    case '-':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        ajustarZoom(-0.1)
      }
      break

    case '0':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        zoom.value = 1
      }
      break
  }
}

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('keydown', manejarTeclado)
})

onUnmounted(() => {
  document.removeEventListener('keydown', manejarTeclado)
})
</script>

<style scoped>
.lienzo-disenador {
  background-color: #f8fafc;
}

.area-diseno {
  transition: all 0.2s ease;
  min-height: 500px;
}

.area-diseno.drop-zone-active {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.marcador-drop-zone {
  background-color: rgba(59, 130, 246, 0.05);
}

.indicador-posicion {
  z-index: 1000;
}

.herramientas-flotantes {
  z-index: 100;
}

.controles-zoom,
.controles-grilla {
  backdrop-filter: blur(8px);
}

/* Transiciones para elementos */
.elemento-enter-active,
.elemento-leave-active {
  transition: all 0.3s ease;
}

.elemento-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

.elemento-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(-20px);
}

.elemento-move {
  transition: transform 0.3s ease;
}

/* Estilos responsivos */
@media (max-width: 768px) {
  .contenedor-formulario {
    padding: 1rem;
  }

  .herramientas-flotantes {
    bottom: 1rem;
    right: 1rem;
  }

  .controles-zoom,
  .controles-grilla {
    padding: 0.5rem;
  }

  .informacion-formulario {
    margin-bottom: 1rem;
    padding: 1rem;
  }
}

/* Animaciones personalizadas */
@keyframes pulse-border {
  0%, 100% {
    border-color: #3b82f6;
  }
  50% {
    border-color: #60a5fa;
  }
}

.area-diseno.drop-zone-active {
  animation: pulse-border 1s ease-in-out infinite;
}

/* Scroll personalizado */
.lienzo-disenador::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.lienzo-disenador::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.lienzo-disenador::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.lienzo-disenador::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
