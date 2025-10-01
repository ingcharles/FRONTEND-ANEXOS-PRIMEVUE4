<script setup lang="ts">
import { computed } from 'vue'
import type { EsquemaCampo } from '@/interfaces/Campos'
import ContenedorArrastrable from './ContenedorArrastrable.vue'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'

const propiedades = withDefaults(defineProps<{ campo: EsquemaCampo; contraido?: boolean }>(), { contraido: false })
const emitir = defineEmits<{ (e: 'alternar'): void }>()
const almacen = useAlmacenDisenador()

const hijos = computed(() => propiedades.campo.hijos ?? [])

function actualizarHijos(nuevosHijos: EsquemaCampo[]) {
  // Solo panel puede tener hijos: el almacen ya impone esta restricción
  almacen.actualizarCampo(propiedades.campo.id, { hijos: [...nuevosHijos] })
}
</script>

<template>
  <PrimePanel class="p-2" :header="propiedades.campo.etiqueta || 'Panel'" :toggleable="true"
    :collapsed="propiedades.contraido" @toggle="emitir('alternar')">
    <ContenedorArrastrable
      :elementos="hijos"
      mensaje-vacio="Arrastre aquí elementos desde la paleta"
      @actualizar="actualizarHijos"
    />
  </PrimePanel>
</template>

<style scoped>
</style>
