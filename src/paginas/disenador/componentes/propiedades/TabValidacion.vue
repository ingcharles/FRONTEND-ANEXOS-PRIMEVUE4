<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import type { ReglaValidacion } from '@/interfaces/Validacion'

// Tipos específicos para este componente
interface PropiedadesTabValidacion {
  idCampo: string
}

interface OpcionTipoValidacion {
  etiqueta: string
  valor: ReglaValidacion['tipo']
}

// Props del componente
defineProps<PropiedadesTabValidacion>()

// Almacén de estado
const almacen = useAlmacenDisenador()

// Estado computado
const campoSeleccionado = computed(() => almacen.campoSeleccionado)

const reglasValidacion = computed<ReglaValidacion[]>({
  get: () => campoSeleccionado.value?.validaciones ?? [],
  set: (nuevasReglas) => {
    if (campoSeleccionado.value) {
      almacen.actualizarCampo(campoSeleccionado.value.id, { validaciones: nuevasReglas })
    }
  },
})

// Opciones de tipos de validación
const tiposValidacion: OpcionTipoValidacion[] = [
  { etiqueta: 'Campo requerido', valor: 'requerido' },
  { etiqueta: 'Longitud mínima', valor: 'longitud-minima' },
  { etiqueta: 'Longitud máxima', valor: 'longitud-maxima' },
  { etiqueta: 'Patrón RegEx', valor: 'patron' },
  { etiqueta: 'Validación personalizada', valor: 'personalizada' }
]

// Funciones de gestión
function crearNuevaValidacion(tipo: ReglaValidacion['tipo']): ReglaValidacion {
  return { tipo }
}

function agregarValidacion(tipo: ReglaValidacion['tipo']): void {
  const nuevaValidacion = crearNuevaValidacion(tipo)
  reglasValidacion.value = [...reglasValidacion.value, nuevaValidacion]
}

function eliminarValidacion(indice: number): void {
  reglasValidacion.value = reglasValidacion.value.filter((_, i) => i !== indice)
}

function obtenerEtiquetaCampo(tipo: ReglaValidacion['tipo']): string {
  const etiquetas: Record<ReglaValidacion['tipo'], string> = {
    'requerido': 'Mensaje de error',
    'longitud-minima': 'Longitud mínima',
    'longitud-maxima': 'Longitud máxima',
    'patron': 'Expresión regular',
    'personalizada': 'Función de validación'
  }
  return etiquetas[tipo] || 'Configuración'
}

function obtenerPlaceholderCampo(tipo: ReglaValidacion['tipo']): string {
  const placeholders: Record<ReglaValidacion['tipo'], string> = {
    'requerido': 'Este campo es obligatorio',
    'longitud-minima': 'Ej: 3',
    'longitud-maxima': 'Ej: 100',
    'patron': 'Ej: ^[a-zA-Z]+$',
    'personalizada': 'function(valor) { return valor > 0; }'
  }
  return placeholders[tipo] || ''
}

function obtenerTextoAyuda(tipo: ReglaValidacion['tipo']): string {
  const ayudas: Record<ReglaValidacion['tipo'], string> = {
    'requerido': '',
    'longitud-minima': '',
    'longitud-maxima': '',
    'patron': 'Ingresa una expresión regular válida',
    'personalizada': 'Función JavaScript que retorne true si el valor es válido'
  }
  return ayudas[tipo] || ''
}

function mostrarAyuda(tipo: ReglaValidacion['tipo']): boolean {
  return tipo === 'patron' || tipo === 'personalizada'
}
</script>

<template>
  <div class="flex flex-column gap-4">
    <!-- Panel de botones para agregar validaciones -->
    <div class="surface-50 border-round-lg p-3" style="border: 1px solid var(--surface-200);">
      <div class="flex align-items-center gap-2 mb-3">
        <i class="pi pi-shield text-primary"></i>
        <span class="font-medium text-700">Agregar validaciones</span>
      </div>

      <div class="flex flex-wrap gap-2">
        <PrimeButton
          label="Requerido"
          icon="pi pi-exclamation-triangle"
          size="small"
          severity="info"
          outlined
          @click="agregarValidacion('requerido')"
          class="shadow-1"
        />
        <PrimeButton
          label="Longitud mín."
          icon="pi pi-arrow-down"
          size="small"
          severity="info"
          outlined
          @click="agregarValidacion('longitud-minima')"
          class="shadow-1"
        />
        <PrimeButton
          label="Longitud máx."
          icon="pi pi-arrow-up"
          size="small"
          severity="info"
          outlined
          @click="agregarValidacion('longitud-maxima')"
          class="shadow-1"
        />
        <PrimeButton
          label="Patrón"
          icon="pi pi-search"
          size="small"
          severity="info"
          outlined
          @click="agregarValidacion('patron')"
          class="shadow-1"
        />
        <PrimeButton
          label="Personalizado"
          icon="pi pi-code"
          size="small"
          severity="info"
          outlined
          @click="agregarValidacion('personalizada')"
          class="shadow-1"
        />
      </div>
    </div>

    <!-- Estado vacío -->
    <div
      v-if="reglasValidacion.length === 0"
      class="text-center p-6 surface-50 border-round-lg border-1 surface-border"
    >
      <i class="pi pi-shield text-4xl text-500 mb-3"></i>
      <p class="text-600 m-0">No hay validaciones configuradas</p>
      <small class="text-500">
        Las validaciones ayudan a asegurar que los datos ingresados sean correctos
      </small>
    </div>

    <!-- Lista de validaciones existentes -->
    <div
      v-for="(regla, indice) in reglasValidacion"
      :key="indice"
      class="surface-0 border-round-lg p-4 shadow-1"
      style="border: 1px solid var(--surface-200);"
    >
      <div class="grid align-items-end gap-3">
        <!-- Tipo de validación -->
        <div class="sm:col-12 md:col-12 lg:col-4">
          <label class="font-medium text-sm text-700 font-medium">
            <i class="pi pi-cog mr-2"></i>Tipo de validación
          </label>
          <PrimeSelect
            v-model="regla.tipo"
            :options="tiposValidacion"
            option-label="etiqueta"
            option-value="valor"
            class="ancho-100 text-sm"
            placeholder="Seleccionar tipo..."
          />
        </div>

        <!-- Campo de configuración -->
        <div class="col-12 md:col-8">
          <label class="font-medium text-sm text-700 font-medium">
            <i class="pi pi-pencil mr-2"></i>
            {{ obtenerEtiquetaCampo(regla.tipo) }}
          </label>
          <PrimeInputText
            :model-value="String((regla as any).valor || '')"
            @update:model-value="(regla as any).valor = $event"
            class="ancho-100 text-sm"
            :placeholder="obtenerPlaceholderCampo(regla.tipo)"
          />

          <!-- Texto de ayuda condicional -->
          <small
            v-if="mostrarAyuda(regla.tipo)"
            class="text-500 block mt-1"
          >
            {{ obtenerTextoAyuda(regla.tipo) }}
          </small>
        </div>
      </div>

      <!-- Acciones de la validación -->
      <div class="flex justify-content-end mt-3 pt-3" style="border-top: 1px solid var(--surface-100);">
        <PrimeButton
          icon="pi pi-trash"
          severity="danger"
          size="small"
          outlined
          @click="eliminarValidacion(indice)"
          aria-label="Eliminar validación"
          class="hover:bg-red-50"
        />
      </div>
    </div>
  </div>
</template>

