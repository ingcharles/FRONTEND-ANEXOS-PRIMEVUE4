<script setup lang="ts">
import { computed } from 'vue'
import { useDesignerStore } from '@/stores/useDesignerStore'
import type { ValidationRule } from '@/types/form-schema'

defineProps<{ fieldId: string }>()
const store = useDesignerStore()
const campo = computed(() => store.campoSeleccionado)
const reglas = computed<ValidationRule[]>({
  get: () => campo.value?.validations ?? [],
  set: (v) => campo.value && store.actualizarCampo(campo.value.id, { validations: v }),
})

function agregar(type: ValidationRule['type']) {
  reglas.value = [...reglas.value, { type }]
}

function eliminar(index: number) {
  reglas.value = reglas.value.filter((_, i) => i !== index)
}
</script>

<template>
  <div class="flex flex-column gap-2">
    <div class="flex flex-wrap gap-2">
      <PrimeButton label="Requerido" size="small" @click="() => agregar('required')" />
      <PrimeButton label="Min length" size="small" @click="() => agregar('minLength')" />
      <PrimeButton label="Max length" size="small" @click="() => agregar('maxLength')" />
      <PrimeButton label="Pattern" size="small" @click="() => agregar('pattern')" />
      <PrimeButton label="Custom" size="small" @click="() => agregar('custom')" />
    </div>
    <div v-for="(r, i) in reglas" :key="i" class="border-1 border-round p-2 surface-card">
      <div class="grid align-items-end gap-2">
        <div class="col-12 md:col-4">
          <label class="block mb-1">Tipo</label>
          <PrimeSelect
            v-model="r.type"
            :options="['required','minLength','maxLength','pattern','custom']"
            class="w-full"
          />
        </div>
        <div class="col-12 md:col-8">
          <label class="block mb-1">Valor / expresión</label>
          <PrimeInputText v-model="(r as any).value" class="w-full" />
        </div>
      </div>
      <div class="flex justify-content-end mt-2">
        <PrimeButton
          icon="pi pi-trash"
          severity="danger"
          size="small"
          outlined
          @click="eliminar(i)"
          aria-label="Eliminar validación"
        />
      </div>
    </div>
  </div>
</template>
