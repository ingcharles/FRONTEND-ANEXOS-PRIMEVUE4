<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDesignerStore } from '@/stores/useDesignerStore'
import AttributesTab from './properties/AttributesTab.vue'
import LogicTab from './properties/LogicTab.vue'
import ValidationTab from './properties/ValidationTab.vue'

const store = useDesignerStore()
const seleccionado = computed(() => store.campoSeleccionado)
const activeTab = ref<'attrs' | 'logic' | 'valid'>('attrs')

// Resetear el tab activo solo cuando se selecciona un campo DIFERENTE
watch(() => seleccionado.value?.id, () => {
  activeTab.value = 'attrs'
})
</script>

<template>
  <PrimePanel header="Propiedades">
    <div v-if="!seleccionado">Selecciona un elemento para ver propiedades</div>
    <template v-else>
      <PrimeTabs v-model:value="activeTab">
        <PrimeTabList>
          <PrimeTab value="attrs">Atributos</PrimeTab>
          <PrimeTab value="logic">Lógica</PrimeTab>
          <PrimeTab value="valid">Validaciones</PrimeTab>
        </PrimeTabList>
        
        <PrimeTabPanels>
          <PrimeTabPanel value="attrs">
            <AttributesTab :field-id="seleccionado.id" />
          </PrimeTabPanel>
          <PrimeTabPanel value="logic">
            <LogicTab :field-id="seleccionado.id" />
          </PrimeTabPanel>
          <PrimeTabPanel value="valid">
            <ValidationTab :field-id="seleccionado.id" />
          </PrimeTabPanel>
        </PrimeTabPanels>
      </PrimeTabs>
    </template>
  </PrimePanel>
</template>
