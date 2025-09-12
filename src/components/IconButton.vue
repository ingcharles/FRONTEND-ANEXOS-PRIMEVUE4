<script setup lang="ts">
const props = withDefaults(defineProps<{ icon: string; label?: string; severity?: 'primary'|'danger'|'success'|'secondary'; text?: boolean }>(), { text: true, severity: 'primary' })
</script>

<template>
  <PrimeButton :icon="props.icon" :label="props.label" :severity="props.severity" :text="props.text" />
</template>
