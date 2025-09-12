<script setup lang="ts">
import { computed } from 'vue'
import { useDesignerStore } from '@/stores/useDesignerStore'
import AttributesTab from './properties/AttributesTab.vue'
import LogicTab from './properties/LogicTab.vue'
import ValidationTab from './properties/ValidationTab.vue'

const store = useDesignerStore()
const seleccionado = computed(() => store.campoSeleccionado)
</script>

<template>
  <PrimePanel header="Propiedades">
    <div v-if="!seleccionado">Selecciona un elemento para ver propiedades</div>
    <template v-else>
      <PrimeTabs value="attrs">
        <PrimeTabPanel header="Atributos" value="attrs">
          <AttributesTab :field-id="seleccionado.id" />
        </PrimeTabPanel>
        <PrimeTabPanel header="Lógica" value="logic">
          <LogicTab :field-id="seleccionado.id" />
        </PrimeTabPanel>
        <PrimeTabPanel header="Validaciones" value="valid">
          <ValidationTab :field-id="seleccionado.id" />
        </PrimeTabPanel>
      </PrimeTabs>
    </template>
  </PrimePanel>
</template>
