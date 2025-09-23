<template>
  <div class="mt-3 p-2 border-1 surface-border border-round">
    <div class="font-semibold mb-2 text-sm">Dependencias</div>

    <div class="grid grid-cols-12 gap-3">
      <!-- Modo de envío -->
      <div class="col-span-12 md:col-span-6">
        <label class="block mb-1">Modo de envío</label>
        <Select
          :model-value="configDependencia.modoEnvio || 'query'"
          :options="modoEnvioOpciones"
          option-label="label"
          option-value="value"
          class="w-full"
          @focus="asegurarDependencia"
          @update:model-value="(v: ModoEnvio) => actualizarDependencia('modoEnvio', v)"
        />
      </div>

      <!-- Campo padre -->
      <div class="col-span-12 md:col-span-6">
        <label class="block mb-1">Campo padre (depende de)</label>
        <MultiSelect
          :model-value="obtenerCamposPadre()"
          :options="camposPaginaActual"
          option-label="label"
          option-value="value"
          placeholder="Seleccionar campo(s)"
          class="w-full"
          @focus="asegurarDependencia"
          @update:model-value="actualizarCamposPadre"
        />
        <small class="text-gray-500 text-xs mt-1 block">
          Puedes elegir múltiples padres; se guardan separados por comas y se respetará el orden.
        </small>
      </div>

      <!-- Nombre de parámetro -->
      <div class="col-span-12 md:col-span-6" v-if="debeMostrarParamKey()">
        <label class="block mb-1">Nombre de parámetro (paramKey)</label>
        <InputText
          :model-value="(configDependencia.paramKey as string) || ''"
          :placeholder="obtenerPlaceholderParamKey()"
          class="w-full"
          @focus="asegurarDependencia"
          @update:model-value="(v: string | undefined) => actualizarDependencia('paramKey', v || '')"
        />
      </div>

      <!-- Opciones de comportamiento -->
      <div class="col-span-12 md:col-span-4 flex items-center gap-2">
        <Checkbox
          binary
          :model-value="configDependencia.limpiarAlCambiar !== false"
          @update:model-value="(v: boolean) => actualizarDependencia('limpiarAlCambiar', v)"
        />
        <label class="text-sm">Limpiar al cambiar</label>
      </div>

      <div class="col-span-12 md:col-span-4 flex items-center gap-2">
        <Checkbox
          binary
          :model-value="configDependencia.deshabilitarHastaValor !== false"
          @update:model-value="(v: boolean) => actualizarDependencia('deshabilitarHastaValor', v)"
        />
        <label class="text-sm">Deshabilitar hasta que padre tenga valor</label>
      </div>

      <!-- Botón de limpiar -->
      <div class="col-span-12 md:col-span-4">
        <Button
          size="small"
          severity="secondary"
          outlined
          icon="pi pi-trash"
          label="Limpiar dependencia"
          @click="limpiarDependencia"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import type { EsquemaCampo } from '@/interfaces/Campos'
import type { ConfiguracionDependencia } from '@/interfaces/Comunes'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'

interface CampoPagina {
  label: string
  value: string
}

type ModoEnvio = 'query' | 'header' | 'path'

const props = defineProps<{ campo: EsquemaCampo }>()
const almacen = useAlmacenDisenador()

// Opciones para modo de envío
const modoEnvioOpciones = [
  { label: 'Query Parameter', value: 'query' },
  // { label: 'Header', value: 'header' },
  { label: 'Path Parameter', value: 'path' }
]

// Configuración de dependencia
const configDependencia = computed((): ConfiguracionDependencia => {
  if (!props.campo) return {}

  const meta = props.campo.metadatos || {}
  const dependencia = (meta as Record<string, unknown>).dependencia as ConfiguracionDependencia

  return dependencia || {}
})

// Campos disponibles en la página actual
const camposPaginaActual = computed((): CampoPagina[] => {
  if (!props.campo) return []

  const paginaActual = almacen.obtenerPaginaActual()
  if (!paginaActual) return []

  return paginaActual.campos
    .filter((campo: EsquemaCampo) => campo.id !== props.campo!.id && campo.tipo !== 'panel')
    .map((campo: EsquemaCampo) => ({
      label: campo.etiqueta || campo.nombre || campo.id,
      value: campo.id
    }))
})

// Funciones para obtener y actualizar campos padre
function obtenerCamposPadre(): string[] {
  const campoPadre = configDependencia.value.campoPadre
  if (!campoPadre) return []
  return typeof campoPadre === 'string' ? campoPadre.split(',').map(s => s.trim()) : []
}

function actualizarCamposPadre(campos: string[]): void {
  if (!props.campo) return
  const valorCamposPadre = campos.length > 0 ? campos.join(',') : ''
  actualizarDependencia('campoPadre', valorCamposPadre)
}

// Verificar si debe mostrar paramKey
function debeMostrarParamKey(): boolean {
  const modo = configDependencia.value.modoEnvio as string
  return ['query', 'header', 'path'].includes(modo || '')
}

// Placeholder para paramKey según el modo
function obtenerPlaceholderParamKey(): string {
  const modo = configDependencia.value.modoEnvio
  switch (modo) {
    case 'query': return 'ej: filtro, categoria'
    case 'header': return 'ej: X-Filter-Value'
    case 'path': return 'ej: {id}, {categoria}'
    default: return 'Nombre del parámetro'
  }
}

// Asegurar que existe la estructura de dependencia
function asegurarDependencia(): void {
  if (!props.campo) return

  const meta = { ...(props.campo.metadatos || {}) } as Record<string, unknown>
  if (!meta.dependencia) {
    meta.dependencia = {
      modoEnvio: 'query',
      campoPadre: '',
      paramKey: '',
      limpiarAlCambiar: true,
      deshabilitarHastaValor: true
    }
    almacen.actualizarCampo(props.campo.id, { metadatos: meta })
  }
}

// Actualizar configuración de dependencia
function actualizarDependencia(propiedad: keyof ConfiguracionDependencia, valor: unknown): void {
  if (!props.campo) return

  const meta = { ...(props.campo.metadatos || {}) } as Record<string, unknown>
  const dependenciaActual = (meta.dependencia as ConfiguracionDependencia) || {}

  meta.dependencia = { ...dependenciaActual, [propiedad]: valor }
  almacen.actualizarCampo(props.campo.id, { metadatos: meta })
}

// Limpiar dependencia completa
function limpiarDependencia(): void {
  if (!props.campo) return

  const meta = { ...(props.campo.metadatos || {}) } as Record<string, unknown>
  delete meta.dependencia
  almacen.actualizarCampo(props.campo.id, { metadatos: meta })
}
</script>

