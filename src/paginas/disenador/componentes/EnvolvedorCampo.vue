<script setup lang="ts">
import type { EsquemaCampo } from '@/interfaces/Campos'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import { computed, defineAsyncComponent, ref, onUnmounted } from 'vue'
import ModalConfirmar from '@/componentes/ModalConfirmar.vue'
import { ServicioCampos } from '@/servicios/disenador/ServiciosCampos'
import { usarPuntoDeCorte } from '@/almacenes/UsarPuntoDeCorte'
import { TipoCampoValor } from '@/enumeraciones/Campos'
import ContenedorPanel from '@paginas/disenador/componentes/ContenedorPanel.vue'

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
  propiedades.campo.tipo === TipoCampoValor.Panel ? (propiedades.campo.hijos?.length ?? 0) : 0
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

const esCampoRequerido = computed<boolean>(() => {
  return propiedades.campo.requerido || propiedades.campo.validaciones?.some(v => v.tipo === 'requerido') || false
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
//const ContenedorPanelAsincrono = defineAsyncComponent(ContenedorPanel)

// Funciones helper para estilos de tabla en el diseñador
function obtenerEstiloTablaDisenador(campo: EsquemaCampo) {
  const metadatos = campo.metadatos as Record<string, unknown> | undefined
  const estiloTabla = (metadatos?.estiloTabla as Record<string, unknown>) || {}

  return {
    conBordes: !!estiloTabla.bordered,
    conRayas: !!estiloTabla.striped,
    conHover: !!estiloTabla.hover,
    relleno: (estiloTabla.padding as string) || 'md'
  }
}

function obtenerClasesTablaCompleta(campo: EsquemaCampo): string[] {
  const estilo = obtenerEstiloTablaDisenador(campo)
  return [
    'tabla-disenador',
    'ancho-100 tamanio-fuente-miga',
    estilo.conBordes ? 'con-bordes' : ''
  ].filter(Boolean)
}

function obtenerClasesCeldaDisenador(campo: EsquemaCampo, esHeader: boolean): string[] {
  const estilo = obtenerEstiloTablaDisenador(campo)
  const clasesRelleno = obtenerClaseRellenoDisenador(estilo.relleno)

  return [
    clasesRelleno
  ].filter(Boolean)
}

function obtenerClasesFilaCompleta(campo: EsquemaCampo, indice: number): string[] {
  const estilo = obtenerEstiloTablaDisenador(campo)
  const clases = []

  if (estilo.conRayas) {
    clases.push('con-rayas')
  }

  if (estilo.conHover) {
    clases.push('con-hover')
  }

  return clases
}

function obtenerClaseRellenoDisenador(relleno: string): string {
  switch (relleno) {
    case 'sm': return 'p-1'
    case 'lg': return 'p-3'
    case 'md':
    default: return 'p-2'
  }
}
</script>

<template>
  <div ref="elementoRaiz" class="p-2 border-1 relative" :class="{ 'border-primary border-2': seleccionado }"
    role="button" tabindex="0" @click="seleccionar">
    <!-- Badge informativo (superior derecha) con dos columnas: texto izquierda, acciones derecha -->
    <div v-if="seleccionado" class="informacion-redimension">
      <PrimeTag class="text-xs px-1 py-1 pointer-events-auto informacion-redimension-tag" severity="primary">
        <div class="grid ancho-100 align-items-start">
          <!-- Columna izquierda (8/12): textos -->
          <div class="col-8 flex flex-column">
            <span class="titulo">{{ `${punto}: ${columnaActual} Columnas` }}</span>
            <span class="color-rojo tamanio-fuente-miga" v-if="campo.tipo === 'panel'">Elementos: {{ conteoHijos
              }}</span>
            <span class="color-rojo tamanio-fuente-miga" v-if="ServicioCampos.soportaOpciones(campo.tipo)">Opciones: {{
              conteoOpciones }}</span>
          </div>
          <!-- Columna derecha (4/12): acciones -->
          <div class="col-4 flex justify-content-end gap-1 pb-0">
            <PrimeButton icon="pi pi-copy" rounded class="boton-pequenio" severity="info" title="Duplicar"
              @click.stop="almacen.duplicarCampo(campo.id)" />
            <PrimeButton icon="pi pi-trash" rounded class="boton-pequenio" severity="info" title="Eliminar"
              @click.stop="almacen.confirmarEliminarCampo(campo.id)" />
          </div>
        </div>
      </PrimeTag>
    </div>

    <!-- Render simple de ejemplo -->
    <div>
      <template
        v-if="campo.tipo === TipoCampoValor.Texto || campo.tipo === TipoCampoValor.Correo || campo.tipo === TipoCampoValor.Contrasena">
        <label class="block mb-1"><span v-if="esCampoRequerido" class="color-rojo">* </span>{{ campo.etiqueta }}</label>
        <PrimeInputText :model-value="valorActualTexto" :placeholder="campo.marcadorPosicion"
          class="ancho-100 tamanio-fuente-miga" :disabled="campo.deshabilitado" :readonly="campo.soloLectura" />
      </template>
      <template v-else-if="campo.tipo === TipoCampoValor.Fecha">
        <label class="block mb-1"><span v-if="esCampoRequerido" class="color-rojo">* </span>{{ campo.etiqueta }}</label>
        <PrimeInputText class="ancho-100 tamanio-fuente-miga"
          :model-value="(valorActual instanceof Date) ? valorActual : (typeof valorActual === 'string' && valorActual ? new Date(valorActual) : undefined)"
          :disabled="campo.deshabilitado" />
      </template>
      <template v-else-if="campo.tipo === TipoCampoValor.Hora">
        <label class="block mb-1"><span v-if="esCampoRequerido" class="color-rojo">* </span>{{ campo.etiqueta }}</label>
        <PrimeDatePicker time-only hour-format="24" class="ancho-100 tamanio-fuente-miga"
          :model-value="(typeof valorActual === 'string' && /^([01]?\d|2[0-3]):([0-5]\d)$/.test(valorActual as any)) ? (() => { const [hh, mm] = String(valorActual).split(':'); const d = new Date(); d.setHours(Number(hh), Number(mm), 0, 0); return d; })() : undefined"
          :disabled="campo.deshabilitado" />
      </template>
      <template v-else-if="campo.tipo === TipoCampoValor.AreaTexto">
        <label class="block mb-1"><span v-if="esCampoRequerido" class="color-rojo">* </span>{{ campo.etiqueta }}</label>
        <PrimeTextarea :model-value="valorActualTexto" :placeholder="campo.marcadorPosicion"
          class="ancho-100 tamanio-fuente-miga" :disabled="campo.deshabilitado" :readonly="campo.soloLectura" />
      </template>
      <template v-else-if="campo.tipo === TipoCampoValor.Seleccion">
        <label class="block mb-1"><span v-if="esCampoRequerido" class="color-rojo">* </span>{{ campo.etiqueta }}</label>
        <PrimeSelect class="ancho-100 tamanio-fuente-miga"
          :options="(campo.metadatos?.opciones as Array<{ etiqueta: string; valor: unknown }>) || []"
          option-label="etiqueta" option-value="valor" :model-value="valorActual" :disabled="campo.deshabilitado || (Boolean((campo.metadatos as any)?.dependencia?.deshabilitarHastaValor) && !String((campo.metadatos as any)?.dependencia?.campoPadre || '').split(',').map((s: string) => s.trim()).filter(Boolean).every((padre: string) => {
            const pid = almacen.paginaActiva?.id ?? almacen.esquemaFormulario.paginas[almacen.indicePaginaActiva]?.id
            return pid ? almacen.obtenerValoresPagina(pid)[padre] : undefined
          }))" />
      </template>
      <template v-else-if="campo.tipo === TipoCampoValor.Numero">
        <label class="block mb-1"><span v-if="esCampoRequerido" class="color-rojo">* </span>{{ campo.etiqueta }}</label>
        <PrimeInputNumber class="ancho-100 tamanio-fuente-miga"
          :model-value="(valorActualTexto != null && valorActualTexto !== '' && !Number.isNaN(Number(valorActualTexto))) ? Number(valorActualTexto) : undefined"
          :placeholder="campo.marcadorPosicion" :disabled="campo.deshabilitado" :readonly="campo.soloLectura" />
      </template>
      <template v-else-if="campo.tipo === TipoCampoValor.Casilla">
        <template
          v-if="Array.isArray((campo.metadatos as any)?.opciones) && ((campo.metadatos as any)?.opciones?.length || 0) > 0">
          <label class="block mb-1"><span v-if="esCampoRequerido" class="color-rojo">
          * </span>{{ campo.etiqueta }}</label>
          <div :class="[
            'flex',
            ((campo.metadatos as any)?.layout === 'horizontal' ? 'flex-row flex-wrap gap-3' : 'flex-column gap-2')
          ]">
            <label v-for="op in ((campo.metadatos?.opciones as any[]) || [])" :key="String(op.valor)"
              class="inline-flex align-items-center gap-2 flex-shrink-0">
              <PrimeCheckbox :input-id="String(op.valor)" :value="op.valor" :model-value="[]" disabled />
              <span>{{ op.etiqueta }}</span>
            </label>
          </div>
        </template>
        <template v-else>
          <div class="flex align-items-center gap-2">
            <PrimeCheckbox :binary="true" :model-value="Boolean(valorActual)" :disabled="campo.deshabilitado" />
            <label class="mb-0"><span v-if="esCampoRequerido" class="color-rojo">* </span>{{ campo.etiqueta }}</label>
          </div>
        </template>
      </template>
      <template v-else-if="campo.tipo === TipoCampoValor.Radio">
        <label class="block mb-1"><span v-if="esCampoRequerido" class="color-rojo">* </span>{{ campo.etiqueta }}</label>
        <div :class="[
          'flex',
          ((campo.metadatos as any)?.layout === 'horizontal' ? 'flex-row flex-wrap gap-3' : 'flex-column gap-2')
        ]">
          <label v-for="op in ((campo.metadatos?.opciones as Array<{ etiqueta: string; valor: unknown }>) || [])"
            :key="String(op.valor)" class="inline-flex align-items-center gap-2 flex-shrink-0">
            <PrimeRadioButton :input-id="String(op.valor)" :value="op.valor"
              :name="campo.nombre || ('radio_' + campo.id)" :model-value="valorActual"
              :disabled="campo.deshabilitado" />
            <span>{{ op.etiqueta }}</span>
          </label>
        </div>
      </template>
      <template v-else-if="campo.tipo === TipoCampoValor.Etiqueta">
        <div class="color-negro">{{ campo.etiqueta }}</div>
      </template>
      <template v-else-if="campo.tipo === TipoCampoValor.Divisor">
        <PrimeDivider class="my-3" />
      </template>
      <template v-else-if="campo.tipo === TipoCampoValor.Boton">
        <PrimeButton :label="campo.etiqueta || 'Botón'" />
      </template>
      <template v-else-if="campo.tipo === TipoCampoValor.Tabla">
        <div class="m-2">
          <div class="negrilla mb-2">Tabla</div>
          <div class="overflow-auto">
            <table :class="obtenerClasesTablaCompleta(campo)">
              <thead>
                <tr>
                  <th v-for="col in ((campo.metadatos as any)?.columnas || [])" :key="col.nombre || col.name"
                    :class="obtenerClasesCeldaDisenador(campo, true)">
                    {{ col.etiqueta || col.label || col.nombre || col.name }}
                  </th>
                  <!-- Columna de acciones si se permite eliminar filas -->
                  <th v-if="(campo.metadatos as any)?.eliminarFilas" :class="obtenerClasesCeldaDisenador(campo, true)"
                    style="width: 60px;">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(fila, indice) in Array.from({ length: Number((campo.metadatos as any)?.filas || 1) })"
                  :key="indice" :class="obtenerClasesFilaCompleta(campo, indice)">
                  <td v-for="col in ((campo.metadatos as any)?.columnas || [])" :key="col.nombre || col.name"
                    :class="obtenerClasesCeldaDisenador(campo, false)">
                    <PrimeInputText v-if="col.tipo === TipoCampoValor.Texto" class="ancho-100 tamanio-fuente-miga"
                      disabled placeholder="Texto" />
                    <PrimeInputNumber v-else-if="col.tipo === TipoCampoValor.Numero"
                      class="ancho-100 tamanio-fuente-miga" disabled placeholder="0" />
                    <PrimeDatePicker v-else-if="col.tipo === TipoCampoValor.Fecha" class="ancho-100 tamanio-fuente-miga"
                      disabled />
                    <span v-else class="color-negro">—</span>
                  </td>
                  <!-- Columna de acciones para eliminar fila -->
                  <td v-if="(campo.metadatos as any)?.eliminarFilas"
                    :class="[obtenerClasesCeldaDisenador(campo, false), 'text-center']">
                    <PrimeButton icon="pi pi-trash" severity="danger" size="small" text rounded disabled />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="mt-2 flex gap-2">
            <PrimeButton v-if="(campo.metadatos as any)?.agregarFilas" label="Añadir fila" icon="pi pi-plus"
              size="small" disabled />
          </div>
          <div class="text-xs color-negro mt-2">
            Filas: {{ Number((campo.metadatos as any)?.filas || 1) }} |
            Columnas: {{ ((campo.metadatos as any)?.columnas || []).length }}
            <span v-if="(campo.metadatos as any)?.agregarFilas"> | ✅ Añadir</span>
            <span v-if="(campo.metadatos as any)?.eliminarFilas"> | 🗑️ Eliminar</span>
            <br>
            <span class="text-xs">
              Estilos:
              <span v-if="obtenerEstiloTablaDisenador(campo).conBordes">🔲 Bordes</span>
              <span v-if="obtenerEstiloTablaDisenador(campo).conRayas"> 🦓 Zebra</span>
              <span v-if="obtenerEstiloTablaDisenador(campo).conHover"> 👆 Hover</span>
              <span v-if="obtenerEstiloTablaDisenador(campo).relleno"> | Padding: {{
                obtenerEstiloTablaDisenador(campo).relleno.toUpperCase() }}</span>
            </span>
          </div>

        </div>
      </template>
      <template v-else-if="campo.tipo === 'panel'">
        <ContenedorPanel :campo="campo" />
      </template>
      <template v-else>
        <em>Tipo {{ campo.tipo }} no implementado en mock</em>
      </template>
    </div>
    <!-- Handle de resize a la derecha -->
    <div class="manejador-redimension-derecha" title="Arrastrar para redimensionar" @mousedown="iniciarRedimensionar"
      @touchstart="iniciarRedimensionarTactil" @click.stop />

    <!-- Modal de confirmación para eliminar -->
    <ModalConfirmar :visible="almacen.mostrarModalEliminarCampo" :message="almacen.mensajeConfirmacionCampo"
      @confirm="almacen.ejecutarEliminarCampo" @cancel="almacen.cancelarEliminarCampo" />
  </div>
</template>

<style scoped>
/* Estilos para tabla en el diseñador */
.tabla-disenador {
  border-collapse: collapse;
}

.tabla-disenador.con-bordes {
  border: 1px solid var(--surface-300);
}

.tabla-disenador th,
.tabla-disenador td {
  border: none;
}

.tabla-disenador.con-bordes th,
.tabla-disenador.con-bordes td {
  border-bottom: 1px solid var(--surface-300);
}

.tabla-disenador tr.con-rayas:nth-child(even) {
  background-color: var(--surface-50);
}

.tabla-disenador tr.con-hover:hover {
  background-color: var(--surface-100);
}

.tabla-disenador th {
  background-color: var(--surface-50);
  font-weight: bold;
  text-align: left;
}
</style>
