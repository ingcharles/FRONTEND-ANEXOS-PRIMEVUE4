<script setup lang="ts">
import { useDesignerStore } from '@/stores/useDesignerStore'
import PalettePanel from '@pages/disenador/paginas/components/PalettePanel.vue'
import PageCanvas from '@pages/disenador/paginas/components/PageCanvas.vue'
import PropertiesTabs from '@pages/disenador/paginas/components/PropertiesTabs.vue'
import PreviewView from '@pages/disenador/paginas/components/PreviewView.vue'
import JsonView from '@pages/disenador/paginas/components/JsonView.vue'
import { ref, computed } from 'vue'
import { z } from 'zod'
import type { FieldSchema } from '@/types/form-schema'
import { EvaluarReglasCampo } from '@/utils/logic'

const store = useDesignerStore()

const paginaActual = store.paginaActiva
const totalPaginas = computed(() => store.formSchema.pages.length)
const pestana = ref<string>('disenador')
const tabTitles = [
  { value: 'disenador', label: 'Diseñador', icon: 'pi pi-sitemap' },
  { value: 'preview', label: 'Vista previa', icon: 'pi pi-eye' },
  { value: 'json', label: 'JSON', icon: 'pi pi-code' },
]

// Helpers mínimos para validación global (reutiliza lógica de Preview)
function recolectarCamposConNombre(list: FieldSchema[], out: FieldSchema[] = []): FieldSchema[] {
  for (const f of list) {
    if (!f) continue
    if (f.name) out.push(f)
    if (f.children && f.children.length) recolectarCamposConNombre(f.children, out)
  }
  return out
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

function enviarDesdeDisenador(): void {
  const erroresGlobales: Record<string, string> = {}
  const valoresGlobales: Record<string, unknown> = {}
  for (const page of store.formSchema.pages) {
    const valsPagina = store.obtenerValoresPagina(page.id)
    Object.assign(valoresGlobales, valsPagina)
    const shape: Record<string, z.ZodTypeAny> = {}
    const todos = recolectarCamposConNombre(page.fields, [])
    const idToName = construirMapaIdNombre(page.fields)
    for (const f of todos) {
      let base: z.ZodTypeAny = z.any()
      if (f.type === 'text' || f.type === 'email' || f.type === 'password' || f.type === 'textarea') base = z.string()
      if (f.type === 'number') base = z.any() // reconstruir con min/max abajo
      if (f.type === 'time') base = z.any()
      if (f.type === 'date') base = z.any()
      if (f.type === 'radio' || f.type === 'select') base = z.any()
      if (f.type === 'checkbox') {
        const metaObj = f.meta as Record<string, unknown> | undefined
        const opts = metaObj?.options as unknown
        const esGrupo = Array.isArray(opts) && opts.length > 0
        base = esGrupo ? z.array(z.any()) : z.boolean().or(z.any())
      }
      if (f.type === 'table') {
        const meta = f.meta as Record<string, unknown> | undefined
        const rawCols = (meta?.columns as unknown) || []
        const cols = Array.isArray(rawCols) ? (rawCols as Array<Record<string, unknown>>) : []
        const rowShape: Record<string, z.ZodTypeAny> = {}
        for (const c of cols) {
          const tipo = (c.type as string) || 'text'
          const nombre = String(c.name || '')
          if (!nombre) continue
          if (tipo === 'number') {
            let numRule = z.number()
            const cMin = typeof c.min === 'number' ? (c.min as number) : undefined
            const cMax = typeof c.max === 'number' ? (c.max as number) : undefined
            const minMsg = typeof c.minMessage === 'string' && c.minMessage ? String(c.minMessage) : (typeof cMin === 'number' ? `Debe ser >= ${cMin}` : 'Valor demasiado pequeño')
            const maxMsg = typeof c.maxMessage === 'string' && c.maxMessage ? String(c.maxMessage) : (typeof cMax === 'number' ? `Debe ser <= ${cMax}` : 'Valor demasiado grande')
            if (typeof cMin === 'number') numRule = numRule.min(cMin, minMsg)
            if (typeof cMax === 'number') numRule = numRule.max(cMax, maxMsg)
            const num = z.preprocess((v) => typeof v === 'string' ? (v.trim()==='' ? undefined : Number(v)) : v, numRule)
            const requerido = Boolean(c.required)
            rowShape[nombre] = requerido ? num : num.optional()
          } else if (tipo === 'date') {
            const requerido = Boolean(c.required)
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
            const minD = parseFecha((c as Record<string, unknown>).minDate)
            const maxD = parseFecha((c as Record<string, unknown>).maxDate)
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
            const requerido = Boolean(c.required)
            const s = z.string()
            rowShape[nombre] = requerido ? s : s.optional()
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
          } else {
            base = base.refine((v: unknown) => (typeof v === 'string' ? v.trim().length > 0 : v != null), f.validations?.find(v=>v.type==='required')?.message || 'Requerido')
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
    alert('Errores en el formulario:\n' + JSON.stringify(erroresGlobales, null, 2))
    return
  }
  alert('Formulario válido:\n' + JSON.stringify(valoresGlobales, null, 2))
}

function crearPaginaDespuesActual(): void {
  const idx = store.activePageIndex
  // usar acción existente que empuja y cambia el índice, luego restaurar
  store.agregarPagina()
  store.activePageIndex = idx
}
</script>

<template>
  <div class="p-3 grid w-full" style="min-height: 70vh">
    <div class="col-12 md:col-2">
      <PalettePanel />
    </div>
    <div class="col-12 md:col-8">
      <div class="flex items-center justify-between mb-2">
        <div class="flex gap-2">
          <PrimeButton label="Añadir página" icon="pi pi-plus" @click="crearPaginaDespuesActual" />
          <PrimeButton label="Duplicar página" icon="pi pi-copy" @click="store.duplicarPagina(store.activePageIndex)" />
          <PrimeButton label="Eliminar página" severity="danger" icon="pi pi-trash" @click="store.eliminarPagina(store.activePageIndex)" />
        </div>
        <div class="flex gap-2 items-center">
          <PrimeButton label="Exportar" icon="pi pi-upload" @click="store.exportarJson" />
          <label class="p-button p-component cursor-pointer">
            <i class="pi pi-download mr-2" />
            <span>Importar</span>
            <input type="file" accept="application/json" class="hidden" @change="(e: Event)=> { const input = e.target as HTMLInputElement; const f = input.files?.[0]; if (f) store.importarJson(f) }" />
          </label>
          <!-- <PrimeToggleButton :model-value="store.gridSnap" on-label="Grid" off-label="Grid" @update:model-value="(v:boolean)=> (store.gridSnap = v)" /> -->
        </div>
      </div>
      <Tabs v-model:value="pestana" class="center-tabs">
        <div class="center-tabs-header">
          <TabList>
            <template v-for="tab in tabTitles" :key="tab.value">
              <Tab :value="tab.value" as="div" class="flex items-center gap-2">
                <i :class="tab.icon"></i>
                <span class="font-bold whitespace-nowrap">{{ tab.label }}</span>
              </Tab>
            </template>
          </TabList>
        </div>

        <TabPanels>
          <TabPanel value="disenador">
            <div class="flex justify-between items-center mb-3">
              <div v-if="totalPaginas>1" class="flex items-center gap-2">
                <PrimeButton label="Anterior" icon="pi pi-angle-left" :disabled="store.activePageIndex===0" @click="() => (store.activePageIndex = Math.max(0, store.activePageIndex-1))" />
                <div class="font-semibold">{{ paginaActual.title || ('Página ' + (store.activePageIndex+1)) }}</div>
                <PrimeButton label="Siguiente" icon-pos="right" icon="pi pi-angle-right" :disabled="store.activePageIndex>=store.formSchema.pages.length-1" @click="() => (store.activePageIndex = Math.min(store.formSchema.pages.length-1, store.activePageIndex+1))" />
              </div>
              <div class="ml-auto">
                <PrimeButton v-if="totalPaginas===1 || store.activePageIndex>=store.formSchema.pages.length-1" label="Enviar" icon="pi pi-check" @click="enviarDesdeDisenador" />
              </div>
            </div>
            <PageCanvas :page="paginaActual" />
          </TabPanel>
          <TabPanel value="preview">
            <PreviewView />
          </TabPanel>
          <TabPanel value="json">
            <JsonView />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
    <div class="col-12 md:col-2">
      <PropertiesTabs />
    </div>
  </div>
</template>
