<script setup lang="ts">
import { computed, nextTick } from 'vue'
import draggable from 'vuedraggable'
import type { FieldSchema, PageSchema } from '@/types/form-schema'
import { useDesignerStore } from '@/stores/useDesignerStore'
import FieldWrapper from './FieldWrapper.vue'

const props = defineProps<{ page: PageSchema }>()
const store = useDesignerStore()

const campos = computed<FieldSchema[]>(() => props.page.fields)

async function manejarAdd(evt: { newIndex: number }) {
  // cuando viene de la paleta, ya es un clon listo
  const idx = evt.newIndex
  await nextTick()
  const lista = props.page.fields
  const elem = (idx != null && idx >= 0 && idx < lista.length) ? lista[idx] : lista[lista.length - 1]
  if (elem && elem.id) store.seleccionarCampo(elem.id)
}

function clasesColumna(f: FieldSchema): string[] {
  const sm = f.grid?.sm ?? 12
  const md = f.grid?.md ?? 6
  const lg = f.grid?.lg ?? 6
  return [
    `col-${Math.min(12, Math.max(1, sm))}`,
    `md:col-${Math.min(12, Math.max(1, md))}`,
    `lg:col-${Math.min(12, Math.max(1, lg))}`,
    'p-2',
  ]
}
</script>

<template>
  <div class="border-1 border-dashed border-round surface-border p-2 w-full">
    <draggable
      :key="page.id"
      class="grid w-full"
      :list="page.fields"
      item-key="id"
      :group="{ name: 'paleta', pull: true, put: true }"
      handle=".handler-mover"
      @add="manejarAdd"
      ghost-class="drag-ghost"
      chosen-class="drag-chosen"
      drag-class="drag-active"
    >
      <template #item="{ element }">
        <div :class="clasesColumna(element)">
          <FieldWrapper :field="element" :selected="store.selectedFieldId===element.id" @select="store.seleccionarCampo(element.id)" />
        </div>
      </template>
      <template #footer>
        <div v-if="campos.length===0" class="col-12 text-600 text-center p-3">Arrastra elementos aquí</div>
      </template>
    </draggable>
  </div>
</template>

<style scoped>
.drag-ghost { opacity: .5; outline: 2px dashed var(--p-primary-400); }
.drag-chosen { outline: 2px solid var(--p-primary-500); }
.drag-active { cursor: grabbing; }
</style>
