<script setup lang="ts">
import { computed } from 'vue'
import type { FieldSchema } from '@/types/form-schema'
import { EvaluarReglasCampo } from '@/utils/logic'

const props = defineProps<{
  field: FieldSchema
  valores: Record<string, unknown>
  idAName: Record<string, string>
  errores?: Record<string, string>
}>()

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

type ColumnaTabla = { name: string; label?: string; type?: 'text' | 'number' | 'date' }
type ColumnaTablaExt = ColumnaTabla & {
  formatMode?: 'decimal' | 'currency' | 'percent'
  currency?: string
  locale?: string
  prefix?: string
  suffix?: string
  minFractionDigits?: number
  maxFractionDigits?: number
  percentScale?: 'whole' | 'fraction'
  agg?: 'none'|'sum'|'avg'|'count'|'min'|'max'
  aggPrefix?: string
  aggSuffix?: string
  decimals?: number
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
function obtenerEstiloTabla(field: FieldSchema) {
  const meta = field.meta as Record<string, unknown> | undefined
  const estilo = (meta?.tableStyle ?? {}) as Partial<{ bordered?: boolean; striped?: boolean; hover?: boolean; padding?: 'sm'|'md'|'lg' }>
  let padding: 'sm'|'md'|'lg' = 'md'
  if (estilo.padding === 'sm' || estilo.padding === 'md' || estilo.padding === 'lg') padding = estilo.padding
  return { bordered: !!estilo.bordered, striped: !!estilo.striped, hover: !!estilo.hover, padding }
}
function clasePaddingTabla(field: FieldSchema): string {
  const p = obtenerEstiloTabla(field).padding
  return p === 'sm' ? 'p-1' : p === 'lg' ? 'p-3' : 'p-2'
}
function clasesTabla(field: FieldSchema): string[] { const e = obtenerEstiloTabla(field); return ['w-full','text-sm', e.bordered ? 'border-1 surface-border' : ''] }
function clasesCelda(field: FieldSchema): string[] { const e = obtenerEstiloTabla(field); const pad = clasePaddingTabla(field); return [pad, e.bordered ? 'border-bottom-1 surface-border' : ''] }
function clasesFila(field: FieldSchema): string[] { const e = obtenerEstiloTabla(field); return [ e.striped ? 'odd:bg-surface-100' : '', e.hover ? 'hover:bg-surface-100' : '' ] }

function crearFilaVacia(cols: ColumnaTabla[]): Record<string, unknown> {
  const obj: Record<string, unknown> = {}
  for (const c of cols) obj[c.name] = undefined
  return obj
}

function agregarFilaCampo(field: FieldSchema): void {
  const nombre = field.name || ''
  if (!nombre) return
  const cols = obtenerColumnasTabla(field)
  const nueva = crearFilaVacia(cols)
  const dict = props.valores as Record<string, unknown>
  const actual = dict[nombre]
  if (Array.isArray(actual)) {
    ;(actual as unknown[]).push(nueva)
  } else {
    dict[nombre] = [nueva]
  }
}

function formatearAgregado(col: ColumnaTablaExt, valor: number | null): string {
  if (valor == null) return ''
  const decimals = typeof col.decimals === 'number' ? Math.max(0, Math.min(8, col.decimals)) : 2
  const numStr = (col.agg === 'count') ? String(valor) : (Number(valor).toFixed(decimals))
  const pre = col.aggPrefix ?? ''
  const suf = col.aggSuffix ?? ''
  return `${pre}${numStr}${suf}`.trim()
}
function calcularAgregado(col: ColumnaTablaExt, filas: Record<string, unknown>[]): number | null {
  const vals = filas.map(r => r[col.name])
  if (col.agg === 'count') return vals.filter(v => v !== undefined && v !== null && String(v).trim() !== '').length
  const nums = vals.map(v => typeof v === 'string' ? (v.trim()==='' ? NaN : Number(v)) : (typeof v === 'number' ? v : NaN)).filter(n => !Number.isNaN(n)) as number[]
  if (nums.length === 0) return col.agg ? 0 : null
  switch (col.agg) {
    case 'sum': return nums.reduce((a,b)=>a+b,0)
    case 'avg': return nums.reduce((a,b)=>a+b,0) / nums.length
    case 'min': return Math.min(...nums)
    case 'max': return Math.max(...nums)
    default: return null
  }
}

const visible = computed(() => EvaluarReglasCampo(props.field, props.valores, props.idAName).visible)
const requerido = computed(() => EvaluarReglasCampo(props.field, props.valores, props.idAName).required)
</script>

<template>
  <div v-if="visible">
    <!-- Panel -->
    <PrimePanel v-if="field.type==='panel'" :header="field.label || 'Panel'">
      <div class="grid">
        <template v-for="ch in (field.children||[])" :key="ch.id">
          <div :class="clasesColumna(ch)">
            <CampoRenderer :field="ch" :valores="valores" :id-a-name="idAName" :errores="errores" />
          </div>
        </template>
      </div>
    </PrimePanel>

    <!-- Campo simple / complejos no panel -->
    <template v-else>
      <label v-if="field.label" class="block mb-1">{{ field.label }}<span v-if="requerido" class="text-red-500"> *</span></label>
      <PrimeInputText v-if="field.type==='text' || field.type==='email' || field.type==='password'" v-model="(valores as any)[field.name||'']" :placeholder="field.placeholder" class="w-full" :disabled="field.disabled" :readonly="field.readonly" />
      <PrimeTextarea v-else-if="field.type==='textarea'" v-model="(valores as any)[field.name||'']" :placeholder="field.placeholder" class="w-full" :disabled="field.disabled" :readonly="field.readonly" />
      <PrimeDatePicker v-else-if="field.type==='time'" v-model="(valores as any)[field.name||'']" time-only hour-format="24" class="w-full" :disabled="field.disabled" />
      <PrimeDatePicker v-else-if="field.type==='date'" v-model="(valores as any)[field.name||'']" class="w-full" :disabled="field.disabled" />
      <PrimeSelect v-else-if="field.type==='select'"
        v-model="(valores as any)[field.name||'']"
        :options="(field.meta?.options as any[])||[]"
        option-label="etiqueta"
        option-value="valor"
        class="w-full"
        :disabled="field.disabled || (((field.meta as any)?.dependencia?.deshabilitarHastaValor) && !String((field.meta as any)?.dependencia?.campoPadre || '').split(',').map((s:string)=>s.trim()).filter(Boolean).every((padre: string) => valores[padre]))"
      />
      <PrimeInputNumber v-else-if="field.type==='number'" v-model="(valores as any)[field.name||'']" class="w-full" :placeholder="field.placeholder" :min="(field.meta as any)?.min" :max="(field.meta as any)?.max" :step="(field.meta as any)?.step ?? 1" :disabled="field.disabled" :readonly="field.readonly" />
      <div v-else-if="field.type==='checkbox'">
        <template v-if="Array.isArray((field.meta as any)?.options) && ((field.meta as any)?.options?.length||0) > 0">
          <div :class="[
            'flex',
            ((field.meta as any)?.layout==='horizontal' ? 'flex-row flex-wrap gap-3' : 'flex-column gap-2')
          ]">
            <label v-for="op in ((field.meta?.options as any[])||[])" :key="String(op.value)" class="inline-flex align-items-center gap-2 flex-shrink-0">
              <PrimeCheckbox :input-id="String(op.value)" :value="op.value" v-model="(valores as any)[field.name||'']" :disabled="field.disabled" />
              <span>{{ op.label }}</span>
            </label>
          </div>
        </template>
        <template v-else>
          <div class="inline-flex align-items-center gap-2">
            <PrimeCheckbox v-model="(valores as any)[field.name||'']" :binary="true" :disabled="field.disabled" />
          </div>
        </template>
      </div>
      <div v-else-if="field.type==='radio'">
        <div :class="[
          'flex',
          ((field.meta as any)?.layout==='horizontal' ? 'flex-row flex-wrap gap-3' : 'flex-column gap-2')
        ]">
          <label v-for="op in ((field.meta?.options as any[])||[])" :key="String(op.value)" class="inline-flex align-items-center gap-2 flex-shrink-0">
            <PrimeRadioButton :input-id="String(op.value)" :value="op.value" v-model="(valores as any)[field.name||'']" :disabled="field.disabled" />
            <span>{{ op.label }}</span>
          </label>
        </div>
      </div>
      <PrimeDivider v-else-if="field.type==='divider'" />
      <div v-else-if="field.type==='table'">
        <div class="overflow-auto">
          <table :class="clasesTabla(field)">
            <thead>
              <tr>
                 <th v-for="col in obtenerColumnasTabla(field)" :key="col.name" :class="['text-left', clasePaddingTabla(field), obtenerEstiloTabla(field).bordered ? 'border-bottom-1 surface-border' : '']">{{ col.label }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rIdx) in (((valores as any)[field.name||''] as any[])||[])" :key="rIdx" :class="clasesFila(field)">
                 <td v-for="col in obtenerColumnasTabla(field)" :key="col.name" :class="clasesCelda(field)">
                  <PrimeInputText v-if="(col.type||'text')==='text'" v-model="(valores as any)[field.name||''][rIdx][col.name]" class="w-full" :disabled="field.disabled" />
                  <PrimeDatePicker v-else-if="col.type==='date'" v-model="(valores as any)[field.name||''][rIdx][col.name]" class="w-full" :disabled="field.disabled" />
                  <template v-else-if="col.type==='number'">
                    <PrimeInputNumber
                      :model-value="(col as any).formatMode==='percent' && (col as any).percentScale==='fraction' ? (((valores as any)[field.name||''][rIdx][col.name] ?? null) as any) * 100 : ((valores as any)[field.name||''][rIdx][col.name])"
                      @update:model-value="(v:any) => { if ((col as any).formatMode==='percent' && (col as any).percentScale==='fraction') { (valores as any)[field.name||''][rIdx][col.name] = (typeof v==='number'? v/100 : v) } else { (valores as any)[field.name||''][rIdx][col.name] = v } }"
                      class="w-full"
                      :disabled="field.disabled"
                      :mode="(col as any).formatMode==='currency' ? 'currency' : ((col as any).formatMode==='percent' ? 'decimal' : 'decimal')"
                      :currency="(col as any).formatMode==='currency' ? ((col as any).currency || 'USD') : undefined"
                      :locale="(col as any).locale || 'es-ES'"
                      :prefix="(col as any).prefix || ''"
                      :suffix="(col as any).formatMode==='percent' ? '%' : ((col as any).suffix || '')"
                      :min-fraction-digits="(col as any).minFractionDigits ?? 0"
                      :max-fraction-digits="(col as any).maxFractionDigits ?? 2"
                    />
                  </template>
                  <span v-else class="text-muted-color">—</span>
                </td>
              </tr>
            </tbody>
            <tfoot v-if="obtenerColumnasTabla(field).some(c => c.agg && c.agg !== 'none') || (field.meta as any)?.showSummary">
              <tr>
                <td v-for="(col, idx) in obtenerColumnasTabla(field)" :key="col.name" :class="[clasePaddingTabla(field), 'font-semibold']">
                  <span v-if="idx===0">{{ (field.meta as any)?.summaryLabel ?? 'Total' }}</span>
                  <span class="ml-2" v-if="col.agg && col.agg!=='none'">
                    {{ formatearAgregado(col as any, calcularAgregado(col as any, (((valores as any)[field.name||''] as Record<string, unknown>[])||[]))) }}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div class="mt-2" v-if="(field.meta as any)?.addRows">
          <PrimeButton size="small" icon="pi pi-plus" label="Añadir fila" @click.prevent="agregarFilaCampo(field)" />
        </div>
      </div>
      <div v-if="field.name && errores && errores[field.name]" class="text-red-500 mt-1">{{ errores[field.name] }}</div>
    </template>
  </div>
</template>

<script lang="ts">
export default { name: 'CampoRenderer' }
</script>

<style scoped>
</style>
