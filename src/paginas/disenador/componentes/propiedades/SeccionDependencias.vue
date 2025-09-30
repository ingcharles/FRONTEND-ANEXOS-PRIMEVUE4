<template>
  <div class="mt-3 p-3 border-1 surface-border border-round">
    <div class="negrilla mb-2 tamanio-fuente-miga">Dependencias</div>

    <div class="grid">
      <!-- Modo de envío -->
      <div class="col-12">
        <label class="tamanio-fuente-miga">Modo de envío</label>
        <PrimeSelect :model-value="configDependencia.modoEnvio || 'query'" :options="modoEnvioOpciones"
          option-label="label" option-value="value" class="ancho-100 tamanio-fuente-miga" @focus="asegurarDependencia"
          @update:model-value="(v: ModoEnvio) => actualizarDependencia('modoEnvio', v)" />
      </div>

      <!-- Campo padre -->
      <div class="col-12">
        <label class="tamanio-fuente-miga">Campo padre (depende de)</label>
        <PrimeMultiSelect :model-value="obtenerCamposPadre()" :options="camposPaginaActual" option-label="label"
          option-value="value" placeholder="Seleccionar campo(s)" class="ancho-100 tamanio-fuente-miga"
          @focus="asegurarDependencia" @update:model-value="actualizarCamposPadre" />
        <small class="text-color-secondary text-xs mt-1">
          Puedes elegir múltiples padres; se guardan separados por comas y se respetará el orden.
        </small>
      </div>

      <!-- Nombre de parámetro -->
      <div class="col-12" v-if="debeMostrarclaveParametro()">
        <label class="tamanio-fuente-miga">Nombre de parámetro (claveParametro)</label>
        <PrimeInputText :model-value="(configDependencia.claveParametro as string) || ''"
          :placeholder="obtenerPlaceholderclaveParametro()" class="ancho-100 tamanio-fuente-miga"
          @focus="asegurarDependencia"
          @update:model-value="(v: string | undefined) => actualizarDependencia('claveParametro', v || '')" />
      </div>

      <!-- Opciones de comportamiento -->
      <div class="col-12 flex align-items-center gap-2">
        <PrimeCheckbox binary :model-value="configDependencia.limpiarAlCambiar !== false"
          @update:model-value="(v: boolean) => actualizarDependencia('limpiarAlCambiar', v)" />
        <label class="tamanio-fuente-miga">Limpiar al cambiar</label>
      </div>

      <div class="col-12 flex align-items-center gap-2">
        <PrimeCheckbox binary :model-value="configDependencia.deshabilitarHastaValor !== false"
          @update:model-value="(v: boolean) => actualizarDependencia('deshabilitarHastaValor', v)" />
        <label class="tamanio-fuente-miga">Deshabilitar hasta que padre tenga valor</label>
      </div>

      <!-- Botón de limpiar -->
      <div class="col-12">
        <PrimeButton size="small" severity="secondary" icon="pi pi-trash" label="Limpiar dependencia"
          @click="limpiarDependencia" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import type { EsquemaCampo } from '@/interfaces/Campos'
import type { ConfiguracionDependencia } from '@/interfaces/Comunes'

interface CampoPagina {
  label: string
  value: string
}
// | 'header'
type ModoEnvio = 'query' | 'path'

const props = defineProps<{ campo: EsquemaCampo }>()
const almacen = useAlmacenDisenador()

// Opciones para modo de envío
const modoEnvioOpciones = [
  { label: 'Path Parameter', value: 'path' },
  { label: 'Query Parameter', value: 'query' }
  // { label: 'Header', value: 'header' },

]

// Configuración de dependencia
const configDependencia = computed((): ConfiguracionDependencia => {
  if (!props.campo) return {}

  const meta = props.campo.metadatos || {}
  const dependencia = (meta as Record<string, unknown>).dependencia as ConfiguracionDependencia

  return dependencia || {}
})

// Función recursiva para obtener todos los campos de la página, incluyendo los que están dentro de paneles
function obtenerTodosLosCampos(campos: unknown[]): EsquemaCampo[] {
  const resultado: EsquemaCampo[] = []

  for (const campo of campos) {
    if (!campo || typeof campo !== 'object') continue

    const campoTipado = campo as Record<string, unknown>
    if (!campoTipado.id || typeof campoTipado.id !== 'string') continue

    // Agregar el campo actual si no es un panel
    if (campoTipado.tipo !== 'panel') {
      resultado.push(campo as unknown as EsquemaCampo)
    }

    // Si tiene hijos (como en el caso de paneles), obtener recursivamente sus campos
    if (campoTipado.hijos && Array.isArray(campoTipado.hijos) && campoTipado.hijos.length > 0) {
      const camposHijos = obtenerTodosLosCampos(campoTipado.hijos)
      resultado.push(...camposHijos)
    }
  }

  return resultado
}

// Campos disponibles en la página actual
const camposPaginaActual = computed((): CampoPagina[] => {
  if (!props.campo) return []

  const paginaActual = almacen.obtenerPaginaActual()
  if (!paginaActual || !paginaActual.campos) return []

  // Obtener todos los campos recursivamente, incluyendo los que están dentro de paneles
  const todosLosCampos = obtenerTodosLosCampos(paginaActual.campos || [])

  return todosLosCampos
    .filter((campo) => campo && campo.id && campo.id !== props.campo!.id)
    .map((campo) => ({
      label: campo.etiqueta || campo.nombre || campo.id,
      value: campo.id
    }))
})

// Funciones para obtener y actualizar campos padre
function obtenerCamposPadre(): string[] {
  const campoPadre = configDependencia.value.campoPadre
  if (!campoPadre) return []

  if (typeof campoPadre === 'string') {
    return campoPadre.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
  }

  return []
}

function actualizarCamposPadre(campos: string[]): void {
  if (!props.campo) return

  const valorCamposPadre = Array.isArray(campos) && campos.length > 0
    ? campos.filter((campo: string) => campo && campo.trim().length > 0).join(',')
    : ''

  actualizarDependencia('campoPadre', valorCamposPadre)
}

// Verificar si debe mostrar claveParametro
function debeMostrarclaveParametro(): boolean {
  const modo = configDependencia.value.modoEnvio as string
  // , 'header'
  return ['query', 'path'].includes(modo || '')
}

// Placeholder para claveParametro según el modo
function obtenerPlaceholderclaveParametro(): string {
  const modo = configDependencia.value.modoEnvio
  switch (modo) {
    case 'query': return 'ej: filtro, categoria'
    // case 'header': return 'ej: X-Filter-Value'
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
      claveParametro: '',
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
