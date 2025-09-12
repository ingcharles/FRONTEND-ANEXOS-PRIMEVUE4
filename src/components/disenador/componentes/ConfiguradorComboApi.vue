<template>
  <div class="configurador-combo-api">
    <!-- Configuración de opciones manuales vs API -->
    <div class="field mb-4">
      <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
        Fuente de Datos
      </label>
      <div class="flex gap-3">
        <div class="flex items-center">
          <RadioButton
            v-model="tipoFuente"
            input-id="manual"
            value="manual"
            @change="cambiarTipoFuente"
          />
          <label for="manual" class="ml-2 text-sm">Manual</label>
        </div>
        <div class="flex items-center">
          <RadioButton
            v-model="tipoFuente"
            input-id="api"
            value="api"
            @change="cambiarTipoFuente"
          />
          <label for="api" class="ml-2 text-sm">API</label>
        </div>
      </div>
    </div>

    <!-- Configuración manual de opciones -->
    <div v-if="tipoFuente === 'manual'" class="opciones-manuales">
      <div class="flex items-center justify-between mb-3">
        <label class="block text-sm font-medium text-surface-700 dark:text-surface-300">
          Opciones
        </label>
        <Button
          icon="pi pi-plus"
          size="small"
          outlined
          @click="agregarOpcion"
        />
      </div>

      <div class="space-y-2 max-h-40 overflow-y-auto">
        <div
          v-for="(opcion, index) in opcionesLocales"
          :key="index"
          class="flex items-center gap-2 p-2 border border-surface-200 dark:border-surface-700 rounded"
        >
          <div class="flex-1">
            <InputText
              v-model="opcion.label"
              placeholder="Etiqueta"
              class="w-full mb-1"
              size="small"
              @input="actualizarOpciones"
            />
            <InputText
              :value="String(opcion.value)"
              placeholder="Valor"
              class="w-full"
              size="small"
              @input="opcion.value = ($event.target as HTMLInputElement).value; actualizarOpciones()"
            />
          </div>
          <Button
            icon="pi pi-trash"
            size="small"
            severity="danger"
            outlined
            @click="eliminarOpcion(index)"
          />
        </div>
      </div>
    </div>

    <!-- Configuración de API -->
    <div v-else class="configuracion-api space-y-4">
      <!-- URL de la API -->
      <div class="field">
        <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          URL de la API
        </label>
        <InputText
          v-model="configApi.url"
          placeholder="https://api.ejemplo.com/opciones"
          class="w-full"
          @input="actualizarConfigApi"
        />
      </div>

      <!-- Método HTTP -->
      <div class="field">
        <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          Método HTTP
        </label>
        <Dropdown
          v-model="configApi.method"
          :options="metodosHttp"
          placeholder="Seleccionar método"
          class="w-full"
          @change="actualizarConfigApi"
        />
      </div>

      <!-- Rutas de mapeo -->
      <div class="grid grid-cols-2 gap-3">
        <div class="field">
          <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
            Ruta para Etiqueta
          </label>
          <InputText
            v-model="configApi.labelPath"
            placeholder="nombre"
            class="w-full"
            @input="actualizarConfigApi"
          />
          <small class="text-surface-500">Ej: nombre, title, label</small>
        </div>
        <div class="field">
          <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
            Ruta para Valor
          </label>
          <InputText
            v-model="configApi.valuePath"
            placeholder="id"
            class="w-full"
            @input="actualizarConfigApi"
          />
          <small class="text-surface-500">Ej: id, codigo, value</small>
        </div>
      </div>

      <!-- Headers personalizados -->
      <div class="field">
        <div class="flex items-center justify-between mb-2">
          <label class="block text-sm font-medium text-surface-700 dark:text-surface-300">
            Headers Personalizados
          </label>
          <Button
            icon="pi pi-plus"
            size="small"
            outlined
            @click="agregarHeader"
          />
        </div>

        <div class="space-y-2">
          <div
            v-for="(header, key) in configApi.headers"
            :key="key"
            class="flex items-center gap-2"
          >
            <InputText
              :value="key"
              placeholder="Nombre del header"
              class="flex-1"
              size="small"
              @input="actualizarNombreHeader(key, $event)"
            />
            <InputText
              v-model="configApi.headers![key]"
              placeholder="Valor del header"
              class="flex-1"
              size="small"
              @input="actualizarConfigApi"
            />
            <Button
              icon="pi pi-trash"
              size="small"
              severity="danger"
              outlined
              @click="eliminarHeader(key)"
            />
          </div>
        </div>
      </div>

      <!-- Botón de prueba -->
      <div class="field">
        <Button
          :label="probandoApi ? 'Probando...' : 'Probar API'"
          :loading="probandoApi"
          icon="pi pi-play"
          size="small"
          @click="probarApi"
        />
        <small v-if="mensajePrueba" :class="[
          'block mt-2',
          tipoMensaje === 'error' ? 'text-red-600' : 'text-green-600'
        ]">
          {{ mensajePrueba }}
        </small>
      </div>

      <!-- Vista previa de datos -->
      <div v-if="datosVistaPrevia.length > 0" class="field">
        <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          Vista Previa (primeros 5 elementos)
        </label>
        <div class="bg-surface-50 dark:bg-surface-800 p-3 rounded border text-sm">
          <div
            v-for="(item, index) in datosVistaPrevia.slice(0, 5)"
            :key="index"
            class="flex justify-between py-1 border-b border-surface-200 dark:border-surface-600 last:border-b-0"
          >
            <span>{{ item.label }}</span>
            <span class="text-surface-500">{{ item.value }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ComboOption, ComboApiConfig } from '@/types/disenador'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import RadioButton from 'primevue/radiobutton'
import Dropdown from 'primevue/dropdown'

interface Props {
  opciones?: ComboOption[]
  apiConfig?: ComboApiConfig
}

interface Emits {
  (e: 'update:opciones', opciones: ComboOption[]): void
  (e: 'update:apiConfig', config: ComboApiConfig | undefined): void
}

const props = withDefaults(defineProps<Props>(), {
  opciones: () => [],
  apiConfig: undefined
})

const emit = defineEmits<Emits>()

// Estado local
const tipoFuente = ref<'manual' | 'api'>(props.apiConfig ? 'api' : 'manual')
const opcionesLocales = ref<ComboOption[]>([...props.opciones])
const configApi = ref<ComboApiConfig>({
  url: '',
  labelPath: 'label',
  valuePath: 'value',
  method: 'GET',
  headers: {},
  ...props.apiConfig
})

const probandoApi = ref(false)
const mensajePrueba = ref('')
const tipoMensaje = ref<'success' | 'error'>('success')
const datosVistaPrevia = ref<ComboOption[]>([])

// Métodos HTTP disponibles
const metodosHttp = ['GET', 'POST']

// Funciones
function cambiarTipoFuente(): void {
  if (tipoFuente.value === 'manual') {
    emit('update:apiConfig', undefined)
    emit('update:opciones', opcionesLocales.value)
  } else {
    emit('update:opciones', [])
    emit('update:apiConfig', configApi.value)
  }
}

function agregarOpcion(): void {
  opcionesLocales.value.push({ label: '', value: '' })
  actualizarOpciones()
}

function eliminarOpcion(index: number): void {
  opcionesLocales.value.splice(index, 1)
  actualizarOpciones()
}

function actualizarOpciones(): void {
  emit('update:opciones', opcionesLocales.value.filter(op => op.label || op.value))
}

function actualizarConfigApi(): void {
  emit('update:apiConfig', { ...configApi.value })
}

function agregarHeader(): void {
  const nuevoNombre = `header-${Date.now()}`
  configApi.value.headers = {
    ...configApi.value.headers,
    [nuevoNombre]: ''
  }
  actualizarConfigApi()
}

function eliminarHeader(nombre: string): void {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [nombre]: _removed, ...rest } = configApi.value.headers || {}
  configApi.value.headers = rest
  actualizarConfigApi()
}

function actualizarNombreHeader(nombreAntiguo: string, evento: Event): void {
  const nuevoNombre = (evento.target as HTMLInputElement).value
  if (nuevoNombre !== nombreAntiguo && configApi.value.headers) {
    const valor = configApi.value.headers[nombreAntiguo]
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [nombreAntiguo]: _removed, ...rest } = configApi.value.headers
    configApi.value.headers = {
      ...rest,
      [nuevoNombre]: valor
    }
    actualizarConfigApi()
  }
}

async function probarApi(): Promise<void> {
  if (!configApi.value.url) {
    mensajePrueba.value = 'Por favor ingrese una URL'
    tipoMensaje.value = 'error'
    return
  }

  probandoApi.value = true
  mensajePrueba.value = ''
  datosVistaPrevia.value = []

  try {
    const opcionesRequest: RequestInit = {
      method: configApi.value.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...configApi.value.headers
      }
    }

    const response = await fetch(configApi.value.url, opcionesRequest)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    // Mapear los datos según las rutas especificadas
    let opcionesMapeadas: ComboOption[] = []

    if (Array.isArray(data)) {
      opcionesMapeadas = data.map(item => ({
        label: obtenerValorAnidado(item, configApi.value.labelPath),
        value: obtenerValorAnidado(item, configApi.value.valuePath)
      }))
    } else if (data && typeof data === 'object') {
      // Si no es un array, intentar extraer array de alguna propiedad común
      const posiblesArrays = ['data', 'items', 'results', 'opciones']
      for (const prop of posiblesArrays) {
        if (Array.isArray(data[prop])) {
          opcionesMapeadas = data[prop].map((item: Record<string, unknown>) => ({
            label: obtenerValorAnidado(item, configApi.value.labelPath),
            value: obtenerValorAnidado(item, configApi.value.valuePath)
          }))
          break
        }
      }
    }

    if (opcionesMapeadas.length === 0) {
      throw new Error('No se pudieron extraer opciones de la respuesta de la API')
    }

    datosVistaPrevia.value = opcionesMapeadas
    mensajePrueba.value = `✓ API conectada exitosamente. ${opcionesMapeadas.length} opciones encontradas.`
    tipoMensaje.value = 'success'

  } catch (error) {
    console.error('Error al probar API:', error)
    mensajePrueba.value = `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`
    tipoMensaje.value = 'error'
  } finally {
    probandoApi.value = false
  }
}

function obtenerValorAnidado(objeto: Record<string, unknown>, ruta: string): string {
  const resultado = ruta.split('.').reduce((obj: unknown, key: string) => {
    return (obj as Record<string, unknown>)?.[key]
  }, objeto)
  return String(resultado || '')
}

// Watch para sincronizar cambios externos
watch(() => props.opciones, (nuevasOpciones) => {
  opcionesLocales.value = [...nuevasOpciones]
}, { deep: true })

watch(() => props.apiConfig, (nuevaConfig) => {
  if (nuevaConfig) {
    configApi.value = { ...nuevaConfig }
    tipoFuente.value = 'api'
  } else {
    tipoFuente.value = 'manual'
  }
}, { deep: true })
</script>

<style scoped>
.configurador-combo-api {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
}

.dark .configurador-combo-api {
  background: #1e293b;
  border-color: #374151;
}
</style>
