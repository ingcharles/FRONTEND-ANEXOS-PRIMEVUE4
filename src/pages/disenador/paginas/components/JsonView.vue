<script setup lang="ts">
import { computed } from 'vue'
import { useDesignerStore } from '@/stores/useDesignerStore'

const store = useDesignerStore()
const contenido = computed(() => store.serializar())
</script>

<template>
  <div class="p-3">
    <div class="flex gap-2 mb-2">
      <PrimeButton label="Exportar" icon="pi pi-upload" @click="store.exportarJson" />
      <label class="p-button p-component cursor-pointer">
        <i class="pi pi-download mr-2" />
        <span>Importar</span>
        <input type="file" accept="application/json" class="hidden" @change="(e: Event)=> { const input = e.target as HTMLInputElement; const f = input.files?.[0]; if (f) store.importarJson(f) }" />
      </label>
    </div>
    <pre class="bg-surface-100 p-3 border-round overflow-auto" style="max-height: 50vh">{{ contenido }}</pre>
  </div>
</template>
