<script setup lang="ts">
import { computed } from 'vue'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import SeccionGeneral from './SeccionGeneral.vue'
import SeccionDiseno from './SeccionDiseno.vue'
import SeccionComportamiento from './SeccionComportamiento.vue'
import SeccionOpciones from './SeccionOpciones.vue'
import SeccionTabla from './SeccionTabla.vue'

defineProps<{ idCampo: string }>()
const almacen = useAlmacenDisenador()
const campo = computed(() => almacen.campoSeleccionado)
</script>

<template>
  <div v-if="campo" class="p-d-flex p-flex-column p-gap-4 py-2 px-2">

    <!-- Información general del campo -->
    <SeccionGeneral :campo="campo" />

    <!-- Comportamiento (required, visible, disabled) -->
    <SeccionComportamiento :campo="campo" />


    <!-- Diseño y grid -->
    <SeccionDiseno :campo="campo" />


    <!-- Opciones para select/radio/checkbox -->
    <SeccionOpciones
      v-if="campo.tipo === 'seleccion' || campo.tipo === 'radio' || campo.tipo === 'casilla'"
      :campo="campo"
    />

    <!-- Configuración de tabla -->
    <SeccionTabla
      v-if="campo.tipo === 'tabla'"
      :campo="campo"
    />
  </div>
</template>

