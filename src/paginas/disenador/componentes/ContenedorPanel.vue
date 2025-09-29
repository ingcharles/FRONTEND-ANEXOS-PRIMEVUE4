<script setup lang="ts">
import draggable from 'vuedraggable'
import { computed, nextTick } from 'vue'
import type { EsquemaCampo } from '@/interfaces/Campos'
import EnvolvedorCampo from './EnvolvedorCampo.vue'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'

const propiedades = withDefaults(defineProps<{ campo: EsquemaCampo; contraido?: boolean }>(), { contraido: false })
const emitir = defineEmits<{ (e: 'alternar'): void }>()
const almacen = useAlmacenDisenador()

// Lista sincronizada directamente con el almacen para reflejar cambios de grid en vivo
const lista = computed<EsquemaCampo[]>({
  get: () => {
    const hijos = propiedades.campo.hijos ?? []
    return hijos
  },
  set: (v) => {
    // Solo panel puede tener hijos: el almacen ya impone esta restricción
    almacen.actualizarCampo(propiedades.campo.id, { hijos: [...v] })
  },
})

async function manejarAgregar(evento: { newIndex: number }) {
  // Seleccionar el hijo recién añadido (desde paleta u otro contenedor)
  if (propiedades.campo.tipo !== 'panel') return
  const indice = evento.newIndex
  await nextTick()
  const arreglo = lista.value
  const elemento = (indice != null && indice >= 0 && indice < arreglo.length) ? arreglo[indice] : arreglo[arreglo.length - 1]
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
  <PrimePanel class="p-2" :header="propiedades.campo.etiqueta || 'Panel'" :toggleable="true"
    :collapsed="propiedades.contraido" @toggle="emitir('alternar')">
    <draggable class="grid ancho-100 texto-miga" v-model="lista" item-key="id"
      :group="{ name: 'paleta', pull: true, put: true }" handle=".handler-mover" @change="() => { }"
      @add="manejarAgregar" ghost-class="drag-ghost" chosen-class="drag-chosen" drag-class="drag-active">
      <template #item="{ element }">
        <div :class="obtenerClasesColumna(element)" @click.stop="almacen.seleccionarCampo(element.id)">
          <EnvolvedorCampo :campo="element" :seleccionado="almacen.idCampoSeleccionado === element.id"
            @seleccionar="almacen.seleccionarCampo(element.id)" />
        </div>
      </template>
      <template #footer>
        <div v-if="lista.length === 0" class="col-12 contenido p-2">
          Arrastre aquí elementos desde la paleta
        </div>
      </template>
    </draggable>
  </PrimePanel>
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
