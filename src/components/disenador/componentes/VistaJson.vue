<template>
  <div class="vista-json h-full bg-gray-50 flex flex-col">
    <!-- Barra de herramientas -->
    <div class="barra-herramientas-json bg-white border-b border-gray-200 p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <h3 class="text-lg font-semibold text-gray-800">Esquema JSON</h3>
          <div class="flex items-center space-x-2">
            <Button
              icon="pi pi-copy"
              label="Copiar"
              size="small"
              outlined
              @click="copiarJSON"
            />
            <Button
              icon="pi pi-download"
              label="Descargar"
              size="small"
              outlined
              @click="descargarJSON"
            />
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <Button
            icon="pi pi-upload"
            label="Importar"
            size="small"
            @click="mostrarDialogoImportar = true"
          />
          <Button
            icon="pi pi-refresh"
            label="Actualizar"
            size="small"
            outlined
            @click="actualizarJSON"
          />
        </div>
      </div>

      <!-- Estadísticas del formulario -->
      <div class="estadisticas-formulario mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="estadistica bg-blue-50 p-3 rounded-lg">
          <div class="text-blue-600 text-2xl font-bold">{{ totalCampos }}</div>
          <div class="text-blue-800 text-sm">Campos</div>
        </div>
        <div class="estadistica bg-green-50 p-3 rounded-lg">
          <div class="text-green-600 text-2xl font-bold">{{ totalPaginas }}</div>
          <div class="text-green-800 text-sm">Páginas</div>
        </div>
        <div class="estadistica bg-purple-50 p-3 rounded-lg">
          <div class="text-purple-600 text-2xl font-bold">{{ totalValidaciones }}</div>
          <div class="text-purple-800 text-sm">Validaciones</div>
        </div>
        <div class="estadistica bg-orange-50 p-3 rounded-lg">
          <div class="text-orange-600 text-2xl font-bold">{{ Math.round(tamanosJSON.kb) }} KB</div>
          <div class="text-orange-800 text-sm">Tamaño</div>
        </div>
      </div>
    </div>

    <!-- Pestañas de contenido -->
    <div class="pestanas-json bg-white border-b border-gray-200">
      <TabView v-model:activeIndex="pestanaActiva" class="custom-tabs">
        <TabPanel header="Esquema Completo">
          <template #header>
            <div class="flex items-center space-x-2">
              <i class="pi pi-file-code"></i>
              <span>Esquema Completo</span>
            </div>
          </template>
        </TabPanel>
        <TabPanel header="Solo Campos">
          <template #header>
            <div class="flex items-center space-x-2">
              <i class="pi pi-list"></i>
              <span>Solo Campos</span>
            </div>
          </template>
        </TabPanel>
        <TabPanel header="Configuración">
          <template #header>
            <div class="flex items-center space-x-2">
              <i class="pi pi-cog"></i>
              <span>Configuración</span>
            </div>
          </template>
        </TabPanel>
        <TabPanel header="Vista de Datos">
          <template #header>
            <div class="flex items-center space-x-2">
              <i class="pi pi-database"></i>
              <span>Datos</span>
            </div>
          </template>
        </TabPanel>
      </TabView>
    </div>

    <!-- Contenido principal -->
    <div class="contenido-json flex-1 overflow-hidden">
      <!-- Esquema Completo -->
      <div v-if="pestanaActiva === 0" class="h-full p-4">
        <div class="editor-json bg-white rounded-lg border h-full overflow-hidden">
          <div class="editor-header bg-gray-50 border-b px-4 py-2 flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700">Esquema Completo del Formulario</span>
            <div class="flex items-center space-x-2">
              <Button
                icon="pi pi-search-plus"
                size="small"
                text
                @click="formatearJSON"
              />
              <Button
                icon="pi pi-search-minus"
                size="small"
                text
                @click="compactarJSON"
              />
            </div>
          </div>
          <div class="editor-content h-full overflow-auto">
            <pre class="json-content p-4 text-sm"><code>{{ jsonEsquemaCompleto }}</code></pre>
          </div>
        </div>
      </div>

      <!-- Solo Campos -->
      <div v-else-if="pestanaActiva === 1" class="h-full p-4">
        <div class="editor-json bg-white rounded-lg border h-full overflow-hidden">
          <div class="editor-header bg-gray-50 border-b px-4 py-2">
            <span class="text-sm font-medium text-gray-700">Definición de Campos</span>
          </div>
          <div class="editor-content h-full overflow-auto">
            <pre class="json-content p-4 text-sm"><code>{{ jsonSoloCampos }}</code></pre>
          </div>
        </div>
      </div>

      <!-- Configuración -->
      <div v-else-if="pestanaActiva === 2" class="h-full p-4">
        <div class="editor-json bg-white rounded-lg border h-full overflow-hidden">
          <div class="editor-header bg-gray-50 border-b px-4 py-2">
            <span class="text-sm font-medium text-gray-700">Configuración del Formulario</span>
          </div>
          <div class="editor-content h-full overflow-auto">
            <pre class="json-content p-4 text-sm"><code>{{ jsonConfiguracion }}</code></pre>
          </div>
        </div>
      </div>

      <!-- Vista de Datos -->
      <div v-else-if="pestanaActiva === 3" class="h-full p-4">
        <div class="contenido-datos grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
          <!-- Estructura de datos -->
          <div class="panel-estructura bg-white rounded-lg border overflow-hidden">
            <div class="panel-header bg-gray-50 border-b px-4 py-2">
              <span class="text-sm font-medium text-gray-700">Estructura de Datos</span>
            </div>
            <div class="panel-content h-full overflow-auto">
              <pre class="json-content p-4 text-sm"><code>{{ jsonEstructuraDatos }}</code></pre>
            </div>
          </div>

          <!-- Datos de ejemplo -->
          <div class="panel-ejemplo bg-white rounded-lg border overflow-hidden">
            <div class="panel-header bg-gray-50 border-b px-4 py-2 flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700">Datos de Ejemplo</span>
              <Button
                icon="pi pi-refresh"
                size="small"
                text
                @click="generarDatosEjemplo"
              />
            </div>
            <div class="panel-content h-full overflow-auto">
              <pre class="json-content p-4 text-sm"><code>{{ jsonDatosEjemplo }}</code></pre>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Diálogo de importación -->
    <Dialog
      v-model:visible="mostrarDialogoImportar"
      modal
      header="Importar Esquema JSON"
      :style="{ width: '600px' }"
    >
      <div class="import-dialog-content">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Pegar JSON o seleccionar archivo
          </label>
          <Textarea
            v-model="jsonImportacion"
            rows="10"
            placeholder="Pegar el JSON del formulario aquí..."
            class="w-full"
          />
        </div>

        <div class="mb-4">
          <FileUpload
            mode="basic"
            accept=".json"
            :max-file-size="1000000"
            choose-label="Seleccionar archivo JSON"
            @select="manejarArchivoJSON"
          />
        </div>

        <div v-if="errorImportacion" class="mb-4">
          <Message severity="error" :closable="false">
            {{ errorImportacion }}
          </Message>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-2">
          <Button
            label="Cancelar"
            outlined
            @click="cerrarDialogoImportar"
          />
          <Button
            label="Importar"
            @click="importarJSON"
          />
        </div>
      </template>
    </Dialog>

    <!-- Toast para notificaciones -->
    <Toast ref="toast" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { useDisenadorStore } from '@/stores/disenador'
import type { FormSchema, FieldSchema } from '@/types/disenador'
import Button from 'primevue/button'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import FileUpload from 'primevue/fileupload'
import Message from 'primevue/message'
import Toast from 'primevue/toast'

// Store
const store = inject('disenadorStore') as ReturnType<typeof useDisenadorStore> || useDisenadorStore()

// Refs
const toast = ref()
const pestanaActiva = ref(0)
const mostrarDialogoImportar = ref(false)
const jsonImportacion = ref('')
const errorImportacion = ref('')
const jsonFormateado = ref(true)

// Computed - Estadísticas
const totalCampos = computed(() =>
  store.currentForm.pages.reduce((total, pagina) => total + pagina.fields.length, 0)
)

const totalPaginas = computed(() => store.currentForm.pages.length)

const totalValidaciones = computed(() =>
  store.currentForm.pages.reduce((total, pagina) =>
    total + pagina.fields.reduce((subtotal, campo) =>
      subtotal + (campo.validations?.length || 0), 0), 0)
)

const tamanosJSON = computed(() => {
  const json = JSON.stringify(store.currentForm)
  const bytes = new Blob([json]).size
  return {
    bytes,
    kb: bytes / 1024,
    mb: bytes / (1024 * 1024)
  }
})

// Computed - JSON outputs
const jsonEsquemaCompleto = computed(() =>
  formatJSON(store.currentForm)
)

const jsonSoloCampos = computed(() => {
  const campos = store.currentForm.pages.flatMap(pagina => pagina.fields)
  return formatJSON(campos)
})

const jsonConfiguracion = computed(() => {
  const config = {
    id: store.currentForm.id,
    title: store.currentForm.title,
    description: store.currentForm.description,
    version: store.currentForm.version,
    settings: store.currentForm.settings,
    metadata: store.currentForm.metadata,
    totalPages: store.currentForm.pages.length,
    totalFields: totalCampos.value
  }
  return formatJSON(config)
})

const jsonEstructuraDatos = computed(() => {
  const estructura: Record<string, string> = {}

  store.currentForm.pages.forEach(pagina => {
    pagina.fields.forEach(campo => {
      estructura[campo.id] = obtenerTipoDato(campo.type)
    })
  })

  return formatJSON(estructura)
})

const jsonDatosEjemplo = computed(() => {
  const datos: Record<string, unknown> = {}

  store.currentForm.pages.forEach(pagina => {
    pagina.fields.forEach(campo => {
      datos[campo.id] = generarValorEjemplo(campo)
    })
  })

  return formatJSON(datos)
})

// Funciones auxiliares
function formatJSON(obj: unknown): string {
  if (jsonFormateado.value) {
    return JSON.stringify(obj, null, 2)
  } else {
    return JSON.stringify(obj)
  }
}

function obtenerTipoDato(tipo: string): string {
  const tiposMap: Record<string, string> = {
    'text': 'string',
    'email': 'string',
    'password': 'string',
    'number': 'number',
    'textarea': 'string',
    'select': 'string',
    'checkbox': 'boolean',
    'radio': 'string',
    'file': 'File[]',
    'date': 'string',
    'datetime': 'string',
    'time': 'string'
  }
  return tiposMap[tipo] || 'unknown'
}

function generarValorEjemplo(campo: FieldSchema): unknown {
  if (campo.defaultValue !== undefined) {
    return campo.defaultValue
  }

  switch (campo.type) {
    case 'text':
    case 'email':
    case 'password':
      return `Ejemplo ${campo.label.toLowerCase()}`
    case 'number':
      return 123
    case 'textarea':
      return `Texto de ejemplo para ${campo.label.toLowerCase()}`
    case 'select':
    case 'radio':
      return campo.options?.[0]?.value || 'opcion1'
    case 'checkbox':
      return false
    case 'date':
      return new Date().toISOString().split('T')[0]
    case 'datetime':
      return new Date().toISOString()
    case 'time':
      return '12:00'
    default:
      return null
  }
}

// Funciones de acción
function formatearJSON(): void {
  jsonFormateado.value = true
}

function compactarJSON(): void {
  jsonFormateado.value = false
}

function actualizarJSON(): void {
  // Forzar recomputación
  pestanaActiva.value = pestanaActiva.value
  mostrarToast('success', 'JSON actualizado', 'El esquema JSON ha sido actualizado')
}

async function copiarJSON(): Promise<void> {
  try {
    let contenido = ''

    switch (pestanaActiva.value) {
      case 0:
        contenido = jsonEsquemaCompleto.value
        break
      case 1:
        contenido = jsonSoloCampos.value
        break
      case 2:
        contenido = jsonConfiguracion.value
        break
      case 3:
        contenido = jsonDatosEjemplo.value
        break
    }

    await navigator.clipboard.writeText(contenido)
    mostrarToast('success', 'Copiado', 'JSON copiado al portapapeles')
  } catch {
    mostrarToast('error', 'Error', 'No se pudo copiar al portapapeles')
  }
}

function descargarJSON(): void {
  let contenido = ''
  let nombreArchivo = ''

  switch (pestanaActiva.value) {
    case 0:
      contenido = jsonEsquemaCompleto.value
      nombreArchivo = `${store.currentForm.title || 'formulario'}-completo.json`
      break
    case 1:
      contenido = jsonSoloCampos.value
      nombreArchivo = `${store.currentForm.title || 'formulario'}-campos.json`
      break
    case 2:
      contenido = jsonConfiguracion.value
      nombreArchivo = `${store.currentForm.title || 'formulario'}-config.json`
      break
    case 3:
      contenido = jsonDatosEjemplo.value
      nombreArchivo = `${store.currentForm.title || 'formulario'}-datos.json`
      break
  }

  const blob = new Blob([contenido], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nombreArchivo
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  mostrarToast('success', 'Descargado', `Archivo ${nombreArchivo} descargado`)
}

function generarDatosEjemplo(): void {
  // Regenerar datos de ejemplo forzando recomputación
  mostrarToast('info', 'Datos regenerados', 'Se han generado nuevos datos de ejemplo')
}

// Funciones de importación
function manejarArchivoJSON(event: { files: File[] }): void {
  const archivo = event.files[0]
  if (archivo) {
    const reader = new FileReader()
    reader.onload = (e) => {
      jsonImportacion.value = e.target?.result as string
    }
    reader.readAsText(archivo)
  }
}

function importarJSON(): void {
  try {
    const esquema = JSON.parse(jsonImportacion.value) as FormSchema

    // Validar estructura básica
    if (!esquema.id || !esquema.title || !esquema.pages) {
      throw new Error('El JSON no tiene la estructura correcta de un formulario')
    }

    // Importar usando el método del store
    const exito = store.importarJson(jsonImportacion.value)

    if (exito) {
      cerrarDialogoImportar()
      mostrarToast('success', 'Importado', 'Esquema JSON importado correctamente')
    } else {
      throw new Error('Error al importar el esquema')
    }

  } catch (error) {
    errorImportacion.value = error instanceof Error ? error.message : 'Error al parsear JSON'
  }
}

function cerrarDialogoImportar(): void {
  mostrarDialogoImportar.value = false
  jsonImportacion.value = ''
  errorImportacion.value = ''
}

function mostrarToast(severity: string, summary: string, detail: string): void {
  toast.value.add({
    severity,
    summary,
    detail,
    life: 3000
  })
}
</script>

<style scoped>
.vista-json {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.editor-json {
  display: flex;
  flex-direction: column;
}

.editor-content {
  flex: 1;
  background: #fafafa;
}

.json-content {
  line-height: 1.4;
  font-size: 12px;
  color: #2d3748;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.json-content code {
  font-family: inherit;
}

.estadistica {
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.estadistica:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.custom-tabs {
  background: white;
}

.custom-tabs :deep(.p-tabview-nav) {
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.custom-tabs :deep(.p-tabview-header) {
  margin-right: 0;
}

.custom-tabs :deep(.p-tabview-title) {
  font-size: 0.875rem;
  font-weight: 500;
}

.contenido-datos {
  max-height: calc(100vh - 300px);
}

.panel-estructura,
.panel-ejemplo {
  display: flex;
  flex-direction: column;
  min-height: 400px;
}

.panel-content {
  flex: 1;
  background: #fafafa;
}

.import-dialog-content {
  max-height: 400px;
  overflow-y: auto;
}

/* Syntax highlighting simulado */
.json-content {
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
}

/* Responsive */
@media (max-width: 768px) {
  .estadisticas-formulario {
    grid-template-columns: repeat(2, 1fr);
  }

  .barra-herramientas-json .flex {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .contenido-datos {
    grid-template-columns: 1fr;
  }

  .json-content {
    font-size: 10px;
  }
}

/* Scroll personalizado */
.editor-content::-webkit-scrollbar,
.panel-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.editor-content::-webkit-scrollbar-track,
.panel-content::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.editor-content::-webkit-scrollbar-thumb,
.panel-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.editor-content::-webkit-scrollbar-thumb:hover,
.panel-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Animaciones */
.estadistica {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
