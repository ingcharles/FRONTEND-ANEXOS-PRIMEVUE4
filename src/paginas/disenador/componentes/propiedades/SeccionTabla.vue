<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import draggable from 'vuedraggable'
import { TipoCampoValor } from '@/enumeraciones/Campos'
import InputNumber from 'primevue/inputnumber'
import Checkbox from 'primevue/checkbox'
import Tag from 'primevue/tag'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import type { EsquemaCampo } from '@/interfaces/Campos'
import type { ColumnaTabla } from '@/interfaces/Comunes'

type TipoColumna = 'texto' | 'numero' | 'fecha'
type ModoFormato = 'decimal' | 'currency' | 'percent'
type EscalaPorcentaje = 'whole' | 'fraction'
type FuncionAgregado = 'none' | 'sum' | 'avg' | 'count' | 'min' | 'max'
type TamañoPadding = 'sm' | 'md' | 'lg'

interface EstiloTabla {
  bordered?: boolean
  striped?: boolean
  hover?: boolean
  padding?: TamañoPadding
}

interface OpcionSelector {
  label: string
  value: string
}

const props = defineProps<{
  campo: EsquemaCampo | null
}>()

const almacen = useAlmacenDisenador()

// Índice de columna seleccionada
const indiceColumna = ref(0)

// Opciones para selectores
const tiposColumna: TipoColumna[] = ['texto', 'numero', 'fecha']
const opcionesModoFormato: ModoFormato[] = ['decimal', 'currency', 'percent']
const funcionesAgregado: FuncionAgregado[] = ['none', 'sum', 'avg', 'count', 'min', 'max']
const opcionesPadding: TamañoPadding[] = ['sm', 'md', 'lg']

const opcionesEscalaPorcentaje: OpcionSelector[] = [
  { label: '15 = 15%', value: 'whole' },
  { label: '0.15 = 15%', value: 'fraction' }
]

// Metadatos de la tabla
const metadatos = computed(() => {
  if (!props.campo) return {}
  return props.campo.metadatos || {}
})

// Estilo de tabla
const estiloTabla = computed((): EstiloTabla => {
  const meta = metadatos.value as Record<string, unknown>
  return (meta.estiloTabla as EstiloTabla) || {}
})

// Obtener columnas
function obtenerColumnas(): ColumnaTabla[] {
  const meta = metadatos.value as Record<string, unknown>
  const columnas = meta.columnas
  return Array.isArray(columnas) ? columnas : []
}

// Proxy para vuedraggable
const columnasProxy = computed({
  get: () => obtenerColumnas(),
  set: (nuevasColumnas: ColumnaTabla[]) => actualizarColumnas(nuevasColumnas)
})

// Opciones para selector de columnas
const opcionesColumnas = computed(() => {
  return obtenerColumnas().map((columna, indice) => ({
    label: columna.etiqueta || columna.nombre || `Col ${indice + 1}`,
    value: indice
  }))
})

// Columna actualmente seleccionada
const columnaActual = computed((): ColumnaTabla | null => {
  const columnas = obtenerColumnas()
  return columnas[indiceColumna.value] || null
})

// Actualizar columnas
function actualizarColumnas(columnas: ColumnaTabla[]): void {
  if (!props.campo) return
  const meta = { ...metadatos.value } as Record<string, unknown>
  meta.columnas = columnas
  almacen.actualizarCampo(props.campo.id, { metadatos: meta })
}

// Agregar nueva columna
function agregarColumna(): void {
  const columnas = obtenerColumnas()
  const nuevaColumna: ColumnaTabla = {
    id: `columna${columnas.length + 1}`,
    nombre: `columna${columnas.length + 1}`,
    etiqueta: `Columna ${columnas.length + 1}`,
    tipo: 'texto',
    name: `columna${columnas.length + 1}`,
    label: `Columna ${columnas.length + 1}`,
    type: 'texto'
  }

  columnas.push(nuevaColumna)
  actualizarColumnas(columnas)
  indiceColumna.value = columnas.length - 1
}

// Eliminar columna
function eliminarColumna(indice: number): void {
  const columnas = obtenerColumnas()
  if (indice >= 0 && indice < columnas.length) {
    columnas.splice(indice, 1)
    actualizarColumnas(columnas)
    asegurarIndiceValido()
  }
}

// Seleccionar columna
function seleccionarColumna(indice: number): void {
  indiceColumna.value = indice
  asegurarIndiceValido()
}

// Asegurar que el índice es válido
function asegurarIndiceValido(): void {
  const columnas = obtenerColumnas()
  if (indiceColumna.value >= columnas.length) {
    indiceColumna.value = Math.max(0, columnas.length - 1)
  }
}

// Manejar reordenación de columnas
function manejarReordenColumnas(): void {
  // vuedraggable ya actualizó columnasProxy
  asegurarIndiceValido()
}

// Actualizar propiedad de columna
function actualizarColumna(propiedad: keyof ColumnaTabla, valor: unknown): void {
  const columnas = [...obtenerColumnas()]
  const indice = indiceColumna.value

  if (indice >= 0 && indice < columnas.length) {
    columnas[indice] = { ...columnas[indice], [propiedad]: valor }
    actualizarColumnas(columnas)
  }
}

// Verificar nombre duplicado
function esNombreColumnaDuplicado(): boolean {
  if (!columnaActual.value) return false

  const columnas = obtenerColumnas()
  const nombreActual = columnaActual.value.nombre

  return columnas.some((columna, indice) =>
    indice !== indiceColumna.value && columna.nombre === nombreActual
  )
}

// Actualizar metadato de tabla
function actualizarMetadato(propiedad: string, valor: unknown): void {
  if (!props.campo) return
  const meta = { ...metadatos.value } as Record<string, unknown>
  meta[propiedad] = valor
  almacen.actualizarCampo(props.campo.id, { metadatos: meta })
}

// Actualizar estilo de tabla
function actualizarEstiloTabla(propiedad: keyof EstiloTabla, valor: unknown): void {
  if (!props.campo) return
  const meta = { ...metadatos.value } as Record<string, unknown>
  const estiloActual = (meta.estiloTabla as EstiloTabla) || {}

  meta.estiloTabla = { ...estiloActual, [propiedad]: valor }
  almacen.actualizarCampo(props.campo.id, { metadatos: meta })
}

// Watchers
watch(() => obtenerColumnas().length, () => {
  asegurarIndiceValido()
}, { immediate: true })
</script>


<template>
  <div v-if="campo?.tipo === TipoCampoValor.Tabla">
    <h3 class="texto-sm text-color mb-2">Tabla</h3>
    <span class="negrilla">Columnas</span>
    <div class="grid">
      <div class="col-12 md:col-12 lg:col-6 ">
        <PrimeSelect :model-value="indiceColumna" :options="opcionesColumnas" option-label="label" option-value="value"
          class="ancho-100" @update:model-value="(v: number) => seleccionarColumna(v)" />
      </div>
      <div class="col-12 md:col-12 lg:col-4 flex justify-content-end gap-1 pb-0">
        <PrimeButton rounded size="small" class="boton-pequenio" icon="pi pi-plus" @click="agregarColumna" />


        <PrimeButton class="boton-pequenio" icon="pi pi-trash" severity="danger"
          :disabled="obtenerColumnas().length === 0" @click="eliminarColumna(indiceColumna)" />
      </div>

    </div>
    <!-- <h3 class="texto-sm text-color mb-2">Tabla</h3> -->

    <!-- Gestión de columnas -->

    <!-- <div class="flex justify-content-between align-items-center mb-2">

      <div class="flex gap-2 align-items-center">


      </div>
    </div> -->

    <!-- Lista ordenable de columnas -->
    <div class="mb-2">
      <draggable :list="columnasProxy" item-key="name" handle=".drag-handle" ghost-class="surface-100" class="grid"
        @end="manejarReordenColumnas">
        <template #item="{ element, index }">
          <div
            class="col-12 md:col-6 flex align-items-center justify-content-between p-2 border-1 surface-border border-round">
            <div class="flex align-items-center gap-2">
              <i class="pi pi-bars drag-handle cursor-move" />
              <span>
                {{ element.etiqueta || element.nombre || ('Col ' + (index + 1)) }}
              </span>
            </div>
            <div class="flex align-items-center gap-2">
              <Tag v-if="element.tipo" :value="String(element.tipo)" severity="secondary" />
            </div>
          </div>
        </template>
      </draggable>
      <small class="text-color-secondary">
        Arrastra para reordenar columnas. La configuración se mantiene para cada columna.
      </small>
    </div>

    <!-- Configuración de columna seleccionada -->
    <template v-if="columnaActual">
      <!-- Propiedades básicas -->
      <div class="grid align-items-end mb-3">
        <div class="sm:col-12 md:col-12 lg:col-4">
          <label class="texto-sm">Nombre</label>
          <PrimeInputText :model-value="columnaActual.nombre"
            @update:model-value="(v: string | undefined) => actualizarColumna('nombre', v || '')" />
          <small v-if="esNombreColumnaDuplicado()" class="color-rojo">
            El nombre ya existe en otra columna.
          </small>
        </div>

        <div class="sm:col-12 md:col-12 lg:col-4">
          <label class="texto-sm">Etiqueta</label>
          <PrimeInputText :model-value="columnaActual.etiqueta"
            @update:model-value="(v: string | undefined) => actualizarColumna('etiqueta', v || '')" />
        </div>

        <div class="sm:col-12 md:col-12 lg:col-4">
          <label class="texto-sm">Tipo</label>
          <PrimeSelect :model-value="columnaActual.tipo || 'texto'" :options="tiposColumna"
            @update:model-value="(v: TipoColumna) => actualizarColumna('tipo', v)" />
        </div>
      </div>

      <!-- Configuración de formato para números -->
      <div v-if="columnaActual.tipo === 'number'" class="mb-3">
        <div class="negrilla mb-2">Formato Numérico</div>
        <div class="grid">
          <div class="col-12 md:col-3">
            <label class="texto-sm">Modo</label>
            <PrimeSelect :model-value="columnaActual.modoFormato || 'decimal'" :options="opcionesModoFormato"
              @update:model-value="(v: ModoFormato) => actualizarColumna('modoFormato', v)" />
          </div>

          <div class="col-12 md:col-3" v-if="columnaActual.modoFormato === 'currency'">
            <label class="texto-sm">Moneda</label>
            <PrimeInputText :model-value="String(columnaActual.moneda || 'USD')"
              @update:model-value="(v: string | undefined) => actualizarColumna('moneda', v || 'USD')" />
          </div>

          <div class="col-12 md:col-3">
            <label class="texto-sm">Idioma</label>
            <PrimeInputText :model-value="String(columnaActual.idioma || 'es-ES')"
              @update:model-value="(v: string | undefined) => actualizarColumna('idioma', v || 'es-ES')" />
          </div>

          <div class="col-12 md:col-3">
            <label class="texto-sm">Prefijo</label>
            <PrimeInputText :model-value="String(columnaActual.prefijo || '')"
              @update:model-value="(v: string | undefined) => actualizarColumna('prefijo', v || '')" />
          </div>

          <div class="col-12 md:col-3">
            <label class="texto-sm">Sufijo</label>
            <PrimeInputText :model-value="String(columnaActual.sufijo || '')"
              @update:model-value="(v: string | undefined) => actualizarColumna('sufijo', v || '')" />
          </div>

          <div class="col-12 md:col-3">
            <label class="texto-sm">Mín. decimales</label>
            <InputNumber :model-value="Number(columnaActual.decimalesMinimos ?? 0)" :min="0" :max="8"
              class="ancho-100 texto-sm"
              @update:model-value="(v: number | null) => actualizarColumna('decimalesMinimos', v ?? 0)" />
          </div>

          <div class="col-12 md:col-3">
            <label class="texto-sm">Máx. decimales</label>
            <InputNumber :model-value="Number(columnaActual.decimalesMaximos ?? 2)" :min="0" :max="8"
              class="ancho-100 texto-sm"
              @update:model-value="(v: number | null) => actualizarColumna('decimalesMaximos', v ?? 2)" />
          </div>

          <div class="col-12 md:col-3" v-if="columnaActual.modoFormato === 'percent'">
            <label class="texto-sm">Escala porcentaje</label>
            <PrimeSelect :model-value="columnaActual.escalaPorcentaje || 'whole'" :options="opcionesEscalaPorcentaje"
              option-label="label" option-value="value"
              @update:model-value="(v: EscalaPorcentaje) => actualizarColumna('escalaPorcentaje', v)" />
          </div>
        </div>
      </div>

      <!-- Configuración de agregado -->
      <div class="mb-3">
        <div class="negrilla mb-2">Agregado</div>
        <div class="grid">
          <div class="col-12 md:col-3">
            <label class="texto-sm">Función</label>
            <PrimeSelect :model-value="columnaActual.agregar || 'none'" :options="funcionesAgregado"
              @update:model-value="(v: FuncionAgregado) => actualizarColumna('agregar', v)" />
          </div>

          <div class="col-12 md:col-3">
            <label class="texto-sm">Prefijo</label>
            <PrimeInputText :model-value="String(columnaActual.prefijoAgregado || '')"
              @update:model-value="(v: string | undefined) => actualizarColumna('prefijoAgregado', v || '')" />
          </div>

          <div class="col-12 md:col-3">
            <label class="texto-sm">Sufijo</label>
            <PrimeInputText :model-value="String(columnaActual.sufijoAgregado || '')"
              @update:model-value="(v: string | undefined) => actualizarColumna('sufijoAgregado', v || '')" />
          </div>

          <div class="col-12 md:col-3">
            <label class="texto-sm">Decimales</label>
            <InputNumber :model-value="Number(columnaActual.decimales ?? 2)" :min="0" :max="8"
              class="ancho-100 texto-sm"
              @update:model-value="(v: number | null) => actualizarColumna('decimales', v ?? 2)" />
          </div>
        </div>
      </div>

      <!-- Validación de columna -->
      <div class="mb-3">
        <div class="negrilla mb-2">Validación</div>
        <div class="grid">
          <div class="col-12 md:col-3">
            <label class="inline-flex align-items-center gap-2">
              <Checkbox binary :model-value="Boolean(columnaActual.requerido)"
                @update:model-value="(v: boolean) => actualizarColumna('requerido', v)" />
              Requerido
            </label>
          </div>

          <template v-if="columnaActual.tipo === 'number'">
            <div class="col-12 md:col-3">
              <label class="texto-sm">Mínimo</label>
              <InputNumber :model-value="typeof columnaActual.minimo === 'number' ? columnaActual.minimo : null"
                class="ancho-100 texto-sm" @update:model-value="(v: number | null) => actualizarColumna('minimo', v)" />
            </div>

            <div class="col-12 md:col-3">
              <label class="texto-sm">Máximo</label>
              <InputNumber :model-value="typeof columnaActual.maximo === 'number' ? columnaActual.maximo : null"
                class="ancho-100 texto-sm" @update:model-value="(v: number | null) => actualizarColumna('maximo', v)" />
            </div>

            <div class="col-12 md:col-6">
              <label class="texto-sm">Mensaje min</label>
              <PrimeInputText :model-value="String(columnaActual.mensajeMinimo || '')"
                @update:model-value="(v: string | undefined) => actualizarColumna('mensajeMinimo', v || '')" />
            </div>

            <div class="col-12 md:col-6">
              <label class="texto-sm">Mensaje max</label>
              <PrimeInputText :model-value="String(columnaActual.mensajeMaximo || '')"
                @update:model-value="(v: string | undefined) => actualizarColumna('mensajeMaximo', v || '')" />
            </div>
          </template>
        </div>
      </div>
    </template>

    <!-- Configuración general de tabla -->
    <div class="mb-3">
      <div class="negrilla mb-2">Configuración General</div>

      <!-- Permitir añadir filas -->
      <div class="field">
        <label class="inline-flex align-items-center gap-2">
          <Checkbox binary :model-value="Boolean(metadatos.agregarFilas)"
            @update:model-value="(v: boolean) => actualizarMetadato('agregarFilas', v)" />
          Permitir añadir filas
        </label>
      </div>

      <!-- Número de filas iniciales -->
      <div class="grid align-items-end">
        <div class="sm:col-12 md:col-12 lg:col-4">
          <label class="texto-sm">Filas iniciales</label>
          <InputNumber :model-value="Number(metadatos.filas ?? 1)" :min="1" class="ancho-100 texto-sm"
            @update:model-value="(v: number | null) => actualizarMetadato('filas', Math.max(1, v ?? 1))" />
        </div>

        <div class="col-12 md:col-8">
          <small class="text-color-secondary">
            Se aplicará al inicializar los datos o cuando estén vacíos.
          </small>
        </div>
      </div>
    </div>

    <!-- Estilo de tabla -->
    <div class="mb-3">
      <div class="negrilla mb-2">Estilo de Tabla</div>
      <div class="grid">
        <div class="col-12 sm:col-3">
          <label class="inline-flex align-items-center gap-2">
            <Checkbox binary :model-value="Boolean(estiloTabla.bordered)"
              @update:model-value="(v: boolean) => actualizarEstiloTabla('bordered', v)" />
            Bordes
          </label>
        </div>

        <div class="col-12 sm:col-3">
          <label class="inline-flex align-items-center gap-2">
            <Checkbox binary :model-value="Boolean(estiloTabla.striped)"
              @update:model-value="(v: boolean) => actualizarEstiloTabla('striped', v)" />
            Zebra
          </label>
        </div>

        <div class="col-12 sm:col-3">
          <label class="inline-flex align-items-center gap-2">
            <Checkbox binary :model-value="Boolean(estiloTabla.hover)"
              @update:model-value="(v: boolean) => actualizarEstiloTabla('hover', v)" />
            Hover
          </label>
        </div>

        <div class="col-12 sm:col-3">
          <label class="texto-sm">Padding</label>
          <PrimeSelect :model-value="estiloTabla.padding || 'md'" :options="opcionesPadding"
            @update:model-value="(v: TamañoPadding) => actualizarEstiloTabla('padding', v)" />
        </div>
      </div>
    </div>
  </div>
</template>
