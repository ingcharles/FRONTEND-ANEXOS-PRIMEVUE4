<template>
  <PrimeDialog
    v-model:visible="visible"
    :header="titulo"
    :modal="true"
    :closable="true"
    :draggable="false"
    :style="{ width: ancho }"
    :class="clasePersonalizada"
    @update:visible="$emit('update:visible', $event)"
  >
    <template #header v-if="$slots.header">
      <slot name="header" />
    </template>

    <div class="p-4">
      <slot />
    </div>

    <template #footer v-if="$slots.footer">
      <slot name="footer" />
    </template>
  </PrimeDialog>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean
  titulo?: string
  ancho?: string
  clasePersonalizada?: string
}

withDefaults(defineProps<Props>(), {
  titulo: 'Ayuda',
  ancho: '600px',
  clasePersonalizada: ''
})

defineEmits<{
  'update:visible': [value: boolean]
}>()
</script>
