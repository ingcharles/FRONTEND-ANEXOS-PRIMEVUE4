<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { z } from 'zod'
import type { FieldSchema } from '@/types/form-schema'
import { useDesignerStore } from '@/stores/useDesignerStore'
import { EvaluarReglasCampo } from '@/utils/logic'

const store = useDesignerStore()
const paginaIndex = ref(0)
const paginaActual = computed(() => store.formSchema.pages[paginaIndex.value])
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
  const stack: FieldSchema[] = [...list]
  while (stack.length) {
    const f = stack.shift()!
    if (f.id && f.name) map[f.id] = f.name
    if (f.children && f.children.length) stack.push(...f.children)
  }
  return map
}

const idAName = computed(() => construirMapaIdNombre(campos.value))

// construir zod schema dinámico
function recolectarCamposConNombre(list: FieldSchema[], out: FieldSchema[] = []): FieldSchema[] {
  for (const f of list) {
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
    if (f.type === 'time') base = z.any()
    if (f.type === 'radio' || f.type === 'select') base = z.any()

    // Aplicar lógica para required dinámico (usa mapa global id->name)
    const estado = EvaluarReglasCampo(f, valores.value as Record<string, unknown>, idAName.value)
    const esVisible = estado.visible
    const esRequerido = estado.required && !f.disabled
    if (!esVisible) {
      base = base.optional()
    } else {
      if (esRequerido) base = base.refine((v: unknown) => (typeof v === 'string' ? v.trim().length > 0 : v != null), f.validations?.find(v=>v.type==='required')?.message || 'Requerido')
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

// Valores persistentes por página
const valores = computed<Record<string, unknown>>(() => store.obtenerValoresPagina(paginaActual.value.id))
const errores = ref<Record<string, string>>({})

// Establecer valores por defecto desde meta.valorPorDefecto para campos con name
function esVacio(v: unknown): boolean {
  return v === undefined || v === null || (typeof v === 'string' && v.trim() === '')
}

function aplicarValoresPorDefecto(list: FieldSchema[], sobrescribirSiVacio = false): void {
  for (const f of list) {
    if (f.name) {
      const meta = f.meta as Record<string, unknown> | undefined
      const def = meta?.valorPorDefecto
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
  // Recalcular esquema por si cambió la lógica de requerido según valores actuales
  schema.value = crearSchema()
  const res = schema.value.safeParse(valores.value)
  if (!res.success) {
    const map: Record<string, string> = {}
    for (const issue of res.error.issues) {
      const path = issue.path[0] as string
      map[path] = issue.message
    }
    errores.value = map
  } else {
    alert('Formulario válido:\n' + JSON.stringify(res.data, null, 2))
  }
}
</script>

<template>
  <div class="p-3">
    <div class="flex justify-content-between mb-3">
  <PrimeButton label="Anterior" icon="pi pi-angle-left" :disabled="paginaIndex===0" @click="paginaIndex--" />
      <div class="font-semibold">{{ paginaActual.title || ('Página ' + (paginaIndex+1)) }}</div>
  <PrimeButton label="Siguiente" icon-pos="right" icon="pi pi-angle-right" :disabled="paginaIndex>=store.formSchema.pages.length-1" @click="paginaIndex++" />
    </div>
    <form class="grid" @submit.prevent="enviar">
      <template v-for="f in campos" :key="f.id">
        <div :class="clasesColumna(f)" v-if="EvaluarReglasCampo(f, valores as any, idAName).visible">
          <label v-if="f.label" class="block mb-1">{{ f.label }}<span v-if="EvaluarReglasCampo(f, valores as any, idAName).required" class="text-red-500"> *</span></label>
          <PrimeInputText v-if="f.type==='text' || f.type==='email' || f.type==='password'" v-model="(valores as any)[f.name||'']" :placeholder="f.placeholder" class="w-full" :disabled="f.disabled" :readonly="f.readonly" />
          <PrimeTextarea v-else-if="f.type==='textarea'" v-model="(valores as any)[f.name||'']" :placeholder="f.placeholder" class="w-full" :disabled="f.disabled" :readonly="f.readonly" />
          <PrimeCalendar v-else-if="f.type==='time'" v-model="(valores as any)[f.name||'']" time-only hour-format="24" class="w-full" :disabled="f.disabled" />
          <PrimeDropdown v-else-if="f.type==='select'" v-model="(valores as any)[f.name||'']" :options="(f.meta?.options as any[])||[]" option-label="label" option-value="value" class="w-full" :disabled="f.disabled" />
          <PrimeDivider v-else-if="f.type==='divider'" />
          <div v-else-if="f.type==='radio'" class="flex gap-3">
            <label v-for="op in ((f.meta?.options as any[])||[])" :key="op.value" class="inline-flex align-items-center gap-2">
              <PrimeRadioButton :input-id="String(op.value)" v-model="(valores as any)[f.name||'']" :value="op.value" :name="f.name" :disabled="f.disabled" />
              <span>{{ op.label }}</span>
            </label>
          </div>
          <PrimeButton v-else-if="f.type==='button' && paginaIndex>=store.formSchema.pages.length-1" :label="f.label || 'Enviar'" type="submit" />
          <!-- Panel: renderizar hijos respetando grid -->
          <PrimePanel v-else-if="f.type==='panel'" :header="f.label || 'Panel'">
            <div class="grid">
              <template v-for="ch in (f.children||[])" :key="ch.id">
                <div :class="clasesColumna(ch)" v-if="EvaluarReglasCampo(ch, valores as any, idAName).visible">
                  <label v-if="ch.label" class="block mb-1">{{ ch.label }}<span v-if="EvaluarReglasCampo(ch, valores as any, idAName).required" class="text-red-500"> *</span></label>
                  <PrimeInputText v-if="ch.type==='text' || ch.type==='email' || ch.type==='password'" v-model="(valores as any)[ch.name||'']" :placeholder="ch.placeholder" class="w-full" :disabled="ch.disabled" :readonly="ch.readonly" />
                  <PrimeTextarea v-else-if="ch.type==='textarea'" v-model="(valores as any)[ch.name||'']" :placeholder="ch.placeholder" class="w-full" :disabled="ch.disabled" :readonly="ch.readonly" />
                  <PrimeCalendar v-else-if="ch.type==='time'" v-model="(valores as any)[ch.name||'']" time-only hour-format="24" class="w-full" :disabled="ch.disabled" />
                  <PrimeDropdown v-else-if="ch.type==='select'" v-model="(valores as any)[ch.name||'']" :options="(ch.meta?.options as any[])||[]" option-label="label" option-value="value" class="w-full" :disabled="ch.disabled" />
                  <PrimeDivider v-else-if="ch.type==='divider'" />
                  <div v-else-if="ch.type==='radio'" class="flex gap-3">
                    <label v-for="op in ((ch.meta?.options as any[])||[])" :key="op.value" class="inline-flex align-items-center gap-2">
                      <PrimeRadioButton :input-id="String(op.value)" v-model="(valores as any)[ch.name||'']" :value="op.value" :name="ch.name" :disabled="ch.disabled" />
                      <span>{{ op.label }}</span>
                    </label>
                  </div>
                </div>
              </template>
            </div>
          </PrimePanel>
          <div v-if="f.name && errores[f.name]" class="text-red-500 mt-1">{{ errores[f.name] }}</div>
        </div>
      </template>
    </form>
  </div>
</template>
