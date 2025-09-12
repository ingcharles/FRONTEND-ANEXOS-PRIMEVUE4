<template>
  <div class="disenador-page">
    <DisenadorFormularios />
  </div>
</template>

<script setup lang="ts">
import DisenadorFormularios from '@/components/disenador/componentes/DisenadorFormularios.vue'

// Meta información de la página
const title = 'Diseñador de Formularios'
const description = 'Constructor visual de formularios dinámicos con drag & drop'

// SEO Meta tags
if (typeof document !== 'undefined') {
  document.title = title
  const metaDescription = document.querySelector('meta[name="description"]')
  if (metaDescription) {
    metaDescription.setAttribute('content', description)
  }
}
</script>

<style scoped>
.disenador-page {
  height: 100vh;
  overflow: hidden;
}
</style>
