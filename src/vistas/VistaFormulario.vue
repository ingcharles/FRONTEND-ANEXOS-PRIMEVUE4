<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { EsquemaFormulario } from '@/interfaces/Formulario'
import RenderizadorFormulario from '@/paginas/formulario/componentes/RenderizadorFormulario.vue'
import { usarDecisionRules } from '@/composables/usarDecisionRules'

// Composables
const decisionRules = usarDecisionRules()

// Estado
const esquemaFormulario = ref<EsquemaFormulario | null>(null)
const mostrarDialogoImportar = ref(false)
const jsonTexto = ref('')
const errorImportacion = ref('')
const formularioCargado = ref(false)

// Cargar configuración de DecisionRules
onMounted(() => {
  console.log('🔧 [VistaFormulario] Cargando configuración de DecisionRules...')
  decisionRules.cargarConfiguracion()
  if (decisionRules.estaConfigurado.value) {
    console.log('✅ [VistaFormulario] DecisionRules configurado correctamente')
  } else {
    console.warn('⚠️ [VistaFormulario] DecisionRules no está configurado')
  }
})

// Computed
const tituloFormulario = computed(() => esquemaFormulario.value?.nombre || 'Formulario')

// Funciones
function abrirDialogoImportar(): void {
  mostrarDialogoImportar.value = true
  errorImportacion.value = ''
  jsonTexto.value = ''
}

function cerrarDialogoImportar(): void {
  mostrarDialogoImportar.value = false
  errorImportacion.value = ''
  jsonTexto.value = ''
}

function importarJSON(): void {
  errorImportacion.value = ''

  if (!jsonTexto.value.trim()) {
    errorImportacion.value = 'Por favor, pega el JSON del formulario'
    return
  }

  try {
    const esquema = JSON.parse(jsonTexto.value) as EsquemaFormulario

    // Validaciones básicas
    if (!esquema.paginas || !Array.isArray(esquema.paginas)) {
      throw new Error('El JSON no tiene una estructura válida de formulario')
    }

    if (esquema.paginas.length === 0) {
      throw new Error('El formulario debe tener al menos una página')
    }

    // Cargar el esquema
    esquemaFormulario.value = esquema
    formularioCargado.value = true
    cerrarDialogoImportar()

    console.log('✅ Formulario importado correctamente:', esquema.nombre)
  } catch (error) {
    console.error('❌ Error al importar JSON:', error)
    errorImportacion.value = error instanceof Error ? error.message : 'Error al parsear el JSON'
  }
}

function importarDesdeArchivo(event: Event): void {
  const input = event.target as HTMLInputElement
  const archivo = input.files?.[0]

  if (!archivo) return

  const lector = new FileReader()

  lector.onload = (e) => {
    const contenido = e.target?.result as string
    jsonTexto.value = contenido
  }

  lector.onerror = () => {
    errorImportacion.value = 'Error al leer el archivo'
  }

  lector.readAsText(archivo)
}

function limpiarFormulario(): void {
  esquemaFormulario.value = null
  formularioCargado.value = false
  jsonTexto.value = ''
  errorImportacion.value = ''
}
</script>

<template>
  <div class="p-4">
    <!-- Header -->
    <div class="mb-4">
      <div class="flex justify-content-between align-items-center">
        <div>
          <h1 class="m-0 mb-2">{{ tituloFormulario }}</h1>
          <p class="m-0 text-600" v-if="!formularioCargado">
            Importa un formulario desde JSON para comenzar
          </p>
        </div>
        <div class="flex gap-2">
          <PrimeButton v-if="!formularioCargado" label="Importar Formulario" icon="pi pi-upload"
            @click="abrirDialogoImportar" severity="primary" />
          <PrimeButton v-else label="Cambiar Formulario" icon="pi pi-refresh" @click="abrirDialogoImportar"
            severity="success" />
          <PrimeButton v-if="formularioCargado" label="Limpiar" icon="pi pi-times" @click="limpiarFormulario"
            severity="danger" outlined />
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-if="!formularioCargado" class="centrar-texto p-5 border-1 border-round">
      <i class="pi pi-file-import tamanio-fuente-24 mb-3 text-primary"></i>
      <h2 class="mt-0 mb-2">No hay formulario cargado</h2>
      <p class="text-600 mb-4">
        Importa un formulario desde JSON para comenzar a usarlo
      </p>
      <PrimeButton label="Importar Formulario" icon="pi pi-upload" @click="abrirDialogoImportar" size="large" />
    </div>

    <!-- Renderizador del formulario -->
    <div v-else>
      <RenderizadorFormulario :esquema="esquemaFormulario!" />
    </div>

    <!-- Dialog de importación -->
    <PrimeDialog v-model:visible="mostrarDialogoImportar" modal header="Importar Formulario" :style="{ width: '50rem' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
      <div class="flex flex-column gap-3">
        <!-- Instrucciones -->
        <div class="p-3 border-1 border-round">
          <div class="flex align-items-start gap-2">
            <i class="pi pi-info-circle" style="color: #2196f3; margin-top: 2px;"></i>
            <div>
              <p class="m-0 mb-2 negrilla" style="color: #1976d2;">¿Cómo importar?</p>
              <small class="text-600">
                1. Copia el JSON desde el diseñador (pestaña JSON)<br>
                2. Pégalo en el área de texto abajo<br>
                3. O sube un archivo .json
              </small>
            </div>
          </div>
        </div>

        <!-- Botón para subir archivo -->
        <div>
          <label for="file-upload" class="cursor-pointer">
            <div class="p-3 border-2 border-dashed border-round centrar-texto hover:bg-surface-100">
              <i class="pi pi-cloud-upload tamanio-fuente-24 mb-2 text-primary"></i>
              <p class="m-0 negrilla">Haz clic para subir un archivo JSON</p>
              <small class="text-600">o arrastra y suelta aquí</small>
            </div>
          </label>
          <input id="file-upload" type="file" accept=".json,application/json" style="display: none"
            @change="importarDesdeArchivo" />
        </div>

        <!-- Separador -->
        <div class="flex align-items-center gap-2">
          <PrimeDivider class="flex-1" />
          <span class="text-600">o pega el JSON</span>
          <PrimeDivider class="flex-1" />
        </div>

        <!-- Área de texto para JSON -->
        <div>
          <label class="block mb-2 negrilla">JSON del Formulario</label>
          <PrimeTextarea v-model="jsonTexto" rows="15" class="ancho-100 font-mono"
            placeholder='{"nombre": "Mi Formulario", "paginas": [...]}' />
        </div>

        <!-- Error -->
        <div v-if="errorImportacion" class="p-3 border-1 border-round">
          <div class="flex align-items-start gap-2">
            <i class="pi pi-exclamation-triangle" style="color: #f44336; margin-top: 2px;"></i>
            <div>
              <p class="m-0 negrilla" style="color: #c62828;">Error al importar</p>
              <small class="text-600">{{ errorImportacion }}</small>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <PrimeButton label="Cancelar" icon="pi pi-times" @click="cerrarDialogoImportar" severity="success" />
        <PrimeButton label="Importar" icon="pi pi-check" @click="importarJSON" severity="primary" />
      </template>
    </PrimeDialog>
  </div>
</template>

<style scoped>
.font-mono {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.875rem;
}
</style>
