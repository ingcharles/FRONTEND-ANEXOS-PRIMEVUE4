<template>
  <div class="barra-herramientas flex items-center justify-between p-3 bg-white border-b border-gray-200">
    <!-- Grupo izquierdo: Acciones principales -->
    <div class="flex items-center space-x-2">
      <PrimeButton 
        icon="pi pi-file" 
        label="Nuevo" 
        size="small"
        severity="secondary"
        @click="nuevoFormulario"
      />
      
      <PrimeButton 
        icon="pi pi-download" 
        label="Exportar" 
        size="small"
        severity="success"
        @click="exportarFormulario"
        :disabled="!totalCampos"
      />
      
      <PrimeDivider layout="vertical" />
      
      <PrimeButton 
        icon="pi pi-grid" 
        size="small"
        severity="secondary"
        @click="alternarGrilla"
        :class="{ 'p-button-success': mostrarGrilla }"
      />
    </div>

    <!-- Grupo central: Información del formulario -->
    <div class="flex items-center space-x-4">
      <div class="text-sm text-gray-600">
        <span class="font-medium">Campos:</span>
        <span class="ml-1">{{ totalCampos }}</span>
      </div>
      
      <div class="text-sm text-gray-600">
        <span class="font-medium">Páginas:</span>
        <span class="ml-1">{{ totalPaginas }}</span>
      </div>
      
      <div class="text-sm text-gray-600" v-if="campoSeleccionado">
        <span class="font-medium">Seleccionado:</span>
        <span class="ml-1 font-mono">{{ campoSeleccionado.label || campoSeleccionado.id }}</span>
      </div>
    </div>

    <!-- Grupo derecho: Acciones de vista -->
    <div class="flex items-center space-x-2">
      <PrimeButton 
        icon="pi pi-eye" 
        label="Preview" 
        size="small"
        severity="info"
        @click="alternarVistaPrevia"
      />
      
      <PrimeButton 
        icon="pi pi-code" 
        label="JSON" 
        size="small"
        severity="info"
        @click="alternarVistaJson"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useDisenadorStore } from '@/stores/disenador'

const toast = useToast()
const store = useDisenadorStore()

// Computed
const totalPaginas = computed(() => store.totalPages)
const mostrarGrilla = computed(() => store.currentForm.settings.showGrid)
const campoSeleccionado = computed(() => store.selectedElement)

const totalCampos = computed(() => {
  return store.currentForm.pages.reduce((total, page) => {
    return total + page.fields.length
  }, 0)
})

// Methods
function nuevoFormulario() {
  if (totalCampos.value > 0) {
    if (confirm('¿Crear nuevo formulario? Se perderán los cambios.')) {
      store.limpiarFormulario()
      toast.add({
        severity: 'success',
        summary: 'Nuevo formulario creado',
        life: 3000
      })
    }
  } else {
    store.limpiarFormulario()
  }
}

function exportarFormulario() {
  try {
    const json = store.exportarJson()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `formulario-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.add({
      severity: 'success',
      summary: 'Formulario exportado',
      life: 3000
    })
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error al exportar',
      life: 3000
    })
  }
}

function alternarGrilla() {
  store.alternarGrilla()
}

function alternarVistaPrevia() {
  store.cambiarModoVista('preview')
}

function alternarVistaJson() {
  store.cambiarModoVista('json')
}
</script>

<style scoped>
.barra-herramientas {
  min-height: 60px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>