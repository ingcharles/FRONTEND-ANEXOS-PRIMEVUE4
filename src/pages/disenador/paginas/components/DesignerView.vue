<script setup lang="ts">
import { computed } from 'vue'
import { useDesignerStore } from '@/stores/useDesignerStore'
import PalettePanel from './PalettePanel.vue'
import PageCanvas from './PageCanvas.vue'
import PropertiesTabs from './PropertiesTabs.vue'

const store = useDesignerStore()

const paginaActual = computed(() => store.paginaActiva)
</script>

<template>
  <div class="p-3 grid w-full" style="min-height: 70vh">
    <div class="col-3">
      <PalettePanel />
    </div>
  <div class="col-12 md:col-6 w-full">
      <div class="flex align-items-center justify-content-between mb-2">
        <div class="flex gap-2">
          <PrimeButton label="Añadir página" icon="pi pi-plus" @click="store.agregarPagina" />
          <PrimeButton label="Duplicar página" icon="pi pi-copy" @click="store.duplicarPagina(store.activePageIndex)" />
          <PrimeButton label="Eliminar página" severity="danger" icon="pi pi-trash" @click="store.eliminarPagina(store.activePageIndex)" />
        </div>
        <div class="flex gap-2">
          <PrimeButton label="Exportar" icon="pi pi-upload" @click="store.exportarJson" />
          <label class="p-button p-component cursor-pointer">
            <i class="pi pi-download mr-2" />
            <span>Importar</span>
            <input type="file" accept="application/json" class="hidden" @change="(e: Event)=> { const input = e.target as HTMLInputElement; const f = input.files?.[0]; if (f) store.importarJson(f) }" />
          </label>
          <PrimeToggleButton :model-value="store.gridSnap" on-label="Grid" off-label="Grid" @update:model-value="(v:boolean)=> (store.gridSnap = v)" />
        </div>
      </div>
  <PageCanvas :page="paginaActual" />
      <div class="flex justify-content-between mt-3">
        <PrimeButton label="Anterior" icon="pi pi-angle-left" :disabled="store.activePageIndex===0" @click="store.activePageIndex--" />
        <PrimeButton label="Siguiente" icon-pos="right" icon="pi pi-angle-right" :disabled="store.activePageIndex>=store.formSchema.pages.length-1" @click="store.activePageIndex++" />
      </div>
    </div>
    <div class="col-3">
      <PropertiesTabs />
    </div>
  </div>
</template>
