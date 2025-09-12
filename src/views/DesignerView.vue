<script setup lang="ts">
import { useDesignerStore } from '@/stores/useDesignerStore'
import PalettePanel from '@pages/disenador/paginas/components/PalettePanel.vue'
import PageCanvas from '@pages/disenador/paginas/components/PageCanvas.vue'
import PropertiesTabs from '@pages/disenador/paginas/components/PropertiesTabs.vue'
import PreviewView from '@pages/disenador/paginas/components/PreviewView.vue'
import JsonView from '@pages/disenador/paginas/components/JsonView.vue'
import { ref } from 'vue'

const store = useDesignerStore()

const paginaActual = store.paginaActiva
const pestana = ref<string>('disenador')
</script>

<template>
  <div class="p-3 grid w-full" style="min-height: 70vh">
    <div class="col-12 md:col-3">
      <PalettePanel />
    </div>
    <div class="col-12 md:col-6">
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
      <PrimeTabs v-model:value="pestana">
        <PrimeTabPanel value="disenador" header="Diseñador">
          <PageCanvas :page="paginaActual" />
        </PrimeTabPanel>
        <PrimeTabPanel value="preview" header="Vista previa">
          <PreviewView />
        </PrimeTabPanel>
        <PrimeTabPanel value="json" header="JSON">
          <JsonView />
        </PrimeTabPanel>
      </PrimeTabs>
    </div>
    <div class="col-12 md:col-3">
      <PropertiesTabs />
    </div>
  </div>
</template>
