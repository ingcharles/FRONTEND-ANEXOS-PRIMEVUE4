<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDesignerStore } from '@/stores/useDesignerStore'
import type { ValidationRule } from '@/types/form-schema'

defineProps<{ fieldId: string }>()
const store = useDesignerStore()
const campo = computed(() => store.campoSeleccionado)

function actualizarTexto(clave: 'label' | 'name' | 'placeholder', valor: string): void {
  if (!campo.value) return
  store.actualizarCampo(campo.value.id, { [clave]: valor })
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
type ColumnaTabla = { name: string; label: string; type?: 'text' | 'number' }
function obtenerColumnas(): ColumnaTabla[] {
  const cols = (campo.value?.meta as Record<string, unknown> | undefined)?.columns as unknown as ColumnaTabla[] | undefined
  return Array.isArray(cols) ? cols : []
}
function actualizarColumnas(nuevas: ColumnaTabla[]): void {
  if (!campo.value) return
  const meta = { ...(campo.value.meta ?? {}) } as Record<string, unknown>
  meta.columns = nuevas
  store.actualizarCampo(campo.value.id, { meta })
}
function agregarColumna(): void {
  const cols = obtenerColumnas()
  actualizarColumnas([...cols, { name: `col${cols.length + 1}`, label: `Columna ${cols.length + 1}`, type: 'text' }])
}
function actualizarColumna(ind: number, prop: keyof ColumnaTabla, valor: string): void {
  const cols = obtenerColumnas().map((c, i) => (i === ind ? { ...c, [prop]: valor } : c))
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
    labelKey: cfg.labelKey || 'label',
    valueKey: cfg.valueKey || 'value',
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
</script>

<template>
  <!-- General -->
  <div class="mb-3">
    <div class="font-semibold mb-2">General</div>
    <div class="flex flex-column gap-2">
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
      <!-- Valor por defecto para checkbox (booleano) -->
      <div class="field" v-if="campo && campo.type==='checkbox'">
        <label class="inline-flex align-items-center gap-2">
          <PrimeCheckbox binary :model-value="Boolean((campo?.meta as any)?.valorPorDefecto)" @update:model-value="(v:boolean)=> actualizarValorPorDefecto(v)" />
          Activado por defecto
        </label>
      </div>
      <!-- Valor por defecto para campo de hora -->
      <div class="field" v-if="campo && campo.type==='time'">
        <label class="block mb-1">Hora por defecto</label>
        <PrimeCalendar time-only hour-format="24" :model-value="obtenerValorPorDefectoTiempoComoFecha()" @update:model-value="(v:any)=> actualizarValorPorDefectoTiempo(v as Date | null)" />
        <small class="text-muted-color">Se guarda como HH:mm; se convertirá a Date en la vista previa.</small>
      </div>
    </div>
  </div>

  <!-- Diseño -->
  <div class="mb-3">
    <div class="font-semibold mb-2">Diseño</div>
    <div class="field grid">
      <div class="col-4">
        <label class="block mb-1">Cols sm</label>
        <PrimeDropdown :model-value="campo?.grid?.sm ?? 12" :options="[1,2,3,4,5,6,7,8,9,10,11,12]" class="w-full" @update:model-value="(v: number | null)=> actualizarGrid({ sm: Number(v ?? 12) })" />
      </div>
      <div class="col-4">
        <label class="block mb-1">Cols md</label>
        <PrimeDropdown :model-value="campo?.grid?.md ?? 6" :options="[1,2,3,4,5,6,7,8,9,10,11,12]" class="w-full" @update:model-value="(v: number | null)=> actualizarGrid({ md: Number(v ?? 6) })" />
      </div>
      <div class="col-4">
        <label class="block mb-1">Cols lg</label>
        <PrimeDropdown :model-value="campo?.grid?.lg ?? 6" :options="[1,2,3,4,5,6,7,8,9,10,11,12]" class="w-full" @update:model-value="(v: number | null)=> actualizarGrid({ lg: Number(v ?? 6) })" />
      </div>
    </div>
  </div>

  <!-- Comportamiento -->
  <div class="mb-3">
    <div class="font-semibold mb-2">Comportamiento</div>
    <div class="field">
      <label class="inline-flex align-items-center gap-2">
        <PrimeCheckbox binary :model-value="!!campo?.visible" @update:model-value="(v: boolean)=> actualizarBooleano('visible', v)" />
        Visible
      </label>
    </div>
    <div class="field" v-if="campo?.type!=='divider' && campo?.type!=='label' && campo?.type!=='panel' && campo?.type!=='button'">
      <label class="inline-flex align-items-center gap-2">
        <PrimeCheckbox binary :model-value="!!campo?.required" @update:model-value="(v: boolean)=> actualizarBooleano('required', v)" />
        Requerido
      </label>
    </div>
    <div v-if="campo?.required" class="field">
      <label class="block mb-1">Mensaje de requerido</label>
      <PrimeInputText :model-value="obtenerMensajeRequerido()" @update:model-value="(v:string)=> actualizarMensajeRequerido(v)" />
      <small class="text-muted-color">Se mostrará en la vista previa cuando el campo sea obligatorio.</small>
    </div>
    <div class="field" v-if="campo && (campo.type==='text'||campo.type==='textarea'||campo.type==='email'||campo.type==='password'||campo.type==='select'||campo.type==='radio'||campo.type==='time'||campo.type==='button'||campo.type==='number'||campo.type==='checkbox')">
      <label class="inline-flex align-items-center gap-2">
        <PrimeCheckbox binary :model-value="!!campo?.disabled" @update:model-value="(v: boolean)=> store.actualizarCampo(campo!.id, { disabled: v })" />
        Deshabilitado
      </label>
    </div>
    <div class="field" v-if="campo && (campo.type==='text'||campo.type==='textarea'||campo.type==='email'||campo.type==='password'||campo.type==='number')">
      <label class="inline-flex align-items-center gap-2">
        <PrimeCheckbox binary :model-value="!!campo?.readonly" @update:model-value="(v: boolean)=> store.actualizarCampo(campo!.id, { readonly: v })" />
        Solo lectura
      </label>
    </div>
  </div>

  <!-- Datos para select/radio -->
  <div v-if="campo?.type==='select' || campo?.type==='radio'" class="mb-3">
    <div class="font-semibold mb-2">Datos (Select/Radio)</div>
    <div class="grid mb-2">
      <div class="col-6">
        <label class="block mb-1">Fuente de opciones</label>
        <PrimeDropdown
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
    <div class="flex justify-content-between align-items-center mb-2">
      <span class="font-semibold">Opciones</span>
      <PrimeButton label="Agregar" size="small" icon="pi pi-plus" @click="agregarOpcion" />
    </div>
    <div v-for="(op, i) in obtenerOpciones()" :key="i" class="grid align-items-end">
      <div class="col-5">
        <label class="block mb-1">Etiqueta</label>
        <PrimeInputText :model-value="String(op.label)" @update:model-value="(v:string)=> actualizarOpcion(i,'label', v)" />
      </div>
      <div class="col-5">
        <label class="block mb-1">Valor</label>
        <PrimeInputText :model-value="String(op.value ?? '')" @update:model-value="(v:string)=> actualizarOpcion(i,'value', v)" />
      </div>
      <div class="col-2">
        <PrimeButton icon="pi pi-trash" severity="danger" text @click="() => eliminarOpcion(i)" />
      </div>
    </div>
    </template>

    <!-- UI Modo API -->
    <div v-if="obtenerModoOpciones()==='api'" class="mt-2 p-2 border-1 surface-border border-round">
      <div class="font-semibold mb-2 text-sm">Cargar opciones por API</div>
      <div class="grid">
        <div class="col-12">
          <label class="block mb-1">URL</label>
          <PrimeInputText :model-value="obtenerConfigApi().url" placeholder="https://api.midominio.com/opciones" @update:model-value="(v:string)=> actualizarConfigApi({ url: v })" />
        </div>
        <div class="col-4">
          <label class="block mb-1">Método</label>
          <PrimeDropdown
            :model-value="obtenerConfigApi().method || 'GET'"
            :options="[{ label: 'GET', value: 'GET' }, { label: 'POST', value: 'POST' }]"
            option-label="label"
            option-value="value"
            class="w-full"
            @update:model-value="(v:'GET'|'POST')=> actualizarConfigApi({ method: v })"
          />
        </div>
        <div class="col-8">
          <label class="block mb-1">Content-Type</label>
          <PrimeDropdown
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
        <div class="col-6">
          <label class="block mb-1">Ruta datos (opcional)</label>
          <PrimeInputText :model-value="obtenerConfigApi().dataPath" placeholder="por ej.: data.items" @update:model-value="(v:string)=> actualizarConfigApi({ dataPath: v })" />
        </div>
        <div class="col-3">
          <label class="block mb-1">labelKey</label>
          <PrimeInputText :model-value="obtenerConfigApi().labelKey" placeholder="label" @update:model-value="(v:string)=> actualizarConfigApi({ labelKey: v })" />
        </div>
        <div class="col-3">
          <label class="block mb-1">valueKey</label>
          <PrimeInputText :model-value="obtenerConfigApi().valueKey" placeholder="value" @update:model-value="(v:string)=> actualizarConfigApi({ valueKey: v })" />
        </div>
        <div class="col-12" v-if="(obtenerConfigApi().method||'GET')==='POST'">
          <label class="block mb-1">Body (JSON o texto)</label>
          <PrimeTextarea :model-value="obtenerConfigApi().body" rows="4" placeholder='{"page":1}' @update:model-value="(v:string)=> actualizarConfigApi({ body: v })" />
        </div>
        <div class="col-12">
          <label class="block mb-1">Headers (JSON opcional)</label>
          <PrimeTextarea :model-value="obtenerConfigApi().headersJson" rows="3" placeholder='{"Authorization":"Bearer ..."}' @update:model-value="(v:string)=> actualizarConfigApi({ headersJson: v })" />
        </div>
      </div>
      <div class="flex align-items-center gap-2 flex-wrap">
        <PrimeButton :disabled="cargandoApi" size="small" icon="pi pi-refresh" :label="cargandoApi ? 'Cargando…' : 'Reemplazar con API'" @click="cargarOpcionesDesdeApi('reemplazar')" />
        <PrimeButton :disabled="cargandoApi" size="small" icon="pi pi-plus" severity="secondary" label="Añadir desde API" @click="cargarOpcionesDesdeApi('agregar')" />
        <small v-if="errorApi" class="text-red-500">{{ errorApi }}</small>
      </div>
      <small class="text-muted-color block mt-2">Reemplazar: sustituye todas las opciones. Añadir: agrega nuevas sin duplicar por valor.</small>
    </div>

    <!-- Selector de valor por defecto -->
    <div class="mt-3">
      <label class="block mb-1">Valor por defecto</label>
      <PrimeDropdown
        :model-value="obtenerValorPorDefecto() as any"
        :options="obtenerOpciones()"
        option-label="label"
        option-value="value"
        placeholder="(sin valor por defecto)"
        class="w-full mb-2"
        @update:model-value="(v:any)=> actualizarValorPorDefecto(v)"
      />
      <small class="text-muted-color">Selecciona qué opción quedará preseleccionada por defecto.</small>
    </div>
  </div>

  <!-- Tabla -->
  <div v-if="campo?.type==='table'" class="mb-3">
    <div class="font-semibold mb-2">Tabla</div>
    <div class="flex justify-content-between align-items-center mb-2">
      <span class="font-semibold">Columnas</span>
      <PrimeButton label="Agregar" size="small" icon="pi pi-plus" @click="agregarColumna" />
    </div>
    <div v-for="(col, i) in obtenerColumnas()" :key="i" class="grid align-items-end">
      <div class="col-4">
        <label class="block mb-1">Nombre</label>
        <PrimeInputText :model-value="col.name" @update:model-value="(v:string)=> actualizarColumna(i,'name', v)" />
      </div>
      <div class="col-4">
        <label class="block mb-1">Etiqueta</label>
        <PrimeInputText :model-value="col.label" @update:model-value="(v:string)=> actualizarColumna(i,'label', v)" />
      </div>
      <div class="col-3">
        <label class="block mb-1">Tipo</label>
        <PrimeDropdown :model-value="col.type || 'text'" :options="['text','number']" @update:model-value="(v:string)=> actualizarColumna(i,'type', v)" />
      </div>
      <div class="col-1">
        <PrimeButton icon="pi pi-trash" severity="danger" text @click="() => eliminarColumna(i)" />
      </div>
    </div>
    <div class="mt-2">
      <label class="inline-flex align-items-center gap-2">
  <PrimeCheckbox binary :model-value="Boolean((campo?.meta as any)?.addRows)" @update:model-value="(v:boolean)=> actualizarAddRows(v)" />
        Permitir añadir filas
      </label>
    </div>
  </div>
</template>
