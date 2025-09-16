<script setup lang="ts">
import { computed } from 'vue'
import { useDesignerStore } from '@/stores/useDesignerStore'
import type { LogicRule } from '@/types/form-schema'
import { generarId } from '@/utils/id'

defineProps<{ fieldId: string }>()
const store = useDesignerStore()
const campo = computed(() => store.campoSeleccionado)
const reglas = computed<LogicRule[]>({
  get: () => campo.value?.logic ?? [],
  set: (v) => campo.value && store.actualizarCampo(campo.value.id, { logic: v }),
})

function agregarRegla(): void {
  const nueva: LogicRule = {
    id: generarId('logic'),
    whenFieldId: '',
    operator: 'equals',
    value: '',
    action: 'show',
  }
  reglas.value = [...reglas.value, nueva]
}
</script>

<template>
  <div class="flex flex-column gap-2">
    <div class="flex justify-content-end">
      <PrimeButton label="Añadir regla" icon="pi pi-plus" size="small" @click="agregarRegla" />
    </div>
    <div v-for="regla in reglas" :key="regla.id" class="border-1 border-round p-2 surface-card">
      <div class="grid align-items-end">
        <div class="col-4">
          <label class="block mb-1">Campo</label>
          <PrimeInputText v-model="regla.whenFieldId" />
        </div>
        <div class="col-3">
          <label class="block mb-1">Operador</label>
          <PrimeSelect v-model="regla.operator" :options="['equals','not_equals','contains','gt','lt','custom']" />
        </div>
        <div class="col-3">
          <label class="block mb-1">Valor</label>
          <PrimeInputText v-model="regla.value" />
        </div>
        <div class="col-2">
          <label class="block mb-1">Acción</label>
          <PrimeSelect v-model="regla.action" :options="['show','hide','require','optional']" />
        </div>
      </div>
      <div v-if="regla.operator==='custom'" class="mt-2">
        <label class="block mb-1">Expresión</label>
        <PrimeTextarea v-model="regla.expression" rows="2" />
      </div>
    </div>
  </div>
</template>
