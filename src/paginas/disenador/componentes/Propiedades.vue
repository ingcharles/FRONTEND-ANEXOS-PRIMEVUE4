<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import TabAtributos from './propiedades/TabAtributos.vue'
import TabLogica from './propiedades/TabLogica.vue'
import TabValidacion from './propiedades/TabValidacion.vue'
import Panel from 'primevue/panel'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'

const almacen = useAlmacenDisenador()
const seleccionado = computed(() => almacen.campoSeleccionado)
const tabActivo = ref<'attrs' | 'logic' | 'valid'>('attrs')

// Resetear el tab activo solo cuando se selecciona un campo DIFERENTE
watch(() => seleccionado.value?.id, () => {
  tabActivo.value = 'attrs'
})
</script>

<template>
  <Panel header="Propiedades" class="text-lg text-color mb-4 px-2 py-2">
    <div v-if="!seleccionado">Selecciona un elemento para ver propiedades</div>
    <template v-else>
      <Tabs v-model:value="tabActivo">
        <TabList>
          <Tab value="attrs">Atributos</Tab>
          <Tab value="logic">Lógica</Tab>
          <Tab value="valid">Validaciones</Tab>
        </TabList>

        <TabPanels class="px-0">
          <TabPanel value="attrs">
            <TabAtributos :id-campo="seleccionado.id" />
          </TabPanel>
          <TabPanel value="logic">
            <TabLogica :id-campo="seleccionado.id" />
          </TabPanel>
          <TabPanel value="valid">
            <TabValidacion :id-campo="seleccionado.id" />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </template>
  </Panel>
</template>

