<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDesignerStore } from '@/stores/useDesignerStore'
import type { ValidationRule } from '@/types/form-schema'
import draggable from 'vuedraggable'

defineProps<{ fieldId: string }>()
const store = useDesignerStore()
const campo = computed(() => store.campoSeleccionado)

function actualizarTexto(clave: 'label' | 'name' | 'placeholder', valor: string): void {
  if (!campo.value) return
  store.actualizarCampo(campo.value.id, { [clave]: valor })
}

// Cambiar tipo de campo
type TipoSimple = 'text'|'textarea'|'email'|'password'|'number'|'time'|'date'|'select'|'radio'|'checkbox'|'label'|'button'|'divider'|'panel'|'table'
const opcionesTipo: { label: string; value: TipoSimple }[] = [
  { label: 'Texto', value: 'text' },
  { label: 'Área', value: 'textarea' },
  { label: 'Email', value: 'email' },
  { label: 'Password', value: 'password' },
  { label: 'Número', value: 'number' },
  { label: 'Hora', value: 'time' },
  { label: 'Fecha', value: 'date' },
  { label: 'Select', value: 'select' },
  { label: 'Radio', value: 'radio' },
  { label: 'Checkbox', value: 'checkbox' },
  { label: 'Etiqueta', value: 'label' },
  { label: 'Botón', value: 'button' },
  { label: 'Divisor', value: 'divider' },
  { label: 'Panel', value: 'panel' },
  { label: 'Tabla', value: 'table' },
]
function obtenerMetaPorDefecto(tipo: TipoSimple): Record<string, unknown> | undefined {
  if (tipo === 'select' || tipo === 'radio') return { options: [{ label: 'Item 1', value: 'item1' }, { label: 'Item 2', value: 'item2' }] }
  if (tipo === 'checkbox') return { valorPorDefecto: false }
  if (tipo === 'table') return { columns: [ { name:'col1', label:'Columna 1', type:'text' }, { name:'col2', label:'Columna 2', type:'number' } ], rows: 1, addRows: true, showSummary: true, summaryLabel: 'Total', tableStyle: { bordered: true, striped: true, hover: true, padding: 'md' } }
  return undefined
}
function cambiarTipoCampo(nuevo: TipoSimple): void {
  if (!campo.value) return
  const meta = { ...(campo.value.meta ?? {}) } as Record<string, unknown>
  const defecto = obtenerMetaPorDefecto(nuevo)
  const metaFinal = defecto ? { ...meta, ...defecto } : meta
  // Al cambiar tipo, aseguramos coherencia básica
  store.actualizarCampo(campo.value.id, { type: nuevo, meta: metaFinal })
}

function actualizarGrid(parcial: { sm?: number; md?: number; lg?: number }): void {
  if (!campo.value) return
  const actual = campo.value.grid ?? {}
  store.actualizarCampo(campo.value.id, { grid: { ...actual, ...parcial } })
}

function actualizarBooleano(clave: 'visible' | 'required', valor: boolean): void {
  if (!campo.value) return
  store.actualizarCampo(campo.value.id, { [clave]: valor } as { [k in typeof clave]: boolean })
  if (clave === 'required') {
    if (valor) asegurarReglaRequerido()
  }
}

// Opciones para select / radio
function obtenerOpciones(): Array<{ label: string; value: unknown }> {
  const arr = (campo.value?.meta?.options as unknown) as Array<{ label: string; value: unknown }> | undefined
  return Array.isArray(arr) ? arr : []
}
function actualizarOpciones(nuevas: Array<{ label: string; value: unknown }>): void {
  if (!campo.value) return
  const meta = { ...(campo.value.meta ?? {}) }
  ;(meta as Record<string, unknown>).options = nuevas
  store.actualizarCampo(campo.value.id, { meta })
}
function agregarOpcion(): void {
  const lista = obtenerOpciones()
  actualizarOpciones([...lista, { label: 'Opción', value: '' }])
}
function actualizarOpcion(ind: number, prop: 'label' | 'value', valor: string): void {
  const lista = obtenerOpciones().map((o, i) => (i === ind ? { ...o, [prop]: valor } : o))
  actualizarOpciones(lista)
}
function eliminarOpcion(ind: number): void {
  const lista = obtenerOpciones().filter((_, i) => i !== ind)
  actualizarOpciones(lista)
}

// Columnas para tabla
type ColumnaTabla = { name: string; label: string; type?: 'text' | 'number' | 'date' }
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
  // Agregados de columna
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
function obtenerColumnas(): ColumnaTabla[] {
  const cols = (campo.value?.meta as Record<string, unknown> | undefined)?.columns as unknown as ColumnaTablaExt[] | undefined
  return Array.isArray(cols) ? cols : []
}

// Utilidades para evitar nombres duplicados en columnas de tabla
function listarNombresColumnas(): string[] {
  return obtenerColumnas().map(c => String(c.name || ''))
}
function existeNombreColumna(nombre: string, exceptIndex?: number): boolean {
  const nombres = listarNombresColumnas()
  return nombres.some((n, i) => n === nombre && i !== (exceptIndex ?? -1))
}
function generarNombreColumnaUnico(base: string, exceptIndex?: number): string {
  const limpio = (base || 'col').trim() || 'col'
  if (!existeNombreColumna(limpio, exceptIndex)) return limpio
  let i = 2
  while (existeNombreColumna(`${limpio}-${i}`, exceptIndex)) i++
  return `${limpio}-${i}`
}
function esNombreColumnaDuplicado(indice: number): boolean {
  const cols = obtenerColumnas()
  if (!cols[indice]) return false
  return existeNombreColumna(cols[indice].name, indice)
}
function actualizarColumnas(nuevas: ColumnaTablaExt[]): void {
  if (!campo.value) return
  const meta = { ...(campo.value.meta ?? {}) } as Record<string, unknown>
  meta.columns = nuevas
  store.actualizarCampo(campo.value.id, { meta })
}
function agregarColumna(): void {
  const cols = obtenerColumnas()
  const base = `col${cols.length + 1}`
  const nombre = generarNombreColumnaUnico(base)
  actualizarColumnas([...cols, { name: nombre, label: `Columna ${cols.length + 1}`, type: 'text' }])
}
function actualizarColumna(ind: number, prop: keyof ColumnaTablaExt, valor: string | number): void {
  const cols = obtenerColumnas().map((c, i) => {
    if (i !== ind) return c
    if (prop === 'name') {
      const nuevo = typeof valor === 'string' ? valor : String(valor)
      const unico = generarNombreColumnaUnico(nuevo, ind)
      return { ...c, name: unico }
    }
    return { ...c, [prop]: valor }
  })
  actualizarColumnas(cols)
}
function eliminarColumna(ind: number): void {
  const cols = obtenerColumnas().filter((_, i) => i !== ind)
  actualizarColumnas(cols)
}
function actualizarAddRows(v: boolean): void {
  if (!campo.value) return
  const meta = { ...(campo.value.meta ?? {}) } as Record<string, unknown>
  meta.addRows = v
  store.actualizarCampo(campo.value.id, { meta })
}

// Selección de columna para edición individual
const indiceColumna = ref<number>(0)
function asegurarIndiceColumna(): void {
  const total = obtenerColumnas().length
  if (total <= 0) {
    indiceColumna.value = 0
    return
  }
  if (indiceColumna.value < 0) indiceColumna.value = 0
  if (indiceColumna.value > total - 1) indiceColumna.value = total - 1
}

// Reglas de validación - requerido
function obtenerValidaciones(): ValidationRule[] {
  const arr = (campo.value?.validations ?? []) as ValidationRule[]
  return Array.isArray(arr) ? arr : []
}

function asegurarReglaRequerido(): void {
  if (!campo.value) return
  const vals = obtenerValidaciones()
  const idx = vals.findIndex(v => v.type === 'required')
  if (idx === -1) {
    vals.push({ type: 'required', message: 'Este campo es requerido' })
  }
  store.actualizarCampo(campo.value.id, { validations: vals })
}

function obtenerMensajeRequerido(): string {
  const vals = obtenerValidaciones()
  return vals.find(v => v.type === 'required')?.message || 'Este campo es requerido'
}

function actualizarMensajeRequerido(msg: string): void {
  if (!campo.value) return
  const vals = obtenerValidaciones()
  const idx = vals.findIndex(v => v.type === 'required')
  if (idx === -1) {
    vals.push({ type: 'required', message: msg })
  } else {
    vals[idx] = { ...vals[idx], message: msg }
  }
  store.actualizarCampo(campo.value.id, { validations: vals })
}

// Valor por defecto (select/radio)
function obtenerValorPorDefecto(): unknown {
  const meta = (campo.value?.meta ?? {}) as Record<string, unknown>
  return meta.valorPorDefecto
}
function actualizarValorPorDefecto(v: unknown): void {
  if (!campo.value) return
  const meta = { ...(campo.value.meta ?? {}) } as Record<string, unknown>
  meta.valorPorDefecto = v
  store.actualizarCampo(campo.value.id, { meta })
}

// ---- Valor por defecto para campo de hora (time) ----
function parsearHoraCadenaAFecha(cadena: string): Date | null {
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(cadena)
  if (!m) return null
  const [, hh, mm] = m
  const d = new Date()
  d.setHours(Number(hh), Number(mm), 0, 0)
  return d
}

function formatearFechaAHHMM(fecha: Date | null | undefined): string | null {
  if (!fecha || !(fecha instanceof Date)) return null
  const hh = String(fecha.getHours()).padStart(2, '0')
  const mm = String(fecha.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

function obtenerValorPorDefectoTiempoComoFecha(): Date | null {
  const meta = (campo.value?.meta ?? {}) as Record<string, unknown>
  const raw = meta.valorPorDefecto
  if (typeof raw === 'string') return parsearHoraCadenaAFecha(raw)
  if (raw instanceof Date) return raw
  return null
}

function actualizarValorPorDefectoTiempo(fecha: Date | null): void {
  if (!campo.value) return
  const meta = { ...(campo.value.meta ?? {}) } as Record<string, unknown>
  const hhmm = formatearFechaAHHMM(fecha || undefined)
  meta.valorPorDefecto = hhmm
  store.actualizarCampo(campo.value.id, { meta })
}

// ----- Cargar opciones por API (select / radio) -----
type ConfigApi = {
  url?: string
  method?: 'GET' | 'POST'
  dataPath?: string
  labelKey?: string
  valueKey?: string
  contentType?: string
  body?: string
  headersJson?: string
}

const cargandoApi = ref(false)
const errorApi = ref<string | null>(null)

type ModoOpciones = 'manual' | 'api'

function obtenerModoOpciones(): ModoOpciones {
  const meta = (campo.value?.meta ?? {}) as Record<string, unknown>
  const modo = (meta.optionsMode as ModoOpciones | undefined) || 'manual'
  return modo
}

function actualizarModoOpciones(modo: ModoOpciones): void {
  if (!campo.value) return
  const meta = { ...(campo.value.meta ?? {}) } as Record<string, unknown>
  meta.optionsMode = modo
  store.actualizarCampo(campo.value.id, { meta })
}

function obtenerConfigApi(): ConfigApi {
  const meta = (campo.value?.meta ?? {}) as Record<string, unknown>
  const cfg = (meta.optionsApi as ConfigApi) || {}
  return {
    url: cfg.url || '',
    method: cfg.method || 'GET',
    dataPath: cfg.dataPath || '',
    labelKey: cfg.labelKey || 'etiqueta',
    valueKey: cfg.valueKey || 'valor',
    contentType: cfg.contentType || 'application/json',
    body: cfg.body || '',
    headersJson: cfg.headersJson || '',
  }
}

function actualizarConfigApi(parcial: Partial<ConfigApi>): void {
  if (!campo.value) return
  const meta = { ...(campo.value.meta ?? {}) } as Record<string, unknown>
  const actual = ((meta.optionsApi as ConfigApi) || {})
  meta.optionsApi = { ...actual, ...parcial }
  store.actualizarCampo(campo.value.id, { meta })
}

function extraerPorRuta(obj: unknown, ruta: string | undefined): unknown {
  if (!ruta) return obj
  if (typeof obj !== 'object' || obj == null) return obj
  const partes = ruta.split('.')
  let actual: unknown = obj
  for (const p of partes) {
    if (typeof actual === 'object' && actual !== null && p in (actual as Record<string, unknown>)) {
      actual = (actual as Record<string, unknown>)[p]
    } else {
      return undefined
    }
  }
  return actual
}

type ModoCarga = 'reemplazar' | 'agregar'

async function cargarOpcionesDesdeApi(modo: ModoCarga = 'reemplazar'): Promise<void> {
  if (!campo.value) return
  const cfg = obtenerConfigApi()
  errorApi.value = null
  if (!cfg.url) {
    errorApi.value = 'Ingrese una URL para cargar opciones.'
    return
  }
  try {
    cargandoApi.value = true
    const headers: Record<string, string> = {}
    if (cfg.contentType) headers['Content-Type'] = cfg.contentType
    if (cfg.headersJson) {
      try {
        const parsed = JSON.parse(cfg.headersJson) as Record<string, unknown>
        for (const [k, v] of Object.entries(parsed)) {
          if (typeof v === 'string') headers[k] = v
        }
      } catch {
        // si headersJson no es JSON válido, lo ignoramos silenciosamente
      }
    }
    let body: string | undefined
    if ((cfg.method || 'GET') === 'POST') {
      if (cfg.contentType && cfg.contentType.includes('application/json')) {
        // validar JSON; si no es válido, enviar como texto plano
        if (cfg.body && cfg.body.trim()) {
          try {
            // aseguramos que sea JSON válido
            JSON.parse(cfg.body)
            body = cfg.body
          } catch {
            body = cfg.body
          }
        }
      } else {
        body = cfg.body && cfg.body.trim() ? cfg.body : undefined
      }
    }
    const res = await fetch(cfg.url, { method: cfg.method || 'GET', headers, body })
    if (!res.ok) throw new Error('Error HTTP ' + res.status)
    const data = await res.json()
    const arr = extraerPorRuta(data, cfg.dataPath)
    const lista = Array.isArray(arr) ? arr : (Array.isArray(data) ? data : [])
    const mapped = (lista as unknown[]).map((it) => {
      const obj = (typeof it === 'object' && it !== null) ? (it as Record<string, unknown>) : {}
      const label = cfg.labelKey ? obj[cfg.labelKey] : obj['label']
      const value = cfg.valueKey ? obj[cfg.valueKey] : obj['value']
      return {
        label: String(label ?? ''),
        value: value ?? null,
      }
    })
    if (modo === 'reemplazar') {
      actualizarOpciones(mapped)
    } else {
      // Agregar sin reemplazar, deduplicando por value (stringificado)
      const existentes = obtenerOpciones()
      const vistos = new Set(existentes.map(o => JSON.stringify(o.value)))
      const fusion = existentes.concat(mapped.filter(o => !vistos.has(JSON.stringify(o.value))))
      actualizarOpciones(fusion)
    }
  } catch (e: unknown) {
    errorApi.value = e instanceof Error ? e.message : 'Error al cargar opciones'
  } finally {
    cargandoApi.value = false
  }
}

// ----- Meta numérica (min, max, step y mensajes) -----
type MetaNumero = { min?: number; max?: number; step?: number; minMessage?: string; maxMessage?: string }
function obtenerMetaNumero(): MetaNumero {
  const m = (campo.value?.meta ?? {}) as Record<string, unknown>
  return {
    min: typeof m.min === 'number' ? (m.min as number) : undefined,
    max: typeof m.max === 'number' ? (m.max as number) : undefined,
    step: typeof m.step === 'number' ? (m.step as number) : 1,
    minMessage: typeof m.minMessage === 'string' ? (m.minMessage as string) : '',
    maxMessage: typeof m.maxMessage === 'string' ? (m.maxMessage as string) : '',
  }
}
function actualizarMetaNumero(parcial: Partial<MetaNumero>): void {
  if (!campo.value) return
  const meta = { ...(campo.value.meta ?? {}) } as Record<string, unknown>
  Object.assign(meta, parcial)
  store.actualizarCampo(campo.value.id, { meta })
}
function minMayorQueMax(): boolean {
  const m = obtenerMetaNumero()
  return typeof m.min === 'number' && typeof m.max === 'number' && m.min > m.max
}

// ----- Layout de grupo (checkbox / radio) -----
type LayoutGrupo = 'vertical' | 'horizontal'
function obtenerLayoutGrupo(): LayoutGrupo {
  const m = (campo.value?.meta ?? {}) as Record<string, unknown>
  const lay = m.layout
  return lay === 'horizontal' ? 'horizontal' : 'vertical'
}
function actualizarLayoutGrupo(l: LayoutGrupo): void {
  if (!campo.value) return
  const meta = { ...(campo.value.meta ?? {}) } as Record<string, unknown>
  meta.layout = l
  store.actualizarCampo(campo.value.id, { meta })
}
</script>

<template>
  <!-- General -->
  <div class="mb-3">
    <div class="font-semibold mb-2">General</div>
    <div class="flex flex-col gap-2">
      <div class="field" v-if="campo && campo.type!=='panel'">
        <label class="block mb-1">Tipo de campo</label>
        <PrimeSelect :model-value="(campo.type as any)" :options="opcionesTipo" option-label="label" option-value="value" class="w-full" @update:model-value="(v:TipoSimple)=> cambiarTipoCampo(v)" />
      </div>
      <div class="field">
        <label class="block mb-1">Etiqueta</label>
        <PrimeInputText :model-value="campo?.label || ''" @update:model-value="(v: string)=> actualizarTexto('label', v)" />
      </div>
      <div class="field">
        <label class="block mb-1">Nombre</label>
        <PrimeInputText :model-value="campo?.name || ''" @update:model-value="(v: string)=> actualizarTexto('name', v)" />
      </div>
      <div class="field" v-if="campo?.type!=='panel' && campo?.type!=='divider' && campo?.type!=='label' && campo?.type!=='button'">
        <label class="block mb-1">Placeholder</label>
        <PrimeInputText :model-value="campo?.placeholder || ''" @update:model-value="(v: string)=> actualizarTexto('placeholder', v)" />
      </div>
      <!-- Valor por defecto para campos de texto -->
      <div class="field" v-if="campo && (campo.type==='text'||campo.type==='email'||campo.type==='password'||campo.type==='textarea')">
        <label class="block mb-1">Valor por defecto</label>
        <PrimeInputText
          v-if="campo.type!=='textarea'"
          :model-value="(campo?.meta as any)?.valorPorDefecto ?? ''"
          @update:model-value="(v:string)=> actualizarValorPorDefecto(v)"
        />
        <PrimeTextarea
          v-else
          :model-value="(campo?.meta as any)?.valorPorDefecto ?? ''"
          rows="3"
          @update:model-value="(v:string)=> actualizarValorPorDefecto(v)"
        />
        <small class="text-muted-color">Se aplicará inicialmente en la vista previa y no sobrescribirá lo que el usuario escriba.</small>
      </div>
      <!-- Valor por defecto para campo numérico -->
      <div class="field" v-if="campo && campo.type==='number'">
        <label class="block mb-1">Valor por defecto</label>
        <PrimeInputNumber :model-value="(campo?.meta as any)?.valorPorDefecto ?? null" @update:model-value="(v:any)=> actualizarValorPorDefecto(v)" class="w-full" />
      </div>
      <!-- Restricciones numéricas -->
      <div class="field grid grid-cols-12 gap-3" v-if="campo && campo.type==='number'">
        <div class="col-span-12 md:col-span-4">
          <label class="block mb-1">Mínimo</label>
          <PrimeInputNumber :model-value="obtenerMetaNumero().min ?? null" @update:model-value="(v:any)=> actualizarMetaNumero({ min: typeof v==='number'? v : undefined })" class="w-full" />
        </div>
        <div class="col-span-12 md:col-span-4">
          <label class="block mb-1">Máximo</label>
          <PrimeInputNumber :model-value="obtenerMetaNumero().max ?? null" @update:model-value="(v:any)=> actualizarMetaNumero({ max: typeof v==='number'? v : undefined })" class="w-full" />
        </div>
        <div class="col-span-12 md:col-span-4">
          <label class="block mb-1">Paso</label>
          <PrimeInputNumber :model-value="obtenerMetaNumero().step ?? 1" @update:model-value="(v:any)=> actualizarMetaNumero({ step: typeof v==='number'? v : 1 })" class="w-full" />
        </div>
        <div class="col-span-12" v-if="minMayorQueMax()">
          <small class="text-red-500">El mínimo no debe ser mayor que el máximo.</small>
        </div>
      </div>
      <div class="field grid grid-cols-12 gap-3" v-if="campo && campo.type==='number'">
        <div class="col-span-12 md:col-span-6">
          <label class="block mb-1">Mensaje error mínimo</label>
          <PrimeInputText :model-value="obtenerMetaNumero().minMessage" @update:model-value="(v:string)=> actualizarMetaNumero({ minMessage: v })" />
        </div>
        <div class="col-span-12 md:col-span-6">
          <label class="block mb-1">Mensaje error máximo</label>
          <PrimeInputText :model-value="obtenerMetaNumero().maxMessage" @update:model-value="(v:string)=> actualizarMetaNumero({ maxMessage: v })" />
        </div>
        <small class="col-span-12 text-muted-color">Si los dejas vacíos, se usarán mensajes por defecto.</small>
      </div>
      <!-- Valor por defecto para checkbox (booleano) cuando NO tiene opciones -->
  <div class="field" v-if="campo && campo.type==='checkbox' && ((!Array.isArray((campo.meta as any)?.options)) || (((campo.meta as any)?.options?.length || 0)===0))">
        <label class="inline-flex items-center gap-2">
          <PrimeCheckbox binary :model-value="Boolean((campo?.meta as any)?.valorPorDefecto)" @update:model-value="(v:boolean)=> actualizarValorPorDefecto(v)" />
          Activado por defecto
        </label>
      </div>
      <!-- Valor por defecto para campo de hora -->
      <div class="field" v-if="campo && campo.type==='time'">
        <label class="block mb-1">Hora por defecto</label>
  <PrimeDatePicker time-only hour-format="24" :model-value="obtenerValorPorDefectoTiempoComoFecha()" @update:model-value="(v:any)=> actualizarValorPorDefectoTiempo(v as Date | null)" />
        <small class="text-muted-color">Se guarda como HH:mm; se convertirá a Date en la vista previa.</small>
      </div>
    </div>
  </div>
  <!-- Valor por defecto para campo de fecha -->
  <div class="field" v-if="campo && campo.type==='date'">
    <label class="block mb-1">Fecha por defecto</label>
    <PrimeDatePicker :model-value="(typeof (campo?.meta as any)?.valorPorDefecto==='string' ? new Date((campo?.meta as any)?.valorPorDefecto) : ((campo?.meta as any)?.valorPorDefecto instanceof Date ? (campo?.meta as any)?.valorPorDefecto : null))"
      @update:model-value="(v:any)=> actualizarValorPorDefecto(v)" />
    <small class="text-muted-color">Puedes definirla como Date o como cadena ISO (YYYY-MM-DD).</small>
  </div>

  <!-- Diseño -->
  <div class="mb-3">
    <div class="font-semibold mb-2">Diseño</div>
    <div class="field grid grid-cols-12 gap-3">
      <div class="col-span-12 md:col-span-4">
        <label class="block mb-1">Cols sm</label>
  <PrimeSelect :model-value="campo?.grid?.sm ?? 12" :options="[1,2,3,4,5,6,7,8,9,10,11,12]" class="w-full" @update:model-value="(v: number | null)=> actualizarGrid({ sm: Number(v ?? 12) })" />
      </div>
      <div class="col-span-12 md:col-span-4">
        <label class="block mb-1">Cols md</label>
  <PrimeSelect :model-value="campo?.grid?.md ?? 6" :options="[1,2,3,4,5,6,7,8,9,10,11,12]" class="w-full" @update:model-value="(v: number | null)=> actualizarGrid({ md: Number(v ?? 6) })" />
      </div>
      <div class="col-span-12 md:col-span-4">
        <label class="block mb-1">Cols lg</label>
  <PrimeSelect :model-value="campo?.grid?.lg ?? 6" :options="[1,2,3,4,5,6,7,8,9,10,11,12]" class="w-full" @update:model-value="(v: number | null)=> actualizarGrid({ lg: Number(v ?? 6) })" />
      </div>
    </div>
  </div>

  <!-- Comportamiento -->
  <div class="mb-3">
    <div class="font-semibold mb-2">Comportamiento</div>
    <div class="field">
      <label class="inline-flex items-center gap-2">
        <PrimeCheckbox binary :model-value="!!campo?.visible" @update:model-value="(v: boolean)=> actualizarBooleano('visible', v)" />
        Visible
      </label>
    </div>
    <div class="field" v-if="campo?.type!=='divider' && campo?.type!=='label' && campo?.type!=='panel' && campo?.type!=='button'">
      <label class="inline-flex items-center gap-2">
        <PrimeCheckbox binary :model-value="!!campo?.required" @update:model-value="(v: boolean)=> actualizarBooleano('required', v)" />
        Requerido
      </label>
    </div>
    <div v-if="campo?.required" class="field">
      <label class="block mb-1">Mensaje de requerido</label>
      <PrimeInputText :model-value="obtenerMensajeRequerido()" @update:model-value="(v:string)=> actualizarMensajeRequerido(v)" />
      <small class="text-muted-color">Se mostrará en la vista previa cuando el campo sea obligatorio.</small>
    </div>
  <div class="field" v-if="campo && (campo.type==='text'||campo.type==='textarea'||campo.type==='email'||campo.type==='password'||campo.type==='select'||campo.type==='radio'||campo.type==='time'||campo.type==='date'||campo.type==='button'||campo.type==='number'||campo.type==='checkbox')">
      <label class="inline-flex items-center gap-2">
        <PrimeCheckbox binary :model-value="!!campo?.disabled" @update:model-value="(v: boolean)=> store.actualizarCampo(campo!.id, { disabled: v })" />
        Deshabilitado
      </label>
    </div>
    <div class="field" v-if="campo && (campo.type==='text'||campo.type==='textarea'||campo.type==='email'||campo.type==='password'||campo.type==='number')">
      <label class="inline-flex items-center gap-2">
        <PrimeCheckbox binary :model-value="!!campo?.readonly" @update:model-value="(v: boolean)=> store.actualizarCampo(campo!.id, { readonly: v })" />
        Solo lectura
      </label>
    </div>
    <div class="field" v-if="campo && (campo.type==='radio'||campo.type==='checkbox') && ((campo.meta as any)?.options?.length||0) > 0">
      <label class="block mb-1">Distribución de opciones</label>
      <PrimeSelectButton :model-value="obtenerLayoutGrupo()" :options="[{label:'Vertical', value:'vertical'},{label:'Horizontal', value:'horizontal'}]" option-label="label" option-value="value" @update:model-value="(v:'vertical'|'horizontal')=> actualizarLayoutGrupo(v)" />
      <small class="text-muted-color">Controla si las opciones se muestran en columna o en fila.</small>
    </div>
  </div>

  <!-- Datos para select/radio/checkbox (grupo) -->
  <div v-if="campo?.type==='select' || campo?.type==='radio' || campo?.type==='checkbox'" class="mb-3">
    <div class="font-semibold mb-2">Datos</div>
    <div class="grid grid-cols-12 gap-3 mb-2">
      <div class="col-span-12">
        <label class="block mb-1">Fuente de opciones</label>
        <PrimeSelect
          :model-value="obtenerModoOpciones()"
          :options="[{ label: 'Manual', value: 'manual' }, { label: 'API', value: 'api' }]"
          option-label="label"
          option-value="value"
          class="w-full"
          @update:model-value="(v: ModoOpciones)=> actualizarModoOpciones(v)"
        />
      </div>
    </div>

    <!-- UI Modo Manual -->
    <template v-if="obtenerModoOpciones()==='manual'">
    <div class="flex justify-between items-center mb-2">
      <span class="font-semibold">Opciones</span>
      <PrimeButton label="Agregar" size="small" icon="pi pi-plus" @click="agregarOpcion" />
    </div>
    <div v-for="(op, i) in obtenerOpciones()" :key="i" class="grid grid-cols-12 gap-3 items-end">
      <div class="col-span-12 md:col-span-5">
        <label class="block mb-1">Etiqueta</label>
        <PrimeInputText :model-value="String(op.label)" @update:model-value="(v:string)=> actualizarOpcion(i,'label', v)" />
      </div>
      <div class="col-span-12 md:col-span-5">
        <label class="block mb-1">Valor</label>
        <PrimeInputText :model-value="String(op.value ?? '')" @update:model-value="(v:string)=> actualizarOpcion(i,'value', v)" />
      </div>
      <div class="col-span-12 md:col-span-2">
        <PrimeButton icon="pi pi-trash" severity="danger" text @click="() => eliminarOpcion(i)" />
      </div>
    </div>
    </template>

    <!-- UI Modo API -->
    <div v-if="obtenerModoOpciones()==='api'" class="mt-2 p-2 border-1 surface-border border-round">
      <div class="font-semibold mb-2 text-sm">Cargar opciones por API</div>
      <div class="grid grid-cols-12 gap-3">
        <div class="col-span-12">
          <label class="block mb-1">URL</label>
          <PrimeInputText :model-value="obtenerConfigApi().url" placeholder="https://api.midominio.com/opciones" @update:model-value="(v:string)=> actualizarConfigApi({ url: v })" />
        </div>
        <div class="col-span-12 md:col-span-4">
          <label class="block mb-1">Método</label>
          <PrimeSelect
            :model-value="obtenerConfigApi().method || 'GET'"
            :options="[{ label: 'GET', value: 'GET' }, { label: 'POST', value: 'POST' }]"
            option-label="label"
            option-value="value"
            class="w-full"
            @update:model-value="(v:'GET'|'POST')=> actualizarConfigApi({ method: v })"
          />
        </div>
        <div class="col-span-12 md:col-span-8">
          <label class="block mb-1">Content-Type</label>
          <PrimeSelect
            :model-value="obtenerConfigApi().contentType || 'application/json'"
            :options="[
              { label: 'application/json', value: 'application/json' },
              { label: 'text/plain', value: 'text/plain' },
              { label: 'application/x-www-form-urlencoded', value: 'application/x-www-form-urlencoded' }
            ]"
            option-label="label"
            option-value="value"
            class="w-full"
            @update:model-value="(v:string)=> actualizarConfigApi({ contentType: v })"
          />
        </div>
        <div class="col-span-12 md:col-span-6">
          <label class="block mb-1">Ruta datos (opcional)</label>
          <PrimeInputText :model-value="obtenerConfigApi().dataPath" placeholder="por ej.: data.items" @update:model-value="(v:string)=> actualizarConfigApi({ dataPath: v })" />
        </div>
        <div class="col-span-12 md:col-span-3">
          <label class="block mb-1">Clave Valor</label>
          <PrimeInputText :model-value="obtenerConfigApi().valueKey" placeholder="valor" @update:model-value="(v:string)=> actualizarConfigApi({ valueKey: v })" />
        </div>
        <div class="col-span-12 md:col-span-3">
          <label class="block mb-1">Clave Etiqueta</label>
          <PrimeInputText :model-value="obtenerConfigApi().labelKey" placeholder="etiqueta" @update:model-value="(v:string)=> actualizarConfigApi({ labelKey: v })" />
        </div>
        <div class="col-span-12" v-if="(obtenerConfigApi().method||'GET')==='POST'">
          <label class="block mb-1">Body (JSON o texto)</label>
          <PrimeTextarea :model-value="obtenerConfigApi().body" rows="4" placeholder='{"page":1}' @update:model-value="(v:string)=> actualizarConfigApi({ body: v })" />
        </div>
        <div class="col-span-12">
          <label class="block mb-1">Headers (JSON opcional)</label>
          <PrimeTextarea :model-value="obtenerConfigApi().headersJson" rows="3" placeholder='{"Authorization":"Bearer ..."}' @update:model-value="(v:string)=> actualizarConfigApi({ headersJson: v })" />
        </div>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <PrimeButton :disabled="cargandoApi" size="small" icon="pi pi-refresh" :label="cargandoApi ? 'Cargando…' : 'Reemplazar con API'" @click="cargarOpcionesDesdeApi('reemplazar')" />
        <PrimeButton :disabled="cargandoApi" size="small" icon="pi pi-plus" severity="secondary" label="Añadir desde API" @click="cargarOpcionesDesdeApi('agregar')" />
        <small v-if="errorApi" class="text-red-500">{{ errorApi }}</small>
      </div>
      <small class="text-muted-color block mt-2">Reemplazar: sustituye todas las opciones. Añadir: agrega nuevas sin duplicar por valor.</small>
    </div>

    <!-- Selector de valor por defecto -->
    <div class="mt-3">
      <label class="block mb-1">Valor por defecto</label>
      <template v-if="campo?.type==='checkbox'">
        <PrimeMultiSelect
          :model-value="(Array.isArray(obtenerValorPorDefecto()) ? (obtenerValorPorDefecto() as any[]) : [])"
          :options="obtenerOpciones()"
          option-label="label"
          option-value="value"
          placeholder="(sin valores por defecto)"
          class="w-full mb-2"
          display="chip"
          @update:model-value="(v:any[])=> actualizarValorPorDefecto(v)"
        />
        <small class="text-muted-color">Puedes preseleccionar varias opciones para el grupo de checkboxes.</small>
      </template>
      <template v-else>
        <PrimeSelect
          :model-value="obtenerValorPorDefecto() as any"
          :options="obtenerOpciones()"
          option-label="label"
          option-value="value"
          placeholder="(sin valor por defecto)"
          class="w-full mb-2"
          @update:model-value="(v:any)=> actualizarValorPorDefecto(v)"
        />
        <small class="text-muted-color">Selecciona qué opción quedará preseleccionada por defecto.</small>
      </template>
    </div>
  </div>

  <!-- Tabla -->
  <div v-if="campo?.type==='table'" class="mb-3">
    <div class="font-semibold mb-2">Tabla</div>
    <div class="flex justify-between items-center mb-2">
      <span class="font-semibold">Columnas</span>
      <div class="flex gap-2 items-center">
        <PrimeSelect
          :model-value="indiceColumna"
          :options="obtenerColumnas().map((c, i) => ({ label: (c.label || c.name || ('Col '+(i+1))), value: i }))"
          option-label="label" option-value="value" class="w-full md:w-64"
          @update:model-value="(v:number)=> { indiceColumna = v as any; asegurarIndiceColumna() }"
        />
        <PrimeButton label="Agregar" size="small" icon="pi pi-plus" @click="() => { agregarColumna(); indiceColumna = obtenerColumnas().length - 1; asegurarIndiceColumna() }" />
        <PrimeButton label="Eliminar" size="small" icon="pi pi-trash" severity="danger" :disabled="obtenerColumnas().length===0" @click="() => { eliminarColumna(indiceColumna); asegurarIndiceColumna() }" />
      </div>
    </div>
    <div class="mb-2">
      <draggable
        :list="obtenerColumnas() as any"
        item-key="name"
        handle=".drag-handle"
        ghost-class="surface-100"
        class="grid grid-cols-12 gap-2"
        @end="(e:any) => {
          const current = obtenerColumnas()
          // vuedraggable ya reordenó la lista reactiva en meta; sin embargo, forzamos persistencia explícita
          actualizarColumnas([...current])
          // ajustar índice seleccionado si es necesario
          asegurarIndiceColumna()
        }"
      >
        <template #item="{ element, index }">
          <div class="col-span-12 md:col-span-6 flex items-center justify-between p-2 border-1 surface-border border-round">
            <div class="flex items-center gap-2">
              <i class="pi pi-bars drag-handle cursor-move" />
              <span class="font-medium">{{ element.label || element.name || ('Col ' + (index+1)) }}</span>
            </div>
            <div class="flex items-center gap-2">
              <PrimeTag v-if="element.type" :value="String(element.type)" severity="secondary" />
            </div>
          </div>
        </template>
      </draggable>
      <small class="text-muted-color">Arrastra para reordenar columnas. La configuración se mantiene para cada columna.</small>
    </div>
    <template v-if="obtenerColumnas().length">
      <div class="grid grid-cols-12 gap-3 items-end">
        <div class="col-span-12 md:col-span-4">
          <label class="block mb-1">Nombre</label>
          <PrimeInputText :model-value="obtenerColumnas()[indiceColumna].name" @update:model-value="(v:string)=> actualizarColumna(indiceColumna,'name', v)" />
          <small v-if="esNombreColumnaDuplicado(indiceColumna)" class="text-red-500">El nombre ya existe en otra columna.</small>
        </div>
        <div class="col-span-12 md:col-span-4">
          <label class="block mb-1">Etiqueta</label>
          <PrimeInputText :model-value="obtenerColumnas()[indiceColumna].label" @update:model-value="(v:string)=> actualizarColumna(indiceColumna,'label', v)" />
        </div>
        <div class="col-span-12 md:col-span-4">
          <label class="block mb-1">Tipo</label>
          <PrimeSelect :model-value="obtenerColumnas()[indiceColumna].type || 'text'" :options="['text','number','date']" @update:model-value="(v:string)=> actualizarColumna(indiceColumna,'type', v)" />
        </div>
      </div>
      <div class="col-12 mt-2" v-if="obtenerColumnas()[indiceColumna].type==='number'">
        <div class="font-semibold mb-1">Formato</div>
        <div class="grid grid-cols-12 gap-3">
          <div class="col-span-12 md:col-span-3">
            <label class="block mb-1">Modo</label>
            <PrimeSelect :model-value="(obtenerColumnas()[indiceColumna] as any).formatMode || 'decimal'" :options="['decimal','currency','percent']" @update:model-value="(v:string)=> actualizarColumna(indiceColumna,'formatMode', v as any)" />
          </div>
          <div class="col-span-12 md:col-span-3" v-if="(obtenerColumnas()[indiceColumna] as any).formatMode==='currency'">
            <label class="block mb-1">Moneda</label>
            <PrimeInputText :model-value="(obtenerColumnas()[indiceColumna] as any).currency || 'USD'" @update:model-value="(v:string)=> actualizarColumna(indiceColumna,'currency', v as any)" />
          </div>
          <div class="col-span-12 md:col-span-3">
            <label class="block mb-1">Locale</label>
            <PrimeInputText :model-value="(obtenerColumnas()[indiceColumna] as any).locale || 'es-ES'" @update:model-value="(v:string)=> actualizarColumna(indiceColumna,'locale', v as any)" />
          </div>
          <div class="col-span-12 md:col-span-3">
            <label class="block mb-1">Prefijo</label>
            <PrimeInputText :model-value="(obtenerColumnas()[indiceColumna] as any).prefix || ''" @update:model-value="(v:string)=> actualizarColumna(indiceColumna,'prefix', v as any)" />
          </div>
          <div class="col-span-12 md:col-span-3">
            <label class="block mb-1">Sufijo</label>
            <PrimeInputText :model-value="(obtenerColumnas()[indiceColumna] as any).suffix || ''" @update:model-value="(v:string)=> actualizarColumna(indiceColumna,'suffix', v as any)" />
          </div>
          <div class="col-span-12 md:col-span-3">
            <label class="block mb-1">Mín. decimales</label>
            <PrimeInputNumber :model-value="(obtenerColumnas()[indiceColumna] as any).minFractionDigits ?? 0" :min="0" :max="8" @update:model-value="(v:any)=> actualizarColumna(indiceColumna,'minFractionDigits', (typeof v==='number'? v : 0) as any)" class="w-full" />
          </div>
          <div class="col-span-12 md:col-span-3">
            <label class="block mb-1">Máx. decimales</label>
            <PrimeInputNumber :model-value="(obtenerColumnas()[indiceColumna] as any).maxFractionDigits ?? 2" :min="0" :max="8" @update:model-value="(v:any)=> actualizarColumna(indiceColumna,'maxFractionDigits', (typeof v==='number'? v : 2) as any)" class="w-full" />
          </div>
          <div class="col-span-12 md:col-span-3" v-if="(obtenerColumnas()[indiceColumna] as any).formatMode==='percent'">
            <label class="block mb-1">Escala porcentaje</label>
            <PrimeSelect :model-value="(obtenerColumnas()[indiceColumna] as any).percentScale || 'whole'" :options="[{label:'15 = 15%', value:'whole'},{label:'0.15 = 15%', value:'fraction'}]" option-label="label" option-value="value" @update:model-value="(v:'whole'|'fraction')=> actualizarColumna(indiceColumna,'percentScale', v as any)" />
          </div>
        </div>
      </div>
      <div class="col-12 mt-2">
        <div class="font-semibold mb-1">Agregado</div>
        <div class="grid grid-cols-12 gap-3">
          <div class="col-span-12 md:col-span-3">
            <label class="block mb-1">Función</label>
            <PrimeSelect :model-value="(obtenerColumnas()[indiceColumna] as any).agg || 'none'" :options="['none','sum','avg','count','min','max']" @update:model-value="(v:string)=> actualizarColumna(indiceColumna,'agg', v)" />
          </div>
          <div class="col-span-12 md:col-span-3">
            <label class="block mb-1">Prefijo</label>
            <PrimeInputText :model-value="(obtenerColumnas()[indiceColumna] as any).aggPrefix || ''" @update:model-value="(v:string)=> actualizarColumna(indiceColumna,'aggPrefix', v)" />
          </div>
          <div class="col-span-12 md:col-span-3">
            <label class="block mb-1">Sufijo</label>
            <PrimeInputText :model-value="(obtenerColumnas()[indiceColumna] as any).aggSuffix || ''" @update:model-value="(v:string)=> actualizarColumna(indiceColumna,'aggSuffix', v)" />
          </div>
          <div class="col-span-12 md:col-span-3">
            <label class="block mb-1">Decimales</label>
            <PrimeInputNumber :model-value="(obtenerColumnas()[indiceColumna] as any).decimals ?? 2" :min="0" :max="8" @update:model-value="(v:any)=> actualizarColumna(indiceColumna,'decimals', typeof v==='number'? v : 2)" class="w-full" />
          </div>
        </div>
      </div>
      <div class="col-12 mt-2">
        <div class="font-semibold mb-1">Validación</div>
        <div class="grid grid-cols-12 gap-3">
          <div class="col-span-12 md:col-span-3">
            <label class="inline-flex items-center gap-2">
              <PrimeCheckbox binary :model-value="Boolean((obtenerColumnas()[indiceColumna] as any).required)" @update:model-value="(v:boolean)=> actualizarColumna(indiceColumna,'required', v as any)" />
              Requerido
            </label>
          </div>
          <div class="col-span-12 md:col-span-3" v-if="obtenerColumnas()[indiceColumna].type==='number'">
            <label class="block mb-1">Mínimo</label>
            <PrimeInputNumber :model-value="(obtenerColumnas()[indiceColumna] as any).min ?? null" @update:model-value="(v:any)=> actualizarColumna(indiceColumna,'min', typeof v==='number'? v : (null as any))" class="w-full" />
          </div>
          <div class="col-span-12 md:col-span-3" v-if="obtenerColumnas()[indiceColumna].type==='number'">
            <label class="block mb-1">Máximo</label>
            <PrimeInputNumber :model-value="(obtenerColumnas()[indiceColumna] as any).max ?? null" @update:model-value="(v:any)=> actualizarColumna(indiceColumna,'max', typeof v==='number'? v : (null as any))" class="w-full" />
          </div>
          <div class="col-span-12 md:col-span-6" v-if="obtenerColumnas()[indiceColumna].type==='number'">
            <label class="block mb-1">Mensaje min</label>
            <PrimeInputText :model-value="(obtenerColumnas()[indiceColumna] as any).minMessage || ''" @update:model-value="(v:string)=> actualizarColumna(indiceColumna,'minMessage', v as any)" />
          </div>
          <div class="col-span-12 md:col-span-6" v-if="obtenerColumnas()[indiceColumna].type==='number'">
            <label class="block mb-1">Mensaje max</label>
            <PrimeInputText :model-value="(obtenerColumnas()[indiceColumna] as any).maxMessage || ''" @update:model-value="(v:string)=> actualizarColumna(indiceColumna,'maxMessage', v as any)" />
          </div>
        </div>
      </div>
    </template>
    <div class="mt-2">
      <label class="inline-flex items-center gap-2">
  <PrimeCheckbox binary :model-value="Boolean((campo?.meta as any)?.addRows)" @update:model-value="(v:boolean)=> actualizarAddRows(v)" />
        Permitir añadir filas
      </label>
    </div>
    <div class="mt-2 grid grid-cols-12 gap-3 items-end">
      <div class="col-span-12 md:col-span-4">
        <label class="block mb-1">Filas</label>
        <PrimeInputNumber :model-value="Number(((campo?.meta as any)?.rows ?? 1))" :min="1" @update:model-value="(v:any)=> { const meta = { ...(campo?.meta as any) }; meta.rows = Math.max(1, Number(v||1)); store.actualizarCampo(campo!.id, { meta }) }" class="w-full" />
      </div>
      <div class="col-span-12 md:col-span-8">
        <small class="text-muted-color">Se aplicará al inicializar los datos o cuando estén vacíos.</small>
      </div>
    </div>
    <!-- <div class="mt-3">
      <div class="font-semibold mb-2">Resumen</div>
      <div class="grid grid-cols-12 gap-3">
        <div class="col-span-12 md:col-span-4">
          <label class="block mb-1">Mostrar resumen</label>
          <PrimeCheckbox binary :model-value="Boolean((campo?.meta as any)?.showSummary)" @update:model-value="(v:boolean)=> { const meta = { ...(campo?.meta as any) }; meta.showSummary = v; store.actualizarCampo(campo!.id, { meta }) }" />
        </div>
        <div class="col-span-12 md:col-span-8">
          <label class="block mb-1">Etiqueta resumen</label>
          <PrimeInputText :model-value="String(((campo?.meta as any)?.summaryLabel ?? 'Total'))" @update:model-value="(v:string)=> { const meta = { ...(campo?.meta as any) }; meta.summaryLabel = v; store.actualizarCampo(campo!.id, { meta }) }" />
        </div>
      </div>
    </div> -->
    <div class="mt-3">
      <div class="font-semibold mb-2">Estilo de tabla</div>
      <div class="grid grid-cols-12 gap-3">
        <div class="col-span-12 sm:col-span-3">
          <label class="block mb-1">Bordes</label>
          <PrimeCheckbox binary :model-value="Boolean((campo?.meta as any)?.tableStyle?.bordered)" @update:model-value="(v:boolean)=> { const meta = { ...(campo?.meta as any), tableStyle: { ...((campo?.meta as any)?.tableStyle||{}) } }; meta.tableStyle.bordered = v; store.actualizarCampo(campo!.id, { meta }) }" />
        </div>
        <div class="col-span-12 sm:col-span-3">
          <label class="block mb-1">Zebra</label>
          <PrimeCheckbox binary :model-value="Boolean((campo?.meta as any)?.tableStyle?.striped)" @update:model-value="(v:boolean)=> { const meta = { ...(campo?.meta as any), tableStyle: { ...((campo?.meta as any)?.tableStyle||{}) } }; meta.tableStyle.striped = v; store.actualizarCampo(campo!.id, { meta }) }" />
        </div>
        <div class="col-span-12 sm:col-span-3">
          <label class="block mb-1">Hover</label>
          <PrimeCheckbox binary :model-value="Boolean((campo?.meta as any)?.tableStyle?.hover)" @update:model-value="(v:boolean)=> { const meta = { ...(campo?.meta as any), tableStyle: { ...((campo?.meta as any)?.tableStyle||{}) } }; meta.tableStyle.hover = v; store.actualizarCampo(campo!.id, { meta }) }" />
        </div>
        <div class="col-span-12 sm:col-span-3">
          <label class="block mb-1">Padding</label>
          <PrimeSelect :model-value="(((campo?.meta as any)?.tableStyle?.padding) || 'md')" :options="['sm','md','lg']" @update:model-value="(v:string)=> { const meta = { ...(campo?.meta as any), tableStyle: { ...((campo?.meta as any)?.tableStyle||{}) } }; meta.tableStyle.padding = v; store.actualizarCampo(campo!.id, { meta }) }" />
        </div>
      </div>
    </div>
  </div>
</template>
