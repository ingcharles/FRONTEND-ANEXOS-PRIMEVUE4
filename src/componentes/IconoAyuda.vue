<template>
  <i class="pi pi-info-circle texto-ayuda color-azul p-2 " v-tooltip.top="mensaje"></i>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

defineProps<{ mensaje: string }>()
</script>
