<template>
  <div class="panel-propiedades w-80 bg-white border-l border-gray-200 overflow-y-auto">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200 bg-gray-50">
      <h3 class="text-lg font-semibold text-gray-900 flex items-center">
        <i class="pi pi-cog mr-2"></i>
        Propiedades
      </h3>
      <p class="text-sm text-gray-600 mt-1">
        {{ campoSeleccionado ? 'Configura el elemento seleccionado' : 'Selecciona un elemento para editarlo' }}
      </p>
    </div>

    <!-- Contenido del panel -->
    <div class="p-4" v-if="campoSeleccionado">
      <!-- Información básica del campo -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium text-gray-500">ELEMENTO SELECCIONADO</span>
          <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {{ campoSeleccionado.type }}
          </span>
        </div>
        <p class="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
          {{ campoSeleccionado.id }}
        </p>
      </div>

      <!-- Propiedades básicas -->
      <PrimePanel header="Propiedades Básicas" class="mb-4" toggleable>
        <div class="space-y-4">
          <!-- Label -->
          <div class="field">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Etiqueta
            </label>
            <PrimeInputText 
              v-model="campoSeleccionado.label"
              class="w-full"
              placeholder="Etiqueta del campo"
              @input="actualizarCampo"
            />
          </div>

          <!-- Placeholder -->
          <div class="field" v-if="tienePropiedad('placeholder')">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Placeholder
            </label>
            <PrimeInputText 
              v-model="campoSeleccionado.placeholder"
              class="w-full"
              placeholder="Texto de ayuda"
              @input="actualizarCampo"
            />
          </div>

          <!-- Requerido -->
          <div class="field">
            <div class="flex items-center">
              <PrimeCheckbox 
                v-model="campoSeleccionado.required"
                binary
                input-id="required"
                @change="actualizarCampo"
              />
              <label for="required" class="ml-2 text-sm font-medium text-gray-700">
                Campo requerido
              </label>
            </div>
          </div>

          <!-- Visible -->
          <div class="field">
            <div class="flex items-center">
              <PrimeCheckbox 
                v-model="campoSeleccionado.visible"
                binary
                input-id="visible"
                @change="actualizarCampo"
              />
              <label for="visible" class="ml-2 text-sm font-medium text-gray-700">
                Visible
              </label>
            </div>
          </div>

          <!-- Disabled -->
          <div class="field">
            <div class="flex items-center">
              <PrimeCheckbox 
                v-model="campoSeleccionado.disabled"
                binary
                input-id="disabled"
                @change="actualizarCampo"
              />
              <label for="disabled" class="ml-2 text-sm font-medium text-gray-700">
                Deshabilitado
              </label>
            </div>
          </div>
        </div>
      </PrimePanel>

      <!-- Opciones para select/radio -->
      <PrimePanel 
        header="Opciones" 
        class="mb-4" 
        toggleable
        v-if="tieneOpciones"
      >
        <div class="space-y-2">
          <div 
            v-for="(opcion, index) in campoSeleccionado.options" 
            :key="index"
            class="flex items-center space-x-2"
          >
            <PrimeInputText 
              v-model="opcion.label"
              placeholder="Etiqueta"
              class="flex-1"
              @input="actualizarCampo"
            />
            <PrimeInputText 
              v-model="opcion.value"
              placeholder="Valor"
              class="flex-1"
              @input="actualizarCampo"
            />
            <PrimeButton 
              icon="pi pi-trash"
              severity="danger"
              size="small"
              @click="eliminarOpcion(index)"
            />
          </div>
          <PrimeButton 
            icon="pi pi-plus"
            label="Agregar opción"
            size="small"
            severity="secondary"
            @click="agregarOpcion"
          />
        </div>
      </PrimePanel>

      <!-- Acciones del campo -->
      <div class="mt-6 pt-4 border-t border-gray-200">
        <div class="flex space-x-2">
          <PrimeButton 
            label="Duplicar"
            icon="pi pi-copy"
            size="small"
            severity="secondary"
            @click="duplicarCampo"
            class="flex-1"
          />
          <PrimeButton 
            label="Eliminar"
            icon="pi pi-trash"
            size="small"
            severity="danger"
            @click="eliminarCampo"
            class="flex-1"
          />
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-else class="p-8 text-center text-gray-500">
      <i class="pi pi-info-circle text-4xl mb-4 block"></i>
      <p class="text-lg font-medium mb-2">Sin selección</p>
      <p class="text-sm">
        Haz clic en un elemento del formulario para ver y editar sus propiedades.
      </p>
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
const campoSeleccionado = computed(() => store.selectedElement)

const tieneOpciones = computed(() => {
  if (!campoSeleccionado.value) return false
  return ['select', 'radio', 'multiselect'].includes(campoSeleccionado.value.type)
})

// Methods
function tienePropiedad(propiedad: string): boolean {
  if (!campoSeleccionado.value) return false
  
  const propiedadesPorTipo: Record<string, string[]> = {
    input: ['placeholder'],
    textarea: ['placeholder'],
    email: ['placeholder'],
    password: ['placeholder'],
    number: ['placeholder'],
    select: [],
    multiselect: [],
    checkbox: [],
    radio: [],
    date: [],
    file: []
  }
  
  return propiedadesPorTipo[campoSeleccionado.value.type]?.includes(propiedad) || false
}

function actualizarCampo() {
  // Los cambios se aplican automáticamente a través de v-model
  // ya que estamos editando directamente el objeto del store
}

function agregarOpcion() {
  if (campoSeleccionado.value?.options) {
    campoSeleccionado.value.options.push({
      label: `Opción ${campoSeleccionado.value.options.length + 1}`,
      value: `opcion_${campoSeleccionado.value.options.length + 1}`
    })
  }
}

function eliminarOpcion(index: number) {
  if (campoSeleccionado.value?.options) {
    campoSeleccionado.value.options.splice(index, 1)
  }
}

function duplicarCampo() {
  if (campoSeleccionado.value) {
    store.duplicarElemento(campoSeleccionado.value.id)
    toast.add({
      severity: 'success',
      summary: 'Campo duplicado',
      life: 3000
    })
  }
}

function eliminarCampo() {
  if (campoSeleccionado.value) {
    if (confirm('¿Eliminar este campo?')) {
      store.eliminarElemento(campoSeleccionado.value.id)
      toast.add({
        severity: 'success',
        summary: 'Campo eliminado',
        life: 3000
      })
    }
  }
}
</script>

<style scoped>
.panel-propiedades {
  max-height: 100vh;
  background-color: #fafafa;
}

.field {
  margin-bottom: 1rem;
}
</style>