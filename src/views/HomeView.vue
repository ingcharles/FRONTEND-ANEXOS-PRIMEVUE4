<script setup lang="ts">
import { ref } from 'vue'

const mensaje = ref('Hola, mundo!')
</script>
<template>
  <div class="home">
    <h1>{{ mensaje }}</h1>
  </div>
</template>
<style scoped></style>

