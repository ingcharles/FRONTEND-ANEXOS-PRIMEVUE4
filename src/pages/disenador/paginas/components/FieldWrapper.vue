<script setup lang="ts">
import type { FieldSchema } from '@/types/form-schema'
import { useDesignerStore } from '@/stores/useDesignerStore'
import { computed, defineAsyncComponent, ref } from 'vue'
import PrimeTag from 'primevue/tag'
import { usarPuntoDeCorte } from '@/composables/usarPuntoDeCorte'

const props = defineProps<{ field: FieldSchema; selected?: boolean }>()
const emit = defineEmits<{ (e: 'select'): void }>()

const store = useDesignerStore()
const { punto } = usarPuntoDeCorte()

const colActual = computed<number>({
  get() {
    const g = props.field.grid || {}
    if (punto.value === 'lg') return g.lg ?? g.md ?? g.sm ?? 12
    if (punto.value === 'md') return g.md ?? g.sm ?? 12
    return g.sm ?? 12
  },
  set(v: number) {
    const nuevo = Math.min(12, Math.max(1, Math.round(v)))
    const g = { ...(props.field.grid || {}) }
    if (punto.value === 'lg') g.lg = nuevo
    else if (punto.value === 'md') g.md = nuevo
    else g.sm = nuevo
    store.actualizarCampo(props.field.id, { grid: g })
  },
})

const conteoHijos = computed<number>(() =>
  props.field.type === 'panel' ? (props.field.children?.length ?? 0) : 0
)

const conteoOpciones = computed<number>(() => {
  if (!(props.field.type === 'select' || props.field.type === 'radio')) return 0
  const opts = (props.field.meta as Record<string, unknown> | undefined)?.options as unknown
  return Array.isArray(opts) ? opts.length : 0
})

// Valor actual persistido (Preview) o por defecto desde meta
const valorActual = computed<unknown>(() => {
  const meta = props.field.meta as Record<string, unknown> | undefined
  const defecto = meta?.valorPorDefecto
  const nombre = props.field.name
  if (!nombre) return defecto
  const paginaId = store.paginaActiva.id
  const mapa = store.obtenerValoresPagina(paginaId) as Record<string, unknown>
  const v = mapa[nombre]
  return v !== undefined ? v : defecto
})

const valorActualTexto = computed<string | undefined>(() => {
  const v = valorActual.value
  return v == null ? undefined : String(v)
})


const arrastrando = ref(false)
let inicioX = 0
let inicioCols = 0
const rootEl = ref<HTMLElement | null>(null)

function iniciarResize(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  arrastrando.value = true
  inicioX = e.clientX
  inicioCols = colActual.value
  window.addEventListener('mousemove', duranteResize)
  window.addEventListener('mouseup', finalizarResize)
}

function duranteResize(e: MouseEvent) {
  if (!arrastrando.value) return
  const deltaPx = e.clientX - inicioX
  // Aproximar 12 columnas al ancho del contenedor padre inmediato que tiene las clases col-*
  const nodo = rootEl.value
  const parent = nodo?.parentElement as HTMLElement | null
  const grid = parent?.parentElement as HTMLElement | null
  const ancho = grid?.clientWidth || parent?.clientWidth || window.innerWidth || 1200
  const pxPorCol = Math.max(40, Math.floor(ancho / 12))
  const deltaCols = Math.round(deltaPx / pxPorCol)
  colActual.value = inicioCols + deltaCols
}

function finalizarResize() {
  arrastrando.value = false
  window.removeEventListener('mousemove', duranteResize)
  window.removeEventListener('mouseup', finalizarResize)
}

// Soporte táctil
function iniciarResizeTouch(e: TouchEvent) {
  e.preventDefault()
  e.stopPropagation()
  const t = e.touches[0]
  if (!t) return
  arrastrando.value = true
  inicioX = t.clientX
  inicioCols = colActual.value
  window.addEventListener('touchmove', duranteResizeTouch, { passive: false })
  window.addEventListener('touchend', finalizarResizeTouch)
}

function duranteResizeTouch(e: TouchEvent) {
  if (!arrastrando.value) return
  const t = e.touches[0]
  if (!t) return
  const deltaPx = t.clientX - inicioX
  const nodo = rootEl.value
  const parent = nodo?.parentElement as HTMLElement | null
  const grid = parent?.parentElement as HTMLElement | null
  const ancho = grid?.clientWidth || parent?.clientWidth || window.innerWidth || 1200
  const pxPorCol = Math.max(40, Math.floor(ancho / 12))
  const deltaCols = Math.round(deltaPx / pxPorCol)
  colActual.value = inicioCols + deltaCols
}

function finalizarResizeTouch() {
  arrastrando.value = false
  window.removeEventListener('touchmove', duranteResizeTouch)
  window.removeEventListener('touchend', finalizarResizeTouch)
}

function seleccionar(): void {
  emit('select')
}

// Carga perezosa segura del contenedor de panel
const AsyncPanelContainer = defineAsyncComponent(() => import('./PanelContainer.vue'))
</script>

<template>
  <div
    ref="rootEl"
    class="border-round p-2 surface-card border-1 relative handler-mover"
    :class="{ 'border-primary border-2': selected }"
    role="button"
    tabindex="0"
    @click="seleccionar"
  >
    <!-- Badge informativo (superior derecha) con dos columnas: texto izquierda, acciones derecha -->
    <div v-if="selected" class="info-badge">
      <PrimeTag class="text-xs px-1 py-1 pointer-events-auto min-w-64" severity="primary">
        <div class="grid w-full align-items-start">
          <!-- Columna izquierda (8/12): textos -->
          <div class="col-8 flex flex-column gap-1 text-[10px]">
            <span class="font-medium">{{ `${field.type || field.label  }: ${field.id}` }}</span>
            <span class="font-medium ">{{ `${punto.toUpperCase()}: ${colActual} Cols` }}</span>
            <span class="font-medium text-red-500" v-if="field.type==='panel'">Elementos: {{ conteoHijos }}</span>
            <span class="font-medium" v-if="field.type==='select' || field.type==='radio'">Opciones: {{ conteoOpciones }}</span>
          </div>
          <!-- Columna derecha (4/12): acciones -->
          <div class="col-4 flex justify-content-end">
            <PrimeButton icon="pi pi-copy" text rounded size="small" class="p-0" title="Duplicar" @click.stop="store.duplicarCampo(field.id)" />
            <PrimeButton icon="pi pi-trash" text rounded size="small" class="p-0" severity="danger" title="Eliminar" @click.stop="store.eliminarCampo(field.id)" />
          </div>
        </div>
      </PrimeTag>
    </div>
    <!-- <div class="flex align-items-center justify-content-between mb-2">
      <div class="flex align-items-center gap-2">
        <strong>{{ field.label || field.type }}</strong>
      </div>
      <div class="flex" />
    </div> -->
    <!-- Render simple de ejemplo -->
    <div>
      <template v-if="field.type==='text' || field.type==='email' || field.type==='password'">
        <label class="block mb-1">{{ field.label }}<span v-if="field.required" class="text-red-500"> *</span></label>
        <PrimeInputText
          :model-value="valorActualTexto"
          :placeholder="field.placeholder"
          class="w-full"
          :disabled="field.disabled"
          :readonly="field.readonly"
        />
      </template>
      <template v-else-if="field.type==='date'">
        <label class="block mb-1">{{ field.label }}<span v-if="field.required" class="text-red-500"> *</span></label>
        <PrimeDatePicker
          class="w-full"
          :model-value="(valorActual instanceof Date) ? valorActual : (typeof valorActual==='string' && valorActual ? new Date(valorActual) : undefined)"
          :disabled="field.disabled"
        />
      </template>
      <template v-else-if="field.type==='time'">
        <label class="block mb-1">{{ field.label }}<span v-if="field.required" class="text-red-500"> *</span></label>
        <PrimeDatePicker
          time-only
          hour-format="24"
          class="w-full"
          :model-value="(typeof valorActual==='string' && /^([01]?\d|2[0-3]):([0-5]\d)$/.test(valorActual as any)) ? (()=>{ const [hh,mm] = String(valorActual).split(':'); const d = new Date(); d.setHours(Number(hh), Number(mm), 0, 0); return d; })() : undefined"
          :disabled="field.disabled"
        />
      </template>
      <template v-else-if="field.type==='textarea'">
        <label class="block mb-1">{{ field.label }}<span v-if="field.required" class="text-red-500"> *</span></label>
        <PrimeTextarea
          :model-value="valorActualTexto"
          :placeholder="field.placeholder"
          class="w-full"
          :disabled="field.disabled"
          :readonly="field.readonly"
        />
      </template>
      <template v-else-if="field.type==='select'">
        <label class="block mb-1">{{ field.label }}<span v-if="field.required" class="text-red-500"> *</span></label>
        <PrimeSelect
          class="w-full"
          :options="(field.meta?.options as Array<{ label: string; value: unknown }>) || []"
          option-label="label"
          option-value="value"
          :model-value="valorActual"
          :disabled="field.disabled"
        />
      </template>
      <template v-else-if="field.type==='number'">
        <label class="block mb-1">{{ field.label }}<span v-if="field.required" class="text-red-500"> *</span></label>
        <PrimeInputNumber
          class="w-full"
          :model-value="(valorActualTexto!=null && valorActualTexto!=='' && !Number.isNaN(Number(valorActualTexto))) ? Number(valorActualTexto) : undefined"
          :placeholder="field.placeholder"
          :disabled="field.disabled"
          :readonly="field.readonly"
        />
      </template>
      <template v-else-if="field.type==='checkbox'">
        <template v-if="Array.isArray((field.meta as any)?.options) && ((field.meta as any)?.options?.length||0) > 0">
          <label class="block mb-1">{{ field.label }}<span v-if="field.required" class="text-red-500"> *</span></label>
          <div :class="['flex', ((field.meta as any)?.layout==='horizontal' ? 'flex-row gap-3' : 'flex-column gap-2')]">
            <label v-for="op in ((field.meta?.options as any[])||[])" :key="String(op.value)" class="inline-flex align-items-center gap-2">
              <PrimeCheckbox :input-id="String(op.value)" :value="op.value" :model-value="[]" disabled />
              <span>{{ op.label }}</span>
            </label>
          </div>
        </template>
        <template v-else>
          <div class="flex align-items-center gap-2">
            <PrimeCheckbox :binary="true" :model-value="Boolean(valorActual)" :disabled="field.disabled" />
            <label class="mb-0">{{ field.label }}<span v-if="field.required" class="text-red-500"> *</span></label>
          </div>
        </template>
      </template>
      <template v-else-if="field.type==='radio'">
        <label class="block mb-1">{{ field.label }}<span v-if="field.required" class="text-red-500"> *</span></label>
        <div :class="['flex', ((field.meta as any)?.layout==='horizontal' ? 'flex-row gap-3' : 'flex-column gap-2')]">
          <label
            v-for="op in ((field.meta?.options as Array<{ label: string; value: unknown }>) || [])"
            :key="String(op.value)"
            class="inline-flex align-items-center gap-2"
          >
            <PrimeRadioButton :input-id="String(op.value)" :value="op.value" :name="field.name || ('radio_'+field.id)" :model-value="valorActual" :disabled="field.disabled" />
            <span>{{ op.label }}</span>
          </label>
        </div>
      </template>
      <template v-else-if="field.type==='label'">
        <div class="text-muted-color">{{ field.label }}</div>
      </template>
      <template v-else-if="field.type==='divider'">
        <PrimeDivider />
      </template>
      <template v-else-if="field.type==='button'">
        <PrimeButton :label="field.label || 'Botón'" />
      </template>
      <template v-else-if="field.type==='table'">
        <div class="border rounded-border p-2">
          <div class="font-semibold mb-2">Tabla</div>
          <div class="overflow-auto">
            <table class="w-full text-sm">
              <thead>
                <tr>
                  <th v-for="col in ((field.meta as any)?.columns||[])" :key="col.name" class="text-left p-2 border-bottom-1 surface-border">{{ col.label }}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td v-for="col in ((field.meta as any)?.columns||[])" :key="col.name" class="p-2">
                    <PrimeInputText v-if="(col.type||'text')==='text'" class="w-full" disabled placeholder="Texto" />
                    <PrimeInputNumber v-else-if="col.type==='number'" class="w-full" disabled placeholder="0" />
                    <span v-else class="text-muted-color">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="text-xs text-muted-color mt-2">Configura columnas y filas en Propiedades.</div>
        </div>
      </template>
      <template v-else-if="field.type==='panel'">
        <AsyncPanelContainer :field="field" />
      </template>
      <template v-else>
        <em>Tipo {{ field.type }} no implementado en mock</em>
      </template>
    </div>
    <!-- Handle de resize a la derecha -->
    <div
      class="resize-handle-right"
      title="Arrastrar para redimensionar"
      @mousedown="iniciarResize"
      @touchstart="iniciarResizeTouch"
      @click.stop
    />
  </div>
</template>

<style scoped>
.info-badge {
  position: absolute;
  top: 0;
  right: 0;
  margin: 0.25rem;
  display: inline-flex;
  gap: 0.25rem;
  align-items: center;
  padding: 0.125rem;
  pointer-events: none;
  z-index: 1;
}

.resize-handle-right {
  position: absolute;
  top: 0;
  right: -6px;
  width: 12px;
  height: 100%;
  cursor: col-resize;
  display: inline-block;
}

/* Indicador visual al pasar el mouse */
.resize-handle-right::after {
  content: '';
  position: absolute;
  top: 25%;
  bottom: 25%;
  left: 4px;
  width: 4px;
  border-radius: 2px;
  background: var(--p-primary-300);
  opacity: 0.7;
}
</style>
