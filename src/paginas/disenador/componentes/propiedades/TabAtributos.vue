<script setup lang="ts">
import { computed } from 'vue'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import SeccionGeneral from './SeccionGeneral.vue'
import SeccionDiseno from './SeccionDiseno.vue'
import SeccionComportamiento from './SeccionComportamiento.vue'
import SeccionOpciones from './SeccionOpciones.vue'
import SeccionTabla from './SeccionTabla.vue'
import { TipoCampoValor } from '@/enumeraciones/Campos'

defineProps<{ idCampo: string }>()
const almacen = useAlmacenDisenador()
const campo = computed(() => almacen.campoSeleccionado)
</script>

<template>
  <div v-if="campo" class="flex p-flex-column p-gap-4 py-2 px-2">

    <!-- Información general del campo -->
    <SeccionGeneral :campo="campo" />

    <!-- Comportamiento (required, visible, disabled) -->
    <SeccionComportamiento :campo="campo" />


    <!-- Diseño y grid -->
    <SeccionDiseno :campo="campo" />


    <!-- Opciones para select/radio/checkbox -->
    <SeccionOpciones
      v-if="campo.tipo === TipoCampoValor.Seleccion || campo.tipo === TipoCampoValor.Radio || campo.tipo === TipoCampoValor.Casilla"
      :campo="campo" />

    <!-- Configuración de tabla -->
    <SeccionTabla v-if="campo.tipo === TipoCampoValor.Tabla" :campo="campo" />
  </div>
</template>
