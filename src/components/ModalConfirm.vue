<script setup lang="ts">
const props = defineProps<{ visible: boolean; message: string }>()
const emit = defineEmits<{ (e: 'confirm'): void; (e: 'cancel'): void }>()
</script>

<template>
  <PrimeDialog :visible="props.visible" modal header="Confirmación" @update:visible="emit('cancel')">
    <p class="m-0">{{ props.message }}</p>
    <template #footer>
      <PrimeButton label="Cancelar" text @click="emit('cancel')" />
      <PrimeButton label="Aceptar" @click="emit('confirm')" />
    </template>
  </PrimeDialog>
</template>
