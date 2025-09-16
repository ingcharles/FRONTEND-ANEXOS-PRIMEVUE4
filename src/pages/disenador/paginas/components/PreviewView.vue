<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { z } from 'zod'
import type { FieldSchema } from '@/types/form-schema'
import { useDesignerStore } from '@/stores/useDesignerStore'
import { EvaluarReglasCampo } from '@/utils/logic'
import CampoRenderer from './CampoRenderer.vue'

const store = useDesignerStore()
const paginaIndex = ref(0)
const paginaActual = computed(() => store.formSchema.pages[paginaIndex.value])
const totalPaginas = computed(() => store.formSchema.pages.length)
const campos = computed<FieldSchema[]>(() => paginaActual.value.fields)

function clasesColumna(f: FieldSchema): string[] {
  const sm = f.grid?.sm ?? 12
  const md = f.grid?.md ?? 6
  const lg = f.grid?.lg ?? 6
  return [
    `col-${Math.min(12, Math.max(1, sm))}`,
    `md:col-${Math.min(12, Math.max(1, md))}`,
    `lg:col-${Math.min(12, Math.max(1, lg))}`,
    'p-2',
  ]
}

function construirMapaIdNombre(list: FieldSchema[]): Record<string, string> {
  const map: Record<string, string> = {}
  const stack: Array<FieldSchema | null | undefined> = [...list]
  while (stack.length) {
    const f = stack.shift()!
    if (!f) continue
    if (f.id && f.name) map[f.id] = f.name
    if (f.children && f.children.length) stack.push(...f.children)
  }
  return map
}

const idAName = computed(() => construirMapaIdNombre(campos.value))

// Valores persistentes por página (antes de crear el schema para evitar TDZ)
const valores = computed<Record<string, unknown>>(() => store.obtenerValoresPagina(paginaActual.value.id))
const errores = ref<Record<string, string>>({})

// Tipos auxiliares para tabla
type ColumnaTabla = { name: string; label?: string; type?: 'text' | 'number' | 'date' }
type ColumnaTablaExt = ColumnaTabla & {
  // Formato de celda
  formatMode?: 'decimal' | 'currency' | 'percent'
  currency?: string
  locale?: string
  prefix?: string
  suffix?: string
  minFractionDigits?: number
  maxFractionDigits?: number
  percentScale?: 'whole' | 'fraction'
  // Agregados
  agg?: 'none'|'sum'|'avg'|'count'|'min'|'max'
  aggPrefix?: string
  aggSuffix?: string
  decimals?: number
  // Validación por columna
  required?: boolean
  min?: number | null
  max?: number | null
  minMessage?: string
  maxMessage?: string
}
function obtenerColumnasTabla(field: FieldSchema): ColumnaTablaExt[] {
  const meta = field.meta as Record<string, unknown> | undefined
  const raw = meta?.columns as unknown
  return Array.isArray(raw) ? (raw as ColumnaTablaExt[]).filter(c => c && typeof c.name === 'string') : []
}
function obtenerFilasTabla(field: FieldSchema): number {
  const meta = field.meta as Record<string, unknown> | undefined
  const r = meta?.rows as unknown
  return typeof r === 'number' && r > 0 ? r : 1
}
function crearFilaVacia(cols: ColumnaTabla[]): Record<string, unknown> { const obj: Record<string, unknown> = {}; for (const c of cols) obj[c.name] = undefined; return obj }

// Estilos de tabla desde meta
// Helpers de estilos de tabla se movieron a CampoRenderer
// Nota: helpers visuales de tabla ahora viven en CampoRenderer

// Agregaciones por columna


type Opcion = { label: string; value: unknown }
function obtenerOpciones(field: FieldSchema): Opcion[] {
  const meta = field.meta as Record<string, unknown> | undefined
  const raw = meta?.options as unknown
  return Array.isArray(raw) ? (raw as Opcion[]) : []
}
function checkboxEsGrupo(field: FieldSchema): boolean {
  return obtenerOpciones(field).length > 0
}

// construir zod schema dinámico
function recolectarCamposConNombre(list: FieldSchema[], out: FieldSchema[] = []): FieldSchema[] {
  for (const f of list) {
    if (!f) continue
    if (f.name) out.push(f)
    if (f.children && f.children.length) recolectarCamposConNombre(f.children, out)
  }
  return out
}

function crearSchema(): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {}
  const todos = recolectarCamposConNombre(campos.value, [])
  for (const f of todos) {
    let base: z.ZodTypeAny = z.any()
    if (f.type === 'text' || f.type === 'email' || f.type === 'password' || f.type === 'textarea') base = z.string()
    if (f.type === 'number') base = z.preprocess((v) => typeof v === 'string' ? (v.trim()==='' ? undefined : Number(v)) : v, z.number().optional())
  if (f.type === 'time') base = z.any()
  if (f.type === 'date') {
    // Validación de fecha con min/max opcional en meta
    let dateRule = z.date()
    const meta = f.meta as Record<string, unknown> | undefined
    const minD = meta?.minDate as unknown
    const maxD = meta?.maxDate as unknown
    const parseDate = (v: unknown): Date | undefined => {
      if (v instanceof Date) return isNaN(v.getTime()) ? undefined : v
      if (typeof v === 'string' && v.trim()) { const d = new Date(v); return isNaN(d.getTime()) ? undefined : d }
      return undefined
    }
    const md = parseDate(minD); const Mx = parseDate(maxD)
    if (md) dateRule = dateRule.min(md, `Debe ser posterior a ${md.toISOString().slice(0,10)}`)
    if (Mx) dateRule = dateRule.max(Mx, `Debe ser anterior a ${Mx.toISOString().slice(0,10)}`)
    const dateSchema = z.preprocess((v) => {
      if (v == null || v === '') return undefined
      if (v instanceof Date) return v
      if (typeof v === 'string') { const d = new Date(v); return isNaN(d.getTime()) ? undefined : d }
      return v
    }, dateRule)
    base = dateSchema.optional()
  }
    if (f.type === 'radio' || f.type === 'select') base = z.any()
    if (f.type === 'checkbox') {
      base = checkboxEsGrupo(f) ? z.array(z.any()) : z.boolean().or(z.any())
    }
    if (f.type === 'table') {
      // Tabla: un array de objetos con keys de columnas
      const cols = obtenerColumnasTabla(f)
      const rowShape: Record<string, z.ZodTypeAny> = {}
      for (const c of cols) {
        if ((c.type || 'text') === 'number') {
          // Construir regla numérica con min/max y luego envolver con preprocess
          let numRule = z.number()
          const cMin = typeof c.min === 'number' ? c.min : undefined
          const cMax = typeof c.max === 'number' ? c.max : undefined
          const minMsg = typeof c.minMessage === 'string' && c.minMessage ? String(c.minMessage) : (typeof cMin === 'number' ? `Debe ser >= ${cMin}` : 'Valor demasiado pequeño')
          const maxMsg = typeof c.maxMessage === 'string' && c.maxMessage ? String(c.maxMessage) : (typeof cMax === 'number' ? `Debe ser <= ${cMax}` : 'Valor demasiado grande')
          if (typeof cMin === 'number') numRule = numRule.min(cMin, minMsg)
          if (typeof cMax === 'number') numRule = numRule.max(cMax, maxMsg)
          const num = z.preprocess((v) => typeof v === 'string' ? (v.trim()==='' ? undefined : Number(v)) : v, numRule)
          // Requerido por columna
          const requerido = Boolean(c.required)
          rowShape[c.name] = requerido ? num : (num.optional())
        } else if ((c.type || 'text') === 'date') {
          const requerido = Boolean(c.required)
          const s = z.any()
          rowShape[c.name] = requerido ? s : s.optional()
        } else {
          const requerido = Boolean(c.required)
          const s = z.string()
          rowShape[c.name] = requerido ? s : s.optional()
        }
      }
      base = z.array(z.object(rowShape)).optional()
    }

    // Aplicar lógica para required dinámico (usa mapa global id->name)
    const estado = EvaluarReglasCampo(f, valores.value as Record<string, unknown>, idAName.value)
    const esVisible = estado.visible
    const esRequerido = estado.required && !f.disabled
    if (!esVisible) {
      base = base.optional()
    } else {
      if (esRequerido) {
        if (f.type === 'checkbox') {
          if (checkboxEsGrupo(f)) {
            base = z.array(z.any()).refine((arr) => Array.isArray(arr) && arr.length > 0, f.validations?.find(v=>v.type==='required')?.message || 'Seleccione al menos una opción')
          } else {
            base = z.literal(true)
          }
        } else if (f.type !== 'date') {
          base = base.refine((v: unknown) => (typeof v === 'string' ? v.trim().length > 0 : v != null), f.validations?.find(v=>v.type==='required')?.message || 'Requerido')
        }
        if (f.type === 'date') {
          // Hacerlo requerido explícitamente
          base = (base as z.ZodTypeAny).refine((v: unknown) => v instanceof Date, f.validations?.find(v=>v.type==='required')?.message || 'Requerido')
        }
      }
      // Validación adicional para número con min/max (reconstruir esquema para evitar min/max sobre ZodEffects)
      if (f.type === 'number') {
        const meta = f.meta as Record<string, unknown> | undefined
        const min = typeof meta?.min === 'number' ? (meta!.min as number) : undefined
        const max = typeof meta?.max === 'number' ? (meta!.max as number) : undefined
        const minMsg = typeof meta?.minMessage === 'string' && meta!.minMessage ? String(meta!.minMessage) : `Debe ser >= ${min}`
        const maxMsg = typeof meta?.maxMessage === 'string' && meta!.maxMessage ? String(meta!.maxMessage) : `Debe ser <= ${max}`
        let numRule = z.number()
        if (typeof min === 'number') numRule = numRule.min(min, minMsg)
        if (typeof max === 'number') numRule = numRule.max(max, maxMsg)
        const num = z.preprocess((v) => typeof v === 'string' ? (v.trim()==='' ? undefined : Number(v)) : v, numRule)
        base = esRequerido ? num : num.optional()
      }
      for (const v of f.validations || []) {
        if (v.type === 'minLength') base = (base as z.ZodString).min(Number(v.value || 0), v.message)
        if (v.type === 'maxLength') base = (base as z.ZodString).max(Number(v.value || 9999), v.message)
        if (v.type === 'pattern' && typeof v.value === 'string') base = (base as z.ZodString).regex(new RegExp(v.value), v.message)
        if (v.type === 'custom' && typeof v.value === 'string') {
          try {
            const fn = new Function('valor', `return (${v.value})`) as (valor: unknown) => boolean
            base = base.refine((valor) => {
              try { return !!fn(valor) } catch { return true }
            }, v.message)
          } catch { /* noop */ }
        }
      }
    }
    shape[f.name!] = base
  }
  return z.object(shape)
}

const schema = ref(crearSchema())
watch(campos, () => (schema.value = crearSchema()))

// (valores/errores ya declarados arriba)

// Establecer valores por defecto desde meta.valorPorDefecto para campos con name
function esVacio(v: unknown): boolean {
  return v === undefined || v === null || (typeof v === 'string' && v.trim() === '')
}

function parsearHoraCadenaAFecha(cadena: string): Date | null {
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(cadena)
  if (!m) return null
  const [, hh, mm] = m
  const d = new Date()
  d.setHours(Number(hh), Number(mm), 0, 0)
  return d
}

function aplicarValoresPorDefecto(list: FieldSchema[], sobrescribirSiVacio = false): void {
  for (const f of list) {
    if (!f) continue
    if (f.name) {
      const meta = f.meta as Record<string, unknown> | undefined
      let def = meta?.valorPorDefecto as unknown
      // Normalizar defaults por tipo (por ejemplo, time HH:mm -> Date)
      if (f.type === 'time' && typeof def === 'string') {
        def = parsearHoraCadenaAFecha(def) || def
      }
      if (f.type === 'number' && typeof def === 'string' && def.trim() !== '') {
        const n = Number(def)
        if (!Number.isNaN(n)) def = n
      }
      if (f.type === 'date') {
        // permitir cadena YYYY-MM-DD o Date para default
        if (typeof def === 'string' && def.trim()) {
          const d = new Date(def)
          if (!isNaN(d.getTime())) def = d
        }
      }
      if (f.type === 'checkbox' && typeof def === 'string') {
        // permitir 'true'/'false' como cadena para default simple
        if (def.toLowerCase() === 'true') def = true
        else if (def.toLowerCase() === 'false') def = false
      }
      if (f.type === 'checkbox' && checkboxEsGrupo(f)) {
        // asegurar arreglo para defaults múltiples si hay opciones
        if (!Array.isArray(def)) def = []
      }
      if (f.type === 'table') {
        const cols = obtenerColumnasTabla(f)
        const rows = obtenerFilasTabla(f)
        const plantilla = Array.from({ length: Math.max(1, rows) }, () => crearFilaVacia(cols))
        if (def === undefined) def = plantilla
      }
      // Respetar visibilidad
      const estado = EvaluarReglasCampo(f, valores.value as Record<string, unknown>, idAName.value)
      if (def !== undefined && estado.visible) {
        const actual = (valores.value as Record<string, unknown>)[f.name]
        if (actual === undefined || (sobrescribirSiVacio && esVacio(actual))) {
          ;(valores.value as Record<string, unknown>)[f.name] = def
        }
      }
    }
    if (f.children && f.children.length) aplicarValoresPorDefecto(f.children, sobrescribirSiVacio)
  }
}

// Firma para detectar cambios en valorPorDefecto profundamente
function recolectarFirmasDefaults(list: FieldSchema[], out: Array<string> = []): Array<string> {
  for (const f of list) {
    if (!f) continue
    const def = (f.meta as Record<string, unknown> | undefined)?.valorPorDefecto
    if (f.name) out.push(`${f.name}::${JSON.stringify(def)}`)
    if (f.children && f.children.length) recolectarFirmasDefaults(f.children, out)
  }
  return out
}
const firmaDefaults = computed(() => recolectarFirmasDefaults(campos.value, []).join('|'))

// Aplicar al cargar/actualizar campos o cambiar de página (inicial, no sobreescribe)
watch([campos, paginaIndex], () => {
  schema.value = crearSchema()
  aplicarValoresPorDefecto(campos.value, false)
}, { immediate: true, deep: true })

// Aplicar cuando cambie algún valorPorDefecto: sobreescribe si el valor actual está vacío
watch(firmaDefaults, () => {
  aplicarValoresPorDefecto(campos.value, true)
})

function enviar(): void {
  errores.value = {}
  // Validar TODO el formulario: iterar todas las páginas y sus campos
  const erroresGlobales: Record<string, string> = {}
  const valoresGlobales: Record<string, unknown> = {}
  for (const page of store.formSchema.pages) {
    // valores actuales por página
    const valsPagina = store.obtenerValoresPagina(page.id)
    Object.assign(valoresGlobales, valsPagina)
    // construir esquema por página (reutilizando helpers pero con campos de esa página)
    const shape: Record<string, z.ZodTypeAny> = {}
    const todos = recolectarCamposConNombre(page.fields, [])
    const idToName = construirMapaIdNombre(page.fields)
    for (const f of todos) {
      let base: z.ZodTypeAny = z.any()
      if (f.type === 'text' || f.type === 'email' || f.type === 'password' || f.type === 'textarea') base = z.string()
  if (f.type === 'number') base = z.any() // se reconstruye más abajo con min/max y required
      if (f.type === 'time') base = z.any()
      if (f.type === 'date') {
        let dateRule = z.date()
        const meta = f.meta as Record<string, unknown> | undefined
        const parseFecha = (fv: unknown): Date | undefined => {
          if (fv instanceof Date) return isNaN(fv.getTime()) ? undefined : fv
          if (typeof fv === 'string' && fv.trim()) { const d = new Date(fv); return isNaN(d.getTime()) ? undefined : d }
          return undefined
        }
        const minD = parseFecha(meta?.minDate)
        const maxD = parseFecha(meta?.maxDate)
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
      if (f.type === 'radio' || f.type === 'select') base = z.any()
      if (f.type === 'checkbox') {
        const metaObj = f.meta as Record<string, unknown> | undefined
        const opts = metaObj?.options as unknown
        const esGrupo = Array.isArray(opts) && opts.length > 0
        base = esGrupo ? z.array(z.any()) : z.boolean().or(z.any())
      }
      if (f.type === 'table') {
        const cols = obtenerColumnasTabla(f)
        const rowShape: Record<string, z.ZodTypeAny> = {}
        for (const c of cols) {
          if ((c.type || 'text') === 'number') {
            let numRule = z.number()
            const cMin = typeof c.min === 'number' ? c.min : undefined
            const cMax = typeof c.max === 'number' ? c.max : undefined
            const minMsg = typeof c.minMessage === 'string' && c.minMessage ? String(c.minMessage) : (typeof cMin === 'number' ? `Debe ser >= ${cMin}` : 'Valor demasiado pequeño')
            const maxMsg = typeof c.maxMessage === 'string' && c.maxMessage ? String(c.maxMessage) : (typeof cMax === 'number' ? `Debe ser <= ${cMax}` : 'Valor demasiado grande')
            if (typeof cMin === 'number') numRule = numRule.min(cMin, minMsg)
            if (typeof cMax === 'number') numRule = numRule.max(cMax, maxMsg)
            const num = z.preprocess((v) => typeof v === 'string' ? (v.trim()==='' ? undefined : Number(v)) : v, numRule)
            const requerido = Boolean(c.required)
            rowShape[c.name] = requerido ? num : (num.optional())
          } else {
            const requerido = Boolean(c.required)
            const s = z.string()
            rowShape[c.name] = requerido ? s : s.optional()
          }
        }
        base = z.array(z.object(rowShape)).optional()
      }
      const estado = EvaluarReglasCampo(f, valsPagina as Record<string, unknown>, idToName)
      const esVisible = estado.visible
      const esRequerido = estado.required && !f.disabled
      if (!esVisible) {
        base = base.optional()
      } else {
        if (esRequerido) {
          if (f.type === 'checkbox') {
            const metaObj = f.meta as Record<string, unknown> | undefined
            const opts = metaObj?.options as unknown
            if (Array.isArray(opts) && opts.length > 0) {
              base = z.array(z.any()).refine((arr) => Array.isArray(arr) && arr.length > 0, f.validations?.find(v=>v.type==='required')?.message || 'Seleccione al menos una opción')
            } else {
              base = z.literal(true)
            }
          } else if (f.type !== 'date') {
            base = base.refine((v: unknown) => (typeof v === 'string' ? v.trim().length > 0 : v != null), f.validations?.find(v=>v.type==='required')?.message || 'Requerido')
          }
          if (f.type === 'date') {
            base = (base as z.ZodTypeAny).refine((v: unknown) => v instanceof Date, f.validations?.find(v=>v.type==='required')?.message || 'Requerido')
          }
        }
        if (f.type === 'number') {
          const meta = f.meta as Record<string, unknown> | undefined
          const min = typeof meta?.min === 'number' ? (meta!.min as number) : undefined
          const max = typeof meta?.max === 'number' ? (meta!.max as number) : undefined
          const minMsg = typeof meta?.minMessage === 'string' && meta!.minMessage ? String(meta!.minMessage) : `Debe ser >= ${min}`
          const maxMsg = typeof meta?.maxMessage === 'string' && meta!.maxMessage ? String(meta!.maxMessage) : `Debe ser <= ${max}`
          let numRule = z.number()
          if (typeof min === 'number') numRule = numRule.min(min, minMsg)
          if (typeof max === 'number') numRule = numRule.max(max, maxMsg)
          const num = z.preprocess((v) => typeof v === 'string' ? (v.trim()==='' ? undefined : Number(v)) : v, numRule)
          base = esRequerido ? num : num.optional()
        }
        for (const v of f.validations || []) {
          if (v.type === 'minLength') base = (base as z.ZodString).min(Number(v.value || 0), v.message)
          if (v.type === 'maxLength') base = (base as z.ZodString).max(Number(v.value || 9999), v.message)
          if (v.type === 'pattern' && typeof v.value === 'string') base = (base as z.ZodString).regex(new RegExp(v.value), v.message)
          if (v.type === 'custom' && typeof v.value === 'string') {
            try {
              const fn = new Function('valor', `return (${v.value})`) as (valor: unknown) => boolean
              base = base.refine((valor) => {
                try { return !!fn(valor) } catch { return true }
              }, v.message)
            } catch { /* noop */ }
          }
        }
      }
      shape[f.name!] = base
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
    errores.value = erroresGlobales
    return
  }
  alert('Formulario válido:\n' + JSON.stringify(valoresGlobales, null, 2))
}
</script>

<template>
  <div class="p-3">
    <div class="flex justify-between items-center mb-3" v-if="totalPaginas>1">
      <PrimeButton label="Anterior" icon="pi pi-angle-left" :disabled="paginaIndex===0" @click="paginaIndex--" />
      <div class="font-semibold">{{ paginaActual.title || ('Página ' + (paginaIndex+1)) }}</div>
      <PrimeButton label="Siguiente" icon-pos="right" icon="pi pi-angle-right" :disabled="paginaIndex>=store.formSchema.pages.length-1" @click="paginaIndex++" />
    </div>
    <div class="mb-2" v-else>
      <div class="font-semibold">{{ paginaActual.title || ('Página ' + (paginaIndex+1)) }}</div>
    </div>
    <form class="grid" @submit.prevent="enviar">
      <template v-for="f in campos" :key="f.id">
        <div :class="clasesColumna(f)">
          <CampoRenderer :field="f" :valores="(valores as any)" :id-a-name="idAName" :errores="(errores as any)" />
        </div>
      </template>
      <!-- Botón Enviar de respaldo: si no hay botón en la página y es la última o única -->
      <div class="col-12" v-if="(totalPaginas===1 || paginaIndex>=store.formSchema.pages.length-1) && !campos.some(f=>f.type==='button')">
        <PrimeButton label="Enviar" type="submit" icon="pi pi-check" />
      </div>
    </form>
  </div>
</template>

<style scoped>
</style>
