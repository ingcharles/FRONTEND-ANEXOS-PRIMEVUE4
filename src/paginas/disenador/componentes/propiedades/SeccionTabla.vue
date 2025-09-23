<template>
  <div v-if="campo?.tipo === 'tabla'" class="mb-3">
    <div class="font-semibold mb-2">Configuración de Tabla</div>

    <!-- Gestión de columnas -->
    <div class="flex justify-between items-center mb-2">
      <span class="font-semibold">Columnas</span>
      <div class="flex gap-2 items-center">
        <Select
          :model-value="indiceColumna"
          :options="opcionesColumnas"
          option-label="label"
          option-value="value"
          class="w-full md:w-64"
          @update:model-value="(v: number) => seleccionarColumna(v)"
        />
        <Button
          label="Agregar"
          size="small"
          icon="pi pi-plus"
          @click="agregarColumna"
        />
        <Button
          label="Eliminar"
          size="small"
          icon="pi pi-trash"
          severity="danger"
          :disabled="obtenerColumnas().length === 0"
          @click="eliminarColumna(indiceColumna)"
        />
      </div>
    </div>

    <!-- Lista ordenable de columnas -->
    <div class="mb-2">
      <draggable
        :list="columnasProxy"
        item-key="name"
        handle=".drag-handle"
        ghost-class="surface-100"
        class="grid grid-cols-12 gap-2"
        @end="manejarReordenColumnas"
      >
        <template #item="{ element, index }">
          <div class="col-span-12 md:col-span-6 flex items-center justify-between p-2 border-1 surface-border border-round">
            <div class="flex items-center gap-2">
              <i class="pi pi-bars drag-handle cursor-move" />
              <span class="font-medium">
                {{ element.etiqueta || element.nombre || ('Col ' + (index + 1)) }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <Tag v-if="element.tipo" :value="String(element.tipo)" severity="secondary" />
            </div>
          </div>
        </template>
      </draggable>
      <small class="text-muted-color">
        Arrastra para reordenar columnas. La configuración se mantiene para cada columna.
      </small>
    </div>

    <!-- Configuración de columna seleccionada -->
    <template v-if="columnaActual">
      <!-- Propiedades básicas -->
      <div class="grid grid-cols-12 gap-3 items-end mb-3">
        <div class="col-span-12 md:col-span-4">
          <label class="block mb-1">Nombre</label>
          <InputText
            :model-value="columnaActual.nombre"
            @update:model-value="(v: string | undefined) => actualizarColumna('nombre', v || '')"
          />
          <small v-if="esNombreColumnaDuplicado()" class="text-red-500">
            El nombre ya existe en otra columna.
          </small>
        </div>

        <div class="col-span-12 md:col-span-4">
          <label class="block mb-1">Etiqueta</label>
          <InputText
            :model-value="columnaActual.etiqueta"
            @update:model-value="(v: string | undefined) => actualizarColumna('etiqueta', v || '')"
          />
        </div>

        <div class="col-span-12 md:col-span-4">
          <label class="block mb-1">Tipo</label>
          <Select
            :model-value="columnaActual.tipo || 'text'"
            :options="tiposColumna"
            @update:model-value="(v: TipoColumna) => actualizarColumna('tipo', v)"
          />
        </div>
      </div>

      <!-- Configuración de formato para números -->
      <div v-if="columnaActual.tipo === 'number'" class="mb-3">
        <div class="font-semibold mb-2">Formato Numérico</div>
        <div class="grid grid-cols-12 gap-3">
          <div class="col-span-12 md:col-span-3">
            <label class="block mb-1">Modo</label>
            <Select
              :model-value="columnaActual.formatMode || 'decimal'"
              :options="opcionesModoFormato"
              @update:model-value="(v: ModoFormato) => actualizarColumna('formatMode', v)"
            />
          </div>

          <div class="col-span-12 md:col-span-3" v-if="columnaActual.formatMode === 'currency'">
            <label class="block mb-1">Moneda</label>
            <InputText
              :model-value="String(columnaActual.currency || 'USD')"
              @update:model-value="(v: string | undefined) => actualizarColumna('currency', v || 'USD')"
            />
          </div>

          <div class="col-span-12 md:col-span-3">
            <label class="block mb-1">Locale</label>
            <InputText
              :model-value="String(columnaActual.locale || 'es-ES')"
              @update:model-value="(v: string | undefined) => actualizarColumna('locale', v || 'es-ES')"
            />
          </div>

          <div class="col-span-12 md:col-span-3">
            <label class="block mb-1">Prefijo</label>
            <InputText
              :model-value="String(columnaActual.prefix || '')"
              @update:model-value="(v: string | undefined) => actualizarColumna('prefix', v || '')"
            />
          </div>

          <div class="col-span-12 md:col-span-3">
            <label class="block mb-1">Sufijo</label>
            <InputText
              :model-value="String(columnaActual.suffix || '')"
              @update:model-value="(v: string | undefined) => actualizarColumna('suffix', v || '')"
            />
          </div>

          <div class="col-span-12 md:col-span-3">
            <label class="block mb-1">Mín. decimales</label>
            <InputNumber
              :model-value="Number(columnaActual.minFractionDigits ?? 0)"
              :min="0"
              :max="8"
              class="w-full"
              @update:model-value="(v: number | null) => actualizarColumna('minFractionDigits', v ?? 0)"
            />
          </div>

          <div class="col-span-12 md:col-span-3">
            <label class="block mb-1">Máx. decimales</label>
            <InputNumber
              :model-value="Number(columnaActual.maxFractionDigits ?? 2)"
              :min="0"
              :max="8"
              class="w-full"
              @update:model-value="(v: number | null) => actualizarColumna('maxFractionDigits', v ?? 2)"
            />
          </div>

          <div class="col-span-12 md:col-span-3" v-if="columnaActual.formatMode === 'percent'">
            <label class="block mb-1">Escala porcentaje</label>
            <Select
              :model-value="columnaActual.percentScale || 'whole'"
              :options="opcionesEscalaPorcentaje"
              option-label="label"
              option-value="value"
              @update:model-value="(v: EscalaPorcentaje) => actualizarColumna('percentScale', v)"
            />
          </div>
        </div>
      </div>

      <!-- Configuración de agregado -->
      <div class="mb-3">
        <div class="font-semibold mb-2">Agregado</div>
        <div class="grid grid-cols-12 gap-3">
          <div class="col-span-12 md:col-span-3">
            <label class="block mb-1">Función</label>
            <Select
              :model-value="columnaActual.agg || 'none'"
              :options="funcionesAgregado"
              @update:model-value="(v: FuncionAgregado) => actualizarColumna('agg', v)"
            />
          </div>

          <div class="col-span-12 md:col-span-3">
            <label class="block mb-1">Prefijo</label>
            <InputText
              :model-value="String(columnaActual.aggPrefix || '')"
              @update:model-value="(v: string | undefined) => actualizarColumna('aggPrefix', v || '')"
            />
          </div>

          <div class="col-span-12 md:col-span-3">
            <label class="block mb-1">Sufijo</label>
            <InputText
              :model-value="String(columnaActual.aggSuffix || '')"
              @update:model-value="(v: string | undefined) => actualizarColumna('aggSuffix', v || '')"
            />
          </div>

          <div class="col-span-12 md:col-span-3">
            <label class="block mb-1">Decimales</label>
            <InputNumber
              :model-value="Number(columnaActual.decimals ?? 2)"
              :min="0"
              :max="8"
              class="w-full"
              @update:model-value="(v: number | null) => actualizarColumna('decimals', v ?? 2)"
            />
          </div>
        </div>
      </div>

      <!-- Validación de columna -->
      <div class="mb-3">
        <div class="font-semibold mb-2">Validación</div>
        <div class="grid grid-cols-12 gap-3">
          <div class="col-span-12 md:col-span-3">
            <label class="inline-flex items-center gap-2">
              <Checkbox
                binary
                :model-value="Boolean(columnaActual.requerido)"
                @update:model-value="(v: boolean) => actualizarColumna('requerido', v)"
              />
              Requerido
            </label>
          </div>

          <template v-if="columnaActual.tipo === 'number'">
            <div class="col-span-12 md:col-span-3">
              <label class="block mb-1">Mínimo</label>
              <InputNumber
                :model-value="typeof columnaActual.min === 'number' ? columnaActual.min : null"
                class="w-full"
                @update:model-value="(v: number | null) => actualizarColumna('min', v)"
              />
            </div>

            <div class="col-span-12 md:col-span-3">
              <label class="block mb-1">Máximo</label>
              <InputNumber
                :model-value="typeof columnaActual.max === 'number' ? columnaActual.max : null"
                class="w-full"
                @update:model-value="(v: number | null) => actualizarColumna('max', v)"
              />
            </div>

            <div class="col-span-12 md:col-span-6">
              <label class="block mb-1">Mensaje min</label>
              <InputText
                :model-value="String(columnaActual.minMessage || '')"
                @update:model-value="(v: string | undefined) => actualizarColumna('minMessage', v || '')"
              />
            </div>

            <div class="col-span-12 md:col-span-6">
              <label class="block mb-1">Mensaje max</label>
              <InputText
                :model-value="String(columnaActual.maxMessage || '')"
                @update:model-value="(v: string | undefined) => actualizarColumna('maxMessage', v || '')"
              />
            </div>
          </template>
        </div>
      </div>
    </template>

    <!-- Configuración general de tabla -->
    <div class="mb-3">
      <div class="font-semibold mb-2">Configuración General</div>

      <!-- Permitir añadir filas -->
      <div class="field">
        <label class="inline-flex items-center gap-2">
          <Checkbox
            binary
            :model-value="Boolean(metadatos.mostrarResumen)"
            @update:model-value="(v: boolean) => actualizarMetadato('mostrarResumen', v)"
          />
          Permitir añadir filas
        </label>
      </div>

      <!-- Número de filas iniciales -->
      <div class="grid grid-cols-12 gap-3 items-end">
        <div class="col-span-12 md:col-span-4">
          <label class="block mb-1">Filas iniciales</label>
          <InputNumber
            :model-value="Number(metadatos.filas ?? 1)"
            :min="1"
            class="w-full"
            @update:model-value="(v: number | null) => actualizarMetadato('filas', Math.max(1, v ?? 1))"
          />
        </div>

        <div class="col-span-12 md:col-span-8">
          <small class="text-muted-color">
            Se aplicará al inicializar los datos o cuando estén vacíos.
          </small>
        </div>
      </div>
    </div>

    <!-- Estilo de tabla -->
    <div class="mb-3">
      <div class="font-semibold mb-2">Estilo de Tabla</div>
      <div class="grid grid-cols-12 gap-3">
        <div class="col-span-12 sm:col-span-3">
          <label class="inline-flex items-center gap-2">
            <Checkbox
              binary
              :model-value="Boolean(estiloTabla.bordered)"
              @update:model-value="(v: boolean) => actualizarEstiloTabla('bordered', v)"
            />
            Bordes
          </label>
        </div>

        <div class="col-span-12 sm:col-span-3">
          <label class="inline-flex items-center gap-2">
            <Checkbox
              binary
              :model-value="Boolean(estiloTabla.striped)"
              @update:model-value="(v: boolean) => actualizarEstiloTabla('striped', v)"
            />
            Zebra
          </label>
        </div>

        <div class="col-span-12 sm:col-span-3">
          <label class="inline-flex items-center gap-2">
            <Checkbox
              binary
              :model-value="Boolean(estiloTabla.hover)"
              @update:model-value="(v: boolean) => actualizarEstiloTabla('hover', v)"
            />
            Hover
          </label>
        </div>

        <div class="col-span-12 sm:col-span-3">
          <label class="block mb-1">Padding</label>
          <Select
            :model-value="estiloTabla.padding || 'md'"
            :options="opcionesPadding"
            @update:model-value="(v: TamañoPadding) => actualizarEstiloTabla('padding', v)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import draggable from 'vuedraggable'
import Select from 'primevue/select'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Checkbox from 'primevue/checkbox'
import Tag from 'primevue/tag'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import type { EsquemaCampo } from '@/interfaces/Campos'
import type { ColumnaTabla } from '@/interfaces/Comunes'

type TipoColumna = 'text' | 'number' | 'date'
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
const tiposColumna: TipoColumna[] = ['text', 'number', 'date']
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
  const columnas = meta.columns
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
  meta.columns = columnas
  almacen.actualizarCampo(props.campo.id, { metadatos: meta })
}

// Agregar nueva columna
function agregarColumna(): void {
  const columnas = obtenerColumnas()
  const nuevaColumna: ColumnaTabla = {
    id: `columna${columnas.length + 1}`,
    nombre: `columna${columnas.length + 1}`,
    etiqueta: `Columna ${columnas.length + 1}`,
    tipo: 'text',
    name: `columna${columnas.length + 1}`,
    label: `Columna ${columnas.length + 1}`,
    type: 'text'
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

