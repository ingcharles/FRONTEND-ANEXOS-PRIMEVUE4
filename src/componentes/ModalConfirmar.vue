<!-- Adaptador de compatibilidad: ModalConfirmar.vue -->
<script setup lang="ts">
// Re-exporta el componente original manteniendo compatibilidad
import ModalConfirm from '@/components/ModalConfirm.vue'

// Definir props con los mismos tipos
interface Props {
  visible: boolean
  message: string
}

interface Emits {
  (e: 'confirm'): void
  (e: 'cancel'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <ModalConfirm
    :visible="visible"
    :message="message"
    @confirm="$emit('confirm')"
    @cancel="$emit('cancel')"
  />
</template>
