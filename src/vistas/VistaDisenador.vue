<script setup lang="ts">
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import PanelPaleta from '@/paginas/disenador/componentes/PanelPaleta.vue'
import LienzoPagina from '@/paginas/disenador/componentes/LienzoPagina.vue'
import TabsPropiedades from '@/paginas/disenador/componentes/TabsPropiedades.vue'
import VistaPrevia from '@/paginas/disenador/componentes/VistaPrevia.vue'
import VistaJson from '@/paginas/disenador/componentes/VistaJson.vue'
import ModalConfirmar from '@/componentes/ModalConfirmar.vue'
import { ref, computed, nextTick } from 'vue'
import { z } from 'zod'
import type { EsquemaCampo } from '@/interfaces/Campos'
import { evaluarReglasCampo } from '@/utilidades/Logica'
import type { RegistroDatos } from '@/tipos/Comunes'

const almacen = useAlmacenDisenador()

const paginaActual = computed(() => almacen.esquemaFormulario.paginas[almacen.indicePaginaActiva])
const totalPaginas = computed(() => almacen.esquemaFormulario.paginas.length)
const pestana = ref<string>('disenador')

// Estado para edición de título de página
const editandoTitulo = ref(false)
const tituloTemporal = ref('')

const tabTitles = [
  { value: 'disenador', label: 'Diseñador', icon: 'pi pi-sitemap' },
  { value: 'preview', label: 'Vista previa', icon: 'pi pi-eye' },
  { value: 'json', label: 'JSON', icon: 'pi pi-code' },
]

// Función para iniciar edición del título
function iniciarEdicionTitulo(): void {
  if (paginaActual.value) {
    tituloTemporal.value = paginaActual.value.titulo || `Página ${almacen.indicePaginaActiva + 1}`
    editandoTitulo.value = true
    // Enfocar el input después del próximo tick
    nextTick(() => {
      const input = document.querySelector('.titulo-input') as HTMLInputElement
      if (input) {
        input.focus()
        input.select()
      }
    })
  }
}

// Función para guardar el título
function guardarTitulo(): void {
  if (paginaActual.value && tituloTemporal.value.trim()) {
    almacen.actualizarTituloPagina(almacen.indicePaginaActiva, tituloTemporal.value.trim())
  }
  cancelarEdicionTitulo()
}

// Función para cancelar edición
function cancelarEdicionTitulo(): void {
  editandoTitulo.value = false
  tituloTemporal.value = ''
}

// Función para manejar Enter y Escape
function manejarTeclasTitulo(event: KeyboardEvent): void {
  if (event.key === 'Enter') {
    guardarTitulo()
  } else if (event.key === 'Escape') {
    cancelarEdicionTitulo()
  }
}

// Helpers mínimos para validación global (reutiliza lógica de Preview)
function recolectarCamposConNombre(list: EsquemaCampo[], out: EsquemaCampo[] = []): EsquemaCampo[] {
  for (const f of list) {
    if (!f) continue
    if (f.nombre) out.push(f)
    if (f.hijos && f.hijos.length) recolectarCamposConNombre(f.hijos, out)
  }
  return out
}
function construirMapaIdNombre(list: EsquemaCampo[]): Record<string, string> {
  const map: Record<string, string> = {}
  const stack: Array<EsquemaCampo | null | undefined> = [...list]
  while (stack.length) {
    const f = stack.shift()!
    if (!f) continue
    if (f.id && f.nombre) map[f.id] = f.nombre
    if (f.hijos && f.hijos.length) stack.push(...f.hijos)
  }
  return map
}

function enviarDesdeDisenador(): void {
  const erroresGlobales: Record<string, string> = {}
  const valoresGlobales: RegistroDatos = {}
  for (const page of almacen.esquemaFormulario.paginas) {
  const valsPagina = almacen.obtenerValoresPagina(page.id) as RegistroDatos
    Object.assign(valoresGlobales, valsPagina)
    const shape: Record<string, z.ZodTypeAny> = {}
    const todos = recolectarCamposConNombre(page.campos, [])
    const idToName = construirMapaIdNombre(page.campos)
    for (const f of todos) {
  let base: z.ZodTypeAny = z.any()
      if (f.tipo === 'texto' || f.tipo === 'correo' || f.tipo === 'contrasena' || f.tipo === 'area-texto') base = z.string()
      if (f.tipo === 'numero') base = z.any() // reconstruir con min/max abajo
      if (f.tipo === 'hora') base = z.any()
      if (f.tipo === 'fecha') {
        let dateRule = z.date()
        const meta = f.metadatos as Record<string, unknown> | undefined
        const parseFecha = (fv: unknown): Date | undefined => {
          if (fv instanceof Date) return isNaN(fv.getTime()) ? undefined : fv
          if (typeof fv === 'string' && fv.trim()) { const d = new Date(fv); return isNaN(d.getTime()) ? undefined : d }
          return undefined
        }
        const minD = parseFecha(meta?.fechaMinima)
        const maxD = parseFecha(meta?.fechaMaxima)
        if (minD) dateRule = dateRule.min(minD, `Debe ser posterior a ${minD.toISOString().slice(0,10)}`)
        if (maxD) dateRule = dateRule.max(maxD, `Debe ser anterior a ${maxD.toISOString().slice(0,10)}`)
        const dateSchema = z.preprocess((v) => {
          if (v == null || v === '') return undefined
          if (v instanceof Date) return v
          if (typeof v === 'string') { const d = new Date(v); return isNaN(d.getTime()) ? undefined : d }
          return v
        }, dateRule)
        base = dateSchema.optional()
      }
  if (f.tipo === 'radio' || f.tipo === 'seleccion') base = z.union([z.string(), z.number()])
      if (f.tipo === 'casilla') {
        const metaObj = f.metadatos as Record<string, unknown> | undefined
        const opts = metaObj?.opciones as unknown
  const esGrupo = Array.isArray(opts) && opts.length > 0
  base = esGrupo ? z.array(z.union([z.string(), z.number()])) : z.boolean()
      }
      if (f.tipo === 'tabla') {
        const meta = f.metadatos as Record<string, unknown> | undefined
        const rawCols = (meta?.columnas as unknown) || []
        const cols = Array.isArray(rawCols) ? (rawCols as Array<Record<string, unknown>>) : []
  const rowShape: Record<string, z.ZodTypeAny> = {}
        for (const c of cols) {
          const tipo = (c.tipo as string) || 'texto'
          const nombre = String(c.nombre || '')
          if (!nombre) continue
          if (tipo === 'numero') {
            let numRule = z.number()
            const cMin = typeof c.minimo === 'number' ? (c.minimo as number) : undefined
            const cMax = typeof c.maximo === 'number' ? (c.maximo as number) : undefined
            const minMsg = typeof c.mensajeMinimo === 'string' && c.mensajeMinimo ? String(c.mensajeMinimo) : (typeof cMin === 'number' ? `Debe ser >= ${cMin}` : 'Valor demasiado pequeño')
            const maxMsg = typeof c.mensajeMaximo === 'string' && c.mensajeMaximo ? String(c.mensajeMaximo) : (typeof cMax === 'number' ? `Debe ser <= ${cMax}` : 'Valor demasiado grande')
            if (typeof cMin === 'number') numRule = numRule.min(cMin, minMsg)
            if (typeof cMax === 'number') numRule = numRule.max(cMax, maxMsg)
            const num = z.preprocess((v) => typeof v === 'string' ? (v.trim()==='' ? undefined : Number(v)) : v, numRule)
            const requerido = Boolean(c.requerido)
            rowShape[nombre] = requerido ? num : num.optional()
          } else if (tipo === 'fecha') {
            const requerido = Boolean(c.requerido)
            let dateRule = z.date()
            // soportar minDate/maxDate como string ISO o Date
            const parseFecha = (fv: unknown): Date | undefined => {
              if (fv instanceof Date) return isNaN(fv.getTime()) ? undefined : fv
              if (typeof fv === 'string' && fv.trim()) {
                const d = new Date(fv)
                return isNaN(d.getTime()) ? undefined : d
              }
              return undefined
            }
            const minD = parseFecha((c as Record<string, unknown>).fechaMinima)
            const maxD = parseFecha((c as Record<string, unknown>).fechaMaxima)
            if (minD) dateRule = dateRule.min(minD, `Debe ser posterior a ${minD.toISOString().slice(0,10)}`)
            if (maxD) dateRule = dateRule.max(maxD, `Debe ser anterior a ${maxD.toISOString().slice(0,10)}`)
            const dateSchema = z.preprocess((v) => {
              if (v == null || v === '') return undefined
              if (v instanceof Date) return v
              if (typeof v === 'string') {
                const d = new Date(v)
                return isNaN(d.getTime()) ? undefined : d
              }
              return v
            }, dateRule)
            rowShape[nombre] = requerido ? dateSchema : dateSchema.optional()
          } else {
            const requerido = Boolean(c.requerido)
            const s = z.string()
            rowShape[nombre] = requerido ? s : s.optional()
          }
        }
        base = z.array(z.object(rowShape)).optional()
      }
      // Crear adaptador temporal para compatibilidad con función de evaluación
      const estado = evaluarReglasCampo(f, valsPagina, idToName)
      const esVisible = estado.visible
      const esRequerido = estado.requerido && !f.deshabilitado
      if (!esVisible) {
        base = base.optional()
      } else {
        if (esRequerido) {
          if (f.tipo === 'casilla') {
            const metaObj = f.metadatos as Record<string, unknown> | undefined
            const opts = metaObj?.opciones as unknown
            if (Array.isArray(opts) && opts.length > 0) {
              base = z.array(z.union([z.string(), z.number()])).refine((arr) => Array.isArray(arr) && arr.length > 0, f.validaciones?.find((v)=>v.tipo==='requerido')?.mensaje || 'Seleccione al menos una opción')
            } else {
              base = z.literal(true)
            }
          } else if (f.tipo !== 'fecha') {
            base = base.refine((v: unknown) => (typeof v === 'string' ? v.trim().length > 0 : v != null), f.validaciones?.find((v)=>v.tipo==='requerido')?.mensaje || 'Requerido')
          }
          if (f.tipo === 'fecha') {
            base = (base as z.ZodTypeAny).refine((v: unknown) => v instanceof Date, f.validaciones?.find((v)=>v.tipo==='requerido')?.mensaje || 'Requerido')
          }
        }
        if (f.tipo === 'numero') {
          const meta = f.metadatos as Record<string, unknown> | undefined
          const min = typeof meta?.minimo === 'number' ? (meta!.minimo as number) : undefined
          const max = typeof meta?.maximo === 'number' ? (meta!.maximo as number) : undefined
          const minMsg = typeof meta?.mensajeMinimo === 'string' && meta!.mensajeMinimo ? String(meta!.mensajeMinimo) : `Debe ser >= ${min}`
          const maxMsg = typeof meta?.mensajeMaximo === 'string' && meta!.mensajeMaximo ? String(meta!.mensajeMaximo) : `Debe ser <= ${max}`
          let numRule = z.number()
          if (typeof min === 'number') numRule = numRule.min(min, minMsg)
          if (typeof max === 'number') numRule = numRule.max(max, maxMsg)
          const num = z.preprocess((v) => typeof v === 'string' ? (v.trim()==='' ? undefined : Number(v)) : v, numRule)
          base = esRequerido ? num : num.optional()
        }
      }
      shape[f.nombre!] = base
    }
    const schemaPagina = z.object(shape)
    const res = schemaPagina.safeParse(valsPagina)
    if (!res.success) {
      for (const issue of res.error.issues) {
        const path = String(issue.path[0] || '')
        if (path) erroresGlobales[path] = issue.message
      }
    }
  }
  if (Object.keys(erroresGlobales).length > 0) {
    alert('Errores en el formulario:\n' + JSON.stringify(erroresGlobales, null, 2))
    return
  }
  alert('Formulario válido:\n' + JSON.stringify(valoresGlobales, null, 2))
}
</script>

<template>
  <div class="p-3 grid w-full" style="min-height: 70vh">
    <div class="col-12 md:col-2">
      <PanelPaleta />
    </div>
    <div class="col-12 md:col-7">
      <div class="flex items-center justify-between mb-2">
        <div class="flex gap-2">
          <PrimeButton label="Añadir página" icon="pi pi-plus" @click="almacen.crearPaginaDespuesActual" />
          <PrimeButton label="Duplicar página" icon="pi pi-copy" @click="almacen.duplicarPagina(almacen.indicePaginaActiva)" />
          <PrimeButton label="Eliminar página" severity="danger" icon="pi pi-trash" @click="almacen.confirmarEliminarPagina(almacen.indicePaginaActiva)" />
        </div>
        <div class="flex gap-2 items-center">
          <PrimeButton label="Exportar" icon="pi pi-upload" @click="almacen.exportarJson" />
          <label class="p-button p-component cursor-pointer">
            <i class="pi pi-download mr-2" />
            <span>Importar</span>
            <input type="file" accept="application/json" class="hidden" @change="(e: Event)=> { const input = e.target as HTMLInputElement; const f = input.files?.[0]; if (f) almacen.importarJson(f) }" />
          </label>
          <!-- <PrimeToggleButton :model-value="almacen.gridSnap" on-label="Grid" off-label="Grid" @update:model-value="(v:boolean)=> (almacen.gridSnap = v)" /> -->
        </div>
      </div>
      <PrimeTabs v-model:value="pestana" class="center-tabs">
        <div class="center-tabs-header">
          <PrimeTabList>
            <template v-for="tab in tabTitles" :key="tab.value">
              <PrimeTab :value="tab.value" as="div" class="flex items-center gap-2">
                <i :class="tab.icon"></i>
                <span class="font-bold whitespace-nowrap">{{ tab.label }}</span>
              </PrimeTab>
            </template>
          </PrimeTabList>
        </div>

        <PrimeTabPanels>
          <PrimeTabPanel value="disenador">
            <div class="flex justify-between items-center mb-3">
              <div v-if="totalPaginas>1" class="flex items-center gap-2">
                <PrimeButton label="Anterior" icon="pi pi-angle-left" :disabled="almacen.indicePaginaActiva===0" @click="async () => { almacen.indicePaginaActiva = Math.max(0, almacen.indicePaginaActiva-1); almacen.seleccionarCampo(null); await nextTick() }" />

                <!-- Título editable -->
                <div v-if="!editandoTitulo" class="flex items-center gap-2">
                  <div class="font-semibold cursor-pointer hover:bg-gray-100 px-2 py-1 border-round" @click="iniciarEdicionTitulo">
                    {{ paginaActual.titulo || ('Página ' + (almacen.indicePaginaActiva+1)) }}
                    <i class="pi pi-pencil ml-2 text-gray-500 text-sm"></i>
                  </div>
                </div>
                <div v-else class="flex items-center gap-2">
                  <PrimeInputText
                    v-model="tituloTemporal"
                    class="titulo-input w-48"
                    @keydown="manejarTeclasTitulo"
                    @blur="guardarTitulo"
                    placeholder="Título de la página"
                  />
                  <PrimeButton
                    icon="pi pi-check"
                    severity="success"
                    size="small"
                    @click="guardarTitulo"
                  />
                  <PrimeButton
                    icon="pi pi-times"
                    severity="secondary"
                    size="small"
                    @click="cancelarEdicionTitulo"
                  />
                </div>

                <PrimeButton label="Siguiente" icon-pos="right" icon="pi pi-angle-right" :disabled="almacen.indicePaginaActiva>=almacen.esquemaFormulario.paginas.length-1" @click="async () => { almacen.indicePaginaActiva = Math.min(almacen.esquemaFormulario.paginas.length-1, almacen.indicePaginaActiva+1); almacen.seleccionarCampo(null); await nextTick() }" />
              </div>

              <!-- Título editable para página única -->
              <div v-else class="flex items-center gap-2">
                <div v-if="!editandoTitulo" class="flex items-center gap-2">
                  <div class="font-semibold cursor-pointer hover:bg-gray-100 px-2 py-1 border-round" @click="iniciarEdicionTitulo">
                    {{ paginaActual.titulo || ('Página ' + (almacen.indicePaginaActiva+1)) }}
                    <i class="pi pi-pencil ml-2 text-gray-500 text-sm"></i>
                  </div>
                </div>
                <div v-else class="flex items-center gap-2">
                  <PrimeInputText
                    v-model="tituloTemporal"
                    class="titulo-input w-48"
                    @keydown="manejarTeclasTitulo"
                    @blur="guardarTitulo"
                    placeholder="Título de la página"
                  />
                  <PrimeButton
                    icon="pi pi-check"
                    severity="success"
                    size="small"
                    @click="guardarTitulo"
                  />
                  <PrimeButton
                    icon="pi pi-times"
                    severity="secondary"
                    size="small"
                    @click="cancelarEdicionTitulo"
                  />
                </div>
              </div>

              <div class="ml-auto">
                <PrimeButton v-if="totalPaginas===1 || almacen.indicePaginaActiva>=almacen.esquemaFormulario.paginas.length-1" label="Enviar" icon="pi pi-check" @click="enviarDesdeDisenador" />
              </div>
            </div>
            <LienzoPagina :key="almacen.indicePaginaActiva + ':' + (paginaActual.id || '')" :pagina="paginaActual" />
          </PrimeTabPanel>
          <PrimeTabPanel value="preview">
            <VistaPrevia />
          </PrimeTabPanel>
          <PrimeTabPanel value="json">
            <VistaJson />
          </PrimeTabPanel>
        </PrimeTabPanels>
      </PrimeTabs>
    </div>
    <div class="col-12 md:col-3">
      <TabsPropiedades />
    </div>
  </div>

  <!-- Modal de confirmación para eliminar página -->
  <ModalConfirmar
    :visible="almacen.mostrarModalEliminarPagina"
    message="¿Estás seguro de que deseas eliminar esta página? Esta acción no se puede deshacer."
    @confirm="almacen.ejecutarEliminarPagina"
    @cancel="almacen.cancelarEliminarPagina"
  />
</template>

