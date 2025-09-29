<script setup lang="ts">
import { computed, nextTick } from 'vue'
import draggable from 'vuedraggable'
import type { EsquemaCampo } from '@/interfaces/Campos'
import type { EsquemaPagina } from '@/interfaces/Pagina'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import EnvolvedorCampo from './EnvolvedorCampo.vue'

const propiedades = defineProps<{ pagina: EsquemaPagina }>()
const almacen = useAlmacenDisenador()

const campos = computed<EsquemaCampo[]>(() => propiedades.pagina.campos)

async function manejarAgregar(evento: { newIndex: number }) {
  // cuando viene de la paleta, ya es un clon listo
  const indice = evento.newIndex
  await nextTick()
  const lista = propiedades.pagina.campos
  const elemento = (indice != null && indice >= 0 && indice < lista.length) ? lista[indice] : lista[lista.length - 1]
  if (elemento && elemento.id) almacen.seleccionarCampo(elemento.id)
}

function obtenerClasesColumna(campo: EsquemaCampo): string[] {
  const pequeno = campo.grid?.sm ?? 12
  const mediano = campo.grid?.md ?? 6
  const grande = campo.grid?.lg ?? 6
  return [
    `col-${Math.min(12, Math.max(1, pequeno))}`,
    `md:col-${Math.min(12, Math.max(1, mediano))}`,
    `lg:col-${Math.min(12, Math.max(1, grande))}`,
    'p-2',
  ]
}
</script>

<template>
  <div class="border-1 border-dashed border-round surface-border p-2 ancho-100 texto-miga">
    <draggable :key="pagina.id" class="grid ancho-100 texto-miga" :list="pagina.campos" item-key="id"
      :group="{ name: 'paleta', pull: true, put: true }" handle=".handler-mover" @add="manejarAgregar"
      ghost-class="drag-ghost" chosen-class="drag-chosen" drag-class="drag-active">
      <template #item="{ element }">
        <div :class="obtenerClasesColumna(element)">
          <EnvolvedorCampo :campo="element" :seleccionado="almacen.idCampoSeleccionado === element.id"
            @seleccionar="almacen.seleccionarCampo(element.id)" />
        </div>
      </template>
      <template #footer>
        <div v-if="campos.length === 0" class="col-12 contenido p-3">Arrastra elementos aquí</div>
      </template>
    </draggable>
  </div>
</template>

<style scoped>
.drag-ghost {
  opacity: .5;
  outline: 2px dashed var(--p-primary-400);
}

.drag-chosen {
  outline: 2px solid var(--p-primary-500);
}

.drag-active {
  cursor: grabbing;
}
</style>
