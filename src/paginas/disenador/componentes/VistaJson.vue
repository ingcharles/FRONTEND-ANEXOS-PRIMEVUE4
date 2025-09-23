<script setup lang="ts">
import { computed } from 'vue'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import Button from 'primevue/button'

// Composables y servicios
const almacen = useAlmacenDisenador()

// Computed properties
const contenidoJson = computed(() => almacen.serializar())

// Métodos de gestión de archivos
function manejarImportarArchivo(evento: Event): void {
  const input = evento.target as HTMLInputElement
  const archivo = input.files?.[0]
  if (archivo) {
    almacen.importarJson(archivo)
  }
}

function exportarFormulario(): void {
  almacen.exportarJson()
}
</script>

<template>
  <div class="p-3">
    <div class="flex gap-2 mb-2">
      <Button
        label="Exportar"
        icon="pi pi-upload"
        @click="exportarFormulario"
      />
      <label class="p-button p-component cursor-pointer">
        <i class="pi pi-download mr-2" />
        <span>Importar</span>
        <input
          type="file"
          accept="application/json"
          class="hidden"
          @change="manejarImportarArchivo"
        />
      </label>
    </div>

    <pre class="bg-surface-100 p-3 border-round overflow-auto" style="max-height: 50vh">{{ contenidoJson }}</pre>
  </div>
</template>

<style scoped>
</style>

