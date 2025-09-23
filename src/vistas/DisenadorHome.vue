<script setup lang="ts">
import { ref } from 'vue'
import VistaDisenador from './VistaDisenador.vue'
import VistaPrevia from '@/paginas/disenador/componentes/VistaPrevia.vue'
import VistaJson from '@/paginas/disenador/componentes/VistaJson.vue'

const pestanaActiva = ref<'disenador' | 'prevista' | 'json'>('disenador')
</script>

<template>
  <div class="p-3">
    <PrimeTabs v-model:value="pestanaActiva">
      <PrimeTabPanel value="disenador" header="Diseñador">
        <VistaDisenador />
      </PrimeTabPanel>
      <PrimeTabPanel value="prevista" header="Previsualizar">
        <VistaPrevia />
      </PrimeTabPanel>
      <PrimeTabPanel value="json" header="JSON">
        <VistaJson />
      </PrimeTabPanel>
    </PrimeTabs>
  </div>
</template>

<style scoped>
</style>

