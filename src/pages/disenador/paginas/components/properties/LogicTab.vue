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

function eliminarRegla(id: string): void {
  reglas.value = reglas.value.filter(regla => regla.id !== id)
}
</script>

<template>
  <div class="flex flex-column gap-2">
    <div class="flex justify-content-end">
      <PrimeButton label="Añadir regla" icon="pi pi-plus" size="small" @click="agregarRegla" />
    </div>
    <div v-for="regla in reglas" :key="regla.id" class="border-1 border-round p-2 surface-card">
      <div class="grid align-items-end">
        <div class="col-12 md:col-6 lg:col-4">
          <label class="block mb-1">Campo</label>
          <PrimeInputText v-model="regla.whenFieldId" class="w-full" />
        </div>
        <div class="col-12 md:col-6 lg:col-4">
          <label class="block mb-1">Operador</label>
          <PrimeSelect
            v-model="regla.operator"
            :options="['equals','not_equals','contains','gt','lt','custom']"
            class="w-full"
          />
        </div>
        <div class="col-12 md:col-6 lg:col-4">
          <label class="block mb-1">Valor</label>
          <PrimeInputText v-model="regla.value" class="w-full" />
        </div>
        <div class="col-12 md:col-6 lg:col-4">
          <label class="block mb-1">Acción</label>
          <PrimeSelect
            v-model="regla.action"
            :options="['show','hide','require','optional']"
            class="w-full"
          />
        </div>
      </div>
      <div v-if="regla.operator==='custom'" class="mt-2">
        <div class="col-12">
          <label class="block mb-1">Expresión</label>
          <PrimeTextarea v-model="regla.expression" rows="2" class="w-full" />
        </div>
      </div>
      <div class="flex justify-content-end mt-2">
        <PrimeButton
          icon="pi pi-trash"
          severity="danger"
          size="small"
          outlined
          @click="eliminarRegla(regla.id)"
          aria-label="Eliminar regla"
        />
      </div>
    </div>
  </div>
</template>
