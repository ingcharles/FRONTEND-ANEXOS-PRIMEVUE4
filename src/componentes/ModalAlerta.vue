<template>
  <PrimeDialog
    v-model:visible="visible"
    :header="titulo"
    modal
    :style="{ width: ancho }"
    :closable="cerrable"
    @update:visible="actualizarVisible"
  >
    <div class="flex items-start gap-3">
      <i :class="obtenerClaseIcono()" class="text-2xl mt-1"></i>
      <div class="flex-1">
        <p class="text-gray-700 leading-relaxed">{{ mensaje }}</p>
        <div v-if="mensajeDetalle" class="mt-2 p-2 bg-gray-50 border-1 border-gray-200 border-round">
          <small class="text-gray-600">{{ mensajeDetalle }}</small>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <PrimeButton
          v-if="mostrarBotonCancelar"
          :label="textoBotonCancelar"
          severity="secondary"
          outlined
          @click="emitirCancelar"
        />
        <PrimeButton
          :label="textoBotonConfirmar"
          :icon="iconoBotonConfirmar"
          :severity="severidadBotonConfirmar"
          @click="emitirConfirmar"
          autofocus
        />
      </div>
    </template>
  </PrimeDialog>
</template>

<script setup lang="ts">
import type { ModalAlerta } from '@/interfaces/Comunes';
import { computed } from 'vue'

const props = withDefaults(defineProps<ModalAlerta>(), {
  tipo: 'error',
  ancho: '450px',
  cerrable: true,
  mostrarBotonCancelar: false,
  textoBotonConfirmar: 'Entendido',
  textoBotonCancelar: 'Cancelar',
  iconoBotonConfirmar: 'pi pi-check'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirmar: []
  cancelar: []
}>()

// Computed para el v-model
const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

// Función para obtener la clase del icono según el tipo
function obtenerClaseIcono(): string {
  const iconos = {
    error: 'pi pi-exclamation-triangle text-red-500',
    warning: 'pi pi-exclamation-triangle text-orange-500',
    info: 'pi pi-info-circle text-blue-500',
    success: 'pi pi-check-circle text-green-500'
  }
  return iconos[props.tipo]
}

// Computed para la severidad del botón según el tipo
const severidadBotonConfirmar = computed(() => {
  const severidades = {
    error: 'danger',
    warning: 'warn',
    info: 'info',
    success: 'success'
  }
  return severidades[props.tipo] || 'secondary'
})

// Funciones para emitir eventos
function actualizarVisible(value: boolean): void {
  emit('update:modelValue', value)
}

function emitirConfirmar(): void {
  emit('confirmar')
  emit('update:modelValue', false)
}

function emitirCancelar(): void {
  emit('cancelar')
  emit('update:modelValue', false)
}
</script>
