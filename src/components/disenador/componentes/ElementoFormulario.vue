<template>
  <div
    ref="elementoRef"
    class="elemento-formulario absolute border transition-all duration-200"
    :class="{
      'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800': esSeleccionado,
      'border-surface-300 dark:border-surface-600 hover:border-surface-400 dark:hover:border-surface-500': !esSeleccionado,
      'cursor-move': !estaRedimensionando,
      'select-none': estaArrastrando || estaRedimensionando
    }"
    :style="estilosElemento"
    @click.stop="seleccionar"
    @mousedown="iniciarArrastre"
  >
    <!-- Contenido del elemento -->
    <div
      class="contenido-elemento h-full"
      :style="estilosContenido"
    >
      <ComponenteDinamico
        :elemento="elemento"
        :modo="'diseno'"
        @input="manejarInput"
      />
    </div>

    <!-- Controles de selección -->
    <div v-if="esSeleccionado" class="controles-seleccion">
      <!-- Manejadores de redimensionamiento -->
      <div
        v-for="handle in handlersRedimension"
        :key="handle.name"
        class="handle-redimension absolute bg-primary-500 border border-surface-0 dark:border-surface-900"
        :class="handle.class"
        :style="handle.style"
        @mousedown.stop="iniciarRedimension($event, handle.name)"
      ></div>

      <!-- Barra de herramientas del elemento -->
      <div class="barra-herramientas-elemento absolute -top-10 left-0 bg-primary-500 text-surface-0 px-2 py-1 rounded text-xs flex items-center space-x-1">
        <span class="font-medium">{{ tipoElemento }}</span>
        <div class="flex items-center space-x-1 ml-2">
          <button
            class="hover:bg-primary-600 p-1 rounded"
            title="Duplicar"
            @click.stop="duplicar"
          >
            <i class="pi pi-copy text-xs"></i>
          </button>
          <button
            class="hover:bg-primary-600 p-1 rounded"
            title="Eliminar"
            @click.stop="eliminar"
          >
            <i class="pi pi-trash text-xs"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Overlay de arrastre -->
    <div
      v-if="estaArrastrando"
      class="overlay-arrastre absolute inset-0 bg-primary-100 dark:bg-primary-900/30 bg-opacity-50 border-2 border-primary-400 border-dashed rounded"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import type { FieldSchema, Position } from '@/types/disenador'
import ComponenteDinamico from './ComponenteDinamico.vue'

// Props
interface Props {
  elemento: FieldSchema
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  selected: [elementoId: string]
  moved: [elementoId: string, position: Position]
  resized: [elementoId: string, size: { width: number; height: number }]
  duplicated: [elementoId: string]
  deleted: [elementoId: string]
}>()

// Refs
const elementoRef = ref<HTMLElement>()

// Estado local
const estaArrastrando = ref(false)
const estaRedimensionando = ref(false)
const esSeleccionado = ref(false)
const posicionInicialArrastre = ref<Position>({ x: 0, y: 0 })
const posicionInicialMouse = ref<Position>({ x: 0, y: 0 })
const tamanosIniciales = ref({ width: 0, height: 0 })
const tipoRedimension = ref<string>('')

// Computed
const estilosElemento = computed(() => ({
  left: `${props.elemento.position.x}px`,
  top: `${props.elemento.position.y}px`,
  width: `${props.elemento.size?.width || 200}px`,
  height: `${props.elemento.size?.height || 40}px`,
  zIndex: esSeleccionado.value ? 1000 : props.elemento.position.z || 1
}))

const estilosContenido = computed(() => {
  const styles: Record<string, string> = {
    width: '100%',
    height: '100%',
    padding: '8px'
  }

  // Aplicar estilos responsivos del elemento
  if (props.elemento.responsive) {
    // ResponsiveConfig usa un sistema de columnas (1-12)
    // Podemos usar esto para calcular anchos porcentuales
    const lgColumns = props.elemento.responsive.lg || 12
    const percentage = (lgColumns / 12) * 100
    styles.width = `${percentage}%`
  }

  return styles
})

const tipoElemento = computed(() => {
  const tipos: Record<string, string> = {
    'text': 'Texto',
    'email': 'Email',
    'password': 'Contraseña',
    'number': 'Número',
    'textarea': 'Área de Texto',
    'select': 'Selector',
    'checkbox': 'Casilla',
    'radio': 'Radio',
    'file': 'Archivo',
    'date': 'Fecha',
    'time': 'Hora',
    'datetime': 'Fecha y Hora',
    'button': 'Botón',
    'submit': 'Enviar',
    'reset': 'Reiniciar'
  }
  return tipos[props.elemento.type] || props.elemento.type
})

const handlersRedimension = computed(() => [
  {
    name: 'nw',
    class: 'cursor-nw-resize',
    style: { top: '-4px', left: '-4px', width: '8px', height: '8px' }
  },
  {
    name: 'n',
    class: 'cursor-n-resize',
    style: { top: '-4px', left: 'calc(50% - 4px)', width: '8px', height: '8px' }
  },
  {
    name: 'ne',
    class: 'cursor-ne-resize',
    style: { top: '-4px', right: '-4px', width: '8px', height: '8px' }
  },
  {
    name: 'e',
    class: 'cursor-e-resize',
    style: { top: 'calc(50% - 4px)', right: '-4px', width: '8px', height: '8px' }
  },
  {
    name: 'se',
    class: 'cursor-se-resize',
    style: { bottom: '-4px', right: '-4px', width: '8px', height: '8px' }
  },
  {
    name: 's',
    class: 'cursor-s-resize',
    style: { bottom: '-4px', left: 'calc(50% - 4px)', width: '8px', height: '8px' }
  },
  {
    name: 'sw',
    class: 'cursor-sw-resize',
    style: { bottom: '-4px', left: '-4px', width: '8px', height: '8px' }
  },
  {
    name: 'w',
    class: 'cursor-w-resize',
    style: { top: 'calc(50% - 4px)', left: '-4px', width: '8px', height: '8px' }
  }
])

// Funciones principales
function seleccionar(): void {
  esSeleccionado.value = true
  emit('selected', props.elemento.id)
}

function duplicar(): void {
  emit('duplicated', props.elemento.id)
}

function eliminar(): void {
  emit('deleted', props.elemento.id)
}

function manejarInput(value: unknown): void {
  // Manejar cambios en el valor del elemento
  console.log('Input en elemento:', props.elemento.id, value)
}

// Funciones de arrastre
function iniciarArrastre(event: MouseEvent): void {
  if (estaRedimensionando.value) return

  event.preventDefault()
  estaArrastrando.value = true

  posicionInicialArrastre.value = {
    x: props.elemento.position.x,
    y: props.elemento.position.y
  }

  posicionInicialMouse.value = {
    x: event.clientX,
    y: event.clientY
  }

  document.addEventListener('mousemove', manejarMovimientoArrastre)
  document.addEventListener('mouseup', finalizarArrastre)

  // Seleccionar el elemento
  seleccionar()
}

function manejarMovimientoArrastre(event: MouseEvent): void {
  if (!estaArrastrando.value) return

  const deltaX = event.clientX - posicionInicialMouse.value.x
  const deltaY = event.clientY - posicionInicialMouse.value.y

  const nuevaPosicion = {
    x: Math.max(0, posicionInicialArrastre.value.x + deltaX),
    y: Math.max(0, posicionInicialArrastre.value.y + deltaY)
  }

  emit('moved', props.elemento.id, nuevaPosicion)
}

function finalizarArrastre(): void {
  estaArrastrando.value = false
  document.removeEventListener('mousemove', manejarMovimientoArrastre)
  document.removeEventListener('mouseup', finalizarArrastre)
}

// Funciones de redimensionamiento
function iniciarRedimension(event: MouseEvent, tipo: string): void {
  event.preventDefault()
  event.stopPropagation()

  estaRedimensionando.value = true
  tipoRedimension.value = tipo

  posicionInicialMouse.value = {
    x: event.clientX,
    y: event.clientY
  }

  tamanosIniciales.value = {
    width: props.elemento.size?.width || 200,
    height: props.elemento.size?.height || 40
  }

  document.addEventListener('mousemove', manejarMovimientoRedimension)
  document.addEventListener('mouseup', finalizarRedimension)
}

function manejarMovimientoRedimension(event: MouseEvent): void {
  if (!estaRedimensionando.value) return

  const deltaX = event.clientX - posicionInicialMouse.value.x
  const deltaY = event.clientY - posicionInicialMouse.value.y

  let nuevoAncho = tamanosIniciales.value.width
  let nuevoAlto = tamanosIniciales.value.height
  let nuevaX = props.elemento.position.x
  let nuevaY = props.elemento.position.y

  // Aplicar cambios según el tipo de redimensionamiento
  switch (tipoRedimension.value) {
    case 'nw':
      nuevoAncho = Math.max(50, tamanosIniciales.value.width - deltaX)
      nuevoAlto = Math.max(20, tamanosIniciales.value.height - deltaY)
      nuevaX = props.elemento.position.x + (tamanosIniciales.value.width - nuevoAncho)
      nuevaY = props.elemento.position.y + (tamanosIniciales.value.height - nuevoAlto)
      break
    case 'n':
      nuevoAlto = Math.max(20, tamanosIniciales.value.height - deltaY)
      nuevaY = props.elemento.position.y + (tamanosIniciales.value.height - nuevoAlto)
      break
    case 'ne':
      nuevoAncho = Math.max(50, tamanosIniciales.value.width + deltaX)
      nuevoAlto = Math.max(20, tamanosIniciales.value.height - deltaY)
      nuevaY = props.elemento.position.y + (tamanosIniciales.value.height - nuevoAlto)
      break
    case 'e':
      nuevoAncho = Math.max(50, tamanosIniciales.value.width + deltaX)
      break
    case 'se':
      nuevoAncho = Math.max(50, tamanosIniciales.value.width + deltaX)
      nuevoAlto = Math.max(20, tamanosIniciales.value.height + deltaY)
      break
    case 's':
      nuevoAlto = Math.max(20, tamanosIniciales.value.height + deltaY)
      break
    case 'sw':
      nuevoAncho = Math.max(50, tamanosIniciales.value.width - deltaX)
      nuevoAlto = Math.max(20, tamanosIniciales.value.height + deltaY)
      nuevaX = props.elemento.position.x + (tamanosIniciales.value.width - nuevoAncho)
      break
    case 'w':
      nuevoAncho = Math.max(50, tamanosIniciales.value.width - deltaX)
      nuevaX = props.elemento.position.x + (tamanosIniciales.value.width - nuevoAncho)
      break
  }

  // Emitir cambios de tamaño
  emit('resized', props.elemento.id, { width: nuevoAncho, height: nuevoAlto })

  // Emitir cambios de posición si es necesario
  if (nuevaX !== props.elemento.position.x || nuevaY !== props.elemento.position.y) {
    emit('moved', props.elemento.id, { x: nuevaX, y: nuevaY })
  }
}

function finalizarRedimension(): void {
  estaRedimensionando.value = false
  tipoRedimension.value = ''
  document.removeEventListener('mousemove', manejarMovimientoRedimension)
  document.removeEventListener('mouseup', finalizarRedimension)
}

// Manejar selección desde el exterior
function setSeleccionado(seleccionado: boolean): void {
  esSeleccionado.value = seleccionado
}

// Exponer funciones al componente padre
defineExpose({
  setSeleccionado
})

// Cleanup
onUnmounted(() => {
  document.removeEventListener('mousemove', manejarMovimientoArrastre)
  document.removeEventListener('mouseup', finalizarArrastre)
  document.removeEventListener('mousemove', manejarMovimientoRedimension)
  document.removeEventListener('mouseup', finalizarRedimension)
})
</script>

<style scoped>
.elemento-formulario {
  background: white;
  border-radius: 4px;
  min-width: 50px;
  min-height: 20px;
}

.elemento-formulario:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.elemento-formulario.border-blue-500 {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.handle-redimension {
  border-radius: 2px;
  transition: all 0.2s ease;
}

.handle-redimension:hover {
  background-color: #1d4ed8;
  transform: scale(1.2);
}

.barra-herramientas-elemento {
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.contenido-elemento {
  pointer-events: none;
  overflow: hidden;
}

.overlay-arrastre {
  border-radius: 4px;
}

/* Animaciones */
.elemento-formulario {
  transition: transform 0.1s ease, box-shadow 0.2s ease;
}

.elemento-formulario:active {
  transform: scale(1.02);
}

/* Responsive */
@media (max-width: 768px) {
  .handle-redimension {
    width: 12px !important;
    height: 12px !important;
  }

  .barra-herramientas-elemento {
    font-size: 10px;
    padding: 2px 4px;
  }
}
</style>
