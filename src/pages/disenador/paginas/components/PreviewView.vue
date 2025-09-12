<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { z } from 'zod'
import type { FieldSchema } from '@/types/form-schema'
import { useDesignerStore } from '@/stores/useDesignerStore'
import { EvaluarReglasCampo } from '@/utils/logic'

const store = useDesignerStore()
const paginaIndex = ref(0)
const paginaActual = computed(() => store.formSchema.pages[paginaIndex.value])
const campos = computed<FieldSchema[]>(() => paginaActual.value.fields)

// construir zod schema dinámico
function crearSchema(): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {}
  for (const f of campos.value) {
    if (!f.name) continue
    let base: z.ZodTypeAny = z.any()
    if (f.type === 'text' || f.type === 'email' || f.type === 'password' || f.type === 'textarea') base = z.string()
    if (f.type === 'time') base = z.any()
    if (f.type === 'radio' || f.type === 'select') base = z.any()

    // Aplicar lógica para required dinámico
    const idAName: Record<string, string> = {}
    for (const c of campos.value) if (c.id && c.name) idAName[c.id] = c.name
    const estado = EvaluarReglasCampo(f, valores, idAName)
  const esRequerido = estado.required
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
    shape[f.name] = base
  }
  return z.object(shape)
}

const schema = ref(crearSchema())
watch(campos, () => (schema.value = crearSchema()))

const valores = reactive<Record<string, unknown>>({})
const errores = ref<Record<string, string>>({})

function enviar(): void {
  errores.value = {}
  const res = schema.value.safeParse(valores)
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
        <div class="col-12 md:col-6 lg:col-6 p-2" v-if="EvaluarReglasCampo(f, valores, Object.fromEntries(campos.map(c=>[c.id, c.name||''] as const))).visible">
          <label v-if="f.label" class="block mb-1">{{ f.label }}</label>
          <PrimeInputText v-if="f.type==='text' || f.type==='email' || f.type==='password'" v-model="(valores as any)[f.name||'']" :placeholder="f.placeholder" class="w-full" />
          <PrimeTextarea v-else-if="f.type==='textarea'" v-model="(valores as any)[f.name||'']" :placeholder="f.placeholder" class="w-full" />
          <PrimeCalendar v-else-if="f.type==='time'" v-model="(valores as any)[f.name||'']" time-only hour-format="24" class="w-full" />
          <PrimeDropdown v-else-if="f.type==='select'" v-model="(valores as any)[f.name||'']" :options="(f.meta?.options as any[])||[]" option-label="label" option-value="value" class="w-full" />
          <PrimeDivider v-else-if="f.type==='divider'" />
          <div v-else-if="f.type==='radio'" class="flex gap-3">
            <label v-for="op in ((f.meta?.options as any[])||[])" :key="op.value" class="inline-flex align-items-center gap-2">
              <PrimeRadioButton :inputId="String(op.value)" v-model="(valores as any)[f.name||'']" :value="op.value" :name="f.name" />
              <span>{{ op.label }}</span>
            </label>
          </div>
          <PrimeButton v-else-if="f.type==='button' && paginaIndex>=store.formSchema.pages.length-1" :label="f.label || 'Enviar'" type="submit" />
          <div v-if="f.name && errores[f.name]" class="text-red-500 mt-1">{{ errores[f.name] }}</div>
        </div>
      </template>
    </form>
  </div>
</template>
