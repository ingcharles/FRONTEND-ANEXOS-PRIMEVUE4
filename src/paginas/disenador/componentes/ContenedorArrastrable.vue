<script setup lang="ts" generic="T extends EsquemaCampo">
import draggable from 'vuedraggable'
import { computed, nextTick } from 'vue'
import type { EsquemaCampo } from '@/interfaces/Campos'
import EnvolvedorCampo from './EnvolvedorCampo.vue'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'

interface Props {
  elementos: EsquemaCampo[]
  mensajeVacio?: string
  claseContenedor?: string
  esPanel?: boolean
}

const propiedades = withDefaults(defineProps<Props>(), {
  mensajeVacio: 'Arrastra elementos aquí',
  claseContenedor: 'grid ancho-100 tamanio-fuente-miga',
  esPanel: false
})

const emitir = defineEmits<{
  (e: 'actualizar', elementos: EsquemaCampo[]): void
}>()

const almacen = useAlmacenDisenador()

const lista = computed<EsquemaCampo[]>({
  get: () => propiedades.elementos,
  set: (v) => emitir('actualizar', [...v])
})

async function manejarAgregar(evento: { newIndex: number }) {
  const indice = evento.newIndex
  await nextTick()
  const arreglo = lista.value
  const elemento = (indice != null && indice >= 0 && indice < arreglo.length)
    ? arreglo[indice]
    : arreglo[arreglo.length - 1]
  if (elemento?.id) almacen.seleccionarCampo(elemento.id)
}

function obtenerClasesColumna(elemento: EsquemaCampo): string[] {
  const pequeno = elemento.grid?.sm ?? 12
  const mediano = elemento.grid?.md ?? 6
  const grande = elemento.grid?.lg ?? 6
  return [
    `col-${Math.min(12, Math.max(1, pequeno))}`,
    `md:col-${Math.min(12, Math.max(1, mediano))}`,
    `lg:col-${Math.min(12, Math.max(1, grande))}`,
    'p-2',
  ]
}
</script>

<template>
  <draggable
    :class="claseContenedor"
    v-model="lista"
    item-key="id"
    :group="{ name: 'paleta', pull: true, put: true }"

    @change="() => { }"
    @add="manejarAgregar"
    ghost-class="drag-ghost"
    chosen-class="drag-chosen"
    drag-class="drag-active"
  >
    <template #item="{ element }">
      <div :class="obtenerClasesColumna(element)" @click.stop="almacen.seleccionarCampo(element.id)">
        <EnvolvedorCampo
          :campo="element"
          :seleccionado="almacen.idCampoSeleccionado === element.id"
          @seleccionar="almacen.seleccionarCampo(element.id)"
        />
      </div>
    </template>
    <template #footer>
      <div v-if="lista.length === 0" class="col-12 contenido p-2">
        {{ mensajeVacio }}
      </div>
    </template>
  </draggable>
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
