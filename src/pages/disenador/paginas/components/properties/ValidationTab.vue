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
  <div class="flex flex-column gap-4">
    <div class="surface-50 border-round-lg p-3" style="border: 1px solid var(--surface-200);">
      <div class="flex align-items-center gap-2 mb-3">
        <i class="pi pi-shield text-primary"></i>
        <span class="font-medium text-700">Agregar validaciones</span>
      </div>
      <div class="flex flex-wrap gap-2">
        <PrimeButton 
          label="Requerido" 
          icon="pi pi-exclamation-triangle"
          size="small" 
          severity="info"
          outlined
          @click="() => agregar('required')"
          class="shadow-1"
        />
        <PrimeButton 
          label="Longitud mín." 
          icon="pi pi-arrow-down"
          size="small" 
          severity="info"
          outlined
          @click="() => agregar('minLength')"
          class="shadow-1"
        />
        <PrimeButton 
          label="Longitud máx." 
          icon="pi pi-arrow-up"
          size="small" 
          severity="info"
          outlined
          @click="() => agregar('maxLength')"
          class="shadow-1"
        />
        <PrimeButton 
          label="Patrón" 
          icon="pi pi-search"
          size="small" 
          severity="info"
          outlined
          @click="() => agregar('pattern')"
          class="shadow-1"
        />
        <PrimeButton 
          label="Personalizado" 
          icon="pi pi-code"
          size="small" 
          severity="info"
          outlined
          @click="() => agregar('custom')"
          class="shadow-1"
        />
      </div>
    </div>

    <div v-if="reglas.length === 0" class="text-center p-6 surface-50 border-round-lg border-1 surface-border">
      <i class="pi pi-shield text-4xl text-500 mb-3"></i>
      <p class="text-600 m-0">No hay validaciones configuradas</p>
      <small class="text-500">Las validaciones ayudan a asegurar que los datos ingresados sean correctos</small>
    </div>

    <div v-for="(r, i) in reglas" :key="i" class="surface-0 border-round-lg p-4 shadow-1" style="border: 1px solid var(--surface-200);">
      <div class="grid align-items-end gap-3">
        <div class="col-12 md:col-4">
          <label class="block mb-2 text-700 font-medium">
            <i class="pi pi-cog mr-2"></i>Tipo de validación
          </label>
          <PrimeSelect
            v-model="r.type"
            :options="[
              { label: 'Campo requerido', value: 'required' },
              { label: 'Longitud mínima', value: 'minLength' },
              { label: 'Longitud máxima', value: 'maxLength' },
              { label: 'Patrón RegEx', value: 'pattern' },
              { label: 'Validación personalizada', value: 'custom' }
            ]"
            option-label="label"
            option-value="value"
            class="w-full"
            placeholder="Seleccionar tipo..."
          />
        </div>
        <div class="col-12 md:col-8">
          <label class="block mb-2 text-700 font-medium">
            <i class="pi pi-pencil mr-2"></i>
            {{ r.type === 'required' ? 'Mensaje de error' : 
               r.type === 'minLength' ? 'Longitud mínima' :
               r.type === 'maxLength' ? 'Longitud máxima' :
               r.type === 'pattern' ? 'Expresión regular' :
               'Función de validación' }}
          </label>
          <PrimeInputText 
            v-model="(r as any).value" 
            class="w-full" 
            :placeholder="r.type === 'required' ? 'Este campo es obligatorio' : 
                          r.type === 'minLength' ? 'Ej: 3' :
                          r.type === 'maxLength' ? 'Ej: 100' :
                          r.type === 'pattern' ? 'Ej: ^[a-zA-Z]+$' :
                          'function(value) { return value > 0; }'"
          />
          <small v-if="r.type === 'pattern'" class="text-500 block mt-1">
            Ingresa una expresión regular válida
          </small>
          <small v-if="r.type === 'custom'" class="text-500 block mt-1">
            Función JavaScript que retorne true si el valor es válido
          </small>
        </div>
      </div>
      
      <div class="flex justify-content-end mt-3 pt-3" style="border-top: 1px solid var(--surface-100);">
        <PrimeButton
          icon="pi pi-trash"
          severity="danger"
          size="small"
          outlined
          @click="eliminar(i)"
          aria-label="Eliminar validación"
          class="hover:bg-red-50"
        />
      </div>
    </div>
  </div>
</template>
