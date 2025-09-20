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
  <div class="flex flex-column gap-4">
    <div class="flex justify-content-end">
      <PrimeButton
        label="Añadir regla"
        icon="pi pi-plus"
        size="small"
        @click="agregarRegla"
        class="shadow-1"
      />
    </div>

    <div v-if="reglas.length === 0" class="text-center p-6 surface-50 border-round-lg border-1 surface-border">
      <i class="pi pi-info-circle text-4xl text-500 mb-3"></i>
      <p class="text-600 m-0">No hay reglas de lógica configuradas</p>
      <small class="text-500">Añade reglas para controlar la visibilidad y comportamiento de campos</small>
    </div>

    <div v-for="regla in reglas" :key="regla.id" class="surface-0 border-round-lg p-4 shadow-1" style="border: 1px solid var(--surface-200);">
      <div class="grid align-items-end">
        <div class="col-12 md:col-6 lg:col-3">
          <label class="block mb-2 text-700 font-medium">Campo</label>
          <PrimeInputText v-model="regla.whenFieldId" class="w-full" placeholder="Seleccionar campo..." />
        </div>
        <div class="col-12 md:col-6 lg:col-3">
          <label class="block mb-2 text-700 font-medium">Operador</label>
          <PrimeSelect
            v-model="regla.operator"
            :options="[
              { label: 'Es igual a', value: 'equals' },
              { label: 'No es igual a', value: 'not_equals' },
              { label: 'Contiene', value: 'contains' },
              { label: 'Mayor que', value: 'gt' },
              { label: 'Menor que', value: 'lt' },
              { label: 'Personalizado', value: 'custom' }
            ]"
            option-label="label"
            option-value="value"
            class="w-full"
            placeholder="Seleccionar operador..."
          />
        </div>
        <div class="col-12 md:col-6 lg:col-3">
          <label class="block mb-2 text-700 font-medium">Valor</label>
          <PrimeInputText v-model="regla.value" class="w-full" placeholder="Valor de comparación..." />
        </div>
        <div class="col-12 md:col-6 lg:col-3">
          <label class="block mb-2 text-700 font-medium">Acción</label>
          <PrimeSelect
            v-model="regla.action"
            :options="[
              { label: 'Mostrar', value: 'show' },
              { label: 'Ocultar', value: 'hide' },
              { label: 'Requerir', value: 'require' },
              { label: 'Opcional', value: 'optional' }
            ]"
            option-label="label"
            option-value="value"
            class="w-full"
            placeholder="Seleccionar acción..."
          />
        </div>
      </div>

      <div v-if="regla.operator==='custom'" class="mt-3 p-3 surface-50 border-round">
        <label class="block mb-2 text-700 font-medium">
          <i class="pi pi-code mr-2"></i>Expresión personalizada
        </label>
        <PrimeTextarea
          v-model="regla.expression"
          rows="3"
          class="w-full"
          placeholder="Escribir expresión JavaScript..."
        />
        <small class="text-500 mt-1 block">
          Ejemplo: field.value > 18 && field.visible === true
        </small>
      </div>

      <div class="flex justify-content-end mt-3 pt-3" style="border-top: 1px solid var(--surface-100);">
        <PrimeButton
          icon="pi pi-trash"
          severity="danger"
          size="small"
          outlined
          @click="eliminarRegla(regla.id)"
          aria-label="Eliminar regla"
          class="hover:bg-red-50"
        />
      </div>
    </div>
  </div>
</template>
