<script setup lang="ts">
import type { EsquemaCampo } from '@/interfaces/Campos'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import { computed, defineAsyncComponent, ref, onUnmounted } from 'vue'
import ModalConfirmar from '@/componentes/ModalConfirmar.vue'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import DatePicker from 'primevue/datepicker'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import InputNumber from 'primevue/inputnumber'
import Checkbox from 'primevue/checkbox'
import RadioButton from 'primevue/radiobutton'
import Divider from 'primevue/divider'
import { ServicioCampos } from '@/servicios/disenador/ServiciosCampos'
import { usarPuntoDeCorte } from '@/almacenes/UsarPuntoDeCorte'

const propiedades = defineProps<{ campo: EsquemaCampo; seleccionado?: boolean }>()
const emitir = defineEmits<{ (e: 'seleccionar'): void }>()

const almacen = useAlmacenDisenador()
const { punto } = usarPuntoDeCorte()

// Alias para el template
const campo = computed(() => propiedades.campo)

const columnaActual = computed<number>({
  get() {
    const g = propiedades.campo.grid || {}
    if (punto.value === 'lg') return g.lg ?? g.md ?? g.sm ?? 12
    if (punto.value === 'md') return g.md ?? g.sm ?? 12
    return g.sm ?? 12
  },
  set(v: number) {
    const nuevo = Math.min(12, Math.max(1, Math.round(v)))
    const g = { ...(propiedades.campo.grid || {}) }
    if (punto.value === 'lg') g.lg = nuevo
    else if (punto.value === 'md') g.md = nuevo
    else g.sm = nuevo
    almacen.actualizarCampo(propiedades.campo.id, { grid: g })
  },
})

const conteoHijos = computed<number>(() =>
  propiedades.campo.tipo === 'panel' ? (propiedades.campo.hijos?.length ?? 0) : 0
)

const conteoOpciones = computed<number>(() => {
  if (!ServicioCampos.soportaOpciones(propiedades.campo.tipo)) return 0
  const opciones = (propiedades.campo.metadatos as Record<string, unknown> | undefined)?.opciones as unknown
  return Array.isArray(opciones) ? opciones.length : 0
})

// Valor actual persistido (Preview) o por defecto desde meta
const valorActual = computed<unknown>(() => {
  const metadatos = propiedades.campo.metadatos as Record<string, unknown> | undefined
  const porDefecto = metadatos?.valorPorDefecto
  const nombre = propiedades.campo.nombre
  if (!nombre) return porDefecto
  const paginaId = almacen.paginaActiva?.id ?? almacen.esquemaFormulario.paginas[almacen.indicePaginaActiva]?.id
  if (!paginaId) return porDefecto
  const mapa = almacen.obtenerValoresPagina(paginaId) as Record<string, unknown>
  const v = mapa[nombre]
  return v !== undefined ? v : porDefecto
})

const valorActualTexto = computed<string | undefined>(() => {
  const v = valorActual.value
  return v == null ? undefined : String(v)
})

const arrastrando = ref(false)
let inicioX = 0
let columnasIniciales = 0
const elementoRaiz = ref<HTMLElement | null>(null)

// Helpers internos (DRY)
function getAnchoContenedor(nodo: HTMLElement | null): number {
  const padre = nodo?.parentElement as HTMLElement | null
  const grilla = padre?.parentElement as HTMLElement | null
  return grilla?.clientWidth || padre?.clientWidth || window.innerWidth || 1200
}

function actualizarColumnasDesdeDelta(deltaPx: number) {
  const nodo = elementoRaiz.value
  if (!nodo) return
  const ancho = getAnchoContenedor(nodo)
  const pxPorColumna = Math.max(40, Math.floor(ancho / 12))
  const deltaColumnas = Math.round(deltaPx / pxPorColumna)
  columnaActual.value = columnasIniciales + deltaColumnas
}

function iniciarRedimensionar(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  arrastrando.value = true
  inicioX = e.clientX
  columnasIniciales = columnaActual.value
  window.addEventListener('mousemove', duranteRedimensionar)
  window.addEventListener('mouseup', finalizarRedimensionar)
}

function duranteRedimensionar(e: MouseEvent) {
  if (!arrastrando.value) return
  if (!elementoRaiz.value) return finalizarRedimensionar()
  actualizarColumnasDesdeDelta(e.clientX - inicioX)
}

function finalizarRedimensionar() {
  arrastrando.value = false
  window.removeEventListener('mousemove', duranteRedimensionar)
  window.removeEventListener('mouseup', finalizarRedimensionar)
}

// Soporte táctil
function iniciarRedimensionarTactil(e: TouchEvent) {
  e.preventDefault()
  e.stopPropagation()
  const t = e.touches[0]
  if (!t) return
  arrastrando.value = true
  inicioX = t.clientX
  columnasIniciales = columnaActual.value
  window.addEventListener('touchmove', duranteRedimensionarTactil, { passive: false })
  window.addEventListener('touchend', finalizarRedimensionarTactil)
}

function duranteRedimensionarTactil(e: TouchEvent) {
  if (!arrastrando.value) return
  const t = e.touches[0]
  if (!t) return
  if (!elementoRaiz.value) return finalizarRedimensionarTactil()
  actualizarColumnasDesdeDelta(t.clientX - inicioX)
}

function finalizarRedimensionarTactil() {
  arrastrando.value = false
  window.removeEventListener('touchmove', duranteRedimensionarTactil)
  window.removeEventListener('touchend', finalizarRedimensionarTactil)
}

function seleccionar(): void {
  emitir('seleccionar')
}

// Cleanup de event listeners cuando el componente se desmonta
onUnmounted(() => {
  if (arrastrando.value) {
    window.removeEventListener('mousemove', duranteRedimensionar)
    window.removeEventListener('mouseup', finalizarRedimensionar)
    window.removeEventListener('touchmove', duranteRedimensionarTactil)
    window.removeEventListener('touchend', finalizarRedimensionarTactil)
  }
})

// Carga perezosa segura del contenedor de panel
const ContenedorPanelAsincrono = defineAsyncComponent(() => import('./ContenedorPanel.vue'))
</script>

<template>
  <div
    ref="elementoRaiz"
    class="border-round p-2 surface-card border-1 relative handler-mover"
    :class="{ 'border-primary border-2': seleccionado }"
    role="button"
    tabindex="0"
    @click="seleccionar"
  >
    <!-- Badge informativo (superior derecha) con dos columnas: texto izquierda, acciones derecha -->
    <div v-if="seleccionado" class="info-badge">
      <Tag class="text-xs px-1 py-1 pointer-events-auto min-w-64" severity="primary">
        <div class="grid w-full align-items-start">
          <!-- Columna izquierda (8/12): textos -->
          <div class="col-8 flex flex-column gap-1 text-[10px]">
            <span class="font-medium">{{ `${campo.tipo || campo.etiqueta}: ${campo.id}` }}</span>
            <span class="font-medium">{{ `${punto.toUpperCase()}: ${columnaActual} Cols` }}</span>
            <span class="font-medium text-red-500" v-if="campo.tipo==='panel'">Elementos: {{ conteoHijos }}</span>
            <span class="font-medium" v-if="ServicioCampos.soportaOpciones(campo.tipo)">Opciones: {{ conteoOpciones }}</span>
          </div>
          <!-- Columna derecha (4/12): acciones -->
          <div class="col-4 flex justify-content-end">
            <Button icon="pi pi-copy" text rounded size="small" class="p-0" title="Duplicar" @click.stop="almacen.duplicarCampo(campo.id)" />
            <Button icon="pi pi-trash" text rounded size="small" class="p-0" severity="danger" title="Eliminar" @click.stop="almacen.confirmarEliminarCampo(campo.id)" />
          </div>
        </div>
      </Tag>
    </div>

    <!-- Render simple de ejemplo -->
    <div>
      <template v-if="campo.tipo==='texto' || campo.tipo==='correo' || campo.tipo==='contrasena'">
        <label class="block mb-1">{{ campo.etiqueta }}<span v-if="campo.requerido" class="text-red-500"> *</span></label>
        <InputText
          :model-value="valorActualTexto"
          :placeholder="campo.marcadorPosicion"
          class="w-full"
          :disabled="campo.deshabilitado"
          :readonly="campo.soloLectura"
        />
      </template>
      <template v-else-if="campo.tipo==='fecha'">
        <label class="block mb-1">{{ campo.etiqueta }}<span v-if="campo.requerido" class="text-red-500"> *</span></label>
        <DatePicker
          class="w-full"
          :model-value="(valorActual instanceof Date) ? valorActual : (typeof valorActual==='string' && valorActual ? new Date(valorActual) : undefined)"
          :disabled="campo.deshabilitado"
        />
      </template>
      <template v-else-if="campo.tipo==='hora'">
        <label class="block mb-1">{{ campo.etiqueta }}<span v-if="campo.requerido" class="text-red-500"> *</span></label>
        <DatePicker
          time-only
          hour-format="24"
          class="w-full"
          :model-value="(typeof valorActual==='string' && /^([01]?\d|2[0-3]):([0-5]\d)$/.test(valorActual as any)) ? (()=>{ const [hh,mm] = String(valorActual).split(':'); const d = new Date(); d.setHours(Number(hh), Number(mm), 0, 0); return d; })() : undefined"
          :disabled="campo.deshabilitado"
        />
      </template>
      <template v-else-if="campo.tipo==='area-texto'">
        <label class="block mb-1">{{ campo.etiqueta }}<span v-if="campo.requerido" class="text-red-500"> *</span></label>
        <Textarea
          :model-value="valorActualTexto"
          :placeholder="campo.marcadorPosicion"
          class="w-full"
          :disabled="campo.deshabilitado"
          :readonly="campo.soloLectura"
        />
      </template>
      <template v-else-if="campo.tipo==='seleccion'">
        <label class="block mb-1">{{ campo.etiqueta }}<span v-if="campo.requerido" class="text-red-500"> *</span></label>
        <Select
          class="w-full"
          :options="(campo.metadatos?.opciones as Array<{ etiqueta: string; valor: unknown }>) || []"
          option-label="etiqueta"
          option-value="valor"
          :model-value="valorActual"
          :disabled="campo.deshabilitado || (Boolean((campo.metadatos as any)?.dependencia?.deshabilitarHastaValor) && !String((campo.metadatos as any)?.dependencia?.campoPadre || '').split(',').map((s:string)=>s.trim()).filter(Boolean).every((padre: string) => {
            const pid = almacen.paginaActiva?.id ?? almacen.esquemaFormulario.paginas[almacen.indicePaginaActiva]?.id
            return pid ? almacen.obtenerValoresPagina(pid)[padre] : undefined
          }))"
        />
      </template>
      <template v-else-if="campo.tipo==='numero'">
        <label class="block mb-1">{{ campo.etiqueta }}<span v-if="campo.requerido" class="text-red-500"> *</span></label>
        <InputNumber
          class="w-full"
          :model-value="(valorActualTexto!=null && valorActualTexto!=='' && !Number.isNaN(Number(valorActualTexto))) ? Number(valorActualTexto) : undefined"
          :placeholder="campo.marcadorPosicion"
          :disabled="campo.deshabilitado"
          :readonly="campo.soloLectura"
        />
      </template>
      <template v-else-if="campo.tipo==='casilla'">
        <template v-if="Array.isArray((campo.metadatos as any)?.opciones) && ((campo.metadatos as any)?.opciones?.length||0) > 0">
          <label class="block mb-1">{{ campo.etiqueta }}<span v-if="campo.requerido" class="text-red-500"> *</span></label>
          <div :class="[
            'flex',
            ((campo.metadatos as any)?.layout==='horizontal' ? 'flex-row flex-wrap gap-3' : 'flex-column gap-2')
          ]">
            <label v-for="op in ((campo.metadatos?.opciones as any[])||[])" :key="String(op.valor)" class="inline-flex align-items-center gap-2 flex-shrink-0">
              <Checkbox :input-id="String(op.valor)" :value="op.valor" :model-value="[]" disabled />
              <span>{{ op.etiqueta }}</span>
            </label>
          </div>
        </template>
        <template v-else>
          <div class="flex align-items-center gap-2">
            <Checkbox :binary="true" :model-value="Boolean(valorActual)" :disabled="campo.deshabilitado" />
            <label class="mb-0">{{ campo.etiqueta }}<span v-if="campo.requerido" class="text-red-500"> *</span></label>
          </div>
        </template>
      </template>
      <template v-else-if="campo.tipo==='radio'">
        <label class="block mb-1">{{ campo.etiqueta }}<span v-if="campo.requerido" class="text-red-500"> *</span></label>
        <div :class="[
          'flex',
          ((campo.metadatos as any)?.layout==='horizontal' ? 'flex-row flex-wrap gap-3' : 'flex-column gap-2')
        ]">
          <label
            v-for="op in ((campo.metadatos?.opciones as Array<{ etiqueta: string; valor: unknown }>) || [])"
            :key="String(op.valor)"
            class="inline-flex align-items-center gap-2 flex-shrink-0"
          >
            <RadioButton :input-id="String(op.valor)" :value="op.valor" :name="campo.nombre || ('radio_'+campo.id)" :model-value="valorActual" :disabled="campo.deshabilitado" />
            <span>{{ op.etiqueta }}</span>
          </label>
        </div>
      </template>
      <template v-else-if="campo.tipo==='etiqueta'">
        <div class="text-muted-color">{{ campo.etiqueta }}</div>
      </template>
      <template v-else-if="campo.tipo==='divisor'">
        <Divider />
      </template>
      <template v-else-if="campo.tipo==='boton'">
        <Button :label="campo.etiqueta || 'Botón'" />
      </template>
      <template v-else-if="campo.tipo==='tabla'">
        <div class="border rounded-border p-2">
          <div class="font-semibold mb-2">Tabla</div>
          <div class="overflow-auto">
            <table class="w-full text-sm">
              <thead>
                <tr>
                  <th v-for="col in ((campo.metadatos as any)?.columnas||[])" :key="col.nombre" class="text-left p-2 border-bottom-1 surface-border">{{ col.etiqueta }}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td v-for="col in ((campo.metadatos as any)?.columnas||[])" :key="col.nombre" class="p-2">
                    <InputText v-if="(col.tipo||'texto')==='texto'" class="w-full" disabled placeholder="Texto" />
                    <InputNumber v-else-if="col.tipo==='numero'" class="w-full" disabled placeholder="0" />
                    <span v-else class="text-muted-color">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="text-xs text-muted-color mt-2">Configura columnas y filas en Propiedades.</div>
        </div>
      </template>
      <template v-else-if="campo.tipo==='panel'">
        <ContenedorPanelAsincrono :campo="campo" />
      </template>
      <template v-else>
        <em>Tipo {{ campo.tipo }} no implementado en mock</em>
      </template>
    </div>
    <!-- Handle de resize a la derecha -->
    <div
      class="resize-handle-right"
      title="Arrastrar para redimensionar"
      @mousedown="iniciarRedimensionar"
      @touchstart="iniciarRedimensionarTactil"
      @click.stop
    />

    <!-- Modal de confirmación para eliminar -->
    <ModalConfirmar
      :visible="almacen.mostrarModalEliminarCampo"
      :message="almacen.mensajeConfirmacionCampo"
      @confirm="almacen.ejecutarEliminarCampo"
      @cancel="almacen.cancelarEliminarCampo"
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

