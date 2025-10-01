<script setup lang="ts">
import { computed } from 'vue'
import type { EsquemaCampo } from '@/interfaces/Campos'
import type { EsquemaPagina } from '@/interfaces/Pagina'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import ContenedorArrastrable from './ContenedorArrastrable.vue'

const propiedades = defineProps<{ pagina: EsquemaPagina }>()
const almacen = useAlmacenDisenador()

const campos = computed<EsquemaCampo[]>(() => propiedades.pagina.campos)

function actualizarCampos(nuevosCampos: EsquemaCampo[]) {
  // Usar el método del almacén para mantener consistencia
  almacen.actualizarCamposPagina(propiedades.pagina.id, nuevosCampos)
}

</script>

<template>
  <div class="border-1 border-dashed border-round surface-border p-2 ancho-100 tamanio-fuente-miga">
    <ContenedorArrastrable
      :key="pagina.id"
      :elementos="campos"
      mensaje-vacio="Arrastra elementos aquí"
      @actualizar="actualizarCampos"
    />
  </div>
</template>

<style scoped>
</style>
