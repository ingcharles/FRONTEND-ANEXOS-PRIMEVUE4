<script setup lang="ts">
import type { FieldSchema } from '@/types/form-schema'
import { useDesignerStore } from '@/stores/useDesignerStore'
import { computed, ref } from 'vue'
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
</script>

<template>
  <div
    ref="rootEl"
    class="border-round p-2 surface-card border-1 relative"
    :class="{ 'border-primary border-2': selected }"
    role="button"
    tabindex="0"
    @click="seleccionar"
  >
    <div class="flex align-items-center justify-content-between mb-2">
      <div class="flex align-items-center gap-2">
        <span class="handler-mover pi pi-arrows-alt" title="Mover" />
        <strong>{{ field.label || field.type }}</strong>
      </div>
      <div class="flex gap-2">
        <PrimeButton icon="pi pi-copy" text rounded v-tooltip.top="'Duplicar'" @click.stop="store.duplicarCampo(field.id)" />
        <PrimeButton icon="pi pi-trash" text rounded severity="danger" v-tooltip.top="'Eliminar'" @click.stop="store.eliminarCampo(field.id)" />
      </div>
    </div>
    <!-- Render simple de ejemplo -->
    <div>
      <template v-if="field.type==='text' || field.type==='email' || field.type==='password'">
        <label class="block mb-1">{{ field.label }}</label>
        <PrimeInputText :placeholder="field.placeholder" class="w-full" />
      </template>
      <template v-else-if="field.type==='time'">
        <label class="block mb-1">{{ field.label }}</label>
        <PrimeCalendar time-only hour-format="24" class="w-full" />
      </template>
      <template v-else-if="field.type==='textarea'">
        <label class="block mb-1">{{ field.label }}</label>
        <PrimeTextarea :placeholder="field.placeholder" class="w-full" />
      </template>
      <template v-else-if="field.type==='select'">
        <label class="block mb-1">{{ field.label }}</label>
        <PrimeDropdown class="w-full" :options="(field.meta?.options as any[])||[]" option-label="label" option-value="value" />
      </template>
      <template v-else-if="field.type==='radio'">
        <label class="block mb-1">{{ field.label }}</label>
        <div class="flex gap-3">
          <label v-for="op in ((field.meta?.options as any[])||[])" :key="op.value" class="inline-flex align-items-center gap-2">
            <PrimeRadioButton :input-id="String(op.value)" :value="op.value" name="radio-demo" />
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
          <div class="font-semibold mb-2">Tabla (mock)</div>
          <div class="text-sm text-muted-color">Configura columnas en Propiedades</div>
        </div>
      </template>
      <template v-else-if="field.type==='panel'">
        <component :is="() => import('./PanelContainer.vue')" :field="field" />
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
