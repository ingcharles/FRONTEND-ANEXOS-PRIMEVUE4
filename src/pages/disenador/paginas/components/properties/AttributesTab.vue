<script setup lang="ts">
import { computed } from 'vue'
import { useDesignerStore } from '@/stores/useDesignerStore'

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
</script>

<template>
  <div class="flex flex-column gap-2">
    <div class="field">
      <label class="block mb-1">Etiqueta</label>
  <PrimeInputText :model-value="campo?.label || ''" @update:model-value="(v: string)=> actualizarTexto('label', v)" />
    </div>
    <div class="field">
      <label class="block mb-1">Nombre</label>
  <PrimeInputText :model-value="campo?.name || ''" @update:model-value="(v: string)=> actualizarTexto('name', v)" />
    </div>
    <div class="field">
      <label class="block mb-1">Placeholder</label>
  <PrimeInputText :model-value="campo?.placeholder || ''" @update:model-value="(v: string)=> actualizarTexto('placeholder', v)" />
    </div>
    <div class="field grid">
      <div class="col-4">
        <label class="block mb-1">Cols sm</label>
  <PrimeInputNumber :model-value="campo?.grid?.sm || 12" :min="1" :max="12" @update:model-value="(v: number | null)=> actualizarGrid({ sm: Number(v ?? 12) })" />
      </div>
      <div class="col-4">
        <label class="block mb-1">Cols md</label>
  <PrimeInputNumber :model-value="campo?.grid?.md || 6" :min="1" :max="12" @update:model-value="(v: number | null)=> actualizarGrid({ md: Number(v ?? 6) })" />
      </div>
      <div class="col-4">
        <label class="block mb-1">Cols lg</label>
  <PrimeInputNumber :model-value="campo?.grid?.lg || 6" :min="1" :max="12" @update:model-value="(v: number | null)=> actualizarGrid({ lg: Number(v ?? 6) })" />
      </div>
    </div>
    <div class="field">
      <label class="flex align-items-center gap-2">
        <PrimeCheckbox binary :model-value="!!campo?.visible" @update:model-value="(v: boolean)=> actualizarBooleano('visible', v)" />
        Visible
      </label>
    </div>
    <div class="field">
      <label class="flex align-items-center gap-2">
        <PrimeCheckbox binary :model-value="!!campo?.required" @update:model-value="(v: boolean)=> actualizarBooleano('required', v)" />
        Requerido
      </label>
    </div>
  </div>

  <!-- Config específica por tipo -->
  <div v-if="campo?.type==='select' || campo?.type==='radio'" class="mt-3">
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
  </div>

  <div v-if="campo?.type==='table'" class="mt-3">
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
